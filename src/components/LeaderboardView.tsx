import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Trophy, ArrowRight } from 'lucide-react';
import { formatDuration, TRANSLATIONS } from '../i18n/translations';
import { formatPrize, type GradeLevel, type Language, type LeaderboardEntry } from '../types/game';

interface LeaderboardViewProps {
  language: Language;
  onStartPlay: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ language, onStartPlay }) => {
  const t = TRANSLATIONS[language];
  const [filterGrade, setFilterGrade] = useState<'all' | GradeLevel>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async (grade: 'all' | GradeLevel) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leaderboard?grade=${grade}`);
      if (!res.ok) {
        throw new Error('Failed to load leaderboard');
      }
      const data = (await res.json()) as { entries: LeaderboardEntry[] };
      setEntries(data.entries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEntries(filterGrade);
  }, [filterGrade, fetchEntries]);

  const filterTabs: Array<{ id: 'all' | GradeLevel; label: string }> = [
    { id: 'all', label: t.leaderboard.filterAll },
    { id: 'elementary', label: t.grades.elementary.title },
    { id: 'junior', label: t.grades.junior.title },
    { id: 'high', label: t.grades.high.title },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-blue-900/70 pb-6">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl font-extrabold text-white">
            {t.leaderboard.title}
          </h1>
          <p className="text-sm text-slate-300">{t.leaderboard.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-blue-900/80 bg-[#08132e] p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterGrade(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 ${
                  filterGrade === tab.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void fetchEntries(filterGrade)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-800/80 bg-[#0b1736] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-amber-400/70 hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t.leaderboard.refresh}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-14 animate-pulse rounded-xl border border-blue-900/50 bg-[#08132e]/70"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-blue-900/70 bg-[#08132e]/80 px-6 py-16 text-center">
          <Trophy className="h-12 w-12 text-amber-400" />
          <h2 className="mt-4 font-display text-xl font-bold text-white">
            {t.leaderboard.emptyTitle}
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-300">{t.leaderboard.emptyBody}</p>
          <button
            type="button"
            onClick={onStartPlay}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            <span>{t.leaderboard.playNow}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-blue-900/70 bg-[#08132e]/90">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-blue-900/70 bg-[#0b1736] text-xs font-semibold text-slate-400">
                <th className="px-4 py-3.5">{t.leaderboard.columns.rank}</th>
                <th className="px-4 py-3.5">{t.leaderboard.columns.player}</th>
                <th className="px-4 py-3.5">{t.leaderboard.columns.grade}</th>
                <th className="px-4 py-3.5 text-right">{t.leaderboard.columns.solved}</th>
                <th className="px-4 py-3.5 text-right">{t.leaderboard.columns.prize}</th>
                <th className="px-4 py-3.5 text-right">{t.leaderboard.columns.time}</th>
                <th className="px-4 py-3.5 text-right">{t.leaderboard.columns.date}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/50">
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const gradeLabel = t.grades[entry.gradeLevel].title;
                const dateLabel = new Date(entry.createdAt).toLocaleDateString(
                  language === 'zh-TW' ? 'zh-TW' : 'en-US',
                  { month: 'short', day: 'numeric' }
                );
                return (
                  <tr
                    key={entry.id}
                    className="transition-colors hover:bg-[#0d1d45]/70"
                  >
                    <td className="px-4 py-3.5 font-mono-tabular font-bold text-slate-200">
                      <span
                        className={
                          rank === 1
                            ? 'text-amber-400'
                            : rank === 2
                              ? 'text-slate-200'
                              : rank === 3
                                ? 'text-amber-600'
                                : 'text-slate-400'
                        }
                      >
                        #{rank}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{entry.playerName}</div>
                      <div className="text-xs text-slate-400">
                        {t.leaderboard.outcomeLabels[entry.outcome]}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{gradeLabel}</td>
                    <td className="px-4 py-3.5 text-right font-mono-tabular text-slate-200">
                      {entry.questionsSolved}/15
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono-tabular font-bold text-amber-400">
                      {formatPrize(entry.prizeWon)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono-tabular text-slate-300">
                      {formatDuration(entry.totalTimeSeconds)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-slate-400">
                      {dateLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
