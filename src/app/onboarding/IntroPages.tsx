import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { HandMark } from './HandMark';
import { cx } from '@/lib/cx';

/** The fine line drawings' shared stroke. */
const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** One pen stroke that draws itself in after `delay` seconds. */
function Pen({ d, delay, duration = 0.4, fade = 1, strokeWidth }: { d: string; delay: number; duration?: number; fade?: number; strokeWidth?: number }) {
  return <motion.path {...LINE} strokeWidth={strokeWidth ?? LINE.strokeWidth} d={d} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: fade }} transition={{ duration, delay, ease: 'easeInOut' }} />;
}

/** "Hello" in six languages, written on the book one after the other: Spanish, French, Chinese, Russian, Arabic (under the Chinese), German. */
const WORDS = [
  { text: 'hola', x: 80, y: 66 },
  { text: 'bonjour', x: 180, y: 66, accent: true },
  { text: '你好', x: 80, y: 88, accent: true },
  { text: 'привет', x: 180, y: 88 },
  { text: 'مرحبا', x: 80, y: 110, rtl: true },
  { text: 'hallo', x: 180, y: 110, accent: true },
];

/** An open book, drawn in fine line that draws itself in: stacked pages, text lines, a highlighted word, a sprig, a ribbon and a few sparks of language. */
function OpenBook() {
  return (
    <svg viewBox="0 0 260 150" className="h-auto w-[340px] text-ink-soft" aria-hidden>
      {/* Pages: a soft fill that fades in under the lines. */}
      <motion.path d="M130 42C106 28 66 26 30 34V126C66 118 106 120 130 134C154 120 194 118 230 126V34C194 26 154 28 130 42Z" fill="var(--raised)" stroke="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.05 }} />
      {/* Stacked page edges, then the cover lines. */}
      <Pen d="M30 130C66 122 106 124 130 138C154 124 194 122 230 130" delay={0.05} fade={0.45} />
      <Pen d="M30 134C66 126 106 128 130 142C154 128 194 126 230 134" delay={0.1} fade={0.3} />
      <Pen d="M130 42C106 28 66 26 30 34V126C66 118 106 120 130 134C154 120 194 118 230 126V34C194 26 154 28 130 42Z" delay={0.1} duration={0.61} />
      <Pen d="M130 42V134" delay={0.35} duration={0.28} />
      <Pen d="M126 46V130" delay={0.4} duration={0.28} fade={0.35} />
      {/* A highlighted word on the left page. */}
      {/* Hello in six languages, each one fading in letter by letter and settling into place, one after the other. */}
      {WORDS.map((w, i) => (
        <motion.text
          key={w.text}
          x={w.x}
          y={w.y}
          fontSize={13}
          textAnchor="middle"
          className={cx('font-serif', w.accent ? 'fill-accent' : 'fill-current')}
          initial={{ y: 5 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 + i * 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Arabic letters join, so that word fades in whole rather than letter by letter. */}
          {(w.rtl ? [w.text] : [...w.text]).map((ch, j) => (
            <motion.tspan key={j} initial={{ opacity: 0 }} animate={{ opacity: 0.92 }} transition={{ duration: 0.3, ease: 'easeOut', delay: 0.5 + i * 0.3 + j * 0.04 }}>{ch}</motion.tspan>
          ))}
        </motion.text>
      ))}
      {/* A sage sprig tucked into the right page. */}
      <g stroke="#6b8e78" transform="translate(95 55) scale(0.55)">
        <Pen d="M206 122C204 112 208 102 216 96" delay={1.9} duration={0.35} />
        <Pen d="M216 96C224 96 228 90 228 84C220 84 216 90 216 96Z" delay={2.15} duration={0.25} />
        <Pen d="M208 110C200 110 196 104 196 100C204 100 208 104 208 110Z" delay={2.3} duration={0.25} />
      </g>
      {/* The bookmark ribbon drops from the top. */}
      <motion.path {...LINE} className="text-accent" d="M170 8V46L178 40L186 46V10" initial={{ pathLength: 0, y: -8, opacity: 0 }} animate={{ pathLength: 1, y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.75, ease: 'easeOut' }} />
    </svg>
  );
}

/** Three small vignettes in the same line: a page you can tap, a deck of cards, headphones and a frame. */
const VIGNETTES = [
  {
    title: 'Read anything',
    text: 'Books, articles and comics, with every word a tap away.',
    draw: (
      <>
        <rect {...LINE} x={14} y={6} width={44} height={56} rx={4} />
        {[18, 26, 34, 42, 50].map((y) => (
          <path key={y} {...LINE} strokeWidth={1} opacity={0.5} d={`M22 ${y}H${y === 34 ? 32 : 50}`} />
        ))}
        <rect x={34} y={31} width={16} height={6} rx={2} className="fill-accent/25" />
        <path {...LINE} className="text-accent" d="M44 40l3 9 2.5-3.5 4.5 4" />
      </>
    ),
  },
  {
    title: 'Keep every word',
    text: 'Your words become cards that come back just in time.',
    draw: (
      <>
        <rect {...LINE} x={22} y={10} width={36} height={48} rx={5} transform="rotate(10 40 34)" opacity={0.45} />
        <rect {...LINE} x={18} y={10} width={36} height={48} rx={5} transform="rotate(-4 36 34)" />
        <path {...LINE} strokeWidth={1} d="M26 30H46M28 38H44" opacity={0.55} transform="rotate(-4 36 34)" />
        <path {...LINE} className="text-accent" d="M30 22l3 3 6-6" transform="rotate(-4 36 34)" />
      </>
    ),
  },
  {
    title: 'Listen and watch',
    text: 'Podcasts, radio, films and shows, with text that follows.',
    draw: (
      <>
        <rect {...LINE} x={30} y={14} width={34} height={26} rx={3} opacity={0.6} />
        <path {...LINE} strokeWidth={1} d="M43 22v10l8-5z" opacity={0.6} />
        <path {...LINE} d="M10 48V40C10 28 18 20 28 20S46 28 46 40V48" />
        <rect {...LINE} x={7} y={44} width={9} height={14} rx={3} />
        <rect {...LINE} x={40} y={44} width={9} height={14} rx={3} />
        <path {...LINE} className="text-accent" d="M54 50c3-2 3-6 0-8M58 53c6-4 6-12 0-16" />
      </>
    ),
  },
];

/** What to call you (5.1-2b): one line, bookish and minimal. Enter moves on. */
export function NamePage({ name, onName, onEnter }: { name: string; onName: (name: string) => void; onEnter: () => void }) {
  const translateUi = useUi();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  // The pencil stays while you write and puts itself away a moment after you stop.
  const [typing, setTyping] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(idle.current), []);
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="group relative cursor-default">
        <HandMark size={72} className="text-ink" />
        {/* A little note that pops up when you say hello to the icon. */}
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 w-max max-w-[15rem] -translate-x-1/2 translate-y-1 scale-90 rounded-2xl border border-accent/30 bg-raised px-4 py-2.5 font-serif text-[14.5px] leading-snug text-ink opacity-0 shadow-elev-2 transition-[opacity,transform] duration-200 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
        >
          <UiText source={'Hello! So glad you are here.'} />
          <span aria-hidden className="absolute top-full left-1/2 size-3 -translate-x-1/2 -translate-y-1.5 rotate-45 border-r border-b border-accent/30 bg-raised" />
        </div>
      </div>
      <h1 className="mt-6 font-serif text-[40px] leading-[1.15] font-semibold tracking-tight"><span className="not-italic"><UiText source={'First things first.'} /></span></h1>
      <p className="mt-2 text-[16.5px] text-ink-soft"><UiText source={'What should we call you?'} /></p>
      <div className="group relative mt-10 inline-grid max-w-full">
        {/* Mirror of the typed text: it sizes the box (and so the line) to the name, and carries the pencil, which rides at the end of what you type. */}
        <span aria-hidden className="invisible col-start-1 row-start-1 min-w-[11rem] px-2 pb-4 text-center font-serif text-[32px] leading-[1.15] whitespace-pre">
          <span className="relative">
            {name}
            {/* Zero-width space: keeps the span's height the same when the field is empty, so the pencil never jumps. */}
            {'\u200b'}
            <svg
              viewBox="0 0 24 24"
              width={26}
              height={26}
              className="pointer-events-none visible absolute top-1/2 left-full ml-2 -translate-y-[40%] text-ink-soft transition-opacity duration-300"
              style={{ opacity: !name || typing ? 1 : 0 }}
            >
              <g {...LINE} strokeWidth={1.5}>
                <path d="M4 20L5.2 15L16 4.2L19.8 8L9 18.8Z" />
                <path d="M14 6.2L17.8 10" />
              </g>
              <path d="M4 20L5.2 15L9 18.8Z" fill="var(--accent)" opacity={0.85} />
            </svg>
          </span>
        </span>
        <input
          ref={input}
          value={name}
          onChange={(e) => {
            onName(e.target.value);
            setTyping(true);
            clearTimeout(idle.current);
            idle.current = setTimeout(() => setTyping(false), 900);
          }}
          onKeyDown={(e) => e.key === 'Enter' && onEnter()}
          maxLength={40}
          autoComplete="given-name"
          aria-label={translateUi('Your name')}
          className="col-start-1 row-start-1 w-full min-w-0 bg-transparent px-2 pb-4 text-center font-serif text-[32px] leading-[1.15] outline-none"
        />
        {/* A pen-drawn line: a little wobble, a loose tail, and a second thin pass that appears on focus. */}
        <svg viewBox="0 0 384 14" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-3.5 w-full text-line-strong transition-colors duration-200 group-focus-within:text-accent" aria-hidden>
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path strokeWidth={2.4} d="M3 8C40 5 74 10 118 7C170 4 214 10 262 7C306 5 344 9 378 6" vectorEffect="non-scaling-stroke" />
            <path strokeWidth={1.2} opacity={0} className="transition-opacity duration-200 group-focus-within:opacity-70" d="M20 11C80 9 150 12 210 10C270 8 330 11 360 9" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
      </div>
      <p className="mt-3 text-[12.5px] text-ink-faint"><UiText source={'It stays on this device. We just like to be polite.'} /></p>
    </div>
  );
}

