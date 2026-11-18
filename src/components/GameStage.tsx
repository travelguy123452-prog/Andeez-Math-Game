import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  PhoneCall,
  Users,
  Split,
  Volume2,
  VolumeX,
  LogOut,
  ArrowRight,
  X,
} from 'lucide-react';
import { formatDuration, TRANSLATIONS } from '../i18n/translations';
import {
  PRIZE_LADDER,
  formatPrize,
  getSafetyNetPrize,
  type AnsweredRecord,
  type GameOutcome,
  type GradeLevel,
  type Language,
  type Question,
} from '../types/game';
import { studioAudio } from '../utils/sound';
import { MathText } from './MathText';

interface GameStageProps {
  language: Language;
  gradeLevel: GradeLevel;
  questions: Question[];
  onFinishGame: (result: {
    outcome: GameOutcome;
    prizeWon: number;
    questionsSolved: number;
    totalTimeSeconds: number;
    history: AnsweredRecord[];
  }) => void;
}

type AnswerRevealState = 'SELECTING' | 'LOCKED_SUSPENSE' | 'REVEALED';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

function computeAudiencePoll(
  level: number,
  correctIndex: number,
  eliminatedIndices: number[]
): [number, number, number, number] {
  const activeIndices = [0, 1, 2, 3].filter((i) => !eliminatedIndices.includes(i));
  const counts: [number, number, number, number] = [0, 0, 0, 0];

  // Higher question levels have lower audience certainty
  const baseCorrectShare = Math.max(34, 78 - level * 3);
  const jitter = Math.floor(Math.random() * 11) - 5;
  const correctShare = Math.min(86, Math.max(30, baseCorrectShare + jitter));
  let remaining = 100 - correctShare;

  counts[correctIndex] = correctShare;
  const wrongActive = activeIndices.filter((i) => i !== correctIndex);

  wrongActive.forEach((idx, pos) => {
    if (pos === wrongActive.length - 1) {
      counts[idx] = remaining;
    } else {
      const share = Math.floor(Math.random() * (remaining + 1) * 0.65);
      counts[idx] = share;
      remaining -= share;
    }
  });

  return counts;
}

