// Thesaurus › My decks, Lemora's design (U9): Today first, the way Anki shows it (what waits, by kind, and the week
// ahead), the ways to study as drawn icons that name themselves; the decks in a compact list down the right. Quiet:
// no fills, fine lines, the handbook's hand. The earlier design stays as a choice in Settings › Appearance.
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { DeckCounts } from '@/data/decks';
import type { Deck, Folder } from '@/data/types';
import { useToday } from '@/data/stats';
import { useVocabularyCounts } from '@/data/words';
import { Hand } from '@/design/drawings';
import type { HandName } from '@/design/drawings';
import { UiText, useUi } from '@/design/i18n/UiText';
import { useGate } from '@/features/plans/PlanRoute';
import { cx } from '@/lib/cx';
import { CARD_STATES } from './states';
import type { Order } from './DeckTree';

const DAY = 86_400_000;

const WAYS: Array<{ to: string; hand: HandName; title: string; ludus?: true }> = [
  { to: '/thesaurus/study/all?mode=recall', hand: 'repeat', title: 'Review' },
  { to: '/thesaurus/study/all?mode=ludus', hand: 'play', title: 'Ludus', ludus: true },
  { to: '/thesaurus/study/all?mode=ludus&lightning=1', hand: 'clock', title: 'Lightning round', ludus: true },
  { to: '/thesaurus/study/all?mode=ludus&kind=sentences', hand: 'quill', title: 'Sentences with a gap', ludus: true },
];