/** A line to smile at, picked by the name so it stays the same going back and forth. */
const QUIPS = [
  'Fair warning: you may start dreaming in another language.',
  'Your future self is already showing off about this.',
  'Put the kettle on. This is the start of a beautiful friendship.',
  'Somewhere, a grammar book just sighed with relief.',
];

/** Welcome, by name (5.1-2b): one funny line and the open book. */
export function WelcomePage({ name }: { name: string }) {
  // The book starts drawing only once the greeting and the quip have settled.
  const [bookIn, setBookIn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBookIn(true), 350);
    return () => clearTimeout(t);
  }, []);
  const translateUi = useUi();
  const who = name.trim() || translateUi('friend');
  const full = translateUi('Welcome, {0}.', [who]);
  const quip = QUIPS[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % QUIPS.length];
  return (
    <div className="flex flex-col items-center py-6 text-center">
      {/* The whole greeting, name included, arrives in one smooth fade. */}
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl font-serif text-[44px] leading-[1.12] font-semibold tracking-tight text-balance">{full}</motion.h1>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-3 max-w-md text-[16.5px] leading-relaxed text-ink-soft italic">
        {quip}
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease: 'easeOut' }} className="mt-10 h-[200px]">
        {bookIn && <OpenBook />}
      </motion.div>
    </div>
  );
}

