import React from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import type { Language } from '../types/game';

interface TopNavProps {
  language: Language;
  onToggleLanguage: () => void;
  activeTab: 'play' | 'leaderboard';
  onNavigate: (tab: 'play' | 'leaderboard', anchorId?: string) => void;
  isPlaying: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  language,
  onToggleLanguage,
  activeTab,
  onNavigate,
  isPlaying,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 border-b border-blue-900/50 bg-[#04081a]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-line wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('play')}
          className="font-display text-lg font-bold tracking-tight text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
        >
          {t.brandTitle}
        </button>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300"
        >
          <button
            type="button"
            onClick={() => onNavigate('play')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 ${
              activeTab === 'play' ? 'text-white underline decoration-amber-400 decoration-2 underline-offset-8' : ''
            }`}
          >
            {t.nav.play}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('leaderboard')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 ${
              activeTab === 'leaderboard'
                ? 'text-white underline decoration-amber-400 decoration-2 underline-offset-8'
                : ''
            }`}
          >
            {t.nav.leaderboard}
          </button>
          <button
            type="button"
            disabled={isPlaying}
            onClick={() => onNavigate('play', 'curriculum-section')}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
          >
            {t.nav.curriculum}
          </button>
          <button
            type="button"
            disabled={isPlaying}
            onClick={() => onNavigate('play', 'rules-section')}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
          >
            {t.nav.rules}
          </button>
        </nav>

        {/* Zone 3: Single primary action (Language switcher) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="rounded-lg border border-blue-700/70 bg-[#0b1736] px-4 py-2 text-xs font-semibold text-slate-100 hover:border-amber-400/70 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            {t.langToggleLabel}
          </button>
        </div>
      </div>
    </header>
  );
};
