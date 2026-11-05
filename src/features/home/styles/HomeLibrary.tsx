// Home style 4, "Reading room": a cosy room. The book you are reading is pulled halfway off the shelf with its ribbon out,
// the rest of your library stands as spines on a wooden plank, and below it sit the things on the desk: a stopwatch for
// the day's goal, a stack of cards for the words, and sticky notes for what next.
import { Link } from 'react-router';
import { BookmarkIcon } from 'lucide-react';
import { UiText } from '@/design/i18n/UiText';
import { hashString } from '@/core/hash';
import { cx } from '@/lib/cx';
import { ToolDuotoneIcon } from '../homeComponents';
import { useHomeFacts } from './useHomeFacts';
import { LeftOffCover, NextTitle } from './parts';

const COLOURS = ['#8c3b2e', '#2f5d50', '#2b4468', '#a5742a', '#5b3f72', '#7a2f45', '#3d5a3a', '#4a4a55'];
const NOTES = ['#f6e27f', '#f4b6a0', '#b9dcb0', '#bcd3ee', '#e2c3ec'];
const num = (s: string, mod: number) => parseInt(hashString(s), 36) % mod;
const PLANK = 'h-3.5 rounded-sm bg-[linear-gradient(#a07a52,#7a5a3a)] shadow-[0_6px_10px_-4px_rgba(0,0,0,0.35)]';

