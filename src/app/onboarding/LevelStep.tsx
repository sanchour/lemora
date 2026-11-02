import { UiText, useUi } from '@/design/i18n/UiText';
import { AnimatePresence, motion } from 'motion/react';
import { LEVELS } from '@/core/lang/levels';
import type { Level } from '@/core/lang/levels';
import { Switch } from '@/design/primitives';
import { cx } from '@/lib/cx';
import { StepTitle } from './StepTitle';

/** What each level means, said as what you already know, and what comes next. */
const MEANS: Record<Level, { know: string; next: string }> = {
  A0: { know: 'You are starting from the very first word. Nothing is expected of you yet.', next: 'Greetings, numbers and the alphabet come first.' },
  A1: { know: 'You know a few everyday words and phrases: hello, thank you, how much, where is.', next: 'Next: short sentences about yourself and the people around you.' },
  A2: { know: 'You can follow simple everyday sentences and handle a short chat about familiar things.', next: 'Next: stories, messages and the first easy readers.' },
  B1: { know: 'You can read easy books and follow the gist of shows, with a word looked up now and then.', next: 'Next: longer texts, opinions and the grammar that joins them.' },
  B2: { know: 'You read articles and talk easily about familiar things, and only the odd word stops you.', next: 'Next: nuance, idioms and reading without a dictionary.' },
  C1: { know: 'You read novels and follow fast speech. What is left is nuance, tone and range.', next: 'Next: the finer points: register, humour and the rarer words.' },
};

interface LevelStepProps {
  lang: string;
  level: Level;
  seedKnown: boolean;
  onLevel: (level: Level) => void;
  onSeedKnown: (value: boolean) => void;
}

/**
 * How much do you already know (5.1-2b): the six levels, A0 to C1, stacked and easy to click. Choosing one
 * slides a card in to the right that says what it means; beside the card, a switch skips the most common
 * words so only the new ones stay marked.
 */
export function LevelStep({ level, seedKnown, onLevel, onSeedKnown }: LevelStepProps) {
  const translateUi = useUi();
  const index = LEVELS.findIndex((l) => l.id === level);
  const info = LEVELS[index];
  const top = info.seedKnownTopN;

  return (
    <div>
      <StepTitle title={translateUi('So, how far along are you?')} body={translateUi('Pick the level that sounds most like you. You can change it any time.')} />

      <div className="grid grid-cols-[300px_minmax(0,1fr)] items-stretch gap-5">
        {/* The levels, one under the other. */}
        <div role="radiogroup" aria-label={translateUi('Your level')} className="flex flex-col gap-2">
          {LEVELS.map((l, i) => {
            const on = l.id === level;
            return (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onLevel(l.id)}
                className={cx(
                  'no-callout flex h-[58px] w-full items-center gap-3.5 rounded-2xl border px-3 text-left transition-[background-color,border-color,box-shadow] duration-200',
                  on ? 'border-accent bg-accent-soft shadow-[0_0_0_1px_var(--accent)]' : 'border-line bg-raised hover:border-accent hover:bg-accent-soft/50',
                )}
              >
                <span className={cx('grid h-8 w-11 shrink-0 place-items-center rounded-full text-[13px] font-bold tabular-nums transition-colors duration-200', on ? 'bg-accent-fill text-on-accent' : 'bg-surface text-ink-soft')}>{l.id}</span>
                <span className="min-w-0 flex-1 font-serif text-[18px] leading-tight font-semibold"><UiText source={l.name} /></span>
                {/* Six small bars, filled up to this level. */}
                <span className="flex h-5 shrink-0 items-end gap-[3px]" aria-hidden>
                  {LEVELS.map((_, b) => (
                    <span key={b} className={cx('w-[3px] rounded-full transition-colors duration-200', b <= i ? (on ? 'bg-accent' : 'bg-ink-faint/60') : 'bg-line-strong/50')} style={{ height: 6 + b * 2.8 }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        {/* One wide bar: what the level means, sliding in from the list, and the switch at its right. */}
        <div className="flex min-h-[360px] overflow-hidden rounded-3xl border border-line bg-raised shadow-elev-1">
          <div className="relative min-w-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={level}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex flex-col justify-center px-9 py-7"
              >
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-[12px] font-bold tracking-[0.08em] text-accent-text uppercase">
                  {info.id}
                  <span className="opacity-60">·</span>
                  <UiText source={info.name} />
                </span>
                <p className="mt-5 font-serif text-[26px] leading-snug font-semibold tracking-tight"><UiText source={MEANS[level].know} /></p>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-soft"><UiText source={MEANS[level].next} /></p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* The switch: skip the common words you already know. */}
          <div className={cx('flex w-[260px] shrink-0 flex-col justify-center border-l px-6 py-6 transition-colors duration-300', top > 0 && seedKnown ? 'border-accent bg-accent-soft/40' : 'border-line')} title={translateUi('You can unmark any word while reading.')}>
            {top > 0 ? (
              <>
                <Switch checked={seedKnown} onChange={onSeedKnown} label={translateUi('Mark the {0} most common words as known', [top.toLocaleString()])} />
                <p className="mt-4 font-serif text-[18px] leading-snug font-semibold"><UiText source={'Skip the {0} most common words'} values={[top.toLocaleString()]} /></p>
                <p className="mt-1.5 text-[13px] leading-snug text-ink-soft"><UiText source={'Only new words stay marked'} /></p>
              </>
            ) : (
              <p className="text-[14px] leading-snug text-ink-soft"><UiText source={'Nothing to skip yet: every word starts out new.'} /></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
