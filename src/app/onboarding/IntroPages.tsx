import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { HandMark } from './HandMark';
import { spring } from '@/design/motion';

/** The fine line drawings' shared stroke. */
const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** An open book, drawn in one fine line. */
function OpenBook() {
  return (
    <svg viewBox="0 0 240 130" className="h-auto w-[300px] text-ink-soft" aria-hidden>
      <path {...LINE} d="M120 30C96 16 58 14 22 22V114C58 106 96 108 120 122C144 108 182 106 218 114V22C182 14 144 16 120 30Z" />
      <path {...LINE} d="M120 30V122" />
      {[44, 56, 68, 80, 92].map((y, i) => (
        <g key={y} opacity={0.55}>
          <path {...LINE} strokeWidth={1} d={`M38 ${y - 6}C${60} ${y - 10} ${84} ${y - 9} ${104} ${y - 2 - i * 0.2}`} />
          <path {...LINE} strokeWidth={1} d={`M136 ${y - 2 - i * 0.2}C${156} ${y - 9} ${180} ${y - 10} ${202} ${y - 6}`} />
        </g>
      ))}
      <path {...LINE} className="text-accent" stroke="currentColor" d="M170 4V40L178 34L186 40V6" />
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
        <span aria-hidden className="invisible col-start-1 row-start-1 min-w-[11rem] px-2 pb-3 text-center font-serif text-[32px] whitespace-pre">
          <span className="relative">
            {name}
            <svg
              viewBox="0 0 24 24"
              width={26}
              height={26}
              className="pointer-events-none visible absolute bottom-0.5 left-full ml-2 text-ink-soft transition-opacity duration-300"
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
          className="col-start-1 row-start-1 w-full min-w-0 bg-transparent px-2 pb-3 text-center font-serif text-[32px] outline-none"
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
  const quip = QUIPS[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % QUIPS.length];
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.1 }} className="max-w-2xl font-serif text-[44px] leading-[1.12] font-semibold tracking-tight text-balance"><UiText source={'Welcome, {0}.'} values={[name.trim() || <UiText source={'friend'} />]} /></motion.h1>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.35 }} className="mt-3 max-w-md text-[16.5px] leading-relaxed text-ink-soft italic">
        {quip}
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.55 }} className="mt-10">
        <OpenBook />
      </motion.div>
    </div>
  );
}

/** See what Lingua can do (5.1-2b): three things it does, in one fine line each. */
export function AboutPage() {
  return (
    <div className="py-6">
      <h1 className="text-center font-serif text-[36px] leading-tight font-semibold tracking-tight"><UiText source={'See what Lingua can do'} /></h1>
      <p className="mt-2 text-center text-[16px] text-ink-soft"><UiText source={'Learn a language by living in it. Three things, done well.'} /></p>
      <div className="mt-12 grid grid-cols-3 gap-10">
        {VIGNETTES.map((v, i) => (
          <motion.div key={v.title} className="flex flex-col items-center text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.08 * i }}>
            <svg viewBox="0 0 72 68" className="h-auto w-[120px] text-ink-soft" aria-hidden>
              {v.draw}
            </svg>
            <h2 className="mt-5 font-serif text-[20px] font-semibold">{v.title}</h2>
            <p className="mt-1.5 max-w-[15rem] text-[14px] leading-relaxed text-ink-soft">{v.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
