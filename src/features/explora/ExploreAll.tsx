import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import type { Level } from '@/core/lang/levels';
import { ESTIMATED, levelIndex, LEVELS } from '@/core/mundus/explore';
import type { LevelFilter } from '@/core/mundus/explore';
import type { PickLevel, Picks } from '@/core/mundus/types';
import { starterKey } from '@/data/starter';
import { useApp } from '@/app/context';
import { addBookToCodex, addSubtitlesFor, followPodcast } from '@/features/mundus/actions';
import { pickKey, useAudiobookPicks, usePickLookups, useRadioPicks, useStreaming } from '@/features/mundus/hooks';
import { sonusBase } from '@/features/sonus/paths';
import { countryName as radioCountry } from '@/services/radio/stations';
import { openLibrivoxBook } from '@/services/sonus/librivox';
import { discoverFor } from '@/features/cantus/discover';
import type { PickedArtist } from '@/features/cantus/discover';
import { StarterLibrary } from '@/features/thesaurus/library/StarterLibrary';
import { toast } from '@/state/ui';
import { toggleSaved, useSaved } from './saved';
import type { ExploraCategory, ExploraItem, Kind } from './types';
import { ExploraHeaderBar } from './components/ExploraHeaderBar';
import { HeroBillboard } from './components/HeroBillboard';
import { MediaShelf } from './components/MediaShelf';
import { MediaCard } from './components/MediaCard';
import { MediaDetailModal } from './components/MediaDetailModal';
import { ExploraFeed } from './ExploraFeed';
import { ClassicsShelf, CollectionsShelf, ComicSeriesShelf, DailyCards, OldMagazinesShelf, PictureBooksGrid, PictureBooksShelf, ShortReadsShelf, useCatalogueItems, useCatalogueSeries, useOpenCatalogue } from './components/ExploraShelves';
import type { CatalogueItem } from '@/core/explora/catalogue';
import { mixByKind } from '@/core/explora/mix';
import {
  BooksShelf,
  NewsSection,
  PictureBooksSection,
  WikipediaShelf,
} from './components/BooksSection';
import { WordDecksShelf } from './components/WordDecksShelf';
import { MagazineSection, pepperCard } from './components/ComicsSection';
import { PEPPER_CREDIT } from '@/core/comics/peppercarrot';
import { LudusRow, LudusShelf } from './components/LudusShelf';
import { comicCover, comicEpisodes } from '@/core/comics/peppercarrot';
import { FIRST_BOOKS } from '@/core/lang/firstBooks';
import { tipsFor } from '@/core/mundus/tips';
import { tipLevel } from '@/core/mundus/guide';
import { useLibrary } from '@/data/library';
import { shows } from '@/product';
import { TipsView } from '@/features/mundus/TipsView';
import { Segmented, SortMenu } from '@/design/primitives';
import { patchSetting } from '@/data/settings';
import type { DiscoverGroup, DiscoverSort } from '@/data/settings';

const EASE_LEVEL: Record<PickedArtist['ease'], PickLevel> = {
  clear: 'A2',
  medium: 'B1',
  fast: 'B2',
};

const KIND_TO_CATEGORY: Record<string, ExploraCategory> = {
  series: 'screen',
  films: 'screen',
  books: 'books',
  read: 'books',
  dictionaries: 'books',
  audiobooks: 'audio',
  podcasts: 'audio',
  music: 'music',
  radio: 'music',
  words: 'words',
  try: 'try',
  saved: 'saved',
  articles: 'articles',
  news: 'articles',
  comics: 'comics',
  ludus: 'ludus',
};

/** Whether this build has the room an item opens in (src/product.ts): Lemora keeps what is read. */
export const kindShown = (kind: Kind): boolean =>
  kind === 'series' || kind === 'films' || kind === 'youtube' ? shows('visio') : kind === 'podcasts' || kind === 'audiobooks' || kind === 'radio' ? shows('sonus') : kind === 'music' ? shows('cantus') : kind === 'games' ? shows('mundus') : true;