export function HomeLibrary() {
  const f = useHomeFacts();
  const { header, leftOff, recent, whatNext, discover, words, due, goal, minutesToday, tools, progress, language } = f;
  const ratio = Math.min(1, minutesToday / Math.max(1, goal));
  const others = recent.filter((t) => t.id !== leftOff.id);
  // Fewer than a full shelf: the rest of the row are ghost spines that lead to Explora.
  const ghosts = Math.max(0, 9 - others.length);

  return (
    <div className="mx-auto max-w-[1100px] pb-10">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-serif text-[34px] leading-tight font-semibold tracking-tight text-ink sm:text-[44px]">{header.greeting}</h1>
        <p className="text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase">{header.eyebrow}</p>
      </header>

      <section className="rounded-[32px] border border-[#a07a52]/30 bg-[color-mix(in_oklab,#a07a52_9%,var(--bg))] px-5 pt-8 pb-5 sm:px-9">
        <div className="flex items-end gap-6 sm:gap-9">
          {/* The book pulled out */}
          <Link to={leftOff.to} className="group relative block w-[150px] shrink-0 pb-1 sm:w-[190px]">
            <span className="relative block aspect-[2/3] -rotate-2 overflow-hidden rounded-r-md rounded-l-[3px] shadow-[8px_10px_18px_-6px_rgba(0,0,0,0.5)] ring-1 ring-black/15 transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-0">
              <LeftOffCover facts={f} />
              <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent" />
            </span>
            <BookmarkIcon aria-hidden size={46} className="absolute -top-3 right-5 fill-accent text-accent drop-shadow" />
            <span className="mt-3 block text-center font-serif text-[15px] font-bold text-ink"><UiText source={leftOff.isStarter ? 'Open your first book' : 'Continue reading'} /></span>
            <span className="mx-auto mt-1.5 block h-1.5 w-24 overflow-hidden rounded-full bg-black/10"><span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(4, leftOff.percent)}%` }} /></span>
          </Link>

          {/* The shelf */}
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-[11px] font-bold tracking-[0.16em] text-ink-faint uppercase"><UiText source={'Your shelf'} /></p>
            <div className="flex h-[190px] items-end gap-[3px] overflow-x-auto overflow-y-hidden px-1 pb-0 scrollbar-none">
              {others.map((t) => {
                const h = 120 + num(t.id, 60);
                const w = 26 + num(t.id + 'w', 18);
                const pct = Math.round((progress?.get(t.id)?.percent ?? 0) * 100);
                return (
                  <Link key={t.id} to={t.kind === 'article' ? `/codex/read/${t.id}` : `/codex/book/${t.id}`} title={t.title} lang={language.id} className="group relative shrink-0 overflow-hidden rounded-t-[3px] text-[11.5px] font-bold text-white/95 shadow-[inset_-3px_0_4px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:-translate-y-3" style={{ height: h, width: w, background: COLOURS[num(t.id, COLOURS.length)] }}>
                    <span className="absolute inset-x-0 top-2 h-0.5 bg-[#e8c97a]/70" aria-hidden />
                    <span className="absolute inset-x-0 top-3.5 h-px bg-[#e8c97a]/40" aria-hidden />
                    <span className="absolute inset-0 flex items-center justify-center px-1 py-6 [writing-mode:vertical-rl]"><span className="line-clamp-1">{t.title}</span></span>
                    {pct > 0 && <span className="absolute inset-x-0 bottom-0 bg-white/35" style={{ height: `${pct * 0.12}px` }} aria-hidden />}
                  </Link>
                );
              })}
              {Array.from({ length: ghosts }, (_, i) => (
                <Link key={`g${i}`} to={discover[i % Math.max(1, discover.length)]?.to ?? '/explora'} title={discover[i % Math.max(1, discover.length)]?.title} className="shrink-0 rounded-t-[3px] border-2 border-dashed border-[#a07a52]/50 transition-colors hover:border-accent hover:bg-accent-soft" style={{ height: 110 + ((i * 37) % 55), width: 26 + ((i * 11) % 14) }} />
              ))}
            </div>
            <div className={PLANK} aria-hidden />
          </div>
        </div>
      </section>

      {/* The desk */}
      <section className="mt-8 grid gap-8 md:grid-cols-[220px_minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Stopwatch */}
        <Link to={leftOff.to} className="group flex flex-col items-center text-center">
          <span className="relative grid size-40 place-items-center rounded-full border-[6px] border-[#a07a52] bg-raised shadow-[0_10px_16px_-8px_rgba(0,0,0,0.45)] transition-transform group-hover:-rotate-2">
            <span aria-hidden className="absolute -top-5 h-4 w-6 rounded-t bg-[#a07a52]" />
            <svg viewBox="0 0 100 100" className="absolute inset-2 -rotate-90" aria-hidden><circle cx={50} cy={50} r={44} fill="none" strokeWidth={6} className="stroke-line" /><circle cx={50} cy={50} r={44} fill="none" strokeWidth={6} strokeLinecap="round" strokeDasharray={2 * Math.PI * 44} strokeDashoffset={2 * Math.PI * 44 * (1 - ratio)} className="stroke-accent" /></svg>
            <span><span className="block font-serif text-[36px] leading-none font-bold text-ink tabular-nums">{minutesToday}</span><span className="text-[11.5px] font-bold text-ink-faint">/ <UiText source={'{0} min'} values={[goal]} /></span></span>
          </span>
          <span className="mt-3 font-serif text-[16px] font-bold text-ink"><UiText source={'Time today'} /></span>
        </Link>

        {/* Index cards */}
        <Link to="/thesaurus/study/all?mode=recall" className="group flex flex-col items-center">
          <span className="relative block h-40 w-52">
            {[2, 1, 0].map((k) => (
              <span key={k} className={cx('absolute inset-x-0 flex h-32 flex-col justify-center rounded-md border border-line-strong/60 bg-raised px-4 shadow-elev-1 transition-transform duration-300', k === 0 && 'group-hover:-translate-y-2')} style={{ top: 20 - k * 8, transform: `rotate(${(k - 1) * 3}deg)`, zIndex: 3 - k }}>
                {k === 0 && (words[0] ? <><span className="font-serif text-[24px] font-bold text-ink">{words[0].term}</span><span className="truncate text-[12.5px] text-ink-soft">{words[0].meaning}</span></> : <span className="font-serif text-[16px] text-ink-soft italic"><UiText source={'No cards due'} /></span>)}
              </span>
            ))}
          </span>
          <span className="font-serif text-[16px] font-bold text-ink"><UiText source={'{0} cards to review'} values={[due?.due ?? 0]} /></span>
        </Link>

        {/* Sticky notes */}
        <div className="grid grid-cols-2 gap-3">
          {whatNext.slice(0, 4).map((item, i) => (
            <Link key={item.id} to={item.to} className="group block min-h-[104px] p-3 shadow-[2px_5px_10px_-4px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-1 hover:rotate-0" style={{ background: NOTES[i % NOTES.length], transform: `rotate(${[-2, 1.5, 1, -1.5][i]}deg)` }}>
              <span className="text-[10px] font-black tracking-[0.14em] text-black/45 uppercase"><UiText source={item.room} /></span>
              <span className="mt-0.5 block font-serif text-[15.5px] leading-snug font-bold text-black/80"><NextTitle item={item} /></span>
            </Link>
          ))}
        </div>
      </section>

      <nav aria-label="Tools" className="mt-9 flex flex-wrap items-center justify-center gap-3 border-t border-[#a07a52]/30 pt-5">
        {tools.map((t) => (
          <Link key={t.id} to={t.to} title={t.role} className="group inline-flex items-center gap-2 rounded-md border border-[#a07a52]/50 bg-[linear-gradient(#f4e6c8,#e2cd9c)] px-3 py-1.5 text-[12.5px] font-bold text-[#4a3722] shadow-sm transition-transform hover:-translate-y-0.5">
            <ToolDuotoneIcon id={t.id} className="size-4" /> {t.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
