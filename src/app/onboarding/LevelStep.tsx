import { UiText, useUi } from '@/design/i18n/UiText';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { getLanguage } from '@/core/lang/languages';
import { LEVELS } from '@/core/lang/levels';
import { levelExample } from '@/core/lang/levelExamples';
import type { Level } from '@/core/lang/levels';
import { Switch } from '@/design/primitives';
import { cx } from '@/lib/cx';
import { StepTitle } from './StepTitle';

/** How well you do it at each point on the slider, in a few words; and the full sentence for the one you are on. */
const MEANS: Record<Level, { short: string; know: string }> = {
  A0: { short: 'Brand new', know: 'You are starting from the very first word. Nothing is expected of you yet.' },
  A1: { short: 'A few words', know: 'You know a few everyday words and phrases: hello, thank you, how much, where is.' },
  A2: { short: 'Simple sentences', know: 'You can follow simple everyday sentences and handle a short chat about familiar things.' },
  B1: { short: 'Easy books', know: 'You can read easy books and follow the gist of shows, with a word looked up now and then.' },
  B2: { short: 'Real articles', know: 'You read articles and talk easily about familiar things, and only the odd word stops you.' },
  C1: { short: 'Whole novels', know: 'You read novels and follow fast speech. What is left is nuance, tone and range.' },
};

const COLOUR = { leaf: '#9cc2a6', orange: '#ee8b48', petal: '#f6bd8a', trunk: '#b98259', seed: '#c99668' };
interface Part { d: string; fill?: string }
const stem = (d: string): Part => ({ d });
const leaf = (d: string): Part => ({ d, fill: COLOUR.leaf });
const petal = (x: number, y: number): Part => ({ d: `M${x - 2.8} ${y}a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0`, fill: COLOUR.petal });

/** A growing sprig, one little pen drawing for each level, filled in soft colour: seed, sprout, plant, bud, flower, tree (32 x 32). */
const ICONS: Record<Level | 'C2', Part[]> = {
  A0: [{ d: 'M16 9C20.5 13.5 20.5 20 16 23.5C11.5 20 11.5 13.5 16 9Z', fill: COLOUR.seed }, stem('M16 12V20.5')],
  A1: [stem('M16 27V17'), leaf('M16 19C12 19 10 16.5 10 13.5C14 13.5 16 15.5 16 19Z'), leaf('M16 16C19.5 16 22 14 22 10.5C18 10.5 16 12.5 16 16Z')],
  A2: [stem('M16 27V10'), leaf('M16 23C12 23 9 21 9 18C13 18 16 20 16 23Z'), leaf('M16 19C20 19 23 17 23 14C19 14 16 16 16 19Z'), { d: 'M16 10C14 8 14 5 16 3C18 5 18 8 16 10Z', fill: COLOUR.orange }],
  B1: [stem('M16 27V16'), leaf('M16 24C12 24 10 22 10 20C13 20 16 21 16 24Z'), leaf('M16 22C20 22 22 20 22 18C19 18 16 19 16 22Z'), { d: 'M16 16C11.5 16 10.5 10.5 16 6.5C21.5 10.5 20.5 16 16 16Z', fill: COLOUR.orange }],
  B2: [stem('M16 27V18'), leaf('M16 25C12 25 10 23 10 21C13 21 16 22 16 25Z'), leaf('M16 23C20 23 22 21 22 19C19 19 16 20 16 23Z'), petal(16, 7.5), petal(21.2, 11.3), petal(19.2, 17.4), petal(12.8, 17.4), petal(10.8, 11.3), { d: 'M13.8 13a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0', fill: COLOUR.orange }],
  C1: [
    { d: 'M14.5 27L15 18H17L17.5 27Z', fill: COLOUR.trunk },
    stem('M16 22L12 18M16 20L20 16'),
    { d: 'M9 16C6 16 6 11 10 11C10 7 15 6 17 9C20 7 24 10 22 13C26 14 24 19 20 18H10C9 18 9 17 9 16Z', fill: COLOUR.leaf },
    { d: 'M12 13.2a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0', fill: COLOUR.orange },
    { d: 'M18 12.2a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0', fill: COLOUR.orange },
  ],
  C2: [
    { d: 'M14.5 27L15 18H17L17.5 27Z', fill: COLOUR.trunk },
    stem('M16 22L12 18M16 20L20 16'),
    { d: 'M9 16C6 16 6 11 10 11C10 7 15 6 17 9C20 7 24 10 22 13C26 14 24 19 20 18H10C9 18 9 17 9 16Z', fill: COLOUR.leaf },
    { d: 'M12 13.2a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0', fill: COLOUR.orange },
    { d: 'M18 12.2a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0', fill: COLOUR.orange },
  
    { d: 'M14.5 15.2a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0', fill: COLOUR.orange },
    { d: 'M23.5 5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0', fill: COLOUR.petal },
  ],
};

