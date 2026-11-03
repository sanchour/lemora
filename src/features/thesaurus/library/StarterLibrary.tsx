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
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shelf.entries.map((e) => (
              <Tile key={starterKey(e.spec)} entry={e} lang={lang} index={shown++} added={Boolean(added?.get(starterKey(e.spec)))} onOpen={onOpen} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** One ready-made deck: a bookish lexicon card with its emblem, name, blurb, word count and mastery bar. */
function Tile({ entry, lang, index, added, onOpen }: { entry: Entry; lang: string; index: number; added: boolean; onOpen: (spec: StarterSpec) => void }) {
  const translateUi = useUi();
  const { Icon } = entry;
  const share = entry.size ? entry.known / entry.size : 0;
  const pct = Math.round(share * 100);
  const size = `${entry.size.toLocaleString('en')} ${entry.size === 1 ? 'word' : 'words'}`;
  const meta = entry.empty ? 'Look words up while listening' : entry.spec.kind === 'frequency' ? `Top ${entry.spec.milestone.toLocaleString('en')} · ${pct}% known` : pct ? `${size} · ${pct}% known` : size;
  const lvl = levelOf(entry.rank);
  return (
    <motion.div
      className="group relative min-w-0"
      style={{ '--hue': entry.hue } as CSSProperties}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring.soft, delay: Math.min(index, 14) * 0.02 }}
    >
      <button
        type="button"
        disabled={entry.empty}
        title={entry.empty ? translateUi('Words you look up in songs, videos and podcasts gather here.') : entry.blurb}
        onClick={() => onOpen(entry.spec)}
        className="no-callout flex h-full w-full flex-col justify-between rounded-2xl border border-line/70 bg-surface p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-elev-2 active:translate-y-0 active:scale-[0.99] disabled:cursor-default disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        <div>
          <div className="flex items-start justify-between gap-2 pr-8">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line/50 bg-[color-mix(in_oklab,var(--hue)_14%,var(--raised))] text-[color-mix(in_oklab,var(--hue)_72%,var(--ink))] transition-transform duration-200 group-hover:scale-105">
              {Icon ? (
                <Icon aria-hidden size={19} strokeWidth={1.75} />
              ) : (
                <span aria-hidden className="font-serif text-[14.5px] leading-none font-bold tracking-tight tabular-nums">
                  {entry.label}
                </span>
              )}
            </span>
            <div className="flex items-center gap-1.5">
              {added && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sage-soft px-2 py-0.5 text-[10.5px] font-bold text-sage-text">
                  <UiText source={'{0} Added'} values={[<Check size={10} strokeWidth={3} aria-hidden />]} />
                </span>
              )}
              <span className="rounded-md bg-raised px-1.5 py-0.5 text-[10.5px] font-bold text-ink-soft tabular-nums">
                {lvl}
              </span>
            </div>
          </div>

          <span className="mt-3 block line-clamp-1 font-serif text-[16.5px] leading-snug font-semibold text-ink transition-colors group-hover:text-accent-text">
            {entry.name}
          </span>
          <span className="mt-1 line-clamp-2 block text-[12.5px] leading-relaxed text-ink-soft">
            {entry.blurb}
          </span>
        </div>

        <div className="mt-3.5 border-t border-line/50 pt-2.5">
          <div className="flex items-center justify-between gap-2 text-[11.5px] font-semibold text-ink-faint tabular-nums">
            <span className="truncate">{meta}</span>
          </div>
          <span className="mt-2 block h-1 shrink-0 overflow-hidden rounded-full bg-sunken">
            <span className="block h-full origin-left rounded-full bg-sage transition-transform duration-500" style={{ transform: `scaleX(${share})` }} />
          </span>
        </div>
      </button>
      {!entry.empty && (
        <div className="absolute top-3 right-3">
          <AddStarterMenu lang={lang} spec={entry.spec} trigger="icon" />
        </div>
      )}
    </motion.div>
  );
}
