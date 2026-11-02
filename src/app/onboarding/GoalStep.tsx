import { UiText, useUi } from '@/design/i18n/UiText';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Level } from '@/core/lang/levels';
import type { CefrLevel } from '@/data/types';
import { spring } from '@/design/motion';
import { cx } from '@/lib/cx';
import { LevelIcon } from './LevelStep';
import { StepTitle } from './StepTitle';

/** The daily times the slider snaps to, each with its name. */
export const DAILY_MINUTES: Array<{ minutes: number; name: string }> = [
  { minutes: 5, name: 'A sip' },
  { minutes: 10, name: 'Steady' },
  { minutes: 15, name: 'Regular' },
  { minutes: 20, name: 'Keen' },
  { minutes: 30, name: 'Serious' },
  { minutes: 45, name: 'Deep' },
  { minutes: 60, name: 'Immersed' },
];

const ORDER: CefrLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
/** Each level as a milestone worth aiming for. */
const MILESTONE: Record<CefrLevel, string> = {
  A0: 'Starting out',
  A1: 'First words',
  A2: 'Get by',
  B1: 'Hold a conversation',
  B2: 'Talk with ease',
  C1: 'Read anything',
  C2: 'Like a native',
};
/**
 * Roughly how many hours of study reach each level from zero: the middle of the guided learning hours
 * usually given for the CEFR levels (Cambridge's estimates). Only for a rough "how long".
 */
const HOURS: Record<CefrLevel, number> = { A0: 0, A1: 95, A2: 190, B1: 375, B2: 550, C1: 750, C2: 1100 };

/** The goal a level starts with: two steps up from zero, one step up after that. */
export function defaultGoal(level: Level): CefrLevel {
  return level === 'A0' ? 'A2' : ORDER[Math.min(ORDER.length - 1, ORDER.indexOf(level) + 1)];
}

/** About how long the goal takes at so many minutes a day, said plainly. */
function howLong(from: Level, to: CefrLevel, minutes: number, translate: (source: string, values?: readonly unknown[]) => string): string {
  const days = ((HOURS[to] - HOURS[from]) * 60) / minutes;
  const months = days / 30.4;
  if (months < 1.5) return translate('a few weeks');
  if (months < 24) return translate('{0} months', [Math.round(months)]);
  return translate('{0} years', [Math.round(months / 12)]);
}

const PEACH = '#f6bd8a';
/** One uneven pen line, shared by both trails. */
const WOBBLE = 'M0 10C60 6 110 14 170 9C230 5 280 13 340 9C400 5 450 13 510 9C550 7 580 11 600 9';

/** The orange slice of the little clock: this many minutes of an hour, clockwise from twelve (32 x 32). */
function wedge(minutes: number): string {
  const a = (minutes / 60) * 2 * Math.PI;
  const x = 16 + 11 * Math.sin(a);
  const y = 16 - 11 * Math.cos(a);
  return `M16 16L16 5A11 11 0 ${a > Math.PI ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}Z`;
}

interface GoalStepProps {
  level: Level;
  goal: CefrLevel;
  minutes: number;
  onGoal: (goal: CefrLevel) => void;
  onMinutes: (minutes: number) => void;
}

