export type Language = 'en' | 'zh-TW';

export type GradeLevel = 'elementary' | 'junior' | 'high';

export type GamePhase = 'LOBBY' | 'LOADING' | 'PLAYING' | 'RESULT';

export type GameOutcome = 'MILLIONAIRE' | 'WALKED_AWAY' | 'ELIMINATED';

export interface Question {
  id: string;
  level: number;
  prize: number;
  topic: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  professorHint: string;
  explanation: string;
}

export interface AnsweredRecord {
  question: Question;
  selectedIndex: number | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  gradeLevel: GradeLevel;
  language: Language;
  prizeWon: number;
  questionsSolved: number;
  totalTimeSeconds: number;
  outcome: GameOutcome;
  createdAt: string;
}

export interface PrizeStep {
  level: number;
  amount: number;
  isSafetyNet: boolean;
}

export const PRIZE_LADDER: PrizeStep[] = [
  { level: 1, amount: 100, isSafetyNet: false },
  { level: 2, amount: 200, isSafetyNet: false },
  { level: 3, amount: 300, isSafetyNet: false },
  { level: 4, amount: 500, isSafetyNet: false },
  { level: 5, amount: 1000, isSafetyNet: true },
  { level: 6, amount: 2000, isSafetyNet: false },
  { level: 7, amount: 4000, isSafetyNet: false },
  { level: 8, amount: 8000, isSafetyNet: false },
  { level: 9, amount: 16000, isSafetyNet: false },
  { level: 10, amount: 32000, isSafetyNet: true },
  { level: 11, amount: 64000, isSafetyNet: false },
  { level: 12, amount: 125000, isSafetyNet: false },
  { level: 13, amount: 250000, isSafetyNet: false },
  { level: 14, amount: 500000, isSafetyNet: false },
  { level: 15, amount: 1000000, isSafetyNet: true },
];

export function formatPrize(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

export function getSafetyNetPrize(solvedCount: number): number {
  if (solvedCount >= 15) return 1000000;
  if (solvedCount >= 10) return 32000;
  if (solvedCount >= 5) return 1000;
  return 0;
}
