import { useUi } from '@/design/i18n/UiText';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Brain, Briefcase, Clapperboard, GraduationCap, Heart, Plane } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { LearningReason } from '@/data/settings';
import { spring } from '@/design/motion';
import { cx } from '@/lib/cx';
import { StepTitle } from './StepTitle';

export const REASONS: Array<{ id: LearningReason; name: string; blurb: string; quip: string; icon: LucideIcon }> = [
  { id: 'travel', name: 'Travel', blurb: 'Find your way, order, chat with locals', quip: 'Pack light; bring words.', icon: Plane },
  { id: 'family', name: 'Family & friends', blurb: 'Talk with the people you love', quip: 'The best reason there is.', icon: Heart },
  { id: 'work', name: 'Work', blurb: 'Meetings, mail and colleagues', quip: 'Your next meeting just got more interesting.', icon: Briefcase },
  { id: 'culture', name: 'Culture', blurb: 'Books, films and music in the original', quip: 'Subtitles off, sooner than you think.', icon: Clapperboard },
  { id: 'study', name: 'Study', blurb: 'A course, an exam or a stay abroad', quip: 'Top of the class, here we come.', icon: GraduationCap },
  { id: 'sharp', name: 'Keeping sharp', blurb: 'A good habit for a curious mind', quip: 'Crosswords, step aside.', icon: Brain },
];

const SKY = '#a9c7dd';
const SAGE = '#9cc2a6';
const ORANGE = '#ee8b48';
const PEACH = '#f6bd8a';
const SAND = '#c99668';
const SUN = '#f4d27a';
interface Part { d: string; fill?: string; stroke?: string }

/** One pen drawing per reason, filled in soft colour (32 x 32), in the same hand as the level sprigs. */
const DRAWINGS: Partial<Record<LearningReason, Part[]>> = {
  travel: [
    { d: 'M3.5 15.5L28 5L21.5 27L15.5 19Z', fill: SKY },
    { d: 'M15.5 19L28 5' },
    { d: 'M15.5 19L14.5 25L18 21.5', fill: PEACH },
    { d: 'M3 25C6 22.5 8 26 11 23.5', stroke: ORANGE },
  ],
  family: [
    { d: 'M16 27C6 20 4.5 12 9.5 8.5C12.5 6.5 15 8 16 10.5C17 8 19.5 6.5 22.5 8.5C27.5 12 26 20 16 27Z', fill: ORANGE },
    { d: 'M24.5 3.5C23 2.5 21 3.5 21 5.2C21 7 24.5 9 24.5 9S28 7 28 5.2C28 3.5 26 2.5 24.5 3.5Z', fill: PEACH },
    { d: 'M10 12.5C10.8 11.4 12.2 11.2 13 11.8', stroke: '#fff' },
  ],
  work: [
    { d: 'M6 11H26Q27.5 11 27.5 12.5V23.5Q27.5 25 26 25H6Q4.5 25 4.5 23.5V12.5Q4.5 11 6 11Z', fill: SAND },
    { d: 'M12 11V8.5Q12 7 13.5 7H18.5Q20 7 20 8.5V11' },
    { d: 'M4.5 17.5C10 19 22 19 27.5 17.5' },
    { d: 'M14.2 16.2H17.8V20H14.2Z', fill: ORANGE },
  ],
  culture: [
    { d: 'M5 12.5H27V25.5H5Z', fill: SKY },
    { d: 'M4.5 7.8L27.5 4.8V10.6L4.5 12.5Z', fill: ORANGE },
    { d: 'M10.5 7L9 12M16.5 6.2L15 11.6M22.5 5.4L21 10.8' },
    { d: 'M13.5 16.5V22L19 19.2Z', fill: PEACH },
  ],
  study: [
    { d: 'M9 15.5V21C9 23.2 12.2 25 16 25S23 23.2 23 21V15.5', fill: PEACH },
    { d: 'M16 6L29.5 12.5L16 19L2.5 12.5Z', fill: SAGE },
    { d: 'M27 14V21' },
    { d: 'M25.8 21.2a1.3 1.3 0 1 0 2.4 0a1.3 1.3 0 1 0 -2.4 0', fill: ORANGE },
  ],
  sharp: [
    { d: 'M16 3.5C10.5 3.5 8 7.5 8 11.5C8 15 10 16.5 11.5 18.5V21.5H20.5V18.5C22 16.5 24 15 24 11.5C24 7.5 21.5 3.5 16 3.5Z', fill: SUN },
    { d: 'M12 24.5H20M13.5 27.5H18.5' },
    { d: 'M13.2 12L16 15L18.8 12M16 15V21', stroke: ORANGE },
  ],
};