/** Set your own goal (5.1-2b): the level to reach, as milestones on a path, and minutes a day on a slider; then about how long. */
export function GoalStep({ level, goal, minutes, onGoal, onMinutes }: GoalStepProps) {
  const translateUi = useUi();
  const ahead = ORDER.slice(ORDER.indexOf(level) + 1);
  const index = Math.max(0, DAILY_MINUTES.findIndex((d) => d.minutes === minutes));
  const last = DAILY_MINUTES.length - 1;
  const step = (to: number) => onMinutes(DAILY_MINUTES[Math.min(last, Math.max(0, to))].minutes);
  const onKey = (e: KeyboardEvent) => {
    const to = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? index + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? index - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? last : null;
    if (to === null) return;
    e.preventDefault();
    step(to);
  };
  const stops: Level[] = [level, ...(ahead as Level[])];
  const lastStop = stops.length - 1;
  const goalAt = Math.max(1, stops.indexOf(goal as Level));
  const verdict = minutes >= 45 ? 'Ambitious. We like it.' : minutes <= 5 ? 'Small sips add up.' : 'A pace that lasts.';
  const time = howLong(level, goal, minutes, translateUi);
  const crop = (frac: number) => `inset(-12px ${100 - frac * 100}% -12px -12px)`;

  return (
    <div>
      <StepTitle center title={translateUi('Set your own goal')} body="Aim high, start small. Both can change any time in Settings." />

      {/* The trail: where you are, then each level ahead, one little drawing apiece; the goal has a flag planted in it. */}
      <h2 className="mb-2 text-center text-[12px] font-bold tracking-[0.08em] text-ink-faint uppercase"><UiText source={'Where do you want to get?'} /></h2>
      <div role="radiogroup" aria-label={translateUi('The level to reach')} className="relative mx-auto mt-10 h-16 max-w-3xl">
        <svg viewBox="0 0 600 20" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 overflow-visible text-line-strong" aria-hidden>
          <path d={WOBBLE} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeDasharray="1 7" vectorEffect="non-scaling-stroke" />
        </svg>
        <motion.svg viewBox="0 0 600 20" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 overflow-visible" aria-hidden initial={false} animate={{ clipPath: crop(goalAt / lastStop) }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <path d={WOBBLE} fill="none" stroke="var(--accent)" strokeWidth={2.4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </motion.svg>
        {stops.map((l, i) => {
          const you = i === 0;
          const on = i === goalAt;
          const inside = i <= goalAt;
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={you ? `${translateUi('You')}, ${l}` : `${l}, ${translateUi(MILESTONE[l])}`}
              disabled={you}
              onClick={() => onGoal(l)}
              className="group absolute top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-bg disabled:cursor-default"
              style={{ left: `${(i / lastStop) * 100}%` }}
            >
              <LevelIcon level={l} className={cx('size-11 transition-[opacity,transform] duration-300', on ? 'scale-110' : !you && 'group-hover:-translate-y-0.5')} style={{ opacity: inside ? 1 : 0.4 }} />
              {on && (
                <motion.svg layoutId="goal-flag" transition={spring.snappy} viewBox="0 0 24 32" className="pointer-events-none absolute -top-9 left-1/2 h-9 w-7 -translate-x-[22%]" fill="none" aria-hidden>
                  <path d="M5 30V3" stroke="var(--ink)" strokeWidth={1.5} strokeLinecap="round" />
                  <path d="M5.5 3.5C10 2 14 6 22 4C20 8 20 11 22 15C14 17 10 13 5.5 15Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth={1.4} strokeLinejoin="round" />
                </motion.svg>
              )}
              <span className="pointer-events-none absolute top-full mt-0.5 w-28 text-center leading-tight">
                <span className={cx('block text-[11.5px] font-bold tracking-wide', on ? 'text-accent-text' : 'text-ink-faint')}>{you ? translateUi('You') + ' · ' + l : l}</span>
                {!you && <span className={cx('block text-[12.5px]', on ? 'font-semibold text-ink' : 'text-ink-faint')}><UiText source={MILESTONE[l]} /></span>}
              </span>
            </button>
          );
        })}
      </div>

      {/* Minutes a day: a pen line to slide along, the knob a little clock whose orange slice is the time. */}
      <h2 className="mt-24 text-center text-[12px] font-bold tracking-[0.08em] text-ink-faint uppercase"><UiText source={'Time a day'} /></h2>
      <p className="mt-1 text-center font-serif text-[30px] leading-none font-semibold text-accent-text tabular-nums"><UiText source={'{0} min'} values={[minutes]} /></p>
      <div className="mx-auto mt-3 max-w-3xl px-6">
        <div
          role="slider"
          tabIndex={0}
          aria-label={translateUi('Time a day')}
          aria-valuemin={DAILY_MINUTES[0].minutes}
          aria-valuemax={DAILY_MINUTES[last].minutes}
          aria-valuenow={minutes}
          aria-valuetext={translateUi('{0} minutes, {1}', [minutes, translateUi(DAILY_MINUTES[index].name)])}
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
          <svg viewBox="0 0 600 20" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 overflow-visible text-line-strong" aria-hidden>
            <path d={WOBBLE} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <motion.svg viewBox="0 0 600 20" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 overflow-visible" aria-hidden initial={false} animate={{ clipPath: crop(index / last) }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
            <path d={WOBBLE} fill="none" stroke="var(--accent)" strokeWidth={2.4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </motion.svg>
          {DAILY_MINUTES.map((d, i) => (
            <span key={d.minutes} className={cx('pointer-events-none absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 rounded-full', i <= index ? 'bg-accent' : 'bg-line-strong')} style={{ left: `${(i / last) * 100}%` }} />
          ))}
          {/* The knob rides a full-width layer moved by transform, so a percentage is of the track. */}
          <span className="pointer-events-none absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: `translateX(${(index / last) * 100}%)` }}>
            <svg viewBox="0 0 32 32" className="absolute top-1/2 left-0 size-11 -translate-x-1/2 -translate-y-1/2 drop-shadow-sm" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx={16} cy={16} r={13} fill="var(--raised)" stroke="var(--ink)" />
              {minutes >= 60 ? <circle cx={16} cy={16} r={11} fill={PEACH} stroke="none" /> : <path d={wedge(minutes)} fill={PEACH} stroke="none" />}
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
              tabIndex={-1}
              onClick={() => onMinutes(d.minutes)}
              className={cx('absolute -translate-x-1/2 text-center leading-tight transition-colors', i === index ? 'text-accent-text' : 'text-ink-faint hover:text-ink-soft')}
              style={{ left: `${(i / last) * 100}%` }}
            >
              <span className="block text-[12.5px] font-bold tabular-nums">{d.minutes}</span>
              <span className={cx('block text-[12px] whitespace-nowrap', i === index && 'font-semibold')}><UiText source={d.name} /></span>
            </button>
          ))}
        </div>
      </div>

      {/* The sum, said plainly under a pen squiggle. */}
      <div className="mt-10 text-center">
        <svg viewBox="0 0 120 8" className="mx-auto mb-5 h-2 w-28 text-line-strong" aria-hidden>
          <path d="M2 4C12 1 20 7 30 4C40 1 48 7 58 4C68 1 76 7 86 4C96 1 104 7 118 3" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
        <p className="text-[17px] leading-snug"><UiText source={'At {0} minutes a day, {1} in about{2}{3}.'} values={[minutes, goal, ' ', <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={time} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={spring.snappy} className="inline-block font-serif text-[24px] font-semibold text-accent-text">
              {time}
            </motion.span>
          </AnimatePresence>]} /></p>
        <p className="mt-1.5 font-serif text-[16px] text-ink-soft italic"><UiText source={verdict} /></p>
        <p className="mt-3 text-[12px] text-ink-faint"><UiText source={'A rough guide from the usual hours of study per level. Reading and listening every day count.'} /></p>
      </div>
    </div>
  );
}
