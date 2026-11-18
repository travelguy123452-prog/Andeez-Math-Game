import React, { useState } from 'react';
import { ArrowRight, Trophy, Check } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { GradeLevel, Language } from '../types/game';

interface LobbyViewProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  gradeLevel: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
}

const STUDIO_BACKDROP_SRC = '/src/assets/images/studio_arena_backdrop_1794992124880.jpg';
const TROPHY_EMBLEM_SRC = '/src/assets/images/millionaire_trophy_emblem_1794992132126.jpg';

export const LobbyView: React.FC<LobbyViewProps> = ({
  language,
  onSelectLanguage,
  gradeLevel,
  onSelectGrade,
  onStartGame,
  onOpenLeaderboard,
}) => {
  const t = TRANSLATIONS[language];
  const [backdropFailed, setBackdropFailed] = useState(false);
  const [trophyFailed, setTrophyFailed] = useState(false);

  const gradeKeys: GradeLevel[] = ['elementary', 'junior', 'high'];

  return (
    <div className="pb-20">
      {/* Studio Arena Hero */}
      <section className="relative overflow-hidden border-b border-blue-900/50">
        {!backdropFailed && (
          <img
            src={STUDIO_BACKDROP_SRC}
            alt="Quiz show television studio stage with spotlights"
            referrerPolicy="no-referrer"
            onError={() => setBackdropFailed(true)}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#04081a]/90 via-[#060d26]/75 to-[#04081a]"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch">
            {/* Left column: Headline, Controls & Launch CTA */}
            <div className="flex flex-col justify-between gap-8 lg:col-span-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-amber-300/90">
                  <span>{t.hero.curriculumStandardLabel}</span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span>{t.hero.questionsCountLabel}</span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="tabular-nums">{t.hero.grandPrizeLabel}</span>
                </div>

                <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl text-balance max-w-3xl leading-[1.12]">
                  {t.hero.headline}
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                  {t.hero.subheadline}
                </p>
              </div>

              {/* Language Selector */}
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-wide text-slate-400">
                  {t.hero.selectLanguageLabel}
                </p>
                <div className="inline-flex rounded-lg border border-blue-800/70 bg-[#08122b] p-1">
                  <button
                    type="button"
                    onClick={() => onSelectLanguage('en')}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 ${
                      language === 'en'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectLanguage('zh-TW')}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 ${
                      language === 'zh-TW'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    繁體中文 (台灣)
                  </button>
                </div>
              </div>

              {/* Grade Level Selector */}
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-wide text-slate-400">
                  {t.hero.selectGradeLabel}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {gradeKeys.map((key) => {
                    const info = t.grades[key];
                    const selected = gradeLevel === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onSelectGrade(key)}
                        className={`group flex flex-col justify-between rounded-xl border p-4 text-left transition-all focus-visible:outline-2 focus-visible:outline-amber-400 ${
                          selected
                            ? 'border-amber-400 bg-[#0f224d] shadow-lg shadow-amber-500/10'
                            : 'border-blue-900/80 bg-[#08132e]/90 hover:border-blue-600/80 hover:bg-[#0c1a3d]'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-lg font-bold text-white">
                              {info.title}
                            </span>
                            {selected && (
                              <span
                                aria-label="Selected"
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 shrink-0"
                              >
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                            <span>{info.subtitle}</span>
                          </div>
                        </div>

                        <p className="mt-3 text-xs font-medium text-amber-300/90">
                          {info.curriculumTag}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary & Secondary Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={onStartGame}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-amber-500 px-7 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.99] transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                >
                  <span>{t.hero.startButton}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={onOpenLeaderboard}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-700/80 bg-[#0b1736]/90 px-5 py-3.5 text-sm font-semibold text-slate-100 hover:border-blue-400 hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                >
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>{t.hero.viewLeaderboardButton}</span>
                </button>
              </div>
            </div>

            {/* Right column: Studio Trophy Emblem & Active Grade Focus */}
            <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-blue-900/70 bg-[#08132e]/95 p-6">
              <div className="overflow-hidden rounded-xl border border-blue-800/50 bg-[#050b1d] aspect-square">
                {!trophyFailed ? (
                  <img
                    src={TROPHY_EMBLEM_SRC}
                    alt="Sapphire and gold geometric polyhedron trophy emblem"
                    referrerPolicy="no-referrer"
                    onError={() => setTrophyFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0b1736] to-[#04081a] p-6 text-center">
                    <Trophy className="h-14 w-14 text-amber-400" />
                    <span className="mt-3 font-display text-lg font-bold text-white">
                      {t.brandTitle}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-2 border-t border-blue-900/70 pt-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{t.grades[gradeLevel].subtitle}</span>
                  <span className="font-mono-tabular text-amber-400 font-semibold">$1,000,000</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  {t.grades[gradeLevel].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 108 Curriculum Breakdown */}
      <section id="curriculum-section" className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="max-w-3xl space-y-2">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl text-balance">
            {t.curriculumSection.title}
          </h2>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            {t.curriculumSection.subtitle}
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {gradeKeys.map((key) => {
            const info = t.grades[key];
            return (
              <div
                key={key}
                className="flex flex-col justify-between rounded-xl border border-blue-900/70 bg-[#08132e]/80 p-6"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-white">{info.title}</h3>
                    <span className="text-xs text-slate-400">{info.subtitle}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-amber-400">
                    {info.curriculumTag}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {info.description}
                  </p>
                </div>

                <ul className="mt-5 space-y-1.5 border-t border-blue-900/60 pt-4 text-xs text-slate-300">
                  {info.topics.map((topic) => (
                    <li key={topic} className="flex items-center gap-2">
                      <span aria-hidden="true" className="text-amber-400">—</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Studio Rules & Lifelines */}
      <section id="rules-section" className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          {t.rulesSection.title}
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.rulesSection.items.map((item, idx) => (
            <div
              key={item.title}
              className="rounded-xl border border-blue-900/70 bg-[#08132e]/70 p-5"
            >
              <p className="font-mono-tabular text-xs font-bold text-amber-400">
                0{idx + 1}.
              </p>
              <h3 className="mt-2 font-display text-base font-bold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
