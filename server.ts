import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  PRIZE_LADDER,
  type GradeLevel,
  type Language,
  type LeaderboardEntry,
  type Question,
} from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');
const HISTORY_FILE = path.join(DATA_DIR, 'question_history.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    ensureDataDir();
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

interface QuestionHistoryStore {
  elementary: string[];
  junior: string[];
  high: string[];
}

const CURRICULUM_TOPICS: Record<GradeLevel, { en: string[]; 'zh-TW': string[] }> = {
  elementary: {
    en: [
      'Prime Factorization, GCD & LCM Applications',
      'Complex Fraction & Mixed Decimal Word Problems',
      'Ratios, Proportions & Direct Variation',
      'Percentage, Profit, Loss & Compound Discounts',
      'Speed, Distance, Catch-Up & Meeting Problems',
      'Composite Circular & Sector Area / Perimeter',
      'Volume & Surface Area of Prisms and Cylinders',
      'Age, Chicken-Rabbit & Balance Logic Problems',
      'Number Sequences & Pattern Recognition',
      'Base Rate & Comparative Quantity Modeling',
      'Modular Arithmetic & Remainder Puzzles',
      'Grid Paths & Introductory Combinatorics',
      'Calendar, Clock Angle & Time Intervals',
      'Work-Rate & Pipe-Filling Problems',
      'Geometric Dissection & Symmetry Area Tricks',
      'Average & Weighted Mean Shifts',
      'Digit Puzzles & Divisibility Rules',
    ],
    'zh-TW': [
      '質因數分解、最大公因數與最小公倍數應用',
      '分數與小數四則混合高階應用題',
      '比與比值、正比關係與比例尺',
      '百分率、成數、成本與折扣利潤問題',
      '速率問題（追趕、相遇、流水行船）',
      '圓與扇形的複合周長與面積計算',
      '角柱與圓柱的表面積與體積推理',
      '基準量與比較量、雞兔同籠與年齡問題',
      '等差與幾何圖形數列規律推理',
      '餘數性質與週期問題',
      '簡單排列組合與棋盤路徑計數',
      '時鐘夾角與時間週期計算',
      '工程問題（合作效率與分段施作）',
      '幾何切割、等積變換與對稱面積',
      '平均數變化與極端值推算',
      '因數倍數判別與數字謎題',
      '濃度與混合比例問題',
    ],
  },
  junior: {
    en: [
      'Laws of Exponents & Radical Simplification',
      'Simultaneous Linear Equations & Word Modeling',
      'Linear Inequalities & Feasible Integer Solutions',
      'Polynomial Factorization & Algebraic Identities',
      'Quadratic Equations, Discriminant & Vieta Formulas',
      'Arithmetic & Geometric Sequences and Series',
      'Quadratic Functions, Vertex Optimization & Symmetry',
      'Triangle Congruence & Angle Chasing',
      'Parallel Lines, Trapezoids & Midpoint Theorems',
      'Similar Triangles & Area Ratios',
      'Pythagorean Theorem & 3D Shortest Path on Solids',
      'Circle Theorems: Inscribed, Central & Tangent Angles',
      'Power of a Point & Secant-Tangent Segments',
      'Triangle Centers: Incenter, Circumcenter & Centroid',
      'Linear Functions & Coordinate Geometry',
      'Probability, Tree Diagrams & Complementary Counting',
      'Statistics: Median, Quartiles & Box Plot Shifts',
    ],
    'zh-TW': [
      '指數律與根式化簡（雙重根號與分母有理化）',
      '二元一次聯立方程式與高難度應用建模',
      '一元一次不等式與整數解極值問題',
      '多項式因式分解與乘法公式變形',
      '一元二次方程式、判別式與根與係數關係',
      '等差數列與等比數列級數求值',
      '二次函數圖形對稱軸與極值應用',
      '三角形全等性質與幾何角度追蹤',
      '平行線截比例線段與梯形中線性質',
      '相似三角形與面積比轉換',
      '畢氏定理與立體圖形表面最短路徑',
      '圓心角、圓周角與弦切角綜合幾何',
      '圓冪性質（割線定理與切線長定理）',
      '三角形三心（內心、外心、重心）性質綜合',
      '直角坐標與線型函數圖形交點',
      '古典機率、樹狀圖與反面扣減計數',
      '統計量數（中位數、四分位距與資料平移縮放）',
    ],
  },
  high: {
    en: [
      'Absolute Value Inequalities & Real Number Bounds',
      'Polynomial Remainder, Factor Theorem & Interpolation',
      'Exponential & Logarithmic Equations and Bounds',
      'Trigonometric Identities, Double Angle & Harmonic Synthesis',
      'Law of Sines, Law of Cosines & Triangle Geometry',
      '2D Vectors, Dot Product & Cauchy-Schwarz Inequality',
      '3D Space Lines, Planes & Orthogonal Projections',
      'Matrices, Linear Transformations & Markov Chains',
      'Permutations, Combinations & Inclusion-Exclusion',
      'Binomial Theorem & Combinatorial Identities',
      'Conditional Probability & Bayes Theorem',
      'Conic Sections: Ellipse, Hyperbola & Parabola Tangents',
      'Limits, Continuity & Asymptotic Behavior',
      'Derivatives, Optimization & Tangent Line Geometry',
      'Definite Integrals, Area Between Curves & Kinematics',
      'Complex Plane & De Moivre Theorem',
      'Mathematical Induction & Recursive Sequences',
    ],
    'zh-TW': [
      '絕對值不等式與實數極值估計',
      '多項式餘式定理、因式定理與插值多項式',
      '指數與對數方程式、首數與尾數應用',
      '三角函數恆等變換、倍角公式與疊合極值',
      '正弦定理、餘弦定理與三角形邊角幾何',
      '平面向量內積、柯西不等式與線性組合',
      '空間向量、平面方程式與點面距離投影',
      '矩陣運算、二階線性變換與轉移矩陣',
      '排列組合、重複組合與排容原理',
      '二項式定理與組合恆等式',
      '條件機率、貝氏定理與期望值',
      '圓錐曲線（拋物線、橢圓、雙曲線）切線與焦點性質',
      '數列極限、函數連續性與無窮等比級數',
      '微分應用、函數極值與切線幾何',
      '定積分求面積、旋轉體體積與運動學',
      '複數平面、極式與棣美弗定理',
      '遞迴數列與數學歸納法推導',
    ],
  },
};

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface RawGeminiQuestion {
  level: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  professorHint: string;
  explanation: string;
}

function validateAndNormalizeTier(rawList: unknown, startIndex: number, expectedCount: number): Question[] {
  if (!Array.isArray(rawList) || rawList.length !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} questions for tier starting at ${startIndex + 1}, received ${
        Array.isArray(rawList) ? rawList.length : 'non-array'
      }`
    );
  }

  return rawList.map((item, offset) => {
    const q = item as Partial<RawGeminiQuestion>;
    if (
      typeof q.question !== 'string' ||
      !q.question.trim() ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      typeof q.correctIndex !== 'number' ||
      q.correctIndex < 0 ||
      q.correctIndex > 3 ||
      typeof q.topic !== 'string' ||
      typeof q.professorHint !== 'string' ||
      typeof q.explanation !== 'string'
    ) {
      throw new Error(`Malformed question payload at level ${startIndex + offset + 1}`);
    }

    const cleanOptions = q.options.map((o) => String(o).trim());
    const uniqueOptions = new Set(cleanOptions);
    if (uniqueOptions.size < 4 || cleanOptions.some((o) => !o)) {
      throw new Error(`Duplicate or empty options at level ${startIndex + offset + 1}`);
    }

    const correctValue = cleanOptions[q.correctIndex];
    const shuffledOptions = shuffleArray(cleanOptions);
    const newCorrectIndex = shuffledOptions.indexOf(correctValue);

    const step = PRIZE_LADDER[startIndex + offset];
    return {
      id: crypto.randomUUID(),
      level: step.level,
      prize: step.amount,
      topic: q.topic.trim(),
      question: q.question.trim(),
      options: shuffledOptions as [string, string, string, string],
      correctIndex: newCorrectIndex,
      professorHint: q.professorHint.trim(),
      explanation: q.explanation.trim(),
    };
  });
}

async function generateTierBatch(params: {
  ai: GoogleGenAI;
  language: Language;
  gradeDescription: string;
  langRule: string;
  avoidBlock: string;
  sessionNonce: string;
  startIndex: number;
  topics: string[];
  tierInstruction: string;
  thinkingLevel: ThinkingLevel;
}): Promise<Question[]> {
  const {
    ai,
    gradeDescription,
    langRule,
    avoidBlock,
    sessionNonce,
    startIndex,
    topics,
    tierInstruction,
    thinkingLevel,
  } = params;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.INTEGER, description: 'Question level number' },
        topic: { type: Type.STRING, description: '108 curriculum topic name' },
        question: { type: Type.STRING, description: 'Complete math problem statement with $...$ LaTeX' },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Exactly 4 distinct plausible answer choices',
        },
        correctIndex: {
          type: Type.INTEGER,
          description: '0-based index (0, 1, 2, or 3) of the single mathematically verified correct option',
        },
        professorHint: {
          type: Type.STRING,
          description: 'Strategic clue for Phone a Friend lifeline without revealing the final answer',
        },
        explanation: {
          type: Type.STRING,
          description: 'Concise, rigorous step-by-step proof and solution',
        },
      },
      required: ['level', 'topic', 'question', 'options', 'correctIndex', 'professorHint', 'explanation'],
    },
  };

  const prompt = `You are a Head Problem Setter for "Who Wants to Be a Millionaire: Taiwan 108 Curriculum Math Edition" (Session: ${sessionNonce}-${startIndex + 1}).

Generate exactly ${topics.length} brand-new, SUPER HARD, competition-grade multiple-choice math questions for Levels ${startIndex + 1} through ${startIndex + topics.length}.

TARGET CURRICULUM & DIFFICULTY:
${gradeDescription}

TIER DIFFICULTY BAND:
${tierInstruction}

ASSIGNED 108-CURRICULUM TOPICS (generate 1 question per level in exact order):
${topics.map((t, i) => `Level ${startIndex + i + 1} ($${PRIZE_LADDER[startIndex + i].amount.toLocaleString('en-US')}): ${t}`).join('\n')}

${avoidBlock}
MATHEMATICAL ACCURACY & FORMATTING RULES:
1. ${langRule}
2. Every question MUST be 100% self-contained with NO missing diagrams—if a geometric figure is involved, describe all vertices, coordinates, lengths, and relationships unambiguously in text.
3. Verify your arithmetic and final answer step-by-step before outputting! All 4 options must be plausible, distinct, and unambiguous, with exactly ONE strictly correct answer matching \`correctIndex\` (0..3).
4. \`professorHint\`: A 1–2 sentence strategic mathematical nudge without naming A/B/C/D or the final answer value.
5. \`explanation\`: Concise, rigorous step-by-step derivation (3–5 sentences max) proving why the correct option holds.
6. Use valid JSON only. In LaTeX strings inside JSON, properly escape backslashes (e.g., "\\\\frac{a}{b}", "\\\\sqrt{2}", "\\\\pi").`;

  const modelCandidates: Array<{ model: string; level: ThinkingLevel }> = [
    { model: 'gemini-4-hydrogen', level: thinkingLevel },
    { model: 'gemini-3.1-flash-lite', level: ThinkingLevel.LOW },
  ];

  let lastError: unknown;
  for (let attempt = 0; attempt < modelCandidates.length; attempt++) {
    const candidate = modelCandidates[attempt];
    try {
      const response = await ai.models.generateContent({
        model: candidate.model,
        contents: prompt,
        config: {
          systemInstruction:
            'You are a world-class Taiwan 108 Curriculum Mathematics Olympiad committee member. Double-check every calculation before writing JSON so that options[correctIndex] is mathematically indisputable.',
          responseMimeType: 'application/json',
          responseSchema,
          thinkingConfig: {
            thinkingLevel: candidate.level,
          },
        },
      });

      const rawText = (response.text ?? '[]').trim();
      const parsed = JSON.parse(rawText);
      return validateAndNormalizeTier(parsed, startIndex, topics.length);
    } catch (err) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`Model ${candidate.model} failed:`, errMsg);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to generate question tier.');
}

async function generateMillionaireQuestions(
  language: Language,
  gradeLevel: GradeLevel,
  clientRecentTopics: string[]
): Promise<Question[]> {
  const ai = getAiClient();

  const history = readJsonFile<QuestionHistoryStore>(HISTORY_FILE, {
    elementary: [],
    junior: [],
    high: [],
  });
  const recentStems = history[gradeLevel].slice(-45);
  const selectedTopics = shuffleArray(CURRICULUM_TOPICS[gradeLevel][language]).slice(0, 15);
  const sessionNonce = crypto.randomBytes(6).toString('hex');

  const gradeDescription =
    gradeLevel === 'elementary'
      ? language === 'zh-TW'
        ? '台灣 108 課綱國小高年級（五、六年級，第三學習階段）：嚴禁使用國中代數方程式（如一元二次方程式、負數次方、三角函數），必須使用國小數學奧林匹亞、資優班入學考及 AMC 8 高難度算術與幾何推理。'
        : 'Taiwan 108 Curriculum Elementary Upper Grades (Grades 5–6, Stage 3): Strictly stay within elementary arithmetic, ratios, percentages, speed/work, sector/prism geometry, and logic/combinatorics (NO quadratic equations or high-school algebra), at Taiwan Math Olympiad / AMC 8 competition difficulty.'
      : gradeLevel === 'junior'
        ? language === 'zh-TW'
          ? '台灣 108 課綱國中（七至九年級，第四學習階段）：涵蓋國中會考精熟 A++ 壓軸題、AMC 10 與台灣國中數學競賽難度（包含根式、聯立與二次方程、二次函數、相似與圓幾何、機率統計），嚴禁使用高中微積分、矩陣或複數。'
          : 'Taiwan 108 Curriculum Junior High School (Grades 7–9, Stage 4): Competition & CAP A++ top-tier difficulty covering radicals, quadratics, functions, circle & similarity geometry, and probability/statistics (NO calculus, matrices, or complex numbers).'
        : language === 'zh-TW'
          ? '台灣 108 課綱高中（十至十二年級，含必修數A與選修數學甲）：涵蓋學測數A頂標壓軸題、分科測驗數甲難題及 AMC 12 / AIME 級數的高強度推理（多項式、指對數、三角疊合、空間向量、矩陣、微積分、圓錐曲線、複數平面）。'
          : 'Taiwan 108 Curriculum High School (Grades 10–12, Math A & Elective Math甲): GSAT top-percentile / AST Math甲 / AMC 12 & AIME caliber problems covering polynomials, logs, trigonometry, 3D vectors, matrices, combinatorics, conics, calculus, and complex numbers.';

  const langRule =
    language === 'zh-TW'
      ? 'ALL text (topic, question, options, professorHint, explanation) MUST be written in natural, rigorous Taiwan Traditional Chinese (繁體中文，使用台灣數學標準術語，如「公因數」「判別式」「斜率」「餘弦定理」). Wrap mathematical formulas cleanly in $...$ LaTeX delimiters.'
      : 'ALL text (topic, question, options, professorHint, explanation) MUST be written in clear, rigorous academic English. Wrap mathematical formulas cleanly in $...$ LaTeX delimiters.';

  const avoidBlock =
    recentStems.length > 0 || clientRecentTopics.length > 0
      ? `\nCRITICAL ANTI-REPETITION REQUIREMENT:\nDo NOT reuse or lightly re-skin any of these previously played problems:\n${[
          ...recentStems,
          ...clientRecentTopics.slice(-15),
        ]
          .slice(-30)
          .map((s, i) => `${i + 1}. ${s}`)
          .join('\n')}\nInvent completely fresh contexts, distinct numerical parameters, and non-routine problem structures.\n`
      : '';

  const questions = await generateTierBatch({
    ai,
    language,
    gradeDescription,
    langRule,
    avoidBlock,
    sessionNonce,
    startIndex: 0,
    topics: selectedTopics,
    tierInstruction:
      'Ascending difficulty from Level 1 ($100) to Level 15 ($1,000,000): Levels 1–5 are clever multi-step warm-ups; Levels 6–10 are hard exam/Olympiad differentiators; Levels 11–15 are brutal competition capstone challenges.',
    thinkingLevel: ThinkingLevel.LOW,
  });

  // Persist new question fingerprints so subsequent plays never repeat them
  const newStems = questions.map((q) => `${q.topic}: ${q.question.slice(0, 110).replace(/\s+/g, ' ')}`);
  history[gradeLevel] = [...history[gradeLevel], ...newStems].slice(-90);
  writeJsonFile(HISTORY_FILE, history);

  return questions;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/questions/generate', async (req, res) => {
    try {
      const { language, gradeLevel, recentQuestions } = req.body as {
        language?: Language;
        gradeLevel?: GradeLevel;
        recentQuestions?: string[];
      };

      if (language !== 'en' && language !== 'zh-TW') {
        res.status(400).json({ error: 'Invalid language. Must be "en" or "zh-TW".' });
        return;
      }

      if (gradeLevel !== 'elementary' && gradeLevel !== 'junior' && gradeLevel !== 'high') {
        res.status(400).json({ error: 'Invalid gradeLevel. Must be "elementary", "junior", or "high".' });
        return;
      }

      const clientRecent = Array.isArray(recentQuestions)
        ? recentQuestions.filter((s): s is string => typeof s === 'string').slice(-30)
        : [];

      const questions = await generateMillionaireQuestions(language, gradeLevel, clientRecent);
      res.json({ questions });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown generation error';
      console.error('Question generation error:', error);

      if (message === 'MISSING_API_KEY') {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured. Please add it in Settings > Secrets.',
        });
        return;
      }

      if (message.includes('PERMISSION_DENIED') || message.includes('API_KEY_INVALID')) {
        res.status(403).json({
          error: 'Gemini API key permission or validation failed. Please verify your key in Settings > Secrets.',
        });
        return;
      }

      if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
        res.status(429).json({
          error:
            'Gemini API quota or rate limit reached. Please wait a moment and try again, or check your API key quota in Settings > Secrets.',
        });
        return;
      }

      res.status(500).json({
        error: 'Could not generate a fresh 15-question set. Please try again.',
      });
    }
  });

  app.get('/api/leaderboard', (req, res) => {
    const grade = req.query.grade as string | undefined;
    const entries = readJsonFile<LeaderboardEntry[]>(LEADERBOARD_FILE, []);
    const filtered =
      grade && (grade === 'elementary' || grade === 'junior' || grade === 'high')
        ? entries.filter((e) => e.gradeLevel === grade)
        : entries;

    const sorted = [...filtered].sort((a, b) => {
      if (b.prizeWon !== a.prizeWon) return b.prizeWon - a.prizeWon;
      if (b.questionsSolved !== a.questionsSolved) return b.questionsSolved - a.questionsSolved;
      if (a.totalTimeSeconds !== b.totalTimeSeconds) return a.totalTimeSeconds - b.totalTimeSeconds;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json({ entries: sorted.slice(0, 100) });
  });

  app.post('/api/leaderboard', (req, res) => {
    const body = req.body as Partial<LeaderboardEntry>;
    const playerName = typeof body.playerName === 'string' ? body.playerName.trim().slice(0, 24) : '';
    const gradeLevel = body.gradeLevel;
    const language = body.language;
    const prizeWon = typeof body.prizeWon === 'number' ? Math.max(0, Math.floor(body.prizeWon)) : -1;
    const questionsSolved =
      typeof body.questionsSolved === 'number' ? Math.min(15, Math.max(0, Math.floor(body.questionsSolved))) : -1;
    const totalTimeSeconds =
      typeof body.totalTimeSeconds === 'number' ? Math.max(1, Math.floor(body.totalTimeSeconds)) : -1;
    const outcome = body.outcome;

    if (
      !playerName ||
      (gradeLevel !== 'elementary' && gradeLevel !== 'junior' && gradeLevel !== 'high') ||
      (language !== 'en' && language !== 'zh-TW') ||
      prizeWon < 0 ||
      questionsSolved < 0 ||
      totalTimeSeconds < 0 ||
      (outcome !== 'MILLIONAIRE' && outcome !== 'WALKED_AWAY' && outcome !== 'ELIMINATED')
    ) {
      res.status(400).json({ error: 'Invalid leaderboard submission payload.' });
      return;
    }

    const entries = readJsonFile<LeaderboardEntry[]>(LEADERBOARD_FILE, []);
    const newEntry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      playerName,
      gradeLevel,
      language,
      prizeWon,
      questionsSolved,
      totalTimeSeconds,
      outcome,
      createdAt: new Date().toISOString(),
    };

    const updated = [...entries, newEntry]
      .sort((a, b) => {
        if (b.prizeWon !== a.prizeWon) return b.prizeWon - a.prizeWon;
        if (b.questionsSolved !== a.questionsSolved) return b.questionsSolved - a.questionsSolved;
        if (a.totalTimeSeconds !== b.totalTimeSeconds) return a.totalTimeSeconds - b.totalTimeSeconds;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 200);

    writeJsonFile(LEADERBOARD_FILE, updated);
    const rank = updated.findIndex((e) => e.id === newEntry.id) + 1;

    res.status(201).json({ entry: newEntry, rank });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Math Millionaire server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
