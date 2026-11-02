import { UiText, useUi } from '@/design/i18n/UiText';
import { AnimatePresence, motion } from 'motion/react';
import { useRef } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { getLanguage } from '@/core/lang/languages';
import { LEVELS } from '@/core/lang/levels';
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
const ICONS: Record<Level, Part[]> = {
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
};

/** A sentence in the language you are learning at each level, with what it says (for the six core languages). */
const EXAMPLES: Record<string, Record<Level, [string, string]>> = {
  es: {
    A0: ['Hola.', 'Hello.'],
    A1: ['Me llamo Ana y vivo en Madrid.', 'My name is Ana and I live in Madrid.'],
    A2: ['Ayer fui al mercado y compré pan y frutas.', 'Yesterday I went to the market and bought bread and fruit.'],
    B1: ['Aunque llovía, decidimos salir a caminar porque necesitábamos aire fresco.', 'Although it was raining, we decided to go for a walk because we needed fresh air.'],
    B2: ['Si hubiera sabido lo difícil que sería, probablemente habría empezado mucho antes.', 'If I had known how hard it would be, I would probably have started much earlier.'],
    C1: ['Lejos de resolver el problema, la medida no hizo sino agravar la desconfianza que pretendía disipar.', 'Far from solving the problem, the measure only deepened the mistrust it was meant to dispel.'],
  },
  fr: {
    A0: ['Bonjour.', 'Hello.'],
    A1: ['Je m’appelle Ana et j’habite à Paris.', 'My name is Ana and I live in Paris.'],
    A2: ['Hier, je suis allé au marché et j’ai acheté du pain et des fruits.', 'Yesterday I went to the market and bought bread and fruit.'],
    B1: ['Même s’il pleuvait, nous avons décidé de marcher un peu parce que nous avions besoin d’air.', 'Even though it was raining, we decided to walk a little because we needed some air.'],
    B2: ['Si j’avais su à quel point ce serait difficile, j’aurais probablement commencé bien plus tôt.', 'If I had known how hard it would be, I would probably have started much earlier.'],
    C1: ['Loin de résoudre le problème, cette mesure n’a fait qu’aggraver la méfiance qu’elle prétendait dissiper.', 'Far from solving the problem, this measure only deepened the mistrust it claimed to dispel.'],
  },
  de: {
    A0: ['Hallo.', 'Hello.'],
    A1: ['Ich heiße Ana und wohne in Berlin.', 'My name is Ana and I live in Berlin.'],
    A2: ['Gestern war ich auf dem Markt und habe Brot und Obst gekauft.', 'Yesterday I was at the market and bought bread and fruit.'],
    B1: ['Obwohl es regnete, gingen wir spazieren, weil wir frische Luft brauchten.', 'Although it was raining, we went for a walk because we needed fresh air.'],
    B2: ['Hätte ich gewusst, wie schwierig es werden würde, hätte ich wohl viel früher angefangen.', 'Had I known how hard it would be, I would probably have started much earlier.'],
    C1: ['Weit davon entfernt, das Problem zu lösen, verstärkte die Maßnahme nur das Misstrauen, das sie zerstreuen sollte.', 'Far from solving the problem, the measure only deepened the mistrust it was meant to dispel.'],
  },
  ru: {
    A0: ['Привет.', 'Hello.'],
    A1: ['Меня зовут Ана, я живу в Москве.', 'My name is Ana, I live in Moscow.'],
    A2: ['Вчера я ходил на рынок и купил хлеб и фрукты.', 'Yesterday I went to the market and bought bread and fruit.'],
    B1: ['Хотя шёл дождь, мы решили погулять, потому что нам нужен был свежий воздух.', 'Although it was raining, we decided to go for a walk because we needed fresh air.'],
    B2: ['Если бы я знал, как это трудно, я бы, наверное, начал гораздо раньше.', 'If I had known how hard it was, I would probably have started much earlier.'],
    C1: ['Эта мера не только не решила проблему, но и усилила недоверие, которое должна была развеять.', 'This measure not only failed to solve the problem but deepened the mistrust it was meant to dispel.'],
  },
  ar: {
    A0: ['مرحبا.', 'Hello.'],
    A1: ['اسمي آنا وأسكن في القاهرة.', 'My name is Ana and I live in Cairo.'],
    A2: ['ذهبت أمس إلى السوق واشتريت خبزًا وفاكهة.', 'Yesterday I went to the market and bought bread and fruit.'],
    B1: ['رغم أن المطر كان ينهمر، قررنا أن نتمشى لأننا احتجنا إلى هواء نقي.', 'Although the rain was pouring, we decided to take a walk because we needed fresh air.'],
    B2: ['لو كنت أعلم كم سيكون الأمر صعبًا، لربما بدأت قبل ذلك بكثير.', 'If I had known how hard it would be, I might have started much earlier.'],
    C1: ['بدلًا من حلّ المشكلة، لم يزد القرار إلا تعميقًا لانعدام الثقة الذي كان يُراد تبديده.', 'Instead of solving the problem, the decision only deepened the mistrust it was meant to dispel.'],
  },
  zh: {
    A0: ['你好。', 'Hello.'],
    A1: ['我叫安娜，我住在北京。', 'My name is Ana and I live in Beijing.'],
    A2: ['昨天我去了市场，买了面包和水果。', 'Yesterday I went to the market and bought bread and fruit.'],
    B1: ['虽然下着雨，我们还是决定出去走走，因为需要新鲜空气。', 'Although it was raining, we still decided to go out for a walk because we needed fresh air.'],
    B2: ['如果早知道这么难，我大概会早点开始。', 'If I had known it was this hard, I would probably have started earlier.'],
    C1: ['这项措施非但没有解决问题，反而加深了它本想消除的不信任。', 'Far from solving the problem, the measure deepened the very mistrust it set out to remove.'],
  },
};