/** How many the hero holds (the user, 2026-11-04: seven). */
export const HERO_COUNT = 7;
export const HERO_SLOT_HOURS = 5;
export const HERO_SLOT_MS = HERO_SLOT_HOURS * 60 * 60 * 1000;

export function get5HourSlot(timeMs = Date.now()): number {
  return Math.floor(timeMs / HERO_SLOT_MS);
}

/**
 * Selects 5 diverse hero highlights that rotate deterministically every 5 hours:
 * 1. Series & Films (prioritizing learner level)
 * 2. Books & Graded literature (prioritizing learner level)
 * 3. Audiobooks
 * 4. Podcasts
 * 5. Music / Live Radio
 */
export function pickHeroItems(
  items: ExploraItem[],
  level: Level,
  timeMs = Date.now(),
  count = HERO_COUNT,
): ExploraItem[] {
  if (!items.length) return [];
  const slot = get5HourSlot(timeMs);
  const me = levelIndex(level);

  // Helper to prioritize items matching or close to the learner's level
  const byLevelCloseness = (a: ExploraItem, b: ExploraItem) => {
    const distA = Math.abs(LEVELS.indexOf(a.level) - me);
    const distB = Math.abs(LEVELS.indexOf(b.level) - me);
    return distA - distB;
  };

  const screens = items
    .filter((i) => i.kind === 'series' || i.kind === 'films')
    .sort(byLevelCloseness);
  const books = items.filter((i) => i.kind === 'books').sort(byLevelCloseness);
  const comics = items.filter((i) => i.kind === 'comic').sort(byLevelCloseness);
  const tips = items.filter((i) => i.kind === 'tip').sort(byLevelCloseness);
  const audiobooks = items.filter((i) => i.kind === 'audiobooks').sort(byLevelCloseness);
  const podcasts = items.filter((i) => i.kind === 'podcasts').sort(byLevelCloseness);
  const lives = items
    .filter((i) => i.kind === 'radio' || i.kind === 'music')
    .sort(byLevelCloseness);

  // Books lead (twice), then a comic and something to try; what a build lacks simply isn't there (Lemora U4).
  const pools = [books, comics, books.slice(1), tips, screens, audiobooks, podcasts, lives].filter((p) => p.length > 0);
  const chosen: ExploraItem[] = [];
  const chosenIds = new Set<string>();

  // 1. Pick 1 item from each distinct pool rotated by the 5-hour slot
  for (let i = 0; i < pools.length && chosen.length < count; i++) {
    const pool = pools[i];
    // Each pool is sorted closest to the learner's level first; the hero turns among its closest three.
    const item = pool[(slot + i) % Math.min(pool.length, 3)];
    if (item && !chosenIds.has(item.id)) {
      chosen.push(item);
      chosenIds.add(item.id);
    }
  }

  // 2. If fewer than 5 (e.g. some pool is missing in the language), fill from remaining items rotated by slot
  if (chosen.length < count) {
    const allSorted = [...items].sort(byLevelCloseness);
    for (let i = 0; i < allSorted.length && chosen.length < count; i++) {
      const item = allSorted[(slot + i) % allSorted.length];
      if (item && !chosenIds.has(item.id)) {
        chosen.push(item);
        chosenIds.add(item.id);
      }
    }
  }

  return chosen.slice(0, count);
}

const GENRE_WORD: Record<string, string> = { fable: 'A fable', tale: 'A fairy tale', poem: 'A poem', story: 'A short story', essay: 'An essay' };

