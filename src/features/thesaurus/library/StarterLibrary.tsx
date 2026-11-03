import { UiText, useUi } from '@/design/i18n/UiText';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Check, Download, SearchX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getLanguage } from '@/core/lang/languages';
import { FREQUENCY_MILESTONES, frequencyBand, HEARD_THEME, JOURNEY_STAGES, STARTER_THEMES, THEME_GROUPS } from '@/core/lang/starter';
import type { DiscoverGroup, DiscoverSort } from '@/data/settings';
import { starterKey, useFrequencyProgress, useStarterDecks, useStarterList, useThemeStats } from '@/data/starter';
import type { StarterSpec } from '@/data/starter';
import { Button, Card, searchKey } from '@/design/primitives';
import { spring } from '@/design/motion';
import { installPack, usePackJobs } from '@/services/packs/packs';
import { THEME_HUES, THEME_ICONS } from '../common/DeckIcon';
import { AddStarterMenu } from './AddStarterMenu';

/** Levels by how common a deck's words are (the middle word's frequency rank). */
const LEVELS = [
  { id: 'A1', name: 'A1 · First steps', max: 600 },
  { id: 'A2', name: 'A2 · Elementary', max: 1800 },
  { id: 'B1', name: 'B1 · Intermediate', max: 5000 },
  { id: 'B2', name: 'B2 and beyond', max: Infinity },
];
const levelOf = (rank: number) => LEVELS.find((l) => rank <= l.max)!.id;

interface Entry {
  spec: StarterSpec;
  name: string;
  blurb: string;
  group: (typeof THEME_GROUPS)[number]['id'];
  hue: string;
  Icon: LucideIcon | null;
  /** The path's stops show their number instead of a picture. */
  label?: string;
  size: number;
  known: number;
  rank: number;
  order: number;
  /** Name, description and every word, for search. */
  haystack: string;
  /** "From songs and shows" before anything has been looked up. */
  empty?: boolean;
}

interface LibraryProps {
  lang: string;
  query: string;
  sort: DiscoverSort;
  group: DiscoverGroup;
  onOpen: (spec: StarterSpec) => void;
}

/**
 * Discover (5.1-3b): every ready-made deck as a small card (its picture, name, size and how much you
 * know), on shelves by kind or by level, sorted and searched (by name or by any word inside).
 */