/**
 * The example sentence, a word at a time (Lemora 3.4): under what a level is, one phrase to tap to reveal it. Then every
 * word answers: hover or focus shows its meaning, a click keeps it, dragging across several (or shift-click) gives the
 * phrase, and holding on a word for half a second gives the whole sentence, as does its button. Meanings are local
 * (core/lang/levelExamples), so none of it waits for a dictionary.
 */
const HOLD_MS = 500;
function ExampleReveal({ lang, level }: { lang: string; level: Level }) {
  const translateUi = useUi();
  const still = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState<number | null>(null);
  const [range, setRange] = useState<[number, number] | null>(null);
  const [whole, setWhole] = useState(false);
  const start = useRef<number | null>(null);
  const held = useRef(false);
  const dragged = useRef(false);
  const timer = useRef(0);
  const example = levelExample(lang, level);
  const rtl = getLanguage(lang)?.rtl;
  // Another level, another sentence: start again.
  useEffect(() => {
    setOpen(false);
    setPeek(null);
    setRange(null);
    setWhole(false);
  }, [lang, level]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  if (!example) return null;
  const { units } = example;
  const join = (a: number, b: number) => units.slice(a, b + 1).map((u) => u.gloss).join(' ');
  const caption = whole ? example.en : range ? join(range[0], range[1]) : peek !== null ? units[peek].gloss : null;

  const down = (i: number, e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    start.current = i;
    held.current = false;
    dragged.current = false;
    window.clearTimeout(timer.current);
    if (e.shiftKey && range) return setRange([Math.min(range[0], i), Math.max(range[1], i)]);
    setWhole(false);
    timer.current = window.setTimeout(() => {
      held.current = true;
      setWhole(true);
      setRange(null);
    }, HOLD_MS);
  };
  const over = (i: number, e: PointerEvent<HTMLButtonElement>) => {
    setPeek(i);
    if (e.buttons !== 1 || start.current === null || start.current === i) return;
    window.clearTimeout(timer.current);
    dragged.current = true;
    setRange([Math.min(start.current, i), Math.max(start.current, i)]);
  };
  const up = (i: number) => {
    window.clearTimeout(timer.current);
    const from = start.current;
    start.current = null;
    // A long press or a drag has already done its work; a plain click keeps the word, and clicking it again lets it go.
    if (held.current || dragged.current || from !== i) return;
    setRange(range && range[0] === i && range[1] === i ? null : [i, i]);
  };

  return (
    <div className="mx-auto mt-5 flex min-h-[112px] max-w-2xl flex-col items-center">
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button
            key="word"
            type="button"
            onClick={() => setOpen(true)}
            initial={still ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={still ? { opacity: 0 } : { opacity: 0, scale: 1.08, filter: 'blur(6px)' }}
            transition={{ duration: still ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            whileTap={still ? undefined : { scale: 0.97 }}
            aria-label={translateUi('See example')}
            className="group flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span className="font-serif text-[26px] leading-none font-semibold text-accent-text underline decoration-accent/60 decoration-wavy decoration-1 underline-offset-[8px] transition-[text-decoration-color] group-hover:decoration-accent"><UiText source={'See example'} /></span>
            <span className="grid size-6 place-items-center rounded-full border border-accent/40 text-accent-text transition-[background-color,transform] duration-200 group-hover:translate-x-0.5 group-hover:bg-accent/10">
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M2.5 8.5C5 7.5 9 8.5 12.5 8M9 4.5l3.5 3.5L9 11.5" />
              </svg>
            </span>
          </motion.button>
        ) : (
          <motion.div key="sentence" className="flex flex-col items-center" initial={still ? false : { opacity: 0, y: 8, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: still ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <p lang={lang} dir={rtl ? 'rtl' : undefined} onPointerLeave={() => setPeek(null)} className="select-none font-serif text-[22px] leading-[1.7] text-ink">
              {units.map((u, i) => {
                const chosen = range !== null && i >= range[0] && i <= range[1];
                return (
                  <Fragment key={i}>
                    {i > 0 && lang !== 'zh' && ' '}
                    <button
                      type="button"
                      onPointerDown={(e) => down(i, e)}
                      onPointerEnter={(e) => over(i, e)}
                      onPointerUp={() => up(i)}
                      onFocus={() => setPeek(i)}
                      onBlur={() => setPeek(null)}
                      onClick={(e) => e.detail === 0 && setRange(range?.[0] === i && range[1] === i ? null : [i, i])}
                      aria-pressed={chosen}
                      className={cx('touch-none rounded-md px-0.5 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent/40', chosen ? 'bg-accent-soft text-accent-text' : peek === i ? 'bg-sunken' : 'text-accent-text/90 hover:bg-sunken')}
                    >
                      {u.text}
                    </button>
                  </Fragment>
                );
              })}
            </p>
            {/* The translation of what is under the pointer, kept, or held; or what to do. */}
            <p className="mt-2 min-h-[22px] text-center text-[14.5px] text-ink-soft" aria-live="polite">
              {caption ?? <span className="text-ink-faint"><UiText source={'Hover a word. Drag across several. Hold for the whole sentence.'} /></span>}
            </p>
            <button type="button" onClick={() => { setWhole((w) => !w); setRange(null); }} aria-pressed={whole} className="mt-1 text-[12.5px] font-semibold text-ink-faint underline decoration-line-strong underline-offset-4 hover:text-ink">
              <UiText source={whole ? 'Back to words' : 'Translate the sentence'} />
            </button>
            <span className="sr-only">{translateUi('Example sentence')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A level's little pen drawing, filled in soft colour: the sprig that grows from seed to tree. */
export function LevelIcon({ level, className, style, halo }: { level: Level | 'C2'; className?: string; style?: CSSProperties; halo?: boolean }) {
  const { opacity, ...rest } = style ?? {};
  return (
    <svg viewBox="0 0 32 32" className={cx('text-ink', className)} style={ halo ? rest : style } strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {halo && (
        <g fill="var(--bg)" stroke="var(--bg)" strokeWidth={3.5}>
          {ICONS[level].map((p, k) => (
            <path key={k} d={p.d} />
          ))}
        </g>
      )}
      <g style={halo && opacity !== undefined ? { opacity } : undefined}>
        {ICONS[level].map((p, k) => (
          <path key={k} d={p.d} fill={p.fill ?? 'none'} stroke="currentColor" />
        ))}
      </g>
    </svg>
  );
}

interface LevelStepProps {
  lang: string;
  level: Level;
  seedKnown: boolean;
  onLevel: (level: Level) => void;
  onSeedKnown: (value: boolean) => void;
}

/** One uneven pen line for the track (and, drawn again on top, for how far you have come). */
const LINE = 'M0 10C60 6 110 14 170 9C230 5 280 13 340 9C400 5 450 13 510 9C550 7 580 11 600 9';

/**
 * How much do you already know (5.1-2b): a quiet slider from A0 to C1, drawn by hand. A sprig grows along one
 * pen line, one little drawing for each level, and a scribbled ring marks the one you are on. You can click a
 * drawing, drag, or use the arrow keys; what the level means is said once underneath, with the switch that
 * skips the most common words.
 */
export function LevelStep({ lang, level, seedKnown, onLevel, onSeedKnown }: LevelStepProps) {
  const translateUi = useUi();
  // Lemora 3.4: the title arrives first, then the slider, then what the level means; all at once with reduced motion.
  const still = useReducedMotion();
  const step = (delay: number) => (still ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const } });
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
      <motion.div {...step(0)}>
        <StepTitle center title={translateUi('So, how far along are you?')} body={translateUi('Slide to the level that sounds most like you. You can change it any time.')} />
      </motion.div>

      <div className="mx-auto max-w-4xl">
        <motion.div {...step(0.45)} className="px-20 pt-6">
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
            className="relative h-16 cursor-pointer touch-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {/* The pen line, and the part of it you have travelled in orange. */}
            <svg viewBox="0 0 600 20" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 overflow-visible text-line-strong" aria-hidden>
              <path d={LINE} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            {/* The travelled part: the same line again, cropped at exactly the chosen level's position. */}
            <motion.div className="pointer-events-none absolute inset-x-0 top-1/2 h-5 -translate-y-1/2" aria-hidden initial={false} animate={{ clipPath: `inset(-10px ${100 - (100 * index) / last}% -10px -10px)` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <svg viewBox="0 0 600 20" preserveAspectRatio="none" className="size-full overflow-visible">
                <path d={LINE} fill="none" stroke="var(--accent)" strokeWidth={2.4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </motion.div>

            {/* A small drawing on the line for each level. */}
            {LEVELS.map((l, i) => {
              const on = i === index;
              const reached = i <= index;
              return (
                <button
                  key={l.id}
                  type="button"
                  tabIndex={-1}
                  aria-label={`${l.id}, ${translateUi(MEANS[l.id].short)}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onLevel(l.id)}
                  className="absolute top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                  style={{ left: pct(i) }}
                >
                  <LevelIcon level={l.id} halo className={cx('size-10 transition-[opacity,transform] duration-300', on ? 'scale-110' : 'scale-100')} style={{ opacity: on ? 1 : reached ? 0.85 : 0.5 }} />
                </button>
              );
            })}

            {/* A scribbled ring round the one you are on; it draws itself again each time you move. */}
            <motion.div className="pointer-events-none absolute top-1/2" initial={false} animate={{ left: pct(index) }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
              <svg viewBox="0 0 56 56" className="absolute size-14 -translate-x-1/2 -translate-y-1/2 text-accent" fill="none" aria-hidden>
                <motion.path key={level} d="M29 5C43 4 53 15 52 29C51 43 41 52 27 51C13 50 4 40 5 26C6 13 16 5 30 6C34 6 36 7 38 8" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.55, ease: 'easeOut' }} />
              </svg>
            </motion.div>

            {/* Under each drawing, how well you do it there. */}
            {LEVELS.map((l, i) => (
              <span key={l.id} className="pointer-events-none absolute top-full mt-1 w-32 -translate-x-1/2 text-center" style={{ left: pct(i) }}>
                <span className={cx('block text-[11.5px] font-bold tracking-wide tabular-nums transition-colors duration-300', i === index ? 'text-accent-text' : 'text-ink-faint')}>{l.id}</span>
                <span className={cx('block text-[13.5px] leading-tight transition-colors duration-300', i === index ? 'font-semibold text-ink' : 'text-ink-faint')}><UiText source={MEANS[l.id].short} /></span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* What the level means, said once. */}
        <motion.div {...step(0.95)} className="mt-20 flex min-h-[112px] flex-col items-center text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={level} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}>
              <p className="mx-auto max-w-2xl font-serif text-[23px] leading-snug font-semibold tracking-tight"><UiText source={MEANS[level].know} /></p>
              <ExampleReveal lang={lang} level={level} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* The switch: skip the common words you already know. */}
        <motion.div {...step(1.1)} className={cx('mt-5 ml-auto flex w-fit items-center gap-3 transition-opacity duration-300', top === 0 && 'opacity-45')} title={translateUi('You can unmark any word while reading.')}>
          <span className="text-right">
            <span className="block text-[12.5px] text-ink-soft">
              {top > 0 ? <UiText source={'Skip the {0} most common words'} values={[top.toLocaleString()]} /> : <UiText source={'Nothing to skip yet'} />}
            </span>
          </span>
          <Switch checked={top > 0 && seedKnown} onChange={onSeedKnown} disabled={top === 0} label={translateUi('Mark the {0} most common words as known', [top.toLocaleString()])} />
        </motion.div>
      </div>
    </div>
  );
}
