import { UiText, useUi } from '@/design/i18n/UiText';
import { AnimatePresence, motion } from 'motion/react';
import { useRef } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { LEVELS } from '@/core/lang/levels';
import type { Level } from '@/core/lang/levels';
import { Switch } from '@/design/primitives';
import { cx } from '@/lib/cx';
import { StepTitle } from './StepTitle';

/** How well you do it at each point on the slider, in a few words; and the full sentence for the one you are on. */
const MEANS: Record<Level, { short: string; know: string; next: string }> = {
  A0: { short: 'Brand new', know: 'You are starting from the very first word. Nothing is expected of you yet.', next: 'Greetings, numbers and the alphabet come first.' },
  A1: { short: 'A few words', know: 'You know a few everyday words and phrases: hello, thank you, how much, where is.', next: 'Next: short sentences about yourself and the people around you.' },
  A2: { short: 'Simple sentences', know: 'You can follow simple everyday sentences and handle a short chat about familiar things.', next: 'Next: stories, messages and the first easy readers.' },
  B1: { short: 'Easy books', know: 'You can read easy books and follow the gist of shows, with a word looked up now and then.', next: 'Next: longer texts, opinions and the grammar that joins them.' },
  B2: { short: 'Real articles', know: 'You read articles and talk easily about familiar things, and only the odd word stops you.', next: 'Next: nuance, idioms and reading without a dictionary.' },
  C1: { short: 'Whole novels', know: 'You read novels and follow fast speech. What is left is nuance, tone and range.', next: 'Next: the finer points: register, humour and the rarer words.' },
};

interface LevelStepProps {
  lang: string;
  level: Level;
  seedKnown: boolean;
  onLevel: (level: Level) => void;
  onSeedKnown: (value: boolean) => void;
}

/**
 * How much do you already know (5.1-2b): one big slider from A0 to C1. Each point says how well you do it
 * there, you can click a point, drag the knob or use the arrow keys, and what the level means is said once
 * underneath, with the switch that skips the most common words.
 */
export function LevelStep({ level, seedKnown, onLevel, onSeedKnown }: LevelStepProps) {
  const translateUi = useUi();
  const track = useRef<HTMLDivElement>(null);
  const last = LEVELS.length - 1;
  const index = LEVELS.findIndex((l) => l.id === level);
  const info = LEVELS[index];
  const top = info.seedKnownTopN;
  const pct = (i: number) => `${(i / last) * 100}%`;

  const fromPointer = (e: PointerEvent) => {
    const box = track.current?.getBoundingClientRect();
    if (!box) return;
    const i = Math.round(Math.min(1, Math.max(0, (e.clientX - box.left) / box.width)) * last);
    if (LEVELS[i].id !== level) onLevel(LEVELS[i].id);
  };
  const onKey = (e: KeyboardEvent) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (e.key === 'Home') onLevel(LEVELS[0].id);
    else if (e.key === 'End') onLevel(LEVELS[last].id);
    else if (step) {
      e.preventDefault();
      onLevel(LEVELS[Math.min(last, Math.max(0, index + step))].id);
    }
  };

  return (
    <div>
      <StepTitle center title={translateUi('So, how far along are you?')} body={translateUi('Slide to the level that sounds most like you. You can change it any time.')} />

      <div className="mx-auto max-w-4xl">
        {/* The slider: room at both ends for the first and last labels. */}
        <div className="px-20 pt-10">
          <div
            ref={track}
            role="slider"
            tabIndex={0}
            aria-label={translateUi('Your level')}
            aria-valuemin={0}
            aria-valuemax={last}
            aria-valuenow={index}
            aria-valuetext={`${info.id}, ${translateUi(MEANS[level].short)}`}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              fromPointer(e);
            }}
            onPointerMove={(e) => e.buttons === 1 && fromPointer(e)}
            onKeyDown={onKey}
            className="relative h-14 cursor-pointer touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            {/* The track and how far it is filled. */}
            <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-line-strong/35" />
            <motion.div className="absolute top-1/2 left-0 h-3 -translate-y-1/2 rounded-full bg-accent" initial={false} animate={{ width: pct(index) }} transition={{ type: 'spring', stiffness: 260, damping: 30 }} />

            {/* One point for each level. */}
            {LEVELS.map((l, i) => (
              <span key={l.id} className="absolute top-1/2" style={{ left: pct(i) }}>
                <span className={cx('absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] transition-colors duration-300', i <= index ? 'border-accent bg-raised' : 'border-line-strong bg-raised')} />
              </span>
            ))}

            {/* The knob, with the level on it. */}
            <motion.div className="absolute top-1/2 z-10" initial={false} animate={{ left: pct(index) }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
              <span className="absolute grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent-fill font-serif text-[19px] font-bold text-on-accent shadow-elev-3 ring-4 ring-raised">{info.id}</span>
            </motion.div>

            {/* Under each point: how well you do it there. */}
            {LEVELS.map((l, i) => (
              <button
                key={l.id}
                type="button"
                tabIndex={-1}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onLevel(l.id)}
                className="absolute top-full mt-3 w-32 -translate-x-1/2 text-center"
                style={{ left: pct(i) }}
              >
                <span className={cx('block text-[13px] font-bold tabular-nums transition-colors duration-300', i === index ? 'text-accent-text' : 'text-ink-faint')}>{l.id}</span>
                <span className={cx('mt-0.5 block font-serif text-[15px] leading-tight font-semibold transition-colors duration-300', i === index ? 'text-ink' : 'text-ink-soft')}><UiText source={MEANS[l.id].short} /></span>
              </button>
            ))}
          </div>
        </div>

        {/* What the level means, said once. */}
        <div className="mt-24 flex min-h-[132px] flex-col items-center text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={level} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              <p className="mx-auto max-w-2xl font-serif text-[26px] leading-snug font-semibold tracking-tight"><UiText source={MEANS[level].know} /></p>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft"><UiText source={MEANS[level].next} /></p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The switch: skip the common words you already know. */}
        <div className={cx('mx-auto mt-6 flex w-fit items-center gap-4 rounded-full border bg-raised py-2.5 pr-3 pl-6 transition-[border-color,opacity] duration-300', top > 0 ? (seedKnown ? 'border-accent' : 'border-line') : 'border-line opacity-50')} title={translateUi('You can unmark any word while reading.')}>
          <span className="text-right">
            <span className="block text-[14.5px] font-semibold">
              {top > 0 ? <UiText source={'Skip the {0} most common words'} values={[top.toLocaleString()]} /> : <UiText source={'Nothing to skip yet'} />}
            </span>
            <span className="block text-[12px] text-ink-faint"><UiText source={'Only new words stay marked'} /></span>
          </span>
          <Switch checked={top > 0 && seedKnown} onChange={onSeedKnown} disabled={top === 0} label={translateUi('Mark the {0} most common words as known', [top.toLocaleString()])} />
        </div>
      </div>
    </div>
  );
}
