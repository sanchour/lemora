// Explora's free reading catalogue for the six core languages (fr, es, de, ru, zh, ar): classics, short reads and picture books, every one
// free to read and to use commercially, with the credit it asks for. The data files are written by scripts/build-catalogue.mjs from the sources
// below and checked then (the page or book exists, its author died before 1956 so it is free in the US and the EU, its text is there).
//   Project Gutenberg  classics        public domain (US); only authors who died before 1956, single-language editions
//   Wikisource         poems, fables   public domain texts; transcriptions CC BY-SA
//   StoryWeaver        picture books   CC BY 4.0 (Pratham Books and its authors, credited on the book's page)
import type { PickLevel } from '@/core/mundus/types';
import { hashString } from '@/core/hash';

export type CatalogueKind = 'classic' | 'short' | 'picture';
export type Genre = 'fable' | 'tale' | 'poem' | 'story' | 'essay';

export type CatalogueSource =
  | { type: 'gutenberg'; id: number }
  | { type: 'wikisource'; title: string }
  | { type: 'storyweaver'; slug: string };

export interface CatalogueItem {
  id: string;
  kind: CatalogueKind;
  title: string;
  author?: string;
  level: PickLevel;
  /** Minutes to read, for short reads. */
  minutes?: number;
  genre?: Genre;
  cover?: string;
  /** archive.org identifier of a LibriVox recording, where there is one (the classic can be read along). */
  audio?: string;
  from: CatalogueSource;
}

export interface Catalogue {
  items: CatalogueItem[];
}

/** The languages with a catalogue. */
export const CATALOGUE_LANGS = ['fr', 'es', 'de', 'ru', 'zh', 'ar'] as const;
export const hasCatalogue = (lang: string) => (CATALOGUE_LANGS as readonly string[]).includes(lang);

const loaders = import.meta.glob<{ default: Catalogue }>('./data/*.json');
const kept = new Map<string, Promise<Catalogue>>();

/** A language's catalogue (loaded when asked for, kept after). */
export function loadCatalogue(lang: string): Promise<Catalogue> {
  const load = loaders[`./data/${lang}.json`];
  if (!load) return Promise.resolve({ items: [] });
  let hit = kept.get(lang);
  if (!hit) kept.set(lang, (hit = load().then((m) => m.default)));
  return hit;
}

export const gutenbergUrl = (id: number) => `https://www.gutenberg.org/ebooks/${id}`;
export const gutenbergCover = (id: number) => `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`;
export const storyweaverUrl = (slug: string) => `https://storyweaver.org.in/en/stories/${slug}`;
export const wikisourceUrl = (lang: string, title: string) => `https://${lang}.wikisource.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

/** Where the item's text lives, for its credit line and for finding it on the shelf again. */
export function itemUrl(lang: string, item: CatalogueItem): string {
  return item.from.type === 'gutenberg' ? gutenbergUrl(item.from.id) : item.from.type === 'storyweaver' ? storyweaverUrl(item.from.slug) : wikisourceUrl(lang, item.from.title);
}

/** The credit each source asks for, shown with the shelf. */
export const CATALOGUE_CREDITS = {
  gutenberg: 'Classics: Project Gutenberg, public domain.',
  wikisource: 'Short reads: Wikisource, public domain texts (transcriptions CC BY-SA).',
  storyweaver: 'Picture books: StoryWeaver by Pratham Books, CC BY 4.0, each credited on its page.',
} as const;

// ── Collections ──────────────────────────────────────────────────────────────

export interface Collection {
  id: string;
  title: string;
  blurb: string;
  /** Which hand drawing sits on the banner. */
  icon: 'leaf' | 'quill' | 'book' | 'sound' | 'stack' | 'seal';
  /** The banner's colour, a pair for its gradient. */
  colours: [string, string];
  pick: (item: CatalogueItem) => boolean;
}

export const COLLECTIONS: Collection[] = [
  { id: 'fables-tales', title: 'Fables and fairy tales', blurb: 'Old stories everyone knows, short enough to finish today.', icon: 'leaf', colours: ['#3f6b5b', '#2a4a3f'], pick: (i) => i.genre === 'fable' || i.genre === 'tale' },
  { id: 'poems', title: 'Poems in a minute', blurb: 'Famous poems, a few lines each, good to read aloud.', icon: 'quill', colours: ['#a8741f', '#7a5214'], pick: (i) => i.genre === 'poem' },
  { id: 'first-picture-books', title: 'First picture books', blurb: 'Big pictures, a line or two a page: the gentlest start.', icon: 'book', colours: ['#b4452a', '#8a3320'], pick: (i) => i.kind === 'picture' && (i.level === 'A1' || i.level === 'A2') },
  { id: 'read-along', title: 'Read along with a recording', blurb: 'Classics that a volunteer has recorded: follow the text as you listen.', icon: 'sound', colours: ['#2f4a73', '#1f3252'], pick: (i) => i.kind === 'classic' && Boolean(i.audio) },
  { id: 'short-stories', title: 'Short stories', blurb: 'A whole story in one sitting, by the masters of the form.', icon: 'stack', colours: ['#6a4a7a', '#4b3357'], pick: (i) => i.genre === 'story' },
  { id: 'under-five', title: 'Under five minutes', blurb: 'The quickest reads in Explora, for a coffee break.', icon: 'seal', colours: ['#8a3a4a', '#63283a'], pick: (i) => i.kind === 'short' && (i.minutes ?? 99) <= 5 },
];

export const collectionById = (id: string | undefined) => COLLECTIONS.find((c) => c.id === id);

// ── Picking ──────────────────────────────────────────────────────────────────

const ORDER: PickLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
export const levelIndex = (level: PickLevel) => ORDER.indexOf(level);

/** Today's number, the same all day, so the daily cards do not change on every visit. */
export const dayNumber = (now = Date.now()) => Math.floor(now / 86_400_000);

/** One item for the day, the same all day, from `items`. */
export function itemOfTheDay<T>(items: T[], salt: string, now = Date.now()): T | undefined {
  return items.length ? items[parseInt(hashString(`${salt}|${dayNumber(now)}`), 36) % items.length] : undefined;
}

/** Items closest to the learner's level first, the genre-less ones last among equals. */
export function byLevelCloseness(items: CatalogueItem[], learner: string): CatalogueItem[] {
  const me = Math.max(0, ORDER.indexOf(learner as PickLevel));
  return [...items].sort((a, b) => Math.abs(levelIndex(a.level) - me) - Math.abs(levelIndex(b.level) - me));
}