/** A way to study: a drawn circle whose name pops up on hover or focus. */
function Way({ to, hand, title, locked }: { to: string; hand: HandName; title: string; locked: boolean }) {
  const translateUi = useUi();
  return (
    <Link to={to} aria-label={translateUi(title)} className="group relative grid size-12 place-items-center rounded-full border border-line transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong focus-visible:outline-2 focus-visible:outline-accent">
      <Hand name={hand} size={26} />
      {locked && <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-on-accent">+</span>}
      <span role="tooltip" className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 translate-y-1 rounded-lg bg-inverse px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap text-on-inverse opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        <UiText source={title} />
      </span>
    </Link>
  );
}

/** A small stack of cards, drawn: the deck's own picture (not a book). */
function DeckDrawing({ done }: { done: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="size-28 shrink-0 text-ink-soft" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M34 22Q60 19 86 22Q90 22.5 90 27V86Q90 90 86 90" opacity={0.45} transform="rotate(8 62 56)" />
      <path d="M28 28Q54 25 80 28Q84 28.5 84 33V92Q84 96 80 96" opacity={0.7} transform="rotate(3 56 62)" />
      <path d="M22 36Q24 33 27 33H73Q77 33 77 37V99Q77 103 73 103H27Q23 103 22 99Z" fill="var(--raised)" />
      {done ? <path d="M36 68L46 78L64 56" stroke="var(--sage)" strokeWidth={3} /> : <path d="M34 58H64M34 70H58M34 82H50" stroke="var(--accent)" />}
    </svg>
  );
}

export function DecksDesk({ lang, decks, folders, counts, totals, forecast, lastStudied, order, below, tools, empty }: {
  lang: string;
  decks: Deck[];
  folders: Folder[];
  counts: Map<string, DeckCounts> | undefined;
  totals: DeckCounts | undefined;
  forecast: number[] | undefined;
  lastStudied: Map<string, number> | undefined;
  order: Order;
  /** Under Today: the starter path, the empty state. */
  below?: ReactNode;
  /** At the top of the deck list: search, sort. */
  tools?: ReactNode;
  /** Shown where the list goes when there are no decks yet. */
  empty?: ReactNode;
}) {
  const translateUi = useUi();
  const activity = useToday(lang);
  const vocab = useVocabularyCounts(lang);
  const ludusGate = useGate('ludus');
  const [now] = useState(() => Date.now());
  const c = totals ?? { total: 0, new: 0, learning: 0, due: 0 };
  const waiting = c.new + c.learning + c.due;
  const week = [waiting, ...(forecast ?? []).slice(0, 6)];
  const peak = Math.max(1, ...week);
  const ago = (t?: number) => (t === undefined ? translateUi('Not yet') : now - t < DAY ? translateUi('Today') : translateUi('{0} d ago', [Math.floor((now - t) / DAY)]));
  const day = (i: number) => (i === 0 ? translateUi('Today') : new Date(now + i * DAY).toLocaleDateString(undefined, { weekday: 'narrow' }));

  const sorted = [...decks].sort(order.decks);
  const byFolder = new Map<string | null, Deck[]>();
  for (const d of sorted) byFolder.set(d.folderId ?? null, [...(byFolder.get(d.folderId ?? null) ?? []), d]);
  const groups = [...[...folders].sort(order.folders).flatMap((f) => (byFolder.get(f.id)?.length ? [{ id: f.id, name: f.name, decks: byFolder.get(f.id)! }] : [])), ...(byFolder.get(null)?.length ? [{ id: null, name: '', decks: byFolder.get(null)! }] : [])];

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-10">
        <section aria-label={translateUi('Today')}>
          <div className="flex items-start gap-7">
            <DeckDrawing done={waiting === 0} />
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-bold tracking-[0.14em] text-ink-faint uppercase"><UiText source={'Today'} /></p>
              <h2 className="mt-1 font-serif text-[30px] leading-tight font-semibold tracking-tight">{waiting === 0 ? <UiText source={'All caught up'} /> : <UiText source={'{0} cards waiting'} values={[waiting]} />}</h2>
              {/* As Anki shows it: new, learning, to review, each in its colour. */}
              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
                {CARD_STATES.map((s) => (
                  <div key={s.key}>
                    <dd className="font-serif text-[28px] leading-none font-semibold tabular-nums" style={{ color: s.color }}>{c[s.key]}</dd>
                    <dt className="mt-1 text-[12px] font-semibold text-ink-faint"><UiText source={s.label} /></dt>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link to="/thesaurus/study/all" className={cx('inline-flex h-12 items-center rounded-full px-6 font-semibold transition-transform hover:-translate-y-0.5', waiting ? 'bg-accent-fill text-on-accent' : 'border border-line text-ink-soft')}>
                  <UiText source={'Study now'} />
                </Link>
                {WAYS.map((w) => <Way key={w.to} to={w.to} hand={w.hand} title={w.title} locked={Boolean(w.ludus && ludusGate)} />)}
              </div>
            </div>
          </div>

          {/* The week ahead, minimal: a stroke for each day, as high as what falls due. */}
          <div className="mt-9 grid grid-cols-[auto_minmax(0,1fr)] items-end gap-x-10 gap-y-4">
            <dl className="grid grid-cols-3 gap-x-7">
              <div><dd className="font-serif text-[22px] font-semibold tabular-nums">{activity?.reviews ?? 0}</dd><dt className="text-[12px] text-ink-faint"><UiText source={'reviewed today'} /></dt></div>
              <div><dd className="font-serif text-[22px] font-semibold tabular-nums">{(vocab?.known ?? 0).toLocaleString()}</dd><dt className="text-[12px] text-ink-faint"><UiText source={'known words'} /></dt></div>
              <div><dd className="font-serif text-[22px] font-semibold tabular-nums">{c.total.toLocaleString()}</dd><dt className="text-[12px] text-ink-faint"><UiText source={'cards'} /></dt></div>
            </dl>
            <ol aria-label={translateUi('The week ahead')} className="flex items-end justify-end gap-3">
              {week.map((n, i) => (
                <li key={i} className="flex w-7 flex-col items-center gap-1.5" title={translateUi('{0} due', [n])}>
                  <span className="text-[11px] text-ink-faint tabular-nums">{n || ''}</span>
                  <span className={cx('w-1.5 rounded-full', i === 0 ? 'bg-accent' : 'bg-line-strong')} style={{ height: `${6 + (n / peak) * 44}px` }} aria-hidden />
                  <span className={cx('text-[11px] font-semibold', i === 0 ? 'text-ink' : 'text-ink-faint')}>{day(i)}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
        {below}
      </div>

      <aside aria-label={translateUi('My decks')} className="lg:sticky lg:top-6">
        <div className="mb-3 flex items-center gap-1">
          <h2 className="mr-auto font-serif text-[20px] font-semibold"><UiText source={'My decks'} /> <span className="text-[13px] font-bold text-ink-faint tabular-nums">{decks.length}</span></h2>
          {decks.length > 0 && tools}
        </div>
        {decks.length === 0 && empty}
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.id ?? 'loose'}>
              {g.name && <p className="mb-1.5 text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">{g.name}</p>}
              <ul className="divide-y divide-line/70 border-y border-line/70">
                {g.decks.map((d) => {
                  const n = counts?.get(d.id);
                  return (
                    <li key={d.id}>
                      <Link to={`/thesaurus/deck/${d.id}`} className="group flex items-center gap-3 py-2.5 transition-colors hover:text-accent-text">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line transition-transform group-hover:-rotate-6"><Hand name="cards" size={20} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-serif text-[15.5px] font-semibold">{d.name}</span>
                          <span className="block text-[11.5px] text-ink-faint">{ago(lastStudied?.get(d.id))}</span>
                        </span>
                        <span className="flex gap-2 text-[12.5px] font-semibold tabular-nums">
                          {CARD_STATES.map((s) => (
                            <span key={s.key} style={{ color: n?.[s.key] ? s.color : 'var(--ink-faint)' }} title={translateUi(s.label)}>{n?.[s.key] ?? 0}</span>
                          ))}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {decks.length > 0 && <Link to="/explora?kind=words" className="flex items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-line-strong/80 px-3 py-2.5 text-[13.5px] font-semibold text-ink-faint transition-colors hover:border-accent hover:text-accent-text">
            <span className="grid size-9 place-items-center rounded-full bg-accent-soft"><Hand name="add" size={20} /></span>
            <UiText source={'Ready-made decks'} />
          </Link>}
        </div>
      </aside>
    </div>
  );
}
