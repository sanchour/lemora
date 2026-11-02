import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { HandMark } from './HandMark';
import { spring } from '@/design/motion';

/** The fine line drawings' shared stroke. */
const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** One pen stroke that draws itself in after `delay` seconds. */
function Pen({ d, delay, duration = 0.4, fade = 1, strokeWidth }: { d: string; delay: number; duration?: number; fade?: number; strokeWidth?: number }) {
  return <motion.path {...LINE} strokeWidth={strokeWidth ?? LINE.strokeWidth} d={d} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: fade }} transition={{ duration, delay, ease: 'easeInOut' }} />;
}

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
      <motion.rect x={64} y={54} width={26} height={8} rx={3} className="fill-accent/25" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.3, delay: 0.85, ease: 'easeOut' }} style={{ transformOrigin: '64px 58px' }} />
      {/* Lines of text, each one a little different. */}
      {[
        { y: 58, l: 'M46 58C62 55 88 56 114 60', r: 'M146 60C170 56 196 55 214 58' },
        { y: 70, l: 'M46 70C60 67 80 68 114 72', r: 'M146 72C168 68 190 68 214 70' },
        { y: 82, l: 'M46 82C66 79 90 80 100 82', r: '' },
        { y: 94, l: 'M46 94C62 91 90 92 114 96', r: '' },
        { y: 106, l: 'M46 106C60 103 76 104 92 106', r: 'M146 108C170 104 196 104 202 106' },
      ].map((row, i) => (
        <g key={row.y}>
          <Pen d={row.l} delay={0.5 + i * 0.06} duration={0.28} strokeWidth={1} fade={0.5} />
          {row.r && <Pen d={row.r} delay={0.53 + i * 0.06} duration={0.28} strokeWidth={1} fade={0.5} />}
        </g>
      ))}
      {/* The same word in other scripts on the right page: Chinese, Japanese, Latin. */}
      <g className="text-accent">
        <Pen d="M158 76V79M151 81H165M154 83Q157 90 164 93M162 83Q159 90 152 93" delay={0.7} duration={0.5} strokeWidth={1.2} />
        <Pen d="M176 80H186M181 76Q180 88 180 90M176 86Q184 82 186 90Q184 96 178 92" delay={0.8} duration={0.5} strokeWidth={1.2} />
        <Pen d="M194 93L201 76L208 93M197 87H205" delay={0.9} duration={0.5} strokeWidth={1.2} />
      </g>
      <Pen d="M46 82C60 80 76 80 100 83M46 94C62 92 78 92 100 95" delay={0.65} duration={0.4} strokeWidth={1} fade={0.5} />
      {/* A sage sprig tucked into the right page. */}
      <g stroke="#6b8e78">
        <Pen d="M206 122C204 112 208 102 216 96" delay={0.9} duration={0.33} />
        <Pen d="M216 96C224 96 228 90 228 84C220 84 216 90 216 96Z" delay={1.1} duration={0.22} />
        <Pen d="M208 110C200 110 196 104 196 100C204 100 208 104 208 110Z" delay={1.2} duration={0.22} />
      </g>
      {/* The bookmark ribbon drops from the top. */}
      <motion.path {...LINE} className="text-accent" d="M170 8V46L178 40L186 46V10" initial={{ pathLength: 0, y: -8, opacity: 0 }} animate={{ pathLength: 1, y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.75, ease: 'easeOut' }} />
      {/* Sparks of language rising from the spine, gently floating. */}
      {[
        { x: 112, y: 18, d: 'M104 22L108 14M108 22L116 18', delay: 1.1 },
        { x: 148, y: 14, d: 'M140 18C144 12 150 12 152 18C154 12 160 12 162 18', delay: 1.2 },
        { x: 40, y: 20, d: 'M30 20Q30 12 38 12H56Q64 12 64 20V26Q64 34 56 34H46L38 40V34Q30 33 30 26ZM40 23h.1M47 23h.1M54 23h.1', delay: 1.3, t: 'translate(0 -10)' },
        { x: 200, y: 20, d: 'M196 30Q196 22 204 22H220Q228 22 228 30V34Q228 42 220 42H214L208 48V42Q196 42 196 34ZM204 32L208 28L212 32M216 30H222', delay: 1.4, t: 'translate(0 -22)' },
      ].map((spark, i) => (
        <motion.g key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.8, y: [0, -3, 0] }} transition={{ opacity: { duration: 0.5, delay: spark.delay }, y: { duration: 3.2, delay: spark.delay + i * 0.3, repeat: Infinity, ease: 'easeInOut' } }}>
          <path {...LINE} className="text-accent" strokeWidth={1.2} d={spark.d} transform={spark.t} />
        </motion.g>
      ))}
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
  const translateUi = useUi();
  const who = name.trim() || translateUi('friend');
  const full = translateUi('Welcome, {0}.', [who]);
  // Split around the name: "Welcome" (without its comma) leads, and ", name." follows.
  const [before = '', after = ''] = translateUi('Welcome, {0}.', ['\u0000']).split('\u0000');
  const lead = before.replace(/[\s,，、:：]+$/, '') || full;
  const rest = before.slice(lead.length) + who + after;
  const quip = QUIPS[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % QUIPS.length];
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <h1 className="flex max-w-2xl items-baseline justify-center font-serif text-[44px] leading-[1.12] font-semibold tracking-tight whitespace-nowrap" aria-label={full}>
        {/* "Welcome" arrives alone and centred; then the name opens up beside it and the two re-centre together. */}
        <motion.span aria-hidden initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.05 }}>{lead}</motion.span>
        <motion.span aria-hidden className="-my-1 overflow-hidden py-1 whitespace-pre" initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} transition={{ width: { duration: 0.55, delay: 0.7, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.4, delay: 0.8 } }}>{rest}</motion.span>
      </h1>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 1.1 }} className="mt-3 max-w-md text-[16.5px] leading-relaxed text-ink-soft italic">
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
