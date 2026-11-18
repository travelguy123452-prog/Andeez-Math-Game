import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { GameStage } from './components/GameStage';
import { LeaderboardView } from './components/LeaderboardView';
import { LobbyView } from './components/LobbyView';
import { ResultView } from './components/ResultView';
import { TopNav } from './components/TopNav';
import { TRANSLATIONS } from './i18n/translations';
import type {
  AnsweredRecord,
  GameOutcome,
  GamePhase,
  GradeLevel,
  Language,
  Question,
} from './types/game';

const RECENT_STORAGE_KEY = 'math_millionaire_recent_stems_v1';

function loadRecentStems(grade: GradeLevel): string[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<Record<GradeLevel, string[]>>;
    return Array.isArray(parsed[grade]) ? parsed[grade] : [];
  } catch {
    return [];
  }
}

function saveRecentStems(grade: GradeLevel, questions: Question[]): void {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Record<GradeLevel, string[]>>) : {};
    const existing = Array.isArray(parsed[grade]) ? parsed[grade] : [];
    const additions = questions.map(
      (q) => `${q.topic}: ${q.question.slice(0, 100).replace(/\s+/g, ' ')}`
    );
    parsed[grade] = [...existing, ...additions].slice(-45);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore localStorage quota errors
  }
}

interface CompletedRun {
  outcome: GameOutcome;
  prizeWon: number;
  questionsSolved: number;
  totalTimeSeconds: number;
  history: AnsweredRecord[];
}

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('junior');
  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard'>('play');
  const [phase, setPhase] = useState<GamePhase>('LOBBY');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [completedRun, setCompletedRun] = useState<CompletedRun | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const t = TRANSLATIONS[language];

  // Rotate loading stage progress indicators smoothly while Gemini generates
  useEffect(() => {
    if (phase !== 'LOADING') return;
    setLoadingStep(0);
    const id = window.setInterval(() => {
      setLoadingStep((prev) => (prev < 2 ? prev + 1 : 2));
    }, 2400);
    return () => window.clearInterval(id);
  }, [phase]);

  const cancelGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setGenerationError(null);
    setPhase('LOBBY');
  }, []);

  const startChallenge = useCallback(
    async (targetLang: Language = language, targetGrade: GradeLevel = gradeLevel) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setActiveTab('play');
      setPhase('LOADING');
      setGenerationError(null);
      setCompletedRun(null);

      try {
        const recentQuestions = loadRecentStems(targetGrade);
        const res = await fetch('/api/questions/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            language: targetLang,
            gradeLevel: targetGrade,
            recentQuestions,
          }),
        });

        const data = (await res.json().catch(() => ({}))) as {
          questions?: Question[];
          error?: string;
        };

        if (!res.ok || !Array.isArray(data.questions) || data.questions.length !== 15) {
          throw new Error(data.error || 'Failed to generate 15 questions.');
        }

        if (controller.signal.aborted) return;

        saveRecentStems(targetGrade, data.questions);
        setQuestions(data.questions);
        setPhase('PLAYING');
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setGenerationError(
          err instanceof Error ? err.message : 'Unable to generate questions right now.'
        );
      }
    },
    [gradeLevel, language]
  );

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'zh-TW' : 'en'));
  };

  const handleNavigate = (tab: 'play' | 'leaderboard', anchorId?: string) => {
    setActiveTab(tab);
    if (tab === 'play' && phase === 'RESULT') {
      setPhase('LOBBY');
    }
    if (anchorId) {
      window.setTimeout(() => {
        document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  };

  const handleFinishGame = (result: CompletedRun) => {
    setCompletedRun(result);
    setPhase('RESULT');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav
        language={language}
        onToggleLanguage={handleToggleLanguage}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        isPlaying={phase === 'PLAYING' || phase === 'LOADING'}
      />

      <main className="flex-1">
        {activeTab === 'leaderboard' ? (
          <LeaderboardView
            language={language}
            onStartPlay={() => {
              setActiveTab('play');
              setPhase('LOBBY');
            }}
          />
        ) : phase === 'LOBBY' ? (
          <LobbyView
            language={language}
            onSelectLanguage={setLanguage}
            gradeLevel={gradeLevel}
            onSelectGrade={setGradeLevel}
            onStartGame={() => void startChallenge(language, gradeLevel)}
            onOpenLeaderboard={() => setActiveTab('leaderboard')}
          />
        ) : phase === 'LOADING' ? (
          <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
            {generationError ? (
              <div className="rounded-2xl border border-red-500/40 bg-[#08132e] p-8 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
                <h2 className="mt-4 font-display text-2xl font-bold text-white">
                  {t.error.title}
                </h2>
                <p className="mt-2 text-sm text-red-200">{generationError}</p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => void startChallenge(language, gradeLevel)}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{t.error.retryButton}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGenerationError(null);
                      setPhase('LOBBY');
                    }}
                    className="rounded-xl border border-blue-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:text-white"
                  >
                    {t.error.backButton}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-blue-800/80 bg-[#08132e]/95 p-8 text-center shadow-2xl">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-900 border-t-amber-400" />
                <h2 className="mt-6 font-display text-2xl font-bold text-white">
                  {t.loading.title}
                </h2>
                <p className="mt-2 text-sm text-slate-300">{t.loading.subtitle}</p>

                <ol className="mt-6 space-y-2.5 text-left text-sm">
                  {t.loading.steps.map((stepText, idx) => {
                    const active = idx === loadingStep;
                    const done = idx < loadingStep;
                    return (
                      <li
                        key={stepText}
                        className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${
                          active
                            ? 'border-amber-400/60 bg-amber-500/10 text-amber-200'
                            : done
                              ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                              : 'border-blue-900/60 bg-[#050b1d] text-slate-500'
                        }`}
                      >
                        <span>
                          0{idx + 1}. {stepText}
                        </span>
                        <span className="font-mono-tabular text-xs font-bold">
                          {done ? 'OK' : active ? '...' : ''}
                        </span>
                      </li>
                    );
                  })}
                </ol>

                <button
                  type="button"
                  onClick={cancelGeneration}
                  className="mt-6 text-xs font-semibold text-slate-400 hover:text-white underline underline-offset-4"
                >
                  {t.loading.cancelButton}
                </button>
              </div>
            )}
          </section>
        ) : phase === 'PLAYING' ? (
          <GameStage
            language={language}
            gradeLevel={gradeLevel}
            questions={questions}
            onFinishGame={handleFinishGame}
          />
        ) : (
          completedRun && (
            <ResultView
              language={language}
              gradeLevel={gradeLevel}
              outcome={completedRun.outcome}
              prizeWon={completedRun.prizeWon}
              questionsSolved={completedRun.questionsSolved}
              totalTimeSeconds={completedRun.totalTimeSeconds}
              history={completedRun.history}
              onPlayAgain={() => void startChallenge(language, gradeLevel)}
              onBackToLobby={() => setPhase('LOBBY')}
              onViewLeaderboard={() => setActiveTab('leaderboard')}
            />
          )
        )}
      </main>
    </div>
  );
}