/** A scribbled ring that draws itself round the icon you picked. */
const RING = 'M30 4C43 3 54 14 53 28C52 43 41 53 27 52C13 51 4 40 5 26C6 13 17 5 31 5C35 5 38 6 40 7';

interface WhyStepProps {
  /** The language's English name, for the title. */
  language: string;
  reasons: LearningReason[];
  onReasons: (reasons: LearningReason[]) => void;
}

/** Why, why are you here, huh? (5.1-2b): six tiles, any number, and a line that answers each pick. */
export function WhyStep({ language, reasons, onReasons }: WhyStepProps) {
  const translateUi = useUi();
  const [last, setLast] = useState<LearningReason | null>(null);
  const toggle = (id: LearningReason) => {
    const on = !reasons.includes(id);
    onReasons(on ? [...reasons, id] : reasons.filter((r) => r !== id));
    setLast(on ? id : null);
  };
  const reply = last && reasons.includes(last) ? REASONS.find((r) => r.id === last)!.quip : reasons.length >= 3 ? 'Now that’s what we call motivation.' : reasons.length ? 'Good reasons. Any more?' : '';

  return (
    <div>
      <StepTitle title={translateUi('Why do you want to learn {0}?', [language])} />

      <div role="group" aria-label={translateUi('Why you\'re learning')} className="grid grid-cols-3 gap-3">
        {REASONS.map((r) => {
          const on = reasons.includes(r.id);
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(r.id)}
              className={cx(
                'no-callout relative flex flex-col items-center rounded-3xl border px-4 pt-4 pb-4 text-center transition-[transform,border-color,box-shadow,background-color] duration-200 active:scale-[0.97]',
                on ? '-translate-y-1 border-accent bg-accent-soft shadow-elev-2' : 'border-line bg-raised hover:-translate-y-0.5 hover:border-line-strong',
              )}
            >
              <motion.span animate={on ? { rotate: [0, -8, 6, 0], scale: [1, 1.1, 1] } : { rotate: 0, scale: 1 }} transition={{ duration: 0.45 }} className="relative grid size-[72px] place-items-center">
                <svg viewBox="0 0 32 32" className={cx('size-14 text-ink transition-opacity duration-200', !on && 'opacity-90')} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {(DRAWINGS[r.id] ?? []).map((p, k) => (
                    <path key={k} d={p.d} fill={p.fill ?? 'none'} stroke={p.stroke ?? 'currentColor'} />
                  ))}
                </svg>
                {on && (
                  <svg viewBox="0 0 58 58" className="pointer-events-none absolute inset-0 size-full text-accent" fill="none" aria-hidden>
                    <motion.path d={RING} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                  </svg>
                )}
              </motion.span>
              <span className="mt-3 font-serif text-[18px] font-semibold">{r.name}</span>
              <span className="mt-0.5 text-[12.5px] leading-snug text-ink-soft">{r.blurb}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 h-8 text-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {reply && <motion.p key={reply} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={spring.snappy} className="font-serif text-[19px] text-accent-text italic">
            {reply}
          </motion.p>}
        </AnimatePresence>
      </div>
    </div>
  );
}
