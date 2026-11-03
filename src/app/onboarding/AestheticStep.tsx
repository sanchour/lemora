import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useState } from 'react';
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
 * The sample in the light on show: one sentence of real text on the page's own colours. Click a word to mark it as learning
 * (or to clear it), the way the reader does.
 */
function LivePage({ theme, palette, tokens, lang, start }: { theme: Theme; palette: string; tokens: Array<{ text: string; isWord: boolean }>; lang: string; start: number }) {
  const [learning, setLearning] = useState<number[]>(start >= 0 ? [start] : []);
  const toggle = (i: number) => setLearning((l) => (l.includes(i) ? l.filter((x) => x !== i) : [...l, i]));
  return (
    <div data-theme={theme} data-palette={palette} className="mt-6 grid min-h-[170px] place-items-center rounded-[24px] border border-line bg-bg px-10 py-10 text-ink shadow-elev-2 transition-colors duration-500">
      <p lang={lang} className="text-center font-serif text-[26px] leading-[1.7]">
        {tokens.map((t, i) =>
          t.isWord ? (
            <button key={i} type="button" onClick={() => toggle(i)} className={cx('cursor-pointer rounded-[4px] px-px transition-colors', learning.includes(i) ? 'bg-[var(--learning-bg)] underline decoration-[var(--learning-line)] decoration-[1.5px] underline-offset-[5px]' : 'hover:bg-sunken')}>
              {t.text}
            </button>
          ) : (
            <span key={i}>{t.text}</span>
          ),
        )}
      </p>
    </div>
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
        <motion.div key={theme} initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center gap-3">
            <LightMark theme={theme} />
            <div>
              <p className="font-serif text-[30px] leading-none font-semibold">{name}</p>
              <p className="mt-1 text-[13px] text-ink-faint"><UiText source={latin} /> · <UiText source={note} /></p>
            </div>
          </div>

          {/* A real page of the app, drawn in its own light and palette: the words, menu and buttons all work. */}
          <LivePage theme={theme} palette={palette[theme]} tokens={tokens} lang={lang} start={learning} />

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