export const GameStage: React.FC<GameStageProps> = ({
  language,
  gradeLevel,
  questions,
  onFinishGame,
}) => {
  const t = TRANSLATIONS[language];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealState, setRevealState] = useState<AnswerRevealState>('SELECTING');
  const [history, setHistory] = useState<AnsweredRecord[]>([]);

  // Timers
  const [totalSeconds, setTotalSeconds] = useState(0);
  const questionStartRef = useRef<number>(Date.now());
  const suspenseTimerRef = useRef<number | null>(null);

  // Audio mute state
  const [muted, setMuted] = useState(() => studioAudio.isMuted());

  // Lifelines
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedPhoneFriend, setUsedPhoneFriend] = useState(false);
  const [usedAskAudience, setUsedAskAudience] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [audiencePoll, setAudiencePoll] = useState<[number, number, number, number] | null>(null);
  const [audienceModalOpen, setAudienceModalOpen] = useState(false);
  const [walkAwayConfirmOpen, setWalkAwayConfirmOpen] = useState(false);

  const currentQuestion = questions[currentIndex];
  const solvedCount = currentIndex;
  const currentBankedPrize = solvedCount > 0 ? PRIZE_LADDER[solvedCount - 1].amount : 0;
  const guaranteedPrize = getSafetyNetPrize(solvedCount);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    return () => {
      if (suspenseTimerRef.current !== null) {
        window.clearTimeout(suspenseTimerRef.current);
      }
    };
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    studioAudio.setMuted(next);
  };

  const handleSelectOption = useCallback(
    (idx: number) => {
      if (revealState !== 'SELECTING') return;
      if (eliminatedOptions.includes(idx)) return;
      studioAudio.playSelect();
      setSelectedIndex(idx);
    },
    [eliminatedOptions, revealState]
  );

  const handleLockInAnswer = useCallback(() => {
    if (selectedIndex === null || revealState !== 'SELECTING') return;

    setRevealState('LOCKED_SUSPENSE');
    studioAudio.playLockIn();

    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000));

    suspenseTimerRef.current = window.setTimeout(() => {
      const isCorrect = selectedIndex === currentQuestion.correctIndex;
      setRevealState('REVEALED');

      if (isCorrect) {
        if (currentIndex === questions.length - 1) {
          studioAudio.playMillionaireWin();
        } else {
          studioAudio.playCorrect();
        }
      } else {
        studioAudio.playWrong();
      }

      setHistory((prev) => [
        ...prev,
        {
          question: currentQuestion,
          selectedIndex,
          isCorrect,
          timeSpentSeconds: timeSpent,
        },
      ]);
    }, 650);
  }, [currentIndex, currentQuestion, questions.length, revealState, selectedIndex]);

  const handleAdvance = useCallback(() => {
    const lastRecord = history[history.length - 1];
    if (!lastRecord) return;

    if (!lastRecord.isCorrect) {
      const finalPrize = getSafetyNetPrize(solvedCount);
      onFinishGame({
        outcome: 'ELIMINATED',
        prizeWon: finalPrize,
        questionsSolved: solvedCount,
        totalTimeSeconds: Math.max(1, totalSeconds),
        history,
      });
      return;
    }

    if (currentIndex === questions.length - 1) {
      onFinishGame({
        outcome: 'MILLIONAIRE',
        prizeWon: 1000000,
        questionsSolved: 15,
        totalTimeSeconds: Math.max(1, totalSeconds),
        history,
      });
      return;
    }

    // Move to next question
    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
    setRevealState('SELECTING');
    setEliminatedOptions([]);
    setPhoneModalOpen(false);
    setAudienceModalOpen(false);
    setAudiencePoll(null);
    questionStartRef.current = Date.now();
  }, [currentIndex, history, onFinishGame, questions.length, solvedCount, totalSeconds]);

  const handleConfirmWalkAway = () => {
    studioAudio.playWalkAway();
    setWalkAwayConfirmOpen(false);
    onFinishGame({
      outcome: 'WALKED_AWAY',
      prizeWon: currentBankedPrize,
      questionsSolved: solvedCount,
      totalTimeSeconds: Math.max(1, totalSeconds),
      history,
    });
  };

  // Keyboard shortcuts: A-D / 1-4 to pick, Enter to lock in or advance
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phoneModalOpen || audienceModalOpen || walkAwayConfirmOpen) {
        if (e.key === 'Escape') {
          setPhoneModalOpen(false);
          setAudienceModalOpen(false);
          setWalkAwayConfirmOpen(false);
        }
        return;
      }

      const key = e.key.toUpperCase();
      if (revealState === 'SELECTING') {
        const map: Record<string, number> = {
          A: 0,
          '1': 0,
          B: 1,
          '2': 1,
          C: 2,
          '3': 2,
          D: 3,
          '4': 3,
        };
        if (key in map) {
          e.preventDefault();
          handleSelectOption(map[key]);
        } else if (e.key === 'Enter' && selectedIndex !== null) {
          e.preventDefault();
          handleLockInAnswer();
        }
      } else if (revealState === 'REVEALED' && e.key === 'Enter') {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    audienceModalOpen,
    handleAdvance,
    handleLockInAnswer,
    handleSelectOption,
    phoneModalOpen,
    revealState,
    selectedIndex,
    walkAwayConfirmOpen,
  ]);

  const triggerFiftyFifty = () => {
    if (usedFiftyFifty || revealState !== 'SELECTING') return;
    studioAudio.playLifeline();
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== currentQuestion.correctIndex);
    const shuffledWrong = [...wrongIndices].sort(() => Math.random() - 0.5);
    const toRemove = shuffledWrong.slice(0, 2);
    setEliminatedOptions(toRemove);
    if (selectedIndex !== null && toRemove.includes(selectedIndex)) {
      setSelectedIndex(null);
    }
    setUsedFiftyFifty(true);
  };

  const triggerPhoneFriend = () => {
    if (usedPhoneFriend || revealState !== 'SELECTING') return;
    studioAudio.playLifeline();
    setUsedPhoneFriend(true);
    setPhoneModalOpen(true);
  };

  const triggerAskAudience = () => {
    if (usedAskAudience || revealState !== 'SELECTING') return;
    studioAudio.playLifeline();
    const poll = computeAudiencePoll(
      currentQuestion.level,
      currentQuestion.correctIndex,
      eliminatedOptions
    );
    setAudiencePoll(poll);
    setUsedAskAudience(true);
    setAudienceModalOpen(true);
  };

  const reversedLadder = useMemo(() => [...PRIZE_LADDER].reverse(), []);
  const lastAnswerCorrect =
    revealState === 'REVEALED' && selectedIndex === currentQuestion.correctIndex;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      {/* Studio HUD Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-900/70 pb-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-display font-bold text-white tabular-nums">
            {language === 'zh-TW'
              ? `${t.game.questionProgress} ${currentQuestion.level} / 15 題`
              : `${t.game.questionProgress} ${currentQuestion.level} / 15`}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-300">{t.grades[gradeLevel].title}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-amber-300/90 font-medium">{currentQuestion.topic}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <span className="text-slate-400">
              {t.game.guaranteedPrize}:{' '}
              <strong className="font-mono-tabular text-slate-100">
                {formatPrize(guaranteedPrize)}
              </strong>
            </span>
            <span className="text-slate-400">
              {t.game.timeElapsed}:{' '}
              <strong className="font-mono-tabular text-slate-100">
                {formatDuration(totalSeconds)}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? t.game.unmuteSound : t.game.muteSound}
            title={muted ? t.game.unmuteSound : t.game.muteSound}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-800/80 bg-[#08132e] text-slate-300 hover:border-amber-400/70 hover:text-white transition-colors"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {solvedCount > 0 && revealState === 'SELECTING' && (
            <button
              type="button"
              onClick={() => setWalkAwayConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-[#0b1736] px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/15 transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>
                {t.game.walkAway} ({formatPrize(currentBankedPrize)})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Grid: Hot Seat Stage (Left/Center) + Prize Ladder (Right) */}
      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-9 space-y-6">
          {/* Lifelines & Playing-For Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-slate-400">{t.game.currentPrize}</p>
              <p className="font-mono-tabular text-2xl font-bold text-amber-400 sm:text-3xl">
                {formatPrize(currentQuestion.prize)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={usedFiftyFifty || revealState !== 'SELECTING'}
                onClick={triggerFiftyFifty}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 ${
                  usedFiftyFifty
                    ? 'border-slate-800 bg-slate-900/50 text-slate-500 line-through cursor-not-allowed'
                    : 'border-blue-600/80 bg-[#0b1b42] text-white hover:border-amber-400 hover:text-amber-300 disabled:opacity-50'
                }`}
              >
                <Split className="h-4 w-4 text-amber-400" />
                <span>{t.game.lifelines.fiftyFifty}</span>
              </button>

              <button
                type="button"
                disabled={usedPhoneFriend || revealState !== 'SELECTING'}
                onClick={triggerPhoneFriend}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 ${
                  usedPhoneFriend
                    ? 'border-slate-800 bg-slate-900/50 text-slate-500 line-through cursor-not-allowed'
                    : 'border-blue-600/80 bg-[#0b1b42] text-white hover:border-amber-400 hover:text-amber-300 disabled:opacity-50'
                }`}
              >
                <PhoneCall className="h-4 w-4 text-amber-400" />
                <span>{t.game.lifelines.phoneFriend}</span>
              </button>

              <button
                type="button"
                disabled={usedAskAudience || revealState !== 'SELECTING'}
                onClick={triggerAskAudience}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 ${
                  usedAskAudience
                    ? 'border-slate-800 bg-slate-900/50 text-slate-500 line-through cursor-not-allowed'
                    : 'border-blue-600/80 bg-[#0b1b42] text-white hover:border-amber-400 hover:text-amber-300 disabled:opacity-50'
                }`}
              >
                <Users className="h-4 w-4 text-amber-400" />
                <span>{t.game.lifelines.askAudience}</span>
              </button>
            </div>
          </div>

          {/* Signature Millionaire Question Lozenge */}
          <div className="relative py-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"
            />
            <div className="millionaire-lozenge bg-gradient-to-r from-blue-500/70 via-amber-400/50 to-blue-500/70 p-[1.5px] shadow-xl shadow-blue-950/80">
              <div className="millionaire-lozenge bg-gradient-to-b from-[#0d1f4a] to-[#07112b] px-8 py-7 sm:px-12 sm:py-9">
                <div className="text-base leading-relaxed text-white sm:text-xl font-medium">
                  <MathText text={currentQuestion.question} />
                </div>
              </div>
            </div>
          </div>

          {/* 2x2 A / B / C / D Answer Lozenges */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            {currentQuestion.options.map((optText, idx) => {
              const letter = OPTION_LETTERS[idx];
              const isEliminated = eliminatedOptions.includes(idx);
              const isSelected = selectedIndex === idx;
              const isCorrectOption = idx === currentQuestion.correctIndex;

              let borderClass = 'from-blue-600/70 to-blue-500/70';
              let bgClass = 'from-[#0b1a3d] to-[#071129] hover:from-[#122657] hover:to-[#0a1736]';
              let letterColor = 'text-amber-400';
              let statusBadge: React.ReactNode = null;

              if (isEliminated) {
                borderClass = 'from-slate-800/50 to-slate-800/50';
                bgClass = 'from-[#060c1f]/60 to-[#060c1f]/60';
                letterColor = 'text-slate-600';
              } else if (revealState === 'REVEALED') {
                if (isCorrectOption) {
                  borderClass = 'from-emerald-400 to-emerald-500';
                  bgClass = 'from-emerald-950/90 to-emerald-900/70';
                  letterColor = 'text-emerald-300';
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{t.game.correctLabel}</span>
                    </span>
                  );
                } else if (isSelected && !isCorrectOption) {
                  borderClass = 'from-red-400 to-red-500';
                  bgClass = 'from-red-950/90 to-red-900/70';
                  letterColor = 'text-red-300';
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-300 shrink-0">
                      <XCircle className="h-4 w-4" />
                      <span>{t.game.incorrectLabel}</span>
                    </span>
                  );
                }
              } else if (isSelected) {
                borderClass = 'from-amber-300 to-amber-500';
                bgClass = 'from-amber-600/35 to-amber-700/25';
                letterColor = 'text-amber-300';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isEliminated || revealState !== 'SELECTING'}
                  onClick={() => handleSelectOption(idx)}
                  className={`millionaire-lozenge-sm w-full bg-gradient-to-r ${borderClass} p-[1.5px] text-left transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-amber-400 ${
                    revealState === 'SELECTING' && !isEliminated ? 'active:scale-[0.99]' : ''
                  } ${isEliminated ? 'opacity-35 cursor-not-allowed' : ''}`}
                >
                  <div
                    className={`millionaire-lozenge-sm flex min-h-[60px] items-center justify-between gap-3 bg-gradient-to-b ${bgClass} px-6 py-3.5`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`font-mono-tabular text-sm font-bold shrink-0 ${letterColor}`}>
                        {letter}:
                      </span>
                      <span className="text-sm font-medium text-white sm:text-base break-words">
                        {isEliminated ? '—' : <MathText text={optText} />}
                      </span>
                    </div>
                    {statusBadge}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Lock In Action Bar */}
          {revealState === 'SELECTING' && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-900/70 bg-[#08132e]/90 px-5 py-4">
              <p className="text-xs text-slate-300 sm:text-sm">
                {selectedIndex !== null ? t.game.lockInPrompt : t.game.keyboardHint}
              </p>

              <button
                type="button"
                disabled={selectedIndex === null}
                onClick={handleLockInAnswer}
                className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/15 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
              >
                {t.game.lockInButton}
              </button>
            </div>
          )}

          {revealState === 'LOCKED_SUSPENSE' && (
            <div className="rounded-xl border border-amber-400/50 bg-amber-950/25 px-5 py-4 text-center text-sm font-semibold text-amber-300">
              {t.game.lockedInStatus}
            </div>
          )}

          {/* Post-Reveal Explanation & Next Step */}
          {revealState === 'REVEALED' && (
            <div
              className={`rounded-xl border p-6 space-y-4 ${
                lastAnswerCorrect
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : 'border-red-500/40 bg-red-950/20'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {lastAnswerCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <h3 className="font-display text-lg font-bold text-white">
                    {lastAnswerCorrect ? t.game.correctLabel : t.game.incorrectLabel}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleAdvance}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>
                    {!lastAnswerCorrect || currentIndex === questions.length - 1
                      ? t.game.finishRun
                      : t.game.nextQuestion}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="border-t border-white/10 pt-3">
                <p className="text-xs font-semibold text-slate-400">{t.game.solutionTitle}</p>
                <div className="mt-1.5 text-sm leading-relaxed text-slate-200">
                  <MathText text={currentQuestion.explanation} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: 15-Step Millionaire Money Ladder */}
        <aside className="lg:col-span-3 rounded-2xl border border-blue-900/70 bg-[#08132e]/95 p-4">
          <div className="mb-3 flex items-center justify-between border-b border-blue-900/70 pb-2.5">
            <h2 className="font-display text-sm font-bold text-white">
              {t.game.prizeLadderTitle}
            </h2>
            <span className="font-mono-tabular text-xs text-amber-400">15 → 1</span>
          </div>

          <ol className="space-y-1">
            {reversedLadder.map((step) => {
              const isCurrent = step.level === currentQuestion.level;
              const isPassed = step.level < currentQuestion.level;
              return (
                <li
                  key={step.level}
                  className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs sm:text-sm transition-colors ${
                    isCurrent
                      ? 'bg-amber-500 font-bold text-slate-950'
                      : isPassed
                        ? 'bg-emerald-950/35 text-emerald-300'
                        : step.isSafetyNet
                          ? 'bg-[#0c1b42] font-semibold text-amber-300'
                          : 'text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-2 font-mono-tabular">
                    <span className="w-5 text-right">{step.level}</span>
                    {step.isSafetyNet && !isCurrent && (
                      <span className="text-[11px] font-sans font-semibold text-amber-400/90">
                        · {t.game.safetyNetTag}
                      </span>
                    )}
                  </span>
                  <span className="font-mono-tabular">{formatPrize(step.amount)}</span>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>

      {/* Phone a Professor Overlay */}
      {phoneModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-2xl border border-blue-700/70 bg-[#08132e] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-blue-900/70 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {t.game.phoneModal.title}
                </h3>
                <p className="mt-0.5 text-xs text-amber-400">{t.game.phoneModal.callerName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPhoneModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-900/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 text-sm leading-relaxed text-slate-200">
              <MathText text={currentQuestion.professorHint} />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setPhoneModalOpen(false)}
                className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400"
              >
                {t.game.phoneModal.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ask the Audience Overlay */}
      {audienceModalOpen && audiencePoll && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-blue-700/70 bg-[#08132e] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-blue-900/70 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {t.game.audienceModal.title}
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">{t.game.audienceModal.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setAudienceModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-900/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-4 items-end h-44 px-2">
              {OPTION_LETTERS.map((letter, idx) => {
                const pct = audiencePoll[idx];
                const disabled = eliminatedOptions.includes(idx);
                return (
                  <div key={letter} className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="font-mono-tabular text-xs font-bold text-amber-300">
                      {disabled ? '—' : `${pct}%`}
                    </span>
                    <div className="w-full flex-1 flex items-end bg-[#050b1d] rounded-md p-1 border border-blue-900/60">
                      <div
                        className="w-full rounded-sm bg-gradient-to-t from-blue-600 to-amber-400 transition-all duration-300"
                        style={{ height: `${disabled ? 0 : Math.max(4, pct)}%` }}
                      />
                    </div>
                    <span className="font-mono-tabular text-sm font-bold text-white">{letter}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setAudienceModalOpen(false)}
                className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400"
              >
                {t.game.audienceModal.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walk Away Confirmation Overlay */}
      {walkAwayConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-amber-500/50 bg-[#08132e] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">
              {t.game.walkAwayConfirmTitle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {t.game.walkAwayConfirmBody}
            </p>
            <p className="mt-4 font-mono-tabular text-2xl font-bold text-amber-400">
              {formatPrize(currentBankedPrize)}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setWalkAwayConfirmOpen(false)}
                className="rounded-lg border border-blue-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white"
              >
                {t.game.walkAwayConfirmNo}
              </button>
              <button
                type="button"
                onClick={handleConfirmWalkAway}
                className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400"
              >
                {t.game.walkAwayConfirmYes} {formatPrize(currentBankedPrize)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
