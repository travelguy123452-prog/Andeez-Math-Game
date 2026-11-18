import type { GradeLevel, Language } from '../types/game';

export interface GradeInfo {
  id: GradeLevel;
  title: string;
  subtitle: string;
  curriculumTag: string;
  description: string;
  topics: string[];
}

export interface TranslationBundle {
  brandTitle: string;
  nav: {
    play: string;
    leaderboard: string;
    curriculum: string;
    rules: string;
  };
  langToggleLabel: string;
  hero: {
    headline: string;
    subheadline: string;
    selectLanguageLabel: string;
    selectGradeLabel: string;
    startButton: string;
    viewLeaderboardButton: string;
    grandPrizeLabel: string;
    questionsCountLabel: string;
    curriculumStandardLabel: string;
  };
  grades: Record<GradeLevel, GradeInfo>;
  loading: {
    title: string;
    subtitle: string;
    steps: string[];
    cancelButton: string;
  };
  error: {
    title: string;
    retryButton: string;
    backButton: string;
  };
  game: {
    questionProgress: string;
    currentPrize: string;
    guaranteedPrize: string;
    timeElapsed: string;
    walkAway: string;
    walkAwayConfirmTitle: string;
    walkAwayConfirmBody: string;
    walkAwayConfirmYes: string;
    walkAwayConfirmNo: string;
    lockInPrompt: string;
    lockInButton: string;
    lockedInStatus: string;
    correctLabel: string;
    incorrectLabel: string;
    solutionTitle: string;
    nextQuestion: string;
    finishRun: string;
    prizeLadderTitle: string;
    safetyNetTag: string;
    lifelines: {
      fiftyFifty: string;
      phoneFriend: string;
      askAudience: string;
      usedLabel: string;
    };
    phoneModal: {
      title: string;
      callerName: string;
      close: string;
    };
    audienceModal: {
      title: string;
      subtitle: string;
      close: string;
    };
    keyboardHint: string;
    muteSound: string;
    unmuteSound: string;
  };
  result: {
    millionaireTitle: string;
    millionaireSubtitle: string;
    walkedAwayTitle: string;
    walkedAwaySubtitle: string;
    eliminatedTitle: string;
    eliminatedSubtitle: string;
    finalWinnings: string;
    questionsSolved: string;
    totalTime: string;
    gradeLabel: string;
    submitScoreTitle: string;
    playerNamePlaceholder: string;
    submitButton: string;
    submittingButton: string;
    submittedMessage: string;
    rankPrefix: string;
    playAgainNewSet: string;
    changeSettings: string;
    viewLeaderboard: string;
    reviewTitle: string;
    yourAnswer: string;
    correctAnswer: string;
    noAnswer: string;
    showExplanation: string;
    hideExplanation: string;
  };
  leaderboard: {
    title: string;
    subtitle: string;
    filterAll: string;
    refresh: string;
    emptyTitle: string;
    emptyBody: string;
    playNow: string;
    columns: {
      rank: string;
      player: string;
      grade: string;
      solved: string;
      prize: string;
      time: string;
      date: string;
    };
    outcomeLabels: {
      MILLIONAIRE: string;
      WALKED_AWAY: string;
      ELIMINATED: string;
    };
  };
  curriculumSection: {
    title: string;
    subtitle: string;
  };
  rulesSection: {
    title: string;
    items: Array<{ title: string; body: string }>;
  };
}

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  en: {
    brandTitle: 'Math Millionaire',
    nav: {
      play: 'Play',
      leaderboard: 'Leaderboard',
      curriculum: '108 Curriculum',
      rules: 'Rules',
    },
    langToggleLabel: '繁體中文',
    hero: {
      headline: 'Fifteen Questions to One Million',
      subheadline:
        'Step into the hot seat with a freshly generated, non-repeating set of 15 super-hard math problems calibrated to Taiwan’s 108 Curriculum.',
      selectLanguageLabel: 'Broadcast Language',
      selectGradeLabel: 'Select Your Grade Tier',
      startButton: 'Enter the Hot Seat',
      viewLeaderboardButton: 'View Leaderboard',
      grandPrizeLabel: '$1,000,000 Top Prize',
      questionsCountLabel: '15 Fresh Questions Every Run',
      curriculumStandardLabel: 'Taiwan 108 Curriculum',
    },
    grades: {
      elementary: {
        id: 'elementary',
        title: 'Elementary School',
        subtitle: 'Grades 5–6 · Stage 3',
        curriculumTag: 'AMC 8 & Olympiad Difficulty',
        description:
          'Multi-step arithmetic reasoning, prime factorization, ratios, percentages, rate problems, and composite geometry without high-school algebra.',
        topics: [
          'Prime Factors, GCD & LCM',
          'Ratios, Proportions & Rates',
          'Sectors, Prisms & Dissections',
          'Logic & Combinatorics',
        ],
      },
      junior: {
        id: 'junior',
        title: 'Junior High School',
        subtitle: 'Grades 7–9 · Stage 4',
        curriculumTag: 'CAP A++ & AMC 10 Difficulty',
        description:
          'Radicals, quadratic equations & Vieta relations, arithmetic/geometric sequences, similarity, circle theorems, and triangle centers.',
        topics: [
          'Quadratics & Functions',
          'Sequences & Inequalities',
          'Circle & Similarity Geometry',
          'Probability & Statistics',
        ],
      },
      high: {
        id: 'high',
        title: 'High School',
        subtitle: 'Grades 10–12 · Stage 5',
        curriculumTag: 'GSAT Top Tier & AIME Entry',
        description:
          'Polynomials, logarithms, trigonometry, 2D/3D vectors, matrices, Bayes probability, conics, differential/integral calculus, and complex numbers.',
        topics: [
          'Trig, Logs & Polynomials',
          'Vectors, Matrices & Conics',
          'Combinatorics & Bayes',
          'Calculus & Complex Plane',
        ],
      },
    },
    loading: {
      title: 'Generating 15 Original Questions',
      subtitle: 'Crafting a brand-new, non-repeating Taiwan 108 Curriculum challenge set...',
      steps: [
        'Selecting 15 distinct 108 Curriculum domains',
        'Verifying algebraic & geometric proofs',
        'Calibrating ascending $100 to $1,000,000 difficulty',
      ],
      cancelButton: 'Cancel',
    },
    error: {
      title: 'Studio Generation Interrupted',
      retryButton: 'Try Generating Again',
      backButton: 'Return to Lobby',
    },
    game: {
      questionProgress: 'Question',
      currentPrize: 'Playing For',
      guaranteedPrize: 'Safety Net',
      timeElapsed: 'Time',
      walkAway: 'Walk Away',
      walkAwayConfirmTitle: 'Walk Away With Your Winnings?',
      walkAwayConfirmBody: 'You can end the game right now and safely lock in your current prize on the leaderboard.',
      walkAwayConfirmYes: 'Take',
      walkAwayConfirmNo: 'Keep Playing',
      lockInPrompt: 'Option selected. Ready to lock in your final answer?',
      lockInButton: 'Final Answer',
      lockedInStatus: 'Final Answer Locked...',
      correctLabel: 'Correct Answer',
      incorrectLabel: 'Incorrect Answer',
      solutionTitle: 'Step-by-Step Solution',
      nextQuestion: 'Next Question',
      finishRun: 'See Final Results',
      prizeLadderTitle: 'Prize Ladder',
      safetyNetTag: 'Safe',
      lifelines: {
        fiftyFifty: '50:50',
        phoneFriend: 'Call Professor',
        askAudience: 'Ask Audience',
        usedLabel: 'Used',
      },
      phoneModal: {
        title: 'Phone a Math Professor',
        callerName: 'Prof. Lin · National Math Committee',
        close: 'Back to Question',
      },
      audienceModal: {
        title: 'Studio Audience Poll',
        subtitle: 'Live response distribution across the 4 choices',
        close: 'Back to Question',
      },
      keyboardHint: 'Shortcuts: A–D or 1–4 to choose · Enter to lock in',
      muteSound: 'Mute Audio',
      unmuteSound: 'Enable Audio',
    },
    result: {
      millionaireTitle: 'Math Millionaire!',
      millionaireSubtitle: 'You conquered all 15 super-hard Taiwan 108 Curriculum questions!',
      walkedAwayTitle: 'Smart Walk Away',
      walkedAwaySubtitle: 'You stepped down from the hot seat with your hard-earned winnings intact.',
      eliminatedTitle: 'Game Over',
      eliminatedSubtitle: 'A tough problem stopped the run, but your safety-net winnings are secured.',
      finalWinnings: 'Final Winnings',
      questionsSolved: 'Solved',
      totalTime: 'Total Time',
      gradeLabel: 'Grade Tier',
      submitScoreTitle: 'Record Your Run on the Leaderboard',
      playerNamePlaceholder: 'Enter your contestant name',
      submitButton: 'Submit Score',
      submittingButton: 'Submitting...',
      submittedMessage: 'Score recorded on the leaderboard!',
      rankPrefix: 'Current Rank',
      playAgainNewSet: 'Play New 15 Questions',
      changeSettings: 'Change Grade / Language',
      viewLeaderboard: 'View Leaderboard',
      reviewTitle: 'Question & Solution Review',
      yourAnswer: 'Your Pick',
      correctAnswer: 'Correct',
      noAnswer: 'Not Answered',
      showExplanation: 'Show Solution',
      hideExplanation: 'Hide Solution',
    },
    leaderboard: {
      title: 'Hall of Champions',
      subtitle: 'Top contestants ranked by prize won, questions solved, and total time.',
      filterAll: 'All Grades',
      refresh: 'Refresh',
      emptyTitle: 'No Contestants Recorded Yet',
      emptyBody: 'Complete a 15-question Millionaire run and submit your name to claim the #1 spot.',
      playNow: 'Start First Challenge',
      columns: {
        rank: 'Rank',
        player: 'Contestant',
        grade: 'Grade',
        solved: 'Solved',
        prize: 'Prize Won',
        time: 'Time',
        date: 'Date',
      },
      outcomeLabels: {
        MILLIONAIRE: 'Millionaire',
        WALKED_AWAY: 'Walked Away',
        ELIMINATED: 'Eliminated',
      },
    },
    curriculumSection: {
      title: 'Aligned With Taiwan’s 108 Curriculum (108課綱)',
      subtitle:
        'Every run synthesizes 15 fresh, non-repeating problems across distinct curriculum competencies—strictly enforcing grade-appropriate tools while pushing problem-solving depth to competition level.',
    },
    rulesSection: {
      title: 'Studio Rules & Lifelines',
      items: [
        {
          title: '15 Ascending Steps to $1,000,000',
          body: 'Questions escalate from clever warm-ups ($100) to Olympiad-grade capstone problems ($1,000,000).',
        },
        {
          title: 'Two Guaranteed Safety Nets',
          body: 'Clearing Question 5 guarantees $1,000 and Question 10 guarantees $32,000, even if a later answer is wrong.',
        },
        {
          title: 'Three Classic Lifelines',
          body: 'Use 50:50 to remove two wrong options, Call Professor for a mathematical hint, or Ask Audience for live poll odds.',
        },
        {
          title: 'Walk Away Anytime After Q1',
          body: 'Unsure about a tough proof? Walk away before locking in to keep 100% of your current prize.',
        },
      ],
    },
  },
  'zh-TW': {
    brandTitle: '數學百萬富翁',
    nav: {
      play: '開始挑戰',
      leaderboard: '排行榜',
      curriculum: '108課綱範圍',
      rules: '遊戲規則',
    },
    langToggleLabel: 'English',
    hero: {
      headline: '十五道極限數學，挑戰百萬獎金',
      subheadline:
        '嚴格依循台灣 108 課綱命題，每次開局即時生成 15 題絕不重複的競賽級高難度數學題，考驗你的邏輯與推演極限。',
      selectLanguageLabel: '選擇作答語言',
      selectGradeLabel: '選擇挑戰學級',
      startButton: '登上挑戰席',
      viewLeaderboardButton: '查看排行榜',
      grandPrizeLabel: '最高獎金 $1,000,000',
      questionsCountLabel: '每局 15 題全新不重複',
      curriculumStandardLabel: '台灣 108 課綱標準',
    },
    grades: {
      elementary: {
        id: 'elementary',
        title: '國小高年級',
        subtitle: '五至六年級 · 第三學習階段',
        curriculumTag: 'AMC 8 與奧林匹亞資優難度',
        description:
          '嚴格不使用國中代數方程，聚焦質因數、比與比例、百分率、速率追趕、圓扇形與柱體幾何及邏輯計數推理。',
        topics: [
          '質因數與公因倍數應用',
          '比與比值、速率問題',
          '圓與扇形複合幾何',
          '數列規律與邏輯組合',
        ],
      },
      junior: {
        id: 'junior',
        title: '國中組',
        subtitle: '七至九年級 · 第四學習階段',
        curriculumTag: '會考精熟 A++ 與 AMC 10 難度',
        description:
          '涵蓋根式化簡、一元二次方程與根係數、等差等比數列、二次函數極值、相似形與圓冪幾何、三角形三心與機率統計。',
        topics: [
          '二次方程與函數極值',
          '數列級數與不等式',
          '相似三角形與圓幾何',
          '古典機率與統計量數',
        ],
      },
      high: {
        id: 'high',
        title: '高中組',
        subtitle: '十至十二年級 · 第五學習階段',
        curriculumTag: '學測數A頂標 / 分科數甲 / AIME',
        description:
          '涵蓋多項式、指對數、三角疊合與正餘弦、平面與空間向量、矩陣線性變換、排容與貝氏定理、微積分、圓錐曲線與複數平面。',
        topics: [
          '三角函數、指對數與多項式',
          '空間向量、矩陣與圓錐曲線',
          '排列組合與貝氏條件機率',
          '微積分應用與複數極式',
        ],
      },
    },
    loading: {
      title: '正在即時命題 15 道高難度試題',
      subtitle: '依台灣 108 課綱生成全新不重複題組並驗證數學推導中…',
      steps: [
        '抽樣分配 15 個 108 課綱核心單元',
        '校驗四個選項與嚴謹數學證明',
        '依 $100 至 $1,000,000 梯度排序難度',
      ],
      cancelButton: '取消返回',
    },
    error: {
      title: '試題生成中斷',
      retryButton: '重新生成試題',
      backButton: '返回大廳',
    },
    game: {
      questionProgress: '第',
      currentPrize: '本題獎金',
      guaranteedPrize: '保底獎金',
      timeElapsed: '累計時間',
      walkAway: '見好就收',
      walkAwayConfirmTitle: '確定帶著目前獎金離開嗎？',
      walkAwayConfirmBody: '你可以立即結束挑戰，並將目前累積的獎金完整登錄至排行榜。',
      walkAwayConfirmYes: '領取獎金',
      walkAwayConfirmNo: '繼續作答',
      lockInPrompt: '已選擇選項，確定要鎖定為最終答案嗎？',
      lockInButton: '鎖定最終答案',
      lockedInStatus: '最終答案已鎖定…',
      correctLabel: '答對了',
      incorrectLabel: '答錯了',
      solutionTitle: '詳解推導',
      nextQuestion: '前進下一題',
      finishRun: '查看最終成績',
      prizeLadderTitle: '獎金階梯',
      safetyNetTag: '保底',
      lifelines: {
        fiftyFifty: '50:50 刪去兩項',
        phoneFriend: 'Call Out 數學教授',
        askAudience: '現場觀眾投票',
        usedLabel: '已使用',
      },
      phoneModal: {
        title: '連線數學專家',
        callerName: '林教授 · 數學奧林匹亞命題委員',
        close: '回到題目',
      },
      audienceModal: {
        title: '現場觀眾即時投票',
        subtitle: '四個選項的觀眾支持率分布',
        close: '回到題目',
      },
      keyboardHint: '快捷鍵：按 A–D 或 1–4 選題 · 按 Enter 鎖定答案',
      muteSound: '關閉音效',
      unmuteSound: '開啟音效',
    },
    result: {
      millionaireTitle: '數學百萬富翁誕生！',
      millionaireSubtitle: '你成功制霸 15 道台灣 108 課綱終極數學難題！',
      walkedAwayTitle: '智勇雙全 · 見好就收',
      walkedAwaySubtitle: '你選擇穩健退場，成功守住累積獎金。',
      eliminatedTitle: '挑戰止步',
      eliminatedSubtitle: '雖然在這一題止步，但你依然保有已通過的安全門檻獎金。',
      finalWinnings: '最終獲得獎金',
      questionsSolved: '答對題數',
      totalTime: '總作答時間',
      gradeLabel: '挑戰學級',
      submitScoreTitle: '將成績登錄至全球排行榜',
      playerNamePlaceholder: '請輸入挑戰者暱稱',
      submitButton: '登錄排行榜',
      submittingButton: '登錄中…',
      submittedMessage: '已成功登錄至排行榜！',
      rankPrefix: '目前排名',
      playAgainNewSet: '再玩一局全新 15 題',
      changeSettings: '更換語言或學級',
      viewLeaderboard: '前往排行榜',
      reviewTitle: '本局題目與詳解回顧',
      yourAnswer: '你的選擇',
      correctAnswer: '正確答案',
      noAnswer: '未作答',
      showExplanation: '展開詳解',
      hideExplanation: '收合詳解',
    },
    leaderboard: {
      title: '百萬數學榮譽榜',
      subtitle: '依獲得獎金、答對題數與總耗時排序所有真實挑戰紀錄。',
      filterAll: '全部學級',
      refresh: '重新整理',
      emptyTitle: '目前尚無挑戰紀錄',
      emptyBody: '完成一局 15 題挑戰並送出暱稱，成為首位登上榮譽榜的數學高手！',
      playNow: '立即開始挑戰',
      columns: {
        rank: '名次',
        player: '挑戰者',
        grade: '學級',
        solved: '答對題數',
        prize: '獲得獎金',
        time: '耗時',
        date: '日期',
      },
      outcomeLabels: {
        MILLIONAIRE: '百萬富翁',
        WALKED_AWAY: '見好就收',
        ELIMINATED: '止步離場',
      },
    },
    curriculumSection: {
      title: '嚴謹對齊台灣 108 課綱數學領綱',
      subtitle:
        '每場挑戰都會橫跨 15 個不同核心單元即時命題並記錄題幹指紋，確保不重複出題、不超綱工具、難度直達競賽頂標。',
    },
    rulesSection: {
      title: '節目賽制與三大求救錦囊',
      items: [
        {
          title: '15 階遞進挑戰 $1,000,000',
          body: '題目從 $100 的巧思熱身一路攀升至 $1,000,000 的奧林匹亞壓軸難題。',
        },
        {
          title: '兩道保底安全門檻',
          body: '通過第 5 題即保底 $1,000，通過第 10 題即保底 $32,000，後續答錯仍可帶走保底獎金。',
        },
        {
          title: '三大經典求救錦囊',
          body: '提供「50:50 刪去兩項」、「Call Out 數學教授」提示關鍵定理與「現場觀眾投票」參考。',
        },
        {
          title: '第 1 題後隨時見好就收',
          body: '遇到毫無把握的壓軸題時，可在鎖定答案前選擇退場，全額帶走目前獎金。',
        },
      ],
    },
  },
};

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