export function StarterLibrary({ lang, query, sort, group, onOpen }: LibraryProps) {
  const list = useStarterList(lang);
  const added = useStarterDecks(lang);
  const stats = useThemeStats(lang);
  const progress = useFrequencyProgress(lang, FREQUENCY_MILESTONES);
  const job = usePackJobs((s) => s.jobs[lang]);
  const name = getLanguage(lang)?.name ?? lang;

  const entries = useMemo<Entry[]>(() => {
    if (!list) return [];
    const path = FREQUENCY_MILESTONES.filter((_, i) => i === 0 || FREQUENCY_MILESTONES[i - 1] < list.lemmaFreq.length).map((m, i): Entry => {
      const [from, to] = frequencyBand(m);
      const size = Math.max(0, Math.min(to, list.lemmaFreq.length) - from + 1);
      const stage = JOURNEY_STAGES[m];
      return {
        spec: { kind: 'frequency', milestone: m },
        name: stage?.name ?? `Top ${m}`,
        blurb: `Top ${m.toLocaleString('en')}: ${stage?.lets ?? 'the next most common words'}`,
        group: 'path',
        hue: 'var(--sage)',
        Icon: null,
        label: m >= 1000 ? `${m / 1000}k` : String(m),
        size,
        known: Math.round((progress?.get(m) ?? 0) * size),
        rank: Math.round((from + to) / 2),
        order: i,
        haystack: searchKey(`top ${m} ${stage?.name ?? ''} ${stage?.lets ?? ''} path frequency common`),
      };
    });
    const themes = STARTER_THEMES.filter((t) => t.id === HEARD_THEME || list.themes[t.id]?.length).map((t, i): Entry => {
      const stat = stats?.get(t.id);
      const words = (list.themes[t.id] ?? []).map(([term, meaning]) => `${term} ${meaning}`).join(' ');
      return {
        spec: { kind: 'theme', id: t.id },
        name: t.name,
        blurb: t.blurb,
        group: t.group,
        hue: THEME_HUES[t.id] ?? 'var(--sage)',
        Icon: THEME_ICONS[t.id] ?? null,
        size: stat?.size ?? list.themes[t.id]?.length ?? 0,
        known: stat?.known ?? 0,
        rank: stat?.rank ?? 20_000,
        order: 100 + i,
        haystack: searchKey(`${t.name} ${t.blurb} ${THEME_GROUPS.find((g) => g.id === t.group)?.name ?? ''} ${words}`),
        empty: t.id === HEARD_THEME && !stat?.size,
      };
    });
    return [...path, ...themes];
  }, [list, stats, progress]);

  const shelves = useMemo(() => {
    const q = searchKey(query.trim());
    const found = q ? entries.filter((e) => e.haystack.includes(q)) : entries;
    const order = (a: Entry, b: Entry) => (sort === 'size' ? b.size - a.size : sort === 'easiest' ? a.rank - b.rank : 0) || a.order - b.order;
    const shelfOf = (e: Entry) => (group === 'level' ? levelOf(e.rank) : e.group);
    const all: Array<{ id: string; name: string; blurb: string }> = group === 'level' ? LEVELS.map((l) => ({ id: l.id, name: l.name, blurb: '' })) : THEME_GROUPS;
    return all.map((s) => ({ ...s, entries: found.filter((e) => shelfOf(e) === s.id).sort(order) })).filter((s) => s.entries.length);
  }, [entries, query, sort, group]);

  if (list === undefined) return <div className="h-64" />;
  if (list === null) {
    return (
      <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-ink-soft"><UiText source={'Ready-made {0} decks come with the {1} dictionary{2}'} values={[name, name, job ? <UiText source={', which is being installed now.'} /> : '.']} /></p>
        {!job && (
          <Button variant="secondary" icon={Download} onClick={() => void installPack(lang)}><UiText source={'Install dictionary'} /></Button>
        )}
      </Card>
    );
  }

  if (!shelves.length) {
    return (
      <div className="flex flex-col items-center py-14 text-center text-ink-soft">
        <SearchX size={28} className="mb-3 text-ink-faint" aria-hidden />
        <p className="font-semibold text-ink"><UiText source={'No ready-made decks match “{0}”'} values={[query.trim()]} /></p>
        <p className="mt-1 text-sm"><UiText source={'Try another word: decks are found by name and by the words inside them.'} /></p>
      </div>
    );
  }

  let shown = 0;
  return (
    <div className="space-y-10">
      {shelves.map((shelf) => (
        <section key={shelf.id} aria-label={shelf.name}>
          <header className="mb-4 flex items-baseline gap-2.5 border-b border-line pb-2">
            <h3 className="font-serif text-xl font-semibold">{shelf.name}</h3>
            <span className="text-sm font-bold text-ink-faint tabular-nums">{shelf.entries.length}</span>
            {shelf.blurb && <p className="ml-auto hidden truncate text-[12.5px] text-ink-faint sm:block">{shelf.blurb}</p>}
          </header>
          {shelf.id === 'path' && !query.trim() ? (
            <PathShelf entries={shelf.entries} added={added} onOpen={onOpen} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {shelf.entries.map((e) => (
                <Tile key={starterKey(e.spec)} entry={e} lang={lang} index={shown++} added={Boolean(added?.get(starterKey(e.spec)))} onOpen={onOpen} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

/**
 * The frequency decks as the path they are: milestones along a drawn line, each ringed by how much of it is known.
 * One step, the next; a click opens the deck to see its words and add it.
 */
function PathShelf({ entries, added, onOpen }: { entries: Entry[]; added?: ReadonlyMap<string, unknown>; onOpen: (spec: StarterSpec) => void }) {
  const translateUi = useUi();
  return (
    <div className="relative overflow-x-auto pb-2 [scrollbar-width:thin]">
      <ol className="relative flex min-w-max items-start gap-2 px-1 pt-1">
        {/* The road between the stones, drawn by hand. */}
        <svg className="pointer-events-none absolute top-[38px] right-10 left-10 h-3 w-[calc(100%-5rem)] overflow-visible text-line-strong" preserveAspectRatio="none" viewBox="0 0 100 6" aria-hidden>
          <path d="M0 3C12 1 22 5 34 3S56 1 68 3S88 5 100 3" fill="none" stroke="currentColor" strokeWidth={1.4} strokeDasharray="2 3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {entries.map((e, i) => {
          const share = e.size ? e.known / e.size : 0;
          const isAdded = Boolean(added?.get(starterKey(e.spec)));
          return (
            <motion.li key={starterKey(e.spec)} className="relative w-[118px] shrink-0" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: i * 0.03 }}>
              <button type="button" onClick={() => onOpen(e.spec)} title={e.blurb} className="group flex w-full flex-col items-center gap-2 rounded-2xl px-1 py-1 text-center">
                <span className="relative grid size-[76px] place-items-center rounded-full bg-bg">
                  <svg viewBox="0 0 76 76" className="absolute inset-0 -rotate-90" aria-hidden>
                    <circle cx="38" cy="38" r="34" fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth="3" />
                    <circle cx="38" cy="38" r="34" fill="none" stroke="var(--sage)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={2 * Math.PI * 34} strokeDashoffset={2 * Math.PI * 34 * (1 - share)} className="transition-[stroke-dashoffset] duration-700" />
                  </svg>
                  <span className="relative font-serif text-[19px] font-semibold tabular-nums transition-colors group-hover:text-accent-text">{e.label}</span>
                  {isAdded && (
                    <span className="absolute -top-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-sage text-on-accent" aria-label={translateUi('Added')}>
                      <Check size={11} strokeWidth={3} aria-hidden />
                    </span>
                  )}
                </span>
                <span className="block w-full truncate text-[13px] font-semibold">{e.name}</span>
                <span className="-mt-1.5 block text-[11.5px] font-semibold text-ink-faint tabular-nums">{Math.round(share * 100)}%</span>
              </button>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

/** One ready-made deck: a library catalogue card, its theme's colour on the tab, its emblem, a ruled line, how much is known. */
function Tile({ entry, lang, index, added, onOpen }: { entry: Entry; lang: string; index: number; added: boolean; onOpen: (spec: StarterSpec) => void }) {
  const translateUi = useUi();
  const { Icon } = entry;
  const share = entry.size ? entry.known / entry.size : 0;
  const pct = Math.round(share * 100);
  const size = `${entry.size.toLocaleString('en')} ${entry.size === 1 ? 'word' : 'words'}`;
  const meta = entry.empty ? 'Look words up while listening' : entry.spec.kind === 'frequency' ? `Top ${entry.spec.milestone.toLocaleString('en')} · ${pct}% known` : pct ? `${size} · ${pct}% known` : size;
  const lvl = levelOf(entry.rank);
  return (
    <motion.div className="group relative min-w-0 pt-2.5" style={{ '--hue': entry.hue } as CSSProperties} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: Math.min(index, 14) * 0.02 }}>
      {/* The card's tab, in its theme's colour, as on a drawer of catalogue cards. */}
      <span className="absolute top-0 left-5 h-3.5 w-16 rounded-t-lg border border-b-0 border-line/70 bg-[color-mix(in_oklab,var(--hue)_30%,var(--color-surface))]" aria-hidden />
      <button
        type="button"
        disabled={entry.empty}
        title={entry.empty ? translateUi('Words you look up in songs, videos and podcasts gather here.') : entry.blurb}
        onClick={() => onOpen(entry.spec)}
        className="no-callout relative flex h-full w-full flex-col rounded-2xl border border-line/70 bg-surface p-4 pt-3.5 text-left transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-elev-1 disabled:opacity-60"
      >
        <span className="flex items-center gap-3 pr-9">
          <span className="grid size-9 shrink-0 place-items-center rounded-full text-[color-mix(in_oklab,var(--hue)_72%,var(--ink))]" style={{ background: 'color-mix(in oklab, var(--hue) 14%, var(--color-raised))' }}>
            {Icon ? <Icon aria-hidden size={17} strokeWidth={1.6} /> : <span aria-hidden className="font-serif text-[13px] font-bold tabular-nums">{entry.label}</span>}
          </span>
          <span className="min-w-0 flex-1 truncate font-serif text-[17px] leading-snug font-semibold transition-colors group-hover:text-accent-text">{entry.name}</span>
        </span>
        <span className="mt-2.5 border-t border-dashed border-line pt-2 text-[12.5px] leading-relaxed text-ink-soft line-clamp-2">{entry.blurb}</span>
        <span className="mt-auto flex items-center gap-2 pt-3 text-[11.5px] font-semibold text-ink-faint tabular-nums">
          <span className="min-w-0 flex-1 truncate">{meta}</span>
          {added && <span className="inline-flex items-center gap-1 rounded-full bg-sage-soft px-2 py-0.5 text-[10.5px] font-bold text-sage-text"><UiText source={'{0} Added'} values={[<Check size={10} strokeWidth={3} aria-hidden />]} /></span>}
          <span className="rounded-md bg-raised px-1.5 py-0.5 text-[10.5px] font-bold text-ink-soft">{lvl}</span>
        </span>
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-sunken">
          <span className="block h-full origin-left rounded-full bg-sage transition-transform duration-500" style={{ transform: `scaleX(${share})` }} />
        </span>
      </button>
      {!entry.empty && (
        <div className="absolute top-5 right-3">
          <AddStarterMenu lang={lang} spec={entry.spec} trigger="icon" />
        </div>
      )}
    </motion.div>
  );
}
