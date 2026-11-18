import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDuration, TRANSLATIONS } from '../i18n/translations';
import {
  formatPrize,
  type AnsweredRecord,
  type GameOutcome,
  type GradeLevel,
  type Language,
} from '../types/game';
import { MathText } from './MathText';

interface ResultViewProps {
  language: Language;
  gradeLevel: GradeLevel;
  outcome: GameOutcome;
  prizeWon: number;
  questionsSolved: number;
  totalTimeSeconds: number;
  history: AnsweredRecord[];
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onViewLeaderboard: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export const ResultView: React.FC<ResultViewProps> = ({
  language,
  gradeLevel,
  outcome,
  prizeWon,
  questionsSolved,
  totalTimeSeconds,
  history,
  onPlayAgain,
  onBackToLobby,
  onViewLeaderboard,
}) => {
  const t = TRANSLATIONS[language];
  const [playerName, setPlayerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const headline =
    outcome === 'MILLIONAIRE'
      ? t.result.millionaireTitle
      : outcome === 'WALKED_AWAY'
        ? t.result.walkedAwayTitle
        : t.result.eliminatedTitle;

  const subtitle =
    outcome === 'MILLIONAIRE'
      ? t.result.millionaireSubtitle
      : outcome === 'WALKED_AWAY'
        ? t.result.walkedAwaySubtitle
        : t.result.eliminatedSubtitle;

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = playerName.trim();
    if (!trimmed || submitting || submittedRank !== null) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: trimmed,
          gradeLevel,
          language,
          prizeWon,
          questionsSolved,
          totalTimeSeconds,
          outcome,
        }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error || 'Failed to save score');
      }
      const data = (await res.json()) as { rank: number };
      setSubmittedRank(data.rank);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExplain = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-10">
      {/* Broadcast Summary Banner */}
      <section className="rounded-2xl border border-blue-800/80 bg-[#08132e]/95 p-6 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl text-balance">
              {headline}
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{subtitle}</p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/50 bg-amber-500/10 shrink-0">
            <Trophy className="h-8 w-8 text-amber-400" />
          </div>
        </div>

        {/* 4-Column KPI Strip */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-blue-900/70 pt-6 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">{t.result.finalWinnings}</p>
            <p className="mt-1 font-mono-tabular text-2xl font-bold text-amber-400">
              {formatPrize(prizeWon)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{t.result.questionsSolved}</p>
            <p className="mt-1 font-mono-tabular text-2xl font-bold text-white">
              {questionsSolved} / 15
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{t.result.totalTime}</p>
            <p className="mt-1 font-mono-tabular text-2xl font-bold text-white">
              {formatDuration(totalTimeSeconds)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{t.result.gradeLabel}</p>
            <p className="mt-1 font-display text-lg font-bold text-slate-100">
              {t.grades[gradeLevel].title}
            </p>
          </div>
        </div>

        {/* Leaderboard Submission */}
        <div className="mt-8 border-t border-blue-900/70 pt-6">
          <h2 className="font-display text-base font-bold text-white">
            {t.result.submitScoreTitle}
          </h2>

          {submittedRank !== null ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500/40 bg-emerald-950/25 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                <span>
                  {t.result.submittedMessage} · {t.result.rankPrefix}:{' '}
                  <strong className="font-mono-tabular">#{submittedRank}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={onViewLeaderboard}
                className="text-sm font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4"
              >
                {t.result.viewLeaderboard}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitScore} className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                maxLength={24}
                required
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={t.result.playerNamePlaceholder}
                className="flex-1 rounded-xl border border-blue-800/80 bg-[#050b1d] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting || !playerName.trim()}
                className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
              >
                {submitting ? t.result.submittingButton : t.result.submitButton}
              </button>
            </form>
          )}
          {submitError && <p className="mt-2 text-xs text-red-400">{submitError}</p>}
        </div>

        {/* Next Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-blue-900/70 pt-6">
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{t.result.playAgainNewSet}</span>
          </button>

          <button
            type="button"
            onClick={onBackToLobby}
            className="rounded-xl border border-blue-700/80 bg-[#0b1736] px-5 py-3 text-sm font-semibold text-slate-200 hover:border-blue-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {t.result.changeSettings}
          </button>

          <button
            type="button"
            onClick={onViewLeaderboard}
            className="rounded-xl border border-blue-700/80 bg-[#0b1736] px-5 py-3 text-sm font-semibold text-amber-300 hover:border-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t.result.viewLeaderboard}
          </button>
        </div>
      </section>

      {/* Attempted Questions & Solutions Review */}
      {history.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-white">{t.result.reviewTitle}</h2>

          <div className="space-y-3">
            {history.map((rec) => {
              const expanded = Boolean(expandedMap[rec.question.id]);
              return (
                <div
                  key={rec.question.id}
                  className="rounded-xl border border-blue-900/70 bg-[#08132e]/85 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono-tabular font-bold text-amber-400">
                        Q{rec.question.level} · {formatPrize(rec.question.prize)}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-400">{rec.question.topic}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {rec.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{t.game.correctLabel}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400">
                          <XCircle className="h-4 w-4" />
                          <span>{t.game.incorrectLabel}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-sm leading-relaxed text-white sm:text-base">
                    <MathText text={rec.question.question} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <span>
                      {t.result.yourAnswer}:{' '}
                      <strong className={rec.isCorrect ? 'text-emerald-300' : 'text-red-300'}>
                        {rec.selectedIndex !== null
                          ? `${OPTION_LETTERS[rec.selectedIndex]}. `
                          : t.result.noAnswer}
                        {rec.selectedIndex !== null && (
                          <MathText text={rec.question.options[rec.selectedIndex]} />
                        )}
                      </strong>
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>
                      {t.result.correctAnswer}:{' '}
                      <strong className="text-emerald-300">
                        {OPTION_LETTERS[rec.question.correctIndex]}.{' '}
                        <MathText text={rec.question.options[rec.question.correctIndex]} />
                      </strong>
                    </span>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => toggleExplain(rec.question.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      <span>
                        {expanded ? t.result.hideExplanation : t.result.showExplanation}
                      </span>
                      {expanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {expanded && (
                      <div className="mt-3 border-t border-blue-900/70 pt-3 text-sm leading-relaxed text-slate-300">
                        <MathText text={rec.question.explanation} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