/** A catalogue item as an Explora item, so the hero, search, Flick and the Books tab know it too. */
export function catalogueToItem(c: CatalogueItem): ExploraItem {
  // A classic has no picture of its own: the app draws its cover (Gutenberg's generated ones are slow to come).
  const cover = c.cover;
  const blurb = c.kind === 'picture' ? 'A picture book to read with the pictures, free on StoryWeaver.' : c.kind === 'article' ? `An article from ${c.magazine?.name ?? 'an old magazine'}, about ${c.minutes ?? 1} min to read.` : c.kind === 'short' ? `${GENRE_WORD[c.genre ?? 'story']}, about ${c.minutes ?? 1} min to read.` : 'A free classic, read in Codex with every word a tap away.';
  return { id: `cat:${c.id}`, kind: c.kind === 'classic' ? 'books' : 'read', title: c.title, sub: c.author, level: c.level, cover, catalogue: c, blurb };
}

export function ExploreAll({
  lang,
  picks,
  level,
  searchQuery = '',
  levelFilter = 'mine',
  onSelectLevelFilter,
  flickOpen = false,
  onFlickClose,
}: {
  lang: string;
  picks: Picks | null;
  level: Level;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  levelFilter?: LevelFilter;
  onSelectLevelFilter?: (filter: LevelFilter) => void;
  /** Flick, the full-screen scroller, is opened from the page header. */
  flickOpen?: boolean;
  onFlickClose?: () => void;
}) {
  const translateUi = useUi();
  const navigate = useNavigate();
  const { settings } = useApp();
  const [params, setParams] = useSearchParams();

  // Backward compatibility with ?kind= and ?tab= params
  const requestedKind = params.get('kind');
  const requestedTab = params.get('tab');
  const initialCategory: ExploraCategory = requestedTab
    ? KIND_TO_CATEGORY[requestedTab] ?? 'all'
    : requestedKind
      ? KIND_TO_CATEGORY[requestedKind] ?? 'all'
      : 'all';

  const [category, setCategoryState] = useState<ExploraCategory>(initialCategory);
  // The level filter lives in the page header (Lemora U4): around the learner's level unless chosen otherwise.
  const [selectedItem, setSelectedItem] = useState<ExploraItem | null>(null);

  const saved = useSaved(lang);
  const streaming = useStreaming();
  const lookups = usePickLookups(
    lang,
    picks,
    streaming.country,
    streaming.services.length ? streaming.token : '',
  );
  const stations = useRadioPicks(lang);
  const shelf = useLibrary(lang);
  const audiobooks = useAudiobookPicks(lang);
  const catalogue = useCatalogueItems(lang);
  const comicSeries = useCatalogueSeries(lang);
  const opener = useOpenCatalogue(lang);

  const setCategory = (cat: ExploraCategory) => {
    setCategoryState(cat);
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('tab');
        if (cat === 'all') next.delete('kind');
        else if (cat === 'screen') next.set('kind', 'series');
        else if (cat === 'books') next.set('kind', 'books');
        else if (cat === 'audio') next.set('kind', 'audiobooks');
        else if (cat === 'music') next.set('kind', 'music');
        else if (cat === 'words') next.set('kind', 'words');
        else if (cat === 'try') next.set('kind', 'try');
        else if (cat === 'articles') next.set('kind', 'articles');
        else if (cat === 'comics') next.set('kind', 'comics');
        else if (cat === 'ludus') next.set('kind', 'ludus');
        else if (cat === 'saved') next.set('kind', 'saved');
        return next;
      },
      { replace: true },
    );
  };

  // Compile all items across the language catalog
  const items = useMemo(() => {
    const out: ExploraItem[] = [];
    for (const group of [
      'series',
      'films',
      'books',
      'podcasts',
      'youtube',
      'games',
      'dictionaries',
    ] as const) {
      for (const pick of picks?.[group] ?? []) {
        out.push({
          id: `${group}:${pickKey(pick)}`,
          kind: group as Kind,
          title: pick.title,
          sub:
            [group === 'dictionaries' ? undefined : pick.by, pick.year].filter(Boolean).join(' · ') ||
            undefined,
          level: pick.level,
          pick,
        });
      }
    }
    for (const artist of discoverFor(lang)?.artists ?? []) {
      out.push({
        id: `music:${artist.name}`,
        kind: 'music',
        title: artist.name,
        sub: 'Artist',
        level: EASE_LEVEL[artist.ease],
        artist,
      });
    }
    for (const station of stations) {
      out.push({
        id: `radio:${station.id}`,
        kind: 'radio',
        title: station.name,
        sub: radioCountry(station.countryCode, station.country) || 'Radio',
        level: ESTIMATED.radio,
        estimated: true,
        station,
      });
    }
    for (const book of audiobooks) {
      out.push({
        id: `audiobooks:${book.identifier}`,
        kind: 'audiobooks',
        title: book.title,
        sub: book.author,
        level: ESTIMATED.audiobooks,
        estimated: true,
        book,
      });
    }
    // Lemora U4: the hero and search also know the comics, the things to try, the books on your shelf (Goodreads
    // included) and, for a beginner, the first book.
    for (const ep of comicEpisodes(lang).slice(0, 12)) out.push({ id: `comic:${ep.id}`, kind: 'comic', title: `Pepper&Carrot · ${ep.number}`, level: 'A2', estimated: true, cover: comicCover(lang, ep), to: `/explora/comic/${ep.id}`, blurb: 'A short, funny comic about a young witch and her cat, page by page.' });
    for (const tip of tipsFor(lang).slice(0, 10)) out.push({ id: `tip:${tip.id}`, kind: 'tip', title: tip.title, level: tipLevel(tip), to: '/explora?kind=try', blurb: tip.teaser });
    for (const t of (shelf ?? []).filter((t) => t.kind === 'shelfItem' && !t.deletedAt).slice(0, 10)) out.push({ id: `shelf:${t.id}`, kind: 'books', title: t.title, sub: t.author, level: 'B1', estimated: true, cover: t.coverUrl, to: `/codex/book/${t.id}`, blurb: t.author ? `${t.author}, on your shelf.` : 'On your shelf.' });
    const first = FIRST_BOOKS[lang];
    if (first && (level === 'A0' || level === 'A1')) out.push({ id: 'first-book', kind: 'books', title: first.title, level: 'A1', to: '/codex/first', blurb: 'A tiny first book: a line a page, the easiest words.' });
    for (const c of catalogue) out.push(catalogueToItem(c));
    for (const s of comicSeries) out.push({ id: `series:${s.id}`, kind: 'comic', title: s.title, sub: s.author, level: s.level, cover: s.cover, to: `/explora/series/${s.id}`, blurb: s.blurb });
    return out.filter((item) => kindShown(item.kind));
  }, [picks, stations, audiobooks, lang, shelf, level, catalogue, comicSeries]);

  // Filter items according to active level filter
  const filteredByLevel = useMemo(() => {
    if (levelFilter === 'any') return items;
    if (levelFilter !== 'mine') return items.filter((i) => i.level === levelFilter);
    // 'mine': around the learner's level
    const me = levelIndex(level);
    return items.filter((i) => {
      const idx = LEVELS.indexOf(i.level);
      return idx >= Math.max(0, me - 1) && idx <= Math.min(LEVELS.length - 1, me + 1);
    });
  }, [items, levelFilter, level]);

  // Real-time search matches
  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.sub?.toLowerCase().includes(q) ||
        (i.pick?.by && i.pick.by.toLowerCase().includes(q)),
    );
  }, [items, searchQuery]);

  // Periodic tick that advances when a 5-hour boundary is crossed
  const [slotTick, setSlotTick] = useState(() => Date.now());
  useEffect(() => {
    const msUntilNextSlot = HERO_SLOT_MS - (slotTick % HERO_SLOT_MS) + 1000;
    const timer = setTimeout(() => {
      setSlotTick(Date.now());
    }, msUntilNextSlot);
    return () => clearTimeout(timer);
  }, [slotTick]);

  // Featured 5 highlights for the Hero Billboard, rotating deterministically every 5 hours
  const heroItems = useMemo(() => {
    return pickHeroItems(items, level, slotTick);
  }, [items, level, slotTick]);

  // Handle direct primary action from cards or hero
  const handlePrimaryAction = async (item: ExploraItem) => {
    if (item.catalogue) return opener.open(item.catalogue);
    if (item.to) return navigate(item.to);
    if (item.kind === 'books' && item.pick) {
      const pick = item.pick;
      const added = await addBookToCodex(lang, pick);
      toast(
        added
          ? { source: '“{0}” is on your Codex wishlist.', values: [String(pick.title)] }
          : 'It’s already in Codex.',
        {
          tone: added ? 'success' : 'default',
          action: { label: 'Codex', onClick: () => navigate('/codex') },
        },
      );
      return;
    }
    if (item.kind === 'podcasts' && item.pick) {
      const feedId = await followPodcast(lang, item.pick);
      if (feedId) navigate(`${sonusBase()}/podcast/${feedId}`);
      else toast('Podcast not found under that name.', { duration: 5000 });
      return;
    }
    if ((item.kind === 'series' || item.kind === 'films') && item.pick) {
      const id = await addSubtitlesFor(lang, item.pick.title);
      if (id) navigate(`/visio/watch/${id}`);
      else setSelectedItem(item);
      return;
    }
    if (item.station) {
      navigate(`${sonusBase()}/station/${item.station.id}`);
      return;
    }
    if (item.book) {
      const id = await openLibrivoxBook(lang, item.book.identifier);
      navigate(`${sonusBase()}/book/${id}`);
      return;
    }
    if (item.artist) {
      navigate(`/sonus?tab=music&q=${encodeURIComponent(item.artist.name)}`);
      return;
    }
    setSelectedItem(item);
  };

  // A card opens the details, except an item from the catalogue, which opens to read.
  const openItem = (item: ExploraItem) => (item.catalogue ? void handlePrimaryAction(item) : setSelectedItem(item));

  // Strictly isolate content items by kind:
  const screenItems = useMemo(
    () => filteredByLevel.filter((i) => i.kind === 'series' || i.kind === 'films'),
    [filteredByLevel],
  );
  const bookItems = useMemo(
    () => filteredByLevel.filter((i) => i.kind === 'books'),
    [filteredByLevel],
  );
  // The Books tab shows every book (what See all showed) and filters by level itself (Lemora U4).
  const allBookItems = useMemo(() => items.filter((i) => i.kind === 'books' && !i.id.startsWith('shelf:')), [items]);
  const audiobookItems = useMemo(
    () => filteredByLevel.filter((i) => i.kind === 'audiobooks'),
    [filteredByLevel],
  );
  const musicItems = useMemo(
    () => filteredByLevel.filter((i) => i.kind === 'music'),
    [filteredByLevel],
  );
  const podcastItems = useMemo(
    () => filteredByLevel.filter((i) => i.kind === 'podcasts'),
    [filteredByLevel],
  );
  const radioItems = useMemo(
    () => filteredByLevel.filter((i) => i.kind === 'radio'),
    [filteredByLevel],
  );
  const savedItems = useMemo(
    () => items.filter((i) => saved.includes(i.id)),
    [items, saved],
  );

  const renderMediaShelf = ({
    id,
    title,
    subtitle,
    items: shelfItems,
    aspect,
  }: {
    id: string;
    title: string;
    subtitle?: string;
    items: ExploraItem[];
    aspect?: 'landscape' | 'poster' | 'square' | 'book';
  }) => {
    if (!shelfItems.length) return null;
    return (
      <MediaShelf
        key={id}
        id={id}
        title={title}
        subtitle={subtitle}
        count={shelfItems.length}
      >
        {shelfItems.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            lang={lang}
            lookup={
              item.pick && (item.kind === 'series' || item.kind === 'films')
                ? lookups.get(item.pick.title)
                : undefined
            }
            saved={saved.includes(item.id)}
            onToggleSave={() => toggleSaved(lang, item.id)}
            onOpen={() => openItem(item)}
            streamingServices={streaming.services}
            preferredAspect={aspect}
          />
        ))}
      </MediaShelf>
    );
  };

  return (
    <div className="min-w-0 pb-8 sm:pb-10">
      {/* Streaming Top Navigation Bar: Category pills + Level filter popup */}
      <ExploraHeaderBar
        category={category}
        onSelectCategory={setCategory}
        savedCount={saved.length}
        learnerLevel={level}
        levelFilter={levelFilter}
        onSelectLevelFilter={onSelectLevelFilter}
      />

      {/* Search Results View (when user has typed in top search bar) */}
      {searchMatches !== null ? (
        <div className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-line pb-2">
            <h2 className="font-serif text-[20px] font-semibold text-ink">
              <UiText source={'Search Results'} />
            </h2>
            <span className="text-[13px] text-ink-faint tabular-nums">
              {searchMatches.length} {searchMatches.length === 1 ? translateUi('match') : translateUi('matches')}
            </span>
          </div>

          {searchMatches.length === 0 ? (
            <p className="py-12 text-center text-[14px] text-ink-soft">
              {translateUi('No titles match “{0}”. Try another keyword.', [searchQuery])}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pt-1">
              {searchMatches.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  lang={lang}
                  lookup={
                    item.pick && (item.kind === 'series' || item.kind === 'films')
                      ? lookups.get(item.pick.title)
                      : undefined
                  }
                  saved={saved.includes(item.id)}
                  onToggleSave={() => toggleSaved(lang, item.id)}
                  onOpen={() => openItem(item)}
                  streamingServices={streaming.services}
                />
              ))}
            </div>
          )}
        </div>
      ) : category === 'articles' ? (
        <div className="pt-1">
          <NewsSection lang={lang} />
          <MagazineSection lang={lang} />
          <OldMagazinesShelf lang={lang} items={catalogue} opener={opener} limit={30} />
          <WikipediaShelf lang={lang} />
        </div>
      ) : category === 'comics' ? (
        <div className="pt-1">
          <ComicSeriesShelf lang={lang} series={comicSeries} first={pepperCard(lang)} />
          <p className="-mt-3 mb-6 text-[11.5px] text-ink-faint">{PEPPER_CREDIT}</p>
          <PictureBooksGrid lang={lang} items={catalogue} learner={level} opener={opener} />
          <PictureBooksSection lang={lang} />
        </div>
      ) : category === 'ludus' ? (
        <div className="pt-1">
          <LudusShelf />
        </div>
      ) : category === 'try' ? (
        <div className="pt-1">
          <TipsView lang={lang} />
        </div>
      ) : category === 'words' ? (
        /* Word Decks Tab: StarterLibrary embedded in Explore */
        <div className="pt-1">
          {/* Ready-made decks live here (Thesaurus's Discover moved in): by kind or by level, and in what order. */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Segmented<DiscoverGroup>
              label={translateUi('Kind of deck')}
              value={settings.ui.discoverGroup}
              onChange={(value) => void patchSetting('ui', { discoverGroup: value })}
              options={[
                { value: 'kind', label: translateUi('Kind of deck') },
                { value: 'level', label: translateUi('Level') },
              ]}
            />
            <SortMenu
              value={settings.ui.discoverSort}
              options={[
                { value: 'suggested', label: 'Suggested' },
                { value: 'size', label: 'Most words' },
                { value: 'easiest', label: 'Easiest first' },
              ]}
              onChange={(value: DiscoverSort) => void patchSetting('ui', { discoverSort: value })}
            />
          </div>
          <StarterLibrary
            lang={lang}
            query={searchQuery}
            sort={settings.ui.discoverSort}
            group={settings.ui.discoverGroup}
            onOpen={(spec) => navigate('/thesaurus/ready/' + starterKey(spec))}
          />
        </div>
      ) : category === 'books' ? (
        /* Books Tab: Free Reading suite (Wikipedia, News, Gutenberg/Wikisource, Comics, Graded) */
        <div className="pt-1">
          <ShortReadsShelf lang={lang} items={catalogue} learner={level} opener={opener} />
          <BooksShelf
            layout="grid"
            lang={lang}
            curatedBooks={allBookItems}
            savedIds={saved}
            onToggleSave={(id) => toggleSaved(lang, id)}
            onOpenDetails={openItem}
            streamingServices={streaming.services}
          />
        </div>
      ) : (
        /* All / Screen / Audio / Music / Saved Streaming Views */
        <>
          {/* Featured Hero Billboard (on 'All' view) */}
          {category === 'all' && heroItems.length > 0 && (
            <HeroBillboard
              items={heroItems}
              lang={lang}
              learnerLevel={level}
              lookups={lookups}
              savedIds={saved}
              onToggleSave={(id) => toggleSaved(lang, id)}
              onOpenDetails={openItem}
              onPrimaryAction={handlePrimaryAction}
              streamingServices={streaming.services}
            />
          )}

          {category === 'all' ? (
            /* ALL TAB: the hero, then the free reading under it, then what was here before. */
            <div>
              {/* 1. At your level: a mixed row of every kind */}
              {renderMediaShelf({
                id: 'at-your-level',
                title: translateUi('At your level'),
                items: mixByKind(filteredByLevel, level, 14, (i) => i.id.startsWith('shelf:') || i.id === 'first-book'),
                aspect: 'book',
              })}

              {/* 2. Short reads, 3. picture books (beginners), 4. classics */}
              <ShortReadsShelf lang={lang} items={catalogue} learner={level} opener={opener} />
              <PictureBooksShelf lang={lang} items={catalogue} learner={level} opener={opener} />
              <ClassicsShelf lang={lang} items={catalogue} learner={level} opener={opener} />

              {/* 5. News and magazines */}
              <MagazineSection lang={lang} title={translateUi('News and magazines')} limit={4} />
              <OldMagazinesShelf lang={lang} items={catalogue} opener={opener} />

              {/* 6. Collections, 7. the daily cards */}
              <CollectionsShelf items={catalogue} />
              <DailyCards lang={lang} items={catalogue} opener={opener} />

              {/* 8. What was here before: books, series, word decks, comics, then the rest */}
              <BooksShelf
                lang={lang}
                curatedBooks={bookItems.filter((i) => !i.catalogue)}
                savedIds={saved}
                onToggleSave={(id) => toggleSaved(lang, id)}
                onOpenDetails={openItem}
                streamingServices={streaming.services}
              />

              {/* 2. Series & Films */}
              {renderMediaShelf({
                id: 'screen-shelf',
                title: translateUi('Series & Films'),
                subtitle: translateUi('Watch with dual subtitles and vocabulary aids in Visio.'),
                items: screenItems,
                aspect: 'landscape',
              })}

              {/* 3. Word Decks, random every time but based on level */}
              <WordDecksShelf lang={lang} learnerLevel={level} levelFilter={levelFilter} blurbs={false} />

              {/* Lemora U4: comics, free and legal to use */}
              <ComicSeriesShelf lang={lang} series={comicSeries} first={pepperCard(lang)} />

              {/* Ludus: a row of games */}
              <LudusRow />

              {/* 4. Audiobooks */}
              {renderMediaShelf({
                id: 'audiobooks-shelf',
                title: translateUi('Audiobooks'),
                subtitle: translateUi('Listen aloud with audio playback in Sonus.'),
                items: audiobookItems,
                aspect: 'square',
              })}

              {/* 5. Music */}
              {renderMediaShelf({
                id: 'music-shelf',
                title: translateUi('Music'),
                subtitle: translateUi('Singable lyrics with pronunciation in Cantus.'),
                items: musicItems,
                aspect: 'square',
              })}

              {/* 6. Podcasts */}
              {renderMediaShelf({
                id: 'podcasts-shelf',
                title: translateUi('Podcasts'),
                subtitle: translateUi('Follow podcasts and listen on the go in Sonus.'),
                items: podcastItems,
                aspect: 'square',
              })}

              {/* 7. Radio */}
              {renderMediaShelf({
                id: 'radio-shelf',
                title: translateUi('Live Radio'),
                subtitle: translateUi('Real-time broadcasts from countries where the language is spoken.'),
                items: radioItems,
                aspect: 'square',
              })}

              {/* 8. Most read on wikipedia */}
              <WikipediaShelf lang={lang} />

              {/* 9. In the news */}
              <NewsSection lang={lang} />

              {/* 10. Picture books and comics */}
              <PictureBooksSection lang={lang} />
            </div>
          ) : category === 'screen' ? (
            <div>
              {renderMediaShelf({
                id: 'screen-shelf',
                title: translateUi('Series & Films'),
                subtitle: translateUi('Watch with dual subtitles and vocabulary aids in Visio.'),
                items: screenItems,
                aspect: 'landscape',
              })}
            </div>
          ) : category === 'audio' ? (
            <div>
              {renderMediaShelf({
                id: 'audiobooks-shelf',
                title: translateUi('Audiobooks'),
                subtitle: translateUi('Listen aloud with audio playback in Sonus.'),
                items: audiobookItems,
                aspect: 'square',
              })}
              {renderMediaShelf({
                id: 'podcasts-shelf',
                title: translateUi('Podcasts'),
                subtitle: translateUi('Follow podcasts and listen on the go in Sonus.'),
                items: podcastItems,
                aspect: 'square',
              })}
            </div>
          ) : category === 'music' ? (
            <div>
              {renderMediaShelf({
                id: 'music-shelf',
                title: translateUi('Music'),
                subtitle: translateUi('Singable lyrics with pronunciation in Cantus.'),
                items: musicItems,
                aspect: 'square',
              })}
              {renderMediaShelf({
                id: 'radio-shelf',
                title: translateUi('Live Radio'),
                subtitle: translateUi('Real-time broadcasts from countries where the language is spoken.'),
                items: radioItems,
                aspect: 'square',
              })}
            </div>
          ) : category === 'saved' ? (
            <div>
              {savedItems.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[15px] font-medium text-ink-soft">
                    {translateUi('No saved items yet. Bookmark titles as you explore.')}
                  </p>
                </div>
              ) : (
                renderMediaShelf({
                  id: 'saved-shelf',
                  title: translateUi('Your Watchlist & Reading List'),
                  subtitle: translateUi('Titles you bookmarked for later exploration.'),
                  items: savedItems,
                  aspect: 'landscape',
                })
              )}
            </div>
          ) : null}
        </>
      )}

      {/* Flick: the full-screen scroller. Everything Explora has, one thing at a time. */}
      {flickOpen && (
        <ExploraFeed
          items={items}
          lang={lang}
          learnerLevel={level}
          lookups={lookups}
          savedIds={saved}
          onToggleSave={(id) => toggleSaved(lang, id)}
          onOpen={(item) => void handlePrimaryAction(item)}
          onDetails={openItem}
          onClose={() => onFlickClose?.()}
        />
      )}

      {/* Quick View Streaming Detail Modal */}
      <MediaDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        lang={lang}
        lookup={
          selectedItem?.pick &&
          (selectedItem.kind === 'series' || selectedItem.kind === 'films')
            ? lookups.get(selectedItem.pick.title)
            : undefined
        }
        saved={selectedItem ? saved.includes(selectedItem.id) : false}
        onToggleSave={() => selectedItem && toggleSaved(lang, selectedItem.id)}
        streaming={streaming}
      />
    </div>
  );
}
