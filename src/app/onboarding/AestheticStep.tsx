import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { tokenize } from '@/core/text/tokenizer';
import { patchSetting, setSetting } from '@/data/settings';
import type { Settings, Theme } from '@/data/settings';
import { NOCTURNE_PALETTES, PAPER_PALETTES } from '@/design/palettes';
import type { Palette } from '@/design/palettes';
import { spring } from '@/design/motion';
import { cx } from '@/lib/cx';
import { StepTitle } from './StepTitle';

interface AestheticStepProps {
  /** 0: Lux, the light page; 1: Nox, the dark one. The footer's Continue moves from one to the other. */
  stage: 0 | 1;
  palette: Settings['palette'];
  sample: string;
  lang: string;
}

/** The two lights, with their Latin names: Lux (light) and Nox (night). */
const LIGHTS: Array<{ theme: Theme; name: string; latin: string; note: string; list: Palette[] }> = [
  { theme: 'paper', name: 'Lux', latin: 'light', note: 'For daylight', list: PAPER_PALETTES },
  { theme: 'nocturne', name: 'Nox', latin: 'night', note: 'For the evening', list: NOCTURNE_PALETTES },
];

/** A little pen-drawn sun and moon, filled in soft colour (32 x 32). */
function LightMark({ theme }: { theme: Theme }) {
  return (
    <svg viewBox="0 0 32 32" className="size-9 text-ink" fill="none" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {theme === 'paper' ? (
        <>
          <circle cx={16} cy={16} r={5.5} fill="#f4d27a" stroke="currentColor" />
          <path d="M16 4.5V7.5M16 24.5V27.5M4.5 16H7.5M24.5 16H27.5M8 8L10 10M22 22L24 24M24 8L22 10M10 22L8 24" stroke="#ee8b48" />
        </>
      ) : (
        <>
          <path d="M22.5 5.5C14 6 9 13 11 20.5C13 27 21 29 27 24.5C20.5 25 16 19 17.5 13C18.3 9.8 20 7.2 22.5 5.5Z" fill="#a9c7dd" stroke="currentColor" />
          <path d="M26 7.5V10.5M24.5 9H27.5M20 3.5V4.5" stroke="#f6bd8a" />
        </>
      )}
    </svg>
  );
}

/**
 * Choose your study light (5.1-2b): two stages, each one page of the app drawn in its own light: Lux (light) first, centred,
 * with its colours under it; Continue brings Nox (dark) with its colours. The whole screen takes the light on show, so a
 * colour is tried for real, and the palettes chosen are kept for both.
 */
export function AestheticStep({ stage, palette, sample, lang }: AestheticStepProps) {
  const translateUi = useUi();
  const { theme, name, latin, note, list } = LIGHTS[stage];
  // The screen itself takes on the light you are choosing for.
  useEffect(() => {
    void setSetting('theme', theme);
  }, [theme]);
  // Show one word marked "learning", as the reader does.
  const tokens = tokenize(sample, lang);
  const learning = tokens.findIndex((t, i) => t.isWord && i > 2 && t.text.length > 3);

  return (
    <div>
      <StepTitle center title={translateUi('Choose your study light')} body="We have a fine selection of cute colour themes to choose from. Change it any time in Settings." />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={theme} initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-xl">
          <div className="flex items-center justify-center gap-3">
            <LightMark theme={theme} />
            <div>
              <p className="font-serif text-[30px] leading-none font-semibold">{name}</p>
              <p className="mt-1 text-[13px] text-ink-faint"><UiText source={latin} /> · <UiText source={note} /></p>
            </div>
          </div>

          {/* The page, drawn in its own light and palette. */}
          <div data-theme={theme} data-palette={palette[theme]} className="mt-6 flex h-[210px] overflow-hidden rounded-[24px] border border-line bg-bg text-ink shadow-elev-2">
            <div className="w-14 shrink-0 space-y-3 border-r border-line bg-surface px-3.5 pt-4">
              <span className="block size-7 rounded-lg bg-accent-fill" />
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={cx('block size-7 rounded-lg', i === 0 ? 'bg-accent-soft' : 'bg-line/70')} />
              ))}
            </div>
            <div className="min-w-0 flex-1 px-6 pt-5">
              <span className="block h-2 w-28 rounded-full bg-line-strong" />
              <p lang={lang} className="mt-4 line-clamp-3 font-serif text-[19px] leading-relaxed">
                {tokens.map((t, i) =>
                  i === learning ? (
                    <span key={i} className="rounded-[3px] bg-[var(--learning-bg)] underline decoration-[var(--learning-line)] decoration-[1.5px] underline-offset-[3px]">
                      {t.text}
                    </span>
                  ) : (
                    <span key={i}>{t.text}</span>
                  ),
                )}
              </p>
              <div className="mt-5 flex gap-2.5">
                <span className="h-8 w-24 rounded-full bg-accent-fill" />
                <span className="h-8 w-16 rounded-full border border-line-strong" />
              </div>
            </div>
          </div>

          {/* The colours to try, under the page. */}
          <div role="radiogroup" aria-label={translateUi('{0} palettes', [name])} className="mt-6 grid grid-cols-6 gap-3">
            {list.map((p) => {
              const picked = palette[theme] === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  onClick={() => void patchSetting('palette', { [theme]: p.id } as Partial<Settings['palette']>)}
                  className="no-callout group flex flex-col items-center gap-2 rounded-xl text-center"
                >
                  <motion.span
                    animate={{ scale: picked ? 1.06 : 1 }}
                    transition={spring.snappy}
                    className={cx('grid h-14 w-full place-items-center rounded-2xl border transition-[box-shadow,transform] duration-150 group-hover:-translate-y-0.5', picked ? 'border-transparent ring-2 ring-accent' : 'border-line')}
                    style={{ background: p.swatch[0] }}
                  >
                    <span className="size-4 rounded-full" style={{ background: p.swatch[1] }} />
                  </motion.span>
                  <span className={cx('text-[12px] leading-none', picked ? 'font-semibold text-ink' : 'text-ink-soft')}>{p.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