/** See what Lingua can do (5.1-2b): three things it does, in one fine line each. */
export function AboutPage() {
  const translateUi = useUi();
  // "See what Lingua can do": the name becomes the wordmark, in the sentence at the same size.
  const title = translateUi('See what Lingua can do');
  const at = title.indexOf('Lingua');
  const hasName = at >= 0;
  const pre = hasName ? title.slice(0, at) : title;
  const post = hasName ? title.slice(at + 'Lingua'.length) : '';
  // How many of the three things have been shown so far: each click brings in the next one.
  const [shown, setShown] = useState(0);
  const last = VIGNETTES.length;
  const advance = () => setShown((n) => Math.min(last, n + 1));
  const current = shown - 1; // the one you are on
  const upcoming = shown < last ? shown : -1; // and the one that comes next
  return (
    <div className="py-6">
      <h1 className="text-center font-serif text-[36px] leading-tight font-semibold tracking-tight">
        {pre}
        {hasName ? (
          <span className="relative inline-block">
            lingua<span className="text-accent">.</span>
            {/* A smooth orange line that fades and draws itself in under the name. */}
            <svg viewBox="0 0 120 10" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 -bottom-1.5 h-2.5 w-full text-accent" aria-hidden>
              <motion.path d="M3 6C25 2 50 9 70 5C90 2 105 7 117 4" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.6, delay: 0.3 } }} />
            </svg>
          </span>
        ) : null}
        {post}
      </h1>
      <p className="mt-2 text-center text-[16px] text-ink-soft"><UiText source={'Learn a language by living in it. Three things, done well.'} /></p>
      <div className="mt-12 grid grid-cols-3 gap-8">
        {VIGNETTES.map((v, i) => {
          const on = i < shown;
          const isNext = i === upcoming;
          return (
            <button
              key={v.title}
              type="button"
              onClick={() => (on ? setShown(i + 1) : isNext && advance())}
              disabled={!on && !isNext}
              aria-label={v.title}
              className="group relative flex cursor-pointer flex-col items-center rounded-[28px] px-4 pt-6 pb-5 text-center outline-none disabled:cursor-default"
            >
              {/* The stage the drawing lands on: a quiet dashed ring until its turn, then a soft disc. */}
              <span className="relative grid size-[168px] place-items-center">
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full border-2 border-dashed border-line-strong"
                  animate={{ opacity: on ? 0 : isNext ? 1 : 0.45, scale: on ? 1.08 : 1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.span
                  aria-hidden
                  className={cx('absolute inset-0 rounded-full bg-raised shadow-elev-1 transition-colors duration-500', i === current ? 'ring-2 ring-accent/40' : 'ring-1 ring-line')}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.7 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.svg
                  viewBox="0 0 72 68"
                  className="relative h-auto w-[116px] text-ink-soft"
                  aria-hidden
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.8, y: on ? 0 : 10, rotate: on ? 0 : -4 }}
                  transition={{ duration: 0.8, delay: on ? 0.15 : 0, ease: [0.22, 1, 0.36, 1] }}
                >
                  {v.draw}
                </motion.svg>
                {isNext && (
                  <motion.svg aria-hidden viewBox="0 0 32 32" className="absolute size-9 text-ink-soft" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
                    {/* A small pen-drawn pointing hand with a tap mark, still until you use it. */}
                    <path d="M13 16V8.2C13 6.4 16 6.4 16 8.2V14.5C16 13 19 13 19 14.6C19 13.6 22 13.6 22 15.2C22 14.4 24.6 14.6 24.6 16.4V20.4C24.6 24 22 26.5 18.8 26.5H16.4C14.6 26.5 13.6 25.6 12.2 24L8.4 19.6C7.6 18.6 8.8 17.4 10 18.2L13 20.4" fill="var(--raised)" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10.2 5.2C11.8 3.2 17.2 3.2 18.8 5.2" fill="none" stroke="var(--accent)" strokeWidth={1.4} strokeLinecap="round" />
                  </motion.svg>
                )}
              </span>
              <motion.h2 className="mt-5 font-serif text-[20px] font-semibold" initial={false} animate={{ opacity: on ? 1 : 0.35 }} transition={{ duration: 0.6 }}>{v.title}</motion.h2>
              {/* The subtitle waits until you point at the drawing. */}
              <p className="mt-1.5 h-[3.4rem] max-w-[15rem] text-[14px] leading-relaxed text-ink-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">{on ? v.text : ''}</p>
            </button>
          );
        })}
      </div>
      {/* Which one you are on, and which comes next: the current dot stretches into a pill, the next one is ringed. */}
      <div className="mt-6 flex items-center justify-center gap-2.5" role="tablist" aria-label="Progress">
        {VIGNETTES.map((v, i) => (
          <motion.button
            key={v.title}
            type="button"
            role="tab"
            aria-selected={i === current}
            aria-label={v.title}
            layout
            onClick={() => i < shown && setShown(i + 1)}
            className={cx('h-2.5 rounded-full', i === current ? 'bg-accent' : i < shown ? 'bg-sage' : i === upcoming ? 'border-2 border-accent/60 bg-transparent' : 'bg-line-strong')}
            animate={{ width: i === current ? 30 : 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        ))}
      </div>
      <p className="mt-4 text-center text-[13px] text-ink-faint">{shown === 0 ? 'Click to begin' : shown < last ? 'Click for the next one' : 'That is all of it'}</p>
    </div>
  );
}
