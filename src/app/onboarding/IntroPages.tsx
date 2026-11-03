import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HandMark } from './HandMark';
import { LevelIcon } from './LevelStep';
import { cx } from '@/lib/cx';
import { PRODUCT } from '@/product';

/** The fine line drawings' shared stroke. */
const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** One pen stroke that draws itself in after `delay` seconds. */
function Pen({ d, delay, duration = 0.4, fade = 1, strokeWidth }: { d: string; delay: number; duration?: number; fade?: number; strokeWidth?: number }) {
  return <motion.path {...LINE} strokeWidth={strokeWidth ?? LINE.strokeWidth} d={d} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: fade }} transition={{ duration, delay, ease: 'easeInOut' }} />;
}

/** "Welcome" in six languages, written on the book one after the other: Spanish, French, Chinese, Russian, Arabic (under the Chinese), German. */
const WORDS: Array<{ text: string; x: number; y: number; accent?: boolean; rtl?: boolean; size?: number }> = [
  { text: 'bienvenido', x: 80, y: 66 },
  { text: 'bienvenue', x: 180, y: 66, accent: true },
  { text: '欢迎', x: 80, y: 88, accent: true },
  { text: 'добро пожаловать', x: 180, y: 88, size: 10.5 },
  { text: 'أهلا', x: 80, y: 110, rtl: true },
  { text: 'willkommen', x: 180, y: 110, accent: true },
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
      {/* Welcome in six languages, each one fading in letter by letter and settling into place, one after the other. */}
      {WORDS.map((w, i) => (
        <motion.text
          key={w.text}
          x={w.x}
          y={w.y}
          fontSize={w.size ?? 13}
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

/** What the demo words mean (Spanish), looked up by their lower-case form. */
const GLOSS: Record<string, string> = {
  hola: 'hello', me: 'myself', llamo: 'I am called', lucía: 'Lucía (a name)', vivo: 'I live', en: 'in', una: 'a', casa: 'house', pequeña: 'small', y: 'and', tomo: 'I have, I drink',
  café: 'coffee', con: 'with', pan: 'bread', cada: 'every', mañana: 'morning',
  vamos: 'shall we go', al: 'to the', cine: 'cinema', esta: 'this', noche: 'night', sí: 'yes', pero: 'but', primero: 'first', cenamos: 'we have dinner', algo: 'something',
};
const PASSAGE = 'Hola, me llamo Lucía. Vivo en una casa pequeña y tomo café con pan cada mañana.';
const CLIP = [
  { es: '¿Vamos al cine esta noche?', en: 'Shall we go to the cinema tonight?' },
  { es: 'Sí, pero primero cenamos algo.', en: 'Yes, but let’s have some dinner first.' },
];
/** The cards already in the demo Thesaurus, before you keep any of your own. */
const DECK = ['hola', 'casa', 'café', 'pan', 'mañana'];

/** A sentence as words (with their punctuation kept beside them) and the spaces between. */
function tokens(text: string) {
  return text.split(' ').map((t) => {
    const m = t.match(/^([¿¡]*)(.+?)([.,!?;:]*)$/u)!;
    return { pre: m[1], word: m[2], post: m[3], key: m[2].toLowerCase() };
  });
}

/** One word you can point at for its meaning, and click to keep. */
function Word({ word, gloss, kept, spoken, onKeep }: { word: string; gloss?: string; kept?: boolean; spoken?: boolean; onKeep?: () => void }) {
  return (
    <span className="group/word relative inline-block">
      <button
        type="button"
        onClick={onKeep}
        className={cx(
          '-mx-0.5 cursor-pointer rounded-[5px] px-0.5 transition-colors duration-150',
          kept ? 'bg-accent/15 text-accent-text' : 'decoration-accent/60 decoration-dotted underline-offset-[6px] hover:bg-sunken hover:underline',
          spoken === false && 'text-ink-faint',
        )}
      >
        {word}
      </button>
      {gloss && (
        <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 translate-y-1 rounded-lg bg-ink px-2.5 py-1 font-sans text-[12.5px] whitespace-nowrap text-bg opacity-0 shadow-elev-2 transition-[opacity,transform] duration-150 group-hover/word:translate-y-0 group-hover/word:opacity-100">
          {gloss}
        </span>
      )}
    </span>
  );
}

/** Codex: a short text where every word gives its meaning when you point at it; clicking keeps it for Thesaurus. */
function ReadDemo({ kept, onKeep }: { kept: string[]; onKeep: (key: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p lang="es" className="font-serif text-[25px] leading-[1.9]">
        {tokens(PASSAGE).map((t, i) => (
          <span key={i}>
            {t.pre}
            <Word word={t.word} gloss={GLOSS[t.key]} kept={kept.includes(t.key)} onKeep={() => onKeep(t.key)} />
            {t.post}{' '}
          </span>
        ))}
      </p>
    </div>
  );
}

const STOPS = ['Today', 'Tomorrow', '3 days', '1 week', '1 month'];

/**
 * Thesaurus: your words come back on a widening schedule. The card on top shows a word; click to turn it over, click again to say
 * you knew it, and it hops along the pen line to a later day. Words you kept in Codex are the first in the stack.
 */
function WordsDemo({ kept }: { kept: string[] }) {
  const [deck] = useState(() => [...new Set([...kept.slice().reverse(), ...DECK])].slice(0, 5));
  const [queue, setQueue] = useState(deck);
  const [stage, setStage] = useState<Record<string, number>>({});
  const [turned, setTurned] = useState(false);
  const cur = queue[0];
  const press = () => {
    if (!turned) return setTurned(true);
    setStage((st) => ({ ...st, [cur]: Math.min(STOPS.length - 1, (st[cur] ?? 0) + 1) }));
    setQueue((q) => [...q.slice(1), q[0]]);
    setTurned(false);
  };
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[124px] w-[210px]" style={{ perspective: 900 }}>
        {/* The cards waiting behind, fanned like a hand-held deck. */}
        {[2, 1].map((n) => (
          <span key={n} className="absolute inset-0 rounded-[20px] border border-line bg-raised shadow-elev-1" style={{ transform: `translate(${n * 7}px, ${n * 6}px) rotate(${n * 2.5}deg)`, opacity: 0.9 - n * 0.25 }} />
        ))}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.button
            key={cur + (stage[cur] ?? 0)}
            type="button"
            onClick={press}
            initial={{ opacity: 0, x: 40, rotate: 4 }}
            animate={{ opacity: 1, x: 0, rotate: 0, rotateY: turned ? 180 : 0 }}
            exit={{ opacity: 0, y: 60, scale: 0.8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            aria-label={turned ? `${cur}: ${GLOSS[cur]}` : cur}
          >
            <span className="absolute inset-0 grid place-items-center rounded-[20px] border border-line bg-raised shadow-elev-2" style={{ backfaceVisibility: 'hidden' }}>
              <span lang="es" className="font-serif text-[30px] font-semibold">{cur}</span>
              <span className="absolute bottom-3 text-[11.5px] font-semibold tracking-wide text-accent-text uppercase"><UiText source={'Turn over'} /></span>
            </span>
            <span className="absolute inset-0 grid place-items-center rounded-[20px] border border-accent/40 bg-accent/10 px-4" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <span className="text-center text-[17px] leading-snug font-semibold text-accent-text">{GLOSS[cur]}</span>
              <span className="absolute bottom-3 text-[11.5px] font-semibold tracking-wide text-accent-text/80 uppercase"><UiText source={'I knew it'} /></span>
            </span>
          </motion.button>
        </AnimatePresence>
      </div>

      {/* The schedule: a pen line with five days on it; each word sits at the day it comes back. */}
      <div className="relative mt-9 grid w-full max-w-xl grid-cols-5">
        <svg viewBox="0 0 500 12" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-[10%] top-[78px] h-3 w-[80%] text-line-strong" aria-hidden>
          <path d="M0 6C60 2 110 10 170 6C230 2 280 10 340 6C400 2 450 9 500 5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {STOPS.map((label, i) => (
          <div key={label} className="relative flex flex-col items-center">
            <div className="flex h-[72px] flex-col-reverse items-center gap-1">
              {deck.filter((k) => (stage[k] ?? 0) === i).map((k) => (
                <motion.span key={k} layoutId={`chip-${k}`} transition={{ type: 'spring', stiffness: 320, damping: 30 }} lang="es" className={cx('rounded-full border px-2.5 py-0.5 font-serif text-[13px]', k === cur ? 'border-accent bg-accent/10 text-accent-text' : 'border-line bg-raised')}>
                  {k}
                </motion.span>
              ))}
            </div>
            <span className={cx('relative z-[1] mt-1.5 size-3 rounded-full border-2 bg-bg', deck.some((k) => (stage[k] ?? 0) === i) ? 'border-accent' : 'border-line-strong')} />
            <span className="mt-2 text-[12px] text-ink-faint"><UiText source={label} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Sonus and Visio: a little clip whose subtitles follow along, word by word; every word still gives its meaning. */
function ListenDemo() {
  const lines = CLIP.map((l) => ({ ...l, words: tokens(l.es) }));
  const total = lines.reduce((n, l) => n + l.words.length, 0);
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(-1);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setAt((n) => (n + 1 >= total ? (setPlaying(false), n) : n + 1)), 460);
    return () => clearInterval(id);
  }, [playing, total]);
  let start = 0;
  const lineIndex = Math.max(0, lines.findIndex((l) => ((start += l.words.length), at < start)));
  const before = lines.slice(0, lineIndex).reduce((n, l) => n + l.words.length, 0);
  const line = lines[lineIndex];
  const play = () => {
    if (at + 1 >= total) setAt(-1);
    setPlaying((p) => !p);
  };
  return (
    <div className="flex items-center justify-center gap-10">
      {/* The screen: a night street, drawn in pen, with a play button. */}
      <button type="button" onClick={play} aria-label={playing ? 'Pause' : 'Play'} className="group relative aspect-[16/10] w-[300px] shrink-0 cursor-pointer overflow-hidden rounded-[20px] border border-line bg-sunken">
        <svg viewBox="0 0 160 100" className="absolute inset-0 size-full text-ink-soft" aria-hidden>
          <path d="M120 22a9 9 0 1 0 8 13a7 7 0 1 1 -8 -13Z" fill="#f6bd8a" stroke="currentColor" strokeWidth={1} />
          <path {...LINE} d="M0 78H18V58L28 50L38 58V78H50V46H70V78H84V62L96 54L108 62V78H122V52H140V78H160" />
          <path {...LINE} strokeWidth={1} opacity={0.5} d="M56 54H64M56 62H64M128 60H134M28 64v6" />
          <path {...LINE} strokeWidth={1} opacity={0.4} d="M0 90C40 86 120 94 160 88" />
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-12 place-items-center rounded-full bg-raised/90 text-accent-text shadow-elev-1 transition-transform duration-200 group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" aria-hidden>
              {playing ? <path d="M8 6.5V17.5M16 6.5V17.5" fill="none" strokeWidth={2.4} strokeLinecap="round" /> : <path d="M8.5 6.2C8.5 5.6 9.1 5.2 9.7 5.6L18 11.3C18.5 11.6 18.5 12.4 18 12.7L9.7 18.4C9.1 18.8 8.5 18.4 8.5 17.8Z" />}
            </svg>
          </span>
        </span>
        <span className="absolute inset-x-0 bottom-0 h-1 bg-line">
          <motion.span className="block h-full bg-accent" animate={{ width: `${((at + 1) / total) * 100}%` }} transition={{ duration: 0.4, ease: 'linear' }} />
        </span>
      </button>
      {/* The subtitles, filling in as they are spoken, with the English underneath. */}
      <div className="w-[340px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={lineIndex} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            <p lang="es" className="font-serif text-[24px] leading-snug">
              {line.words.map((t, i) => (
                <span key={i} className={cx('transition-colors duration-200', before + i > at && 'text-ink-faint')}>
                  {t.pre}
                  <Word word={t.word} gloss={GLOSS[t.key]} />
                  {t.post}{' '}
                </span>
              ))}
            </p>
            <p className="mt-2 text-[14px] text-ink-soft">{line.en}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const PAIRS: Array<[string, string]> = [['hola', 'hello'], ['casa', 'house'], ['pan', 'bread'], ['café', 'coffee']];
/** The English column in a fixed, mixed-up order. */
const MIXED = [2, 3, 0, 1];
const GROWN = ['A0', 'A1', 'A2', 'B1'] as const;

/** Ludus: a tiny matching game. Pick a Spanish word, then its English; each right pair grows a seed in the row above. */
function PlayDemo() {
  const [round, setRound] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const order = round % 2 ? [...MIXED].reverse() : MIXED;
  const finished = done.length === PAIRS.length;
  const answer = (i: number) => {
    if (pick === null || done.includes(i)) return;
    if (i === pick) {
      setDone((d) => [...d, i]);
      setPick(null);
    } else {
      setWrong(i);
      window.setTimeout(() => setWrong(null), 420);
    }
  };
  const again = () => {
    setRound((r) => r + 1);
    setDone([]);
    setPick(null);
  };
  return (
    <div className="flex flex-col items-center">
      {/* A seed for each pair, growing as you match them. */}
      <div className="flex items-end gap-3" aria-hidden>
        {GROWN.map((l, i) => (
          <motion.span key={l} animate={{ opacity: done.length > i ? 1 : 0.25, scale: done.length > i ? 1 : 0.85, y: done.length > i ? 0 : 4 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}>
            <LevelIcon level={l} className="size-9" />
          </motion.span>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-[auto_auto_auto] items-center gap-x-8 gap-y-3">
        <div className="flex flex-col gap-3">
          {PAIRS.map(([es], i) => {
            const on = pick === i;
            const ok = done.includes(i);
            return (
              <button key={es} type="button" lang="es" disabled={ok} onClick={() => setPick(on ? null : i)} className={cx('relative flex h-12 w-40 items-center justify-center rounded-2xl border font-serif text-[21px] transition-[transform,background-color,border-color] duration-200', ok ? 'border-sage/60 bg-sage/20 text-ink-soft' : on ? '-translate-y-0.5 border-accent bg-accent/10 text-accent-text shadow-elev-1' : 'border-line bg-raised hover:-translate-y-0.5 hover:border-line-strong')}>
                {es}
                {ok && <Tick />}
              </button>
            );
          })}
        </div>
        <svg viewBox="0 0 40 120" className="h-28 w-8 text-line-strong" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeDasharray="1 6" aria-hidden>
          <path d="M20 4C14 28 26 44 20 62C14 80 26 96 20 116" />
        </svg>
        <div className="flex flex-col gap-3">
          {order.map((i) => {
            const ok = done.includes(i);
            return (
              <motion.button key={PAIRS[i][1]} type="button" disabled={ok || pick === null} onClick={() => answer(i)} animate={wrong === i ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.4 }} className={cx('relative flex h-12 w-40 items-center justify-center rounded-2xl border text-[16px] transition-[transform,background-color,border-color] duration-200', ok ? 'border-sage/60 bg-sage/20 text-ink-soft' : wrong === i ? 'border-accent-text/60 bg-accent/10' : 'border-line bg-raised enabled:hover:-translate-y-0.5 enabled:hover:border-accent/60')}>
                {PAIRS[i][1]}
                {ok && <Tick />}
              </motion.button>
            );
          })}
        </div>
      </div>
      <div className="mt-6 flex h-9 items-center">
        <AnimatePresence mode="wait" initial={false}>
          {finished && (
            <motion.div key="well" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-4">
              <span className="font-serif text-[20px] text-accent-text italic"><UiText source={'Well done.'} /></span>
              <button type="button" onClick={again} className="rounded-full border border-line px-3.5 py-1 text-[13px] font-semibold text-ink-soft transition-colors hover:border-line-strong hover:text-ink"><UiText source={'Play again'} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** A pen-drawn tick that draws itself in the corner of a matched tile. */
function Tick() {
  return (
    <svg viewBox="0 0 20 20" className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-sage" fill="none" aria-hidden>
      <motion.path d="M3.5 10.5L8 15L16.5 5" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
    </svg>
  );
}

/** The three rooms in the demo, each with a small pen-drawn icon (24 x 24). */
const ROOMS = [
  {
    id: 'read',
    name: 'Codex',
    role: 'Read anything',
    icon: (
      <>
        <path d="M12 6.5C9.5 5 6 4.8 3 5.6V18.6C6 17.8 9.5 18 12 19.5C14.5 18 18 17.8 21 18.6V5.6C18 4.8 14.5 5 12 6.5Z" fill="var(--raised)" />
        <path d="M12 6.5V19.5" />
        <path d="M14.5 9.5H18.5M14.5 12.5H17" stroke="var(--accent)" />
      </>
    ),
  },
  {
    id: 'words',
    name: 'Thesaurus',
    role: 'Keep every word',
    icon: (
      <>
        <rect x={7} y={4} width={12} height={15} rx={2.2} transform="rotate(10 13 11.5)" opacity={0.5} />
        <rect x={5} y={5} width={12} height={15} rx={2.2} transform="rotate(-5 11 12.5)" fill="var(--raised)" />
        <path d="M8.5 12.5l2 2 3.5-4" stroke="var(--accent)" transform="rotate(-5 11 12.5)" />
      </>
    ),
  },
  {
    id: 'listen',
    name: 'Sonus & Visio',
    role: 'Listen and watch',
    icon: (
      <>
        <path d="M4 17V12.5C4 8 7.6 4.5 12 4.5S20 8 20 12.5V17" />
        <rect x={3} y={14.5} width={4} height={6} rx={1.6} fill="#f6bd8a" />
        <rect x={17} y={14.5} width={4} height={6} rx={1.6} fill="#f6bd8a" />
        <path d="M10.5 10.5v4.2l3.6-2.1z" fill="var(--accent)" stroke="var(--accent)" />
      </>
    ),
  },
  {
    id: 'play',
    name: 'Ludus',
    role: 'Play and practise',
    icon: (
      <>
        <rect x={2.5} y={8} width={19} height={11} rx={5.5} fill="#a9c7dd" />
        <path d="M8 11v5M5.5 13.5h5" />
        <circle cx={15.5} cy={12} r={1.2} fill="var(--accent)" stroke="var(--accent)" />
        <circle cx={18.5} cy={15} r={1.2} fill="#ee8b48" stroke="var(--accent)" />
      </>
    ),
  },
] as const;
export const ROOM_COUNT = ROOMS.length;
/** What the Next button promises after the room you are in: the next room's name, then the next page. */
export const roomNextLabel = (room: number) => ROOMS[room + 1]?.role ?? null;

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
    </div>
  );
}

/** Welcome, by name (5.1-2b): the greeting and the open book. */
export function WelcomePage({ name }: { name: string }) {
  // The book starts drawing only once the greeting has settled.
  const [bookIn, setBookIn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBookIn(true), 350);
    return () => clearTimeout(t);
  }, []);
  const translateUi = useUi();
  const who = name.trim() || translateUi('friend');
  const full = translateUi('Welcome, {0}.', [who]);
  return (
    <div className="flex flex-col items-center py-6 text-center">
      {/* The whole greeting, name included, arrives in one smooth fade. */}
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl font-serif text-[44px] leading-[1.12] font-semibold tracking-tight text-balance">{full}</motion.h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease: 'easeOut' }} className="mt-10 h-[200px]">
        {bookIn && <OpenBook />}
      </motion.div>
    </div>
  );
}

/** See what Lingua can do (5.1-2b): a small demo of three rooms, Codex, Thesaurus and Sonus & Visio, to try right here. */
export function AboutPage({ room: roomIndex, onRoom }: { room: number; onRoom: (room: number) => void }) {
  const translateUi = useUi();
  // "See what Lingua can do": the name becomes the wordmark, in the sentence at the same size.
  const title = translateUi('See what Lingua can do');
  const at = title.indexOf('Lingua');
  const hasName = at >= 0;
  const pre = hasName ? title.slice(0, at) : title;
  const post = hasName ? title.slice(at + 'Lingua'.length) : '';
  const room = ROOMS[roomIndex]?.id ?? 'read';
  // Only the rooms you have reached are on show: Codex alone at first, each Next bringing in the one after.
  const [reached, setReached] = useState(roomIndex);
  if (roomIndex > reached) setReached(roomIndex);
  const [kept, setKept] = useState<string[]>([]);
  const keep = (key: string) => setKept((k) => (k.includes(key) ? k.filter((x) => x !== key) : [...k, key]));
  return (
    <div className="py-6">
      <h1 className="text-center font-serif text-[36px] leading-tight font-semibold tracking-tight">
        {pre}
        {hasName ? (
          <span className="relative inline-block">
            {PRODUCT.name.toLowerCase()}<span className="text-accent">.</span>
            {/* A smooth orange line that fades and draws itself in under the name. */}
            <svg viewBox="0 0 120 10" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 -bottom-1.5 h-2.5 w-full text-accent" aria-hidden>
              <motion.path d="M3 6C25 2 50 9 70 5C90 2 105 7 117 4" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.6, delay: 0.3 } }} />
            </svg>
          </span>
        ) : null}
        {post}
      </h1>
      {/* The three rooms, as tabs with a hand-drawn line under the one you are in. */}
      <div role="tablist" aria-label={translateUi('What Lingua can do')} className="mt-10 flex justify-center gap-3">
        {ROOMS.slice(0, reached + 1).map((r) => {
          const on = room === r.id;
          return (
            <motion.button key={r.id} layout initial={{ opacity: 0, x: -14, scale: 0.92 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 28 }} type="button" role="tab" aria-selected={on} onClick={() => onRoom(ROOMS.findIndex((x) => x.id === r.id))} className={cx('relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-left transition-colors', on ? 'text-ink' : 'text-ink-faint hover:text-ink-soft')}>
              <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {r.icon}
              </svg>
              <span>
                <span className="block font-serif text-[17px] leading-tight font-semibold">{r.name}</span>
                <span className="block text-[12.5px]"><UiText source={r.role} /></span>
              </span>
              {on && (
                <motion.svg layoutId="room-line" viewBox="0 0 120 8" preserveAspectRatio="none" className="absolute inset-x-4 -bottom-1 h-2 text-accent" aria-hidden transition={{ type: 'spring', stiffness: 380, damping: 34 }}>
                  <path d="M2 5C30 2 60 7 90 4C100 3 110 5 118 4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </motion.svg>
              )}
            </motion.button>
          );
        })}
      </div>
      {/* The demo itself. */}
      <div className="mt-6 grid min-h-[300px] place-items-center rounded-[28px] border border-line bg-raised/60 px-10 py-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={room} className="w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            {room === 'read' && <ReadDemo kept={kept} onKeep={keep} />}
            {room === 'words' && <WordsDemo kept={kept} />}
            {room === 'listen' && <ListenDemo />}
            {room === 'play' && <PlayDemo />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