interface LevelStepProps {
  lang: string;
  level: Level;
  seedKnown: boolean;
  onLevel: (level: Level) => void;
  onSeedKnown: (value: boolean) => void;
}

/** One uneven pen line for the track (and, drawn again on top, for how far you have come). */
const LINE = 'M2 10C60 6 110 14 170 9C230 5 280 13 340 9C400 5 450 13 510 9C550 7 580 11 598 9';

/**
 * How much do you already know (5.1-2b): a quiet slider from A0 to C1, drawn by hand. A sprig grows along one
 * pen line, one little drawing for each level, and a scribbled ring marks the one you are on. You can click a
 * drawing, drag, or use the arrow keys; what the level means is said once underneath, with the switch that
 * skips the most common words.
 */
export function LevelStep({ lang, level, seedKnown, onLevel, onSeedKnown }: LevelStepProps) {
  const translateUi = useUi();
  const track = useRef<HTMLDivElement>(null);
  const last = LEVELS.length - 1;
  const index = LEVELS.findIndex((l) => l.id === level);
  const info = LEVELS[index];
  const top = info.seedKnownTopN;
  const sample = EXAMPLES[lang]?.[level];
  const example = sample ? { text: sample[0], en: sample[1] } : null;
  const rtl = getLanguage(lang)?.rtl;
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
        <div className="px-20 pt-6">
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
              <motion.path d={LINE} fill="none" stroke="var(--accent)" strokeWidth={2.4} strokeLinecap="round" vectorEffect="non-scaling-stroke" initial={false} animate={{ pathLength: index / last }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
            </svg>

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
                  className="absolute top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-bg"
                  style={{ left: pct(i) }}
                >
                  <svg viewBox="0 0 32 32" className={cx('size-10 text-ink transition-[opacity,transform] duration-300', on ? 'scale-110' : 'scale-100')} style={{ opacity: on ? 1 : reached ? 0.85 : 0.5 }} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {ICONS[l.id].map((p, k) => (
                      <path key={k} d={p.d} fill={p.fill ?? 'none'} stroke="currentColor" />
                    ))}
                  </svg>
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
        </div>

        {/* What the level means, said once. */}
        <div className="mt-20 flex min-h-[112px] flex-col items-center text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={level} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}>
              <p className="mx-auto max-w-2xl font-serif text-[23px] leading-snug font-semibold tracking-tight"><UiText source={MEANS[level].know} /></p>
              {example && (
                <div className="mx-auto mt-5 max-w-2xl">
                  <p lang={lang} dir={rtl ? 'rtl' : undefined} className="font-serif text-[21px] leading-snug text-accent-text">{example.text}</p>
                  <p className="mt-1 text-[13.5px] text-ink-faint">{example.en}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The switch: skip the common words you already know. */}
        <div className={cx('mx-auto mt-5 flex w-fit items-center gap-4 transition-opacity duration-300', top === 0 && 'opacity-45')} title={translateUi('You can unmark any word while reading.')}>
          <span className="text-right">
            <span className="block text-[14px] font-semibold">
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
