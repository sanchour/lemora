import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Clock, Sparkles, X } from 'lucide-react';
import { useApp } from '@/app/context';
import { DAILY_MINUTES } from '@/app/onboarding/GoalStep';
import { updateLanguage } from '@/data/languages';
import { useToolDays } from '@/data/toolGoals';
import { UiText, useUi } from '@/design/i18n/UiText';
import { spring } from '@/design/motion';
import { cx } from '@/lib/cx';

const PEACH = '#f6bd8a';
const WOBBLE = 'M0 10C60 6 110 14 170 9C230 5 280 13 340 9C400 5 450 13 510 9C550 7 580 11 600 9';

/** Orange slice of the clock: fraction of 60 minutes, clockwise from 12 o'clock */
function clockWedge(fraction: number): string {
  const f = Math.min(0.999, Math.max(0.001, fraction));
  const a = f * 2 * Math.PI;
  const x = 16 + 11 * Math.sin(a);
  const y = 16 - 11 * Math.cos(a);
  return `M16 16L16 5A11 11 0 ${a > Math.PI ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}Z`;
}

/** The first letter of a day's weekday, from its 'YYYY-MM-DD' key. */
const dayLetter = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' });

function descriptorFor(minutes: number): string {
  if (minutes < 5) return 'A sip';
  const match = [...DAILY_MINUTES].reverse().find((m) => minutes >= m.minutes);
  return match?.name ?? 'Regular';
}

interface TimeADayMeterProps {
  lang: string;
  goalMinutes?: number;
  className?: string;
}

/**
 * Cute "Time a Day" meter based on the onboarding GoalStep design:
 * - Central, fat, clear aesthetic header & numerals
 * - Little clock with the warm peach orange slice showing today's study
 * - Clicking opens the onboarding Time-a-Day slider to change your daily goal
 */
export function TimeADayMeter({ lang, goalMinutes = 15, className }: TimeADayMeterProps) {
  const translateUi = useUi();
  const { language } = useApp();
  // The same minutes as Home's tools and the day's goal: the recorded sessions, counted once (core/goals/tools).
  const days = useToolDays(lang, 7);
  const [sliderOpen, setSliderOpen] = useState(false);

  const today = days?.[days.length - 1];
  const weekMinutes = Math.round((days ?? []).reduce((sum, d) => sum + d.total, 0) / 60_000);
  const minutesToday = Math.round((today?.total ?? 0) / 60_000);

  const descriptor = descriptorFor(minutesToday > 0 ? minutesToday : goalMinutes);
  const fractionOfHour = Math.min(1, minutesToday / 60);
  const progressRatio = Math.min(1, minutesToday / Math.max(1, goalMinutes));
  const isGoalMet = minutesToday >= goalMinutes && goalMinutes > 0;

  const handleSelectMinutes = (newMinutes: number) => {
    void updateLanguage(lang, {
      dailyGoal: {
        ...language.dailyGoal,
        readMinutes: newMinutes,
      },
    });
  };

  useEffect(() => {
    if (!sliderOpen) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setSliderOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sliderOpen]);

  return (
    <>
      {/* Open on the page, no box: the clock, the minutes in the book's figures, each tool's share, and the week. */}
      <button
        type="button"
        onClick={() => setSliderOpen(true)}
        aria-label={translateUi('Time today · Change daily goal')}
        className={cx('group mx-auto flex w-full max-w-[380px] cursor-pointer flex-col justify-start rounded-2xl p-1 text-left', className)}
      >
        <span className="flex items-center justify-center gap-2">
          <Clock size={16} strokeWidth={2.3} className="text-accent-text" aria-hidden />
          <h2 className="font-serif text-[18px] font-bold tracking-tight text-ink"><UiText source={'Time today'} /></h2>
          <span className="ml-1 text-[12px] font-semibold text-ink-faint transition-colors group-hover:text-ink-soft">
            <UiText source={'Goal'} /> · {goalMinutes} <UiText source={'min'} />
          </span>
        </span>

        <span className="mt-5 flex flex-col items-center gap-2 text-center">
          {/* The cute clock: an hour's face with today's slice in peach, drawn in the hand of the first start. */}
          <svg viewBox="0 -4 32 36" className="size-[112px] shrink-0" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {fractionOfHour >= 1 ? <circle cx={16} cy={16} r={11.5} fill={PEACH} stroke="none" /> : fractionOfHour > 0 ? <path d={clockWedge(fractionOfHour)} fill={PEACH} stroke="none" /> : null}
            {/* A stopwatch: its button on top, a pen-drawn ring, a tick for every five minutes, and a hand; the peach slice is the time spent today. */}
            <path d="M13.2 -2.6H18.8M16 -2.4V3" fill="none" stroke="var(--ink)" strokeWidth={1.4} />
            <path d="M25.4 5.4L26.9 3.9" fill="none" stroke="var(--ink)" strokeWidth={1.3} />
            <path d="M16.4 3.1C23.6 3 29.1 8.6 28.9 15.8C28.7 23 23.2 28.9 15.9 28.8C8.7 28.7 3.2 23.1 3.2 16C3.2 9 8.4 3.5 15 3.2" fill="none" stroke="var(--ink)" strokeWidth={1.4} />
            <path d="M15 3.6C21.6 2.6 28 8 28.3 15C28.6 21.8 24.3 27.8 17.5 28.6" fill="none" stroke="var(--ink)" strokeWidth={0.7} opacity={0.4} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * 2 * Math.PI;
              const r1 = i % 3 === 0 ? 10 : 11;
              return <path key={i} d={`M${(16 + r1 * Math.sin(a)).toFixed(2)} ${(16 - r1 * Math.cos(a)).toFixed(2)}L${(16 + 12 * Math.sin(a)).toFixed(2)} ${(16 - 12 * Math.cos(a)).toFixed(2)}`} stroke="var(--ink)" opacity={i % 3 === 0 ? 0.85 : 0.45} />;
            })}
            <path d="M16 16L16.3 8.6" stroke="var(--accent)" strokeWidth={1.7} />
            <circle cx={16} cy={16} r={1.4} fill="var(--ink)" stroke="none" />
          </svg>
          <span className="min-w-0">
            <span className="flex items-baseline justify-center gap-1.5">
              <span className="font-serif text-[30px] leading-none font-semibold text-ink tabular-nums">{minutesToday}</span>
              <span className="font-serif text-[15px] text-ink-soft">/ {goalMinutes} <UiText source={'min'} /></span>
            </span>
            <span className={cx('mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-semibold', isGoalMet ? 'text-sage-text' : 'text-ink-soft')}>
              {isGoalMet ? <><Sparkles size={12} aria-hidden /> <UiText source={'Goal met'} /></> : <UiText source={descriptor} />}
              <span className="text-ink-faint tabular-nums"> · {Math.round(progressRatio * 100)}%</span>
            </span>
          </span>
        </span>

        {/* The weekly tracker: the last seven days, each with its day letter and minutes; today's in the accent, a met day in sage. */}
        <span className="mt-3 block border-t border-line/60 pt-3">
          <span className="flex items-baseline justify-between text-[10.5px] font-bold tracking-[0.12em] text-ink-faint uppercase">
            <UiText source={'This week'} />
            <span className="font-semibold tracking-normal normal-case tabular-nums">{weekMinutes} <UiText source={'min'} /></span>
          </span>
          <span className="mt-2 flex h-10 items-end gap-1.5">
            {(days ?? []).map((d, i) => {
              const m = Math.round(d.total / 60_000);
              const last = i === (days?.length ?? 0) - 1;
              return (
                <span key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-0.5" title={`${d.date} · ${m} min`}>
                  <span className="text-[9.5px] leading-none font-semibold text-ink-faint tabular-nums">{m > 0 ? m : ''}</span>
                  <span className={cx('w-full rounded-full', last ? 'bg-accent' : m >= goalMinutes ? 'bg-sage' : m > 0 ? 'bg-ink-soft/35' : 'bg-line')} style={{ height: `${Math.max(10, Math.min(70, (m / Math.max(1, goalMinutes)) * 70))}%` }} />
                  <span className={cx('text-[9.5px] leading-none font-bold', last ? 'text-accent-text' : 'text-ink-faint')}>{dayLetter(d.date)}</span>
                </span>
              );
            })}
          </span>
        </span>
      </button>

      {/* Onboarding Time-a-Day Slider Modal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {sliderOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSliderOpen(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label={translateUi('Time a day')}
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  transition={spring.snappy}
                  className="relative z-10 w-full max-w-xl rounded-[28px] border border-line-strong/80 bg-bg p-6 shadow-elev-3 sm:p-8"
                >
                  <button
                    type="button"
                    onClick={() => setSliderOpen(false)}
                    aria-label={translateUi('Close')}
                    className="absolute top-5 right-5 grid size-8 place-items-center rounded-full border border-line/70 bg-surface/80 text-ink-soft transition-colors hover:bg-raised hover:text-ink"
                  >
                    <X size={16} />
                  </button>

                  <OnboardingGoalSlider minutes={goalMinutes} onMinutes={handleSelectMinutes} />

                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setSliderOpen(false)}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-accent-fill px-6 font-sans text-[13.5px] font-bold text-on-accent shadow-elev-1 transition hover:brightness-105 active:scale-95"
                    >
                      <UiText source={'Done'} />
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

/** Exact Time-a-Day slider from Onboarding GoalStep.tsx */
function OnboardingGoalSlider({
  minutes,
  onMinutes,
}: {
  minutes: number;
  onMinutes: (minutes: number) => void;
}) {
  const translateUi = useUi();
  const last = DAILY_MINUTES.length - 1;
  const foundIdx = DAILY_MINUTES.findIndex((d) => d.minutes >= minutes);
  const index = foundIdx === -1 ? last : Math.max(0, foundIdx);
  const activeMinutes = DAILY_MINUTES[index].minutes;

  const step = (to: number) => onMinutes(DAILY_MINUTES[Math.min(last, Math.max(0, to))].minutes);
  const onKey = (e: KeyboardEvent) => {
    const to =
      e.key === 'ArrowRight' || e.key === 'ArrowUp'
        ? index + 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
          ? index - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null;
    if (to === null) return;
    e.preventDefault();
    step(to);
  };
  const crop = (frac: number) => `inset(-12px ${100 - frac * 100}% -12px -12px)`;

  return (
    <div className="pt-1">
      <h2 className="text-center font-sans text-[12px] font-bold tracking-[0.08em] text-ink-faint uppercase">
        <UiText source={'Time a day'} />
      </h2>
      <p className="mt-1 text-center font-serif text-[34px] leading-none font-bold text-accent-text tabular-nums">
        <UiText source={'{0} min'} values={[activeMinutes]} />
      </p>

      <div className="mx-auto mt-5 max-w-lg px-4">
        <div
          role="slider"
          tabIndex={0}
          aria-label={translateUi('Time a day')}
          aria-valuemin={DAILY_MINUTES[0].minutes}
          aria-valuemax={DAILY_MINUTES[last].minutes}
          aria-valuenow={activeMinutes}
          aria-valuetext={translateUi('{0} minutes, {1}', [activeMinutes, translateUi(DAILY_MINUTES[index].name)])}
          onKeyDown={onKey}
          onPointerDown={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const pick = (x: number) => step(Math.round(((x - box.left) / box.width) * last));
            pick(e.clientX);
            e.currentTarget.setPointerCapture(e.pointerId);
            e.currentTarget.onpointermove = (m) => pick(m.clientX);
            e.currentTarget.onpointerup = (u) => {
              (u.currentTarget as HTMLElement).onpointermove = null;
            };
          }}
          className="relative h-14 cursor-pointer touch-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <svg
            viewBox="0 0 600 20"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 overflow-visible text-line-strong"
            aria-hidden
          >
            <path
              d={WOBBLE}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-1/2 h-5 -translate-y-1/2"
            aria-hidden
            initial={false}
            animate={{ clipPath: crop(index / last) }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg viewBox="0 0 600 20" preserveAspectRatio="none" className="size-full overflow-visible">
              <path
                d={WOBBLE}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={2.4}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </motion.div>
          {DAILY_MINUTES.map((d, i) => (
            <span
              key={d.minutes}
              className={cx(
                'pointer-events-none absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 rounded-full',
                i <= index ? 'bg-accent' : 'bg-line-strong',
              )}
              style={{ left: `${(i / last) * 100}%` }}
            />
          ))}
          <span
            className="pointer-events-none absolute inset-0 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${(index / last) * 100}%)` }}
          >
            <svg
              viewBox="0 0 32 32"
              className="absolute top-1/2 left-0 size-11 -translate-x-1/2 -translate-y-1/2 drop-shadow-sm"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx={16} cy={16} r={13} fill="var(--raised)" stroke="var(--ink)" />
              {activeMinutes >= 60 ? (
                <circle cx={16} cy={16} r={11} fill={PEACH} stroke="none" />
              ) : (
                <path d={clockWedge(activeMinutes / 60)} fill={PEACH} stroke="none" />
              )}
              <circle cx={16} cy={16} r={13} fill="none" stroke="var(--ink)" />
              <path d="M16 6.5V8.5M25.5 16H23.5M16 25.5V23.5M6.5 16H8.5" stroke="var(--ink)" />
              <path d="M16 16V9.5" stroke="var(--accent)" strokeWidth={1.8} />
            </svg>
          </span>
        </div>

        <div className="relative h-11">
          {DAILY_MINUTES.map((d, i) => (
            <button
              key={d.minutes}
              type="button"
              onClick={() => onMinutes(d.minutes)}
              className={cx(
                'absolute -translate-x-1/2 cursor-pointer text-center leading-tight transition-colors',
                i === index ? 'text-accent-text' : 'text-ink-faint hover:text-ink-soft',
              )}
              style={{ left: `${(i / last) * 100}%` }}
            >
              <span className="block text-[12.5px] font-bold tabular-nums">{d.minutes}</span>
              <span className={cx('block text-[12px] whitespace-nowrap', i === index && 'font-semibold')}>
                <UiText source={d.name} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

