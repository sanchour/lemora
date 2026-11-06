// Explora › All, under the hero: short reads, picture books, classics, collections and the daily cards, from the free catalogue
// (src/core/explora/catalogue.ts). Each opens through openCatalogueItem: read in Codex, or on StoryWeaver for a picture book.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, ArrowUpRight, BookCheck, Clock, Headphones, LoaderCircle, Quote } from 'lucide-react';
import { useApp } from '@/app/context';
import { COLLECTIONS, CATALOGUE_CREDITS, byLevelCloseness, collectionById, itemOfTheDay, loadCatalogue } from '@/core/explora/catalogue';
import type { Catalogue, CatalogueItem, ComicSeries } from '@/core/explora/catalogue';
import { PROVERBS } from '@/core/explora/proverbs';
import { useLibrary, addText } from '@/data/library';
import { Hand } from '@/design/drawings';
import { UiText, useUi } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { BookCover } from '@/features/codex/library/BookCover';
import { sonusBase } from '@/features/sonus/paths';
import { DiscoverError, importWikipedia, wikiHost } from '@/services/discover/discover';
import { itemUrl } from '@/core/explora/catalogue';
import { openCatalogueItem, openRecording } from '@/services/explora/catalogue';
import { toast } from '@/state/ui';
import { LevelBadge } from './LevelBadge';
import { MediaShelf } from './MediaShelf';

/** The comic series for the language (none while it loads, and for languages without any). */
export function useCatalogueSeries(lang: string): ComicSeries[] {
  const [series, setSeries] = useState<ComicSeries[]>([]);
  useEffect(() => {
    let live = true;
    setSeries([]);
    void loadCatalogue(lang).then((c: Catalogue) => live && setSeries(c.series ?? []), () => undefined);
    return () => {
      live = false;
    };
  }, [lang]);
  return series;
}

/** The catalogue for the language (empty while it loads, and for languages without one). */
export function useCatalogueItems(lang: string): CatalogueItem[] {
  const [items, setItems] = useState<CatalogueItem[]>([]);
  useEffect(() => {
    let live = true;
    setItems([]);
    void loadCatalogue(lang).then((c) => live && setItems(c.items), () => undefined);
    return () => {
      live = false;
    };
  }, [lang]);
  return items;
}

/** Opening an item of the catalogue: which one is being added, which are on the shelf, and the go-there. */
export function useOpenCatalogue(lang: string) {
  const navigate = useNavigate();
  const texts = useLibrary(lang);
  const [busy, setBusy] = useState<string | null>(null);
  const onShelf = useMemo(() => new Set((texts ?? []).flatMap((t) => (t.sourceUrl && !t.deletedAt ? [t.sourceUrl] : []))), [texts]);
  const open = async (item: CatalogueItem) => {
    if (busy) return;
    setBusy(item.id);
    try {
      const where = await openCatalogueItem(lang, item);
      if ('external' in where) window.open(where.external, '_blank', 'noreferrer');
      else navigate(where.to);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That couldn’t be added.', { tone: 'error' });
    } finally {
      setBusy(null);
    }
  };
  const listen = async (item: CatalogueItem) => {
    try {
      const to = await openRecording(lang, item, sonusBase());
      if (to) navigate(to);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That recording couldn’t be opened.', { tone: 'error' });
    }
  };
  return { open, listen, busy, isShelved: (item: CatalogueItem) => onShelf.has(itemUrl(lang, item)) };
}
type Opener = ReturnType<typeof useOpenCatalogue>;

const GENRE_HAND: Record<string, 'leaf' | 'quill' | 'book' | 'stack' | 'talk'> = { fable: 'leaf', tale: 'stack', poem: 'quill', story: 'book', essay: 'talk' };
const GENRE_NAME: Record<string, string> = { fable: 'Fable', tale: 'Fairy tale', poem: 'Poem', story: 'Short story', essay: 'Essay' };

function StatusPill({ item, opener }: { item: CatalogueItem; opener: Opener }) {
  if (opener.busy === item.id) return <LoaderCircle size={14} className="animate-spin text-ink-faint" aria-hidden />;
  if (opener.isShelved(item)) return <BookCheck size={14} className="text-sage-text" aria-label="On shelf" />;
  return null;
}

// ── Cards ────────────────────────────────────────────────────────────────────

/** A book standing up: its cover, the level, a headphone when a recording exists. */
export function ClassicCard({ item, lang, opener }: { item: CatalogueItem; lang: string; opener: Opener }) {
  const translateUi = useUi();
  return (
    <div className="group relative block w-full text-left">
      <button type="button" onClick={() => void opener.open(item)} aria-label={translateUi('View {0}', [item.title])} className="relative block aspect-[2/3] w-full cursor-pointer overflow-hidden rounded-[18px] border-l-[4px] border-l-line-strong bg-surface/85 shadow-elev-1 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-elev-2 group-active:scale-[0.97]">
        <BookCover text={{ id: item.id, title: item.title, author: item.author, lang, coverUrl: item.cover }} className="size-full object-cover" lazy />
        <span className="absolute top-2.5 left-2.5"><LevelBadge level={item.level} size="sm" /></span>
        <span className="absolute top-2.5 right-2.5"><StatusPill item={item} opener={opener} /></span>
      </button>
      {item.audio && (
        <button type="button" onClick={() => void opener.listen(item)} aria-label={translateUi('Listen to the recording')} title={translateUi('Listen to the recording')} className="absolute right-2 bottom-[3.1rem] z-10 grid size-8 place-items-center rounded-full bg-raised/95 text-accent-text shadow-elev-1 transition hover:scale-110 active:scale-90">
          <Headphones size={15} aria-hidden />
        </button>
      )}
      <h4 lang={lang} className="mt-2 line-clamp-1 font-serif text-[13.5px] font-semibold text-ink">{item.title}</h4>
      {item.author && <p lang={lang} className="line-clamp-1 text-[11.5px] text-ink-faint">{item.author}</p>}
    </div>
  );
}

/** A picture book: a big square cover, StoryWeaver's mark, opens on StoryWeaver. */
export function PictureCard({ item, lang, opener }: { item: CatalogueItem; lang: string; opener: Opener }) {
  const translateUi = useUi();
  return (
    <button type="button" onClick={() => void opener.open(item)} aria-label={translateUi('View {0}', [item.title])} className="group block w-full cursor-pointer text-left">
      <span className="relative block aspect-square w-full overflow-hidden rounded-[24px] border border-line bg-sunken shadow-elev-1 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-accent group-hover:shadow-elev-2 group-active:scale-[0.97]">
        {item.cover ? <img src={item.cover} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <span className="grid size-full place-items-center"><Hand name="book" size={44} /></span>}
        <span className="absolute top-2.5 left-2.5"><LevelBadge level={item.level} size="sm" /></span>
        <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[10.5px] font-bold text-white/95 backdrop-blur-sm">{'StoryWeaver'} <ArrowUpRight size={11} aria-hidden /></span>
      </span>
      <span lang={lang} className="mt-2 line-clamp-2 block font-serif text-[14px] leading-snug font-semibold text-ink transition-colors group-hover:text-accent-text">{item.title}</span>
      {item.author && <span lang={lang} className="line-clamp-1 block text-[11.5px] text-ink-faint">{item.author}</span>}
    </button>
  );
}

/** A short read: a page torn from a notebook, with its kind drawn on it and the minutes it takes. */
export function ShortCard({ item, lang, opener }: { item: CatalogueItem; lang: string; opener: Opener }) {
  const translateUi = useUi();
  return (
    <button type="button" onClick={() => void opener.open(item)} aria-label={translateUi('View {0}', [item.title])} className="group flex h-full w-full cursor-pointer flex-col rounded-[22px] border border-line bg-surface/70 p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:bg-raised hover:shadow-elev-2 active:scale-[0.98]">
      <span className="flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-full bg-accent-soft transition-transform group-hover:-rotate-6"><Hand name={GENRE_HAND[item.genre ?? 'story'] ?? 'book'} size={24} /></span>
        <span className="flex items-center gap-2"><StatusPill item={item} opener={opener} /><LevelBadge level={item.level} size="sm" /></span>
      </span>
      <span lang={lang} className="mt-3 line-clamp-2 font-serif text-[16.5px] leading-snug font-bold text-ink transition-colors group-hover:text-accent-text">{item.title}</span>
      {item.author && <span lang={lang} className="mt-0.5 line-clamp-1 font-serif text-[13px] text-ink-soft italic">{item.author}</span>}
      <span className="mt-auto flex items-center gap-2 pt-3 text-[11.5px] font-semibold text-ink-faint">
        <Clock size={12} aria-hidden /> <UiText source={'{0} min'} values={[item.minutes ?? 1]} />
        {item.genre && <span>· <UiText source={GENRE_NAME[item.genre]} /></span>}
      </span>
    </button>
  );
}

// ── Shelves ──────────────────────────────────────────────────────────────────

export function ShortReadsShelf({ lang, items, learner, opener }: { lang: string; items: CatalogueItem[]; learner: string; opener: Opener }) {
  const translateUi = useUi();
  const shown = useMemo(() => byLevelCloseness(items.filter((i) => i.kind === 'short' && (i.minutes ?? 99) <= 5), learner).slice(0, 14), [items, learner]);
  if (!shown.length) return null;
  return (
    <MediaShelf id="short-reads" title={translateUi('Short reads')} count={shown.length} itemClass="w-[220px] sm:w-[250px]">
      {shown.map((item) => <ShortCard key={item.id} item={item} lang={lang} opener={opener} />)}
    </MediaShelf>
  );
}

/** Picture books are for beginners: shown for A0 to B1 only. */
export const showsPictureBooks = (learner: string) => ['A0', 'A1', 'A2', 'B1'].includes(learner);

export function PictureBooksShelf({ lang, items, learner, opener }: { lang: string; items: CatalogueItem[]; learner: string; opener: Opener }) {
  const translateUi = useUi();
  const shown = useMemo(() => byLevelCloseness(items.filter((i) => i.kind === 'picture'), learner).slice(0, 16), [items, learner]);
  if (!shown.length || !showsPictureBooks(learner)) return null;
  return (
    <div>
      <MediaShelf id="picture-books" title={translateUi('Picture books')} count={shown.length} itemClass="w-[210px] sm:w-[240px]">
        {shown.map((item) => <PictureCard key={item.id} item={item} lang={lang} opener={opener} />)}
      </MediaShelf>
      <p className="-mt-3 mb-6 text-[11.5px] text-ink-faint"><UiText source={CATALOGUE_CREDITS.storyweaver} /></p>
    </div>
  );
}

export function ClassicsShelf({ lang, items, learner, opener }: { lang: string; items: CatalogueItem[]; learner: string; opener: Opener }) {
  const translateUi = useUi();
  // The ones with a recording first, then the easiest for the learner.
  const shown = useMemo(() => {
    const classics = byLevelCloseness(items.filter((i) => i.kind === 'classic'), learner);
    return [...classics.filter((i) => i.audio), ...classics.filter((i) => !i.audio)];
  }, [items, learner]);
  if (!shown.length) return null;
  return (
    <div>
      <MediaShelf id="classics" title={translateUi('Classics')} count={shown.length}>
        {shown.map((item) => <ClassicCard key={item.id} item={item} lang={lang} opener={opener} />)}
      </MediaShelf>
      <p className="-mt-3 mb-6 text-[11.5px] text-ink-faint"><UiText source={CATALOGUE_CREDITS.gutenberg} /></p>
    </div>
  );
}

// ── Collections ──────────────────────────────────────────────────────────────

export function CollectionsShelf({ items }: { items: CatalogueItem[] }) {
  const translateUi = useUi();
  const shown = COLLECTIONS.map((c) => ({ c, count: items.filter(c.pick).length })).filter((x) => x.count >= 3);
  if (!shown.length) return null;
  return (
    <section aria-label={translateUi('Collections')} className="mb-6">
      <h2 className="mb-3 font-serif text-[21px] font-semibold tracking-tight text-ink sm:text-[24px]"><UiText source={'Collections'} /></h2>
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map(({ c, count }) => (
          <Link key={c.id} to={`/explora/collection/${c.id}`} className="group relative flex h-36 items-center overflow-hidden rounded-[26px] p-5 text-white shadow-elev-1 transition-all duration-200 hover:-translate-y-1 hover:shadow-elev-3" style={{ background: `linear-gradient(135deg, ${c.colours[0]}, ${c.colours[1]})` }}>
            <span aria-hidden className="absolute -right-6 -bottom-8 size-40 rounded-full bg-white/10 transition-transform duration-300 group-hover:scale-110" />
            <span aria-hidden className="absolute top-1/2 right-5 -translate-y-1/2 rotate-6 text-white/85 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110"><Hand name={c.icon} size={76} className="text-white!" /></span>
            <span className="relative max-w-[62%]">
              <span className="block font-serif text-[21px] leading-tight font-bold tracking-tight"><UiText source={c.title} /></span>
              <span className="mt-1 line-clamp-2 block text-[12.5px] leading-snug text-white/85"><UiText source={c.blurb} /></span>
              <span className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-bold tracking-[0.08em] uppercase text-white/90"><UiText source={'{0} reads'} values={[count]} /> <ArrowRight size={12} aria-hidden /></span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** /explora/collection/:id: everything in one collection. */
export function CollectionItems({ lang, id }: { lang: string; id: string | undefined }) {
  const { language } = useApp();
  const items = useCatalogueItems(lang);
  const opener = useOpenCatalogue(lang);
  const collection = collectionById(id);
  const list = useMemo(() => (collection ? byLevelCloseness(items.filter(collection.pick), language.level) : []), [items, collection, language.level]);
  if (!collection) return null;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {list.map((item) => (item.kind === 'classic' ? <ClassicCard key={item.id} item={item} lang={lang} opener={opener} /> : item.kind === 'article' ? <MagazineCard key={item.id} item={item} lang={lang} opener={opener} /> : item.kind === 'picture' ? <PictureCard key={item.id} item={item} lang={lang} opener={opener} /> : <ShortCard key={item.id} item={item} lang={lang} opener={opener} />))}
    </div>
  );
}

// ── Daily cards ──────────────────────────────────────────────────────────────

interface HistoryEvent {
  year: number;
  text: string;
  page?: { title: string; url: string };
}

/** Wikipedia's "on this day" for the language (the selected events), cached for the day. */
function useOnThisDay(lang: string): HistoryEvent | null | undefined {
  const [event, setEvent] = useState<HistoryEvent | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    setEvent(undefined);
    const now = new Date();
    const url = `${wikiHost(lang, 'wikipedia')}/api/rest_v1/feed/onthisday/selected/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${String(now.getUTCDate()).padStart(2, '0')}`;
    fetch(url, { signal: AbortSignal.timeout(15_000) })
      .then((r) => (r.ok ? (r.json() as Promise<{ selected?: Array<{ text: string; year: number; pages?: Array<{ titles?: { normalized?: string }; title: string; content_urls?: { desktop?: { page?: string } } }> }> }>) : Promise.reject(new Error('no'))))
      .then((d) => {
        const list = (d.selected ?? []).filter((e) => e.text && e.pages?.length);
        const pick = itemOfTheDay(list, `history:${lang}`);
        const page = pick?.pages?.[0];
        if (live) setEvent(pick ? { year: pick.year, text: pick.text, page: page?.content_urls?.desktop?.page ? { title: page.titles?.normalized ?? page.title, url: page.content_urls.desktop.page } : undefined } : null);
      })
      .catch(() => live && setEvent(null));
    return () => {
      live = false;
    };
  }, [lang]);
  return event;
}

export function DailyCards({ lang, items, opener }: { lang: string; items: CatalogueItem[]; opener: Opener }) {
  const translateUi = useUi();
  const navigate = useNavigate();
  const history = useOnThisDay(lang);
  const poem = useMemo(() => itemOfTheDay(items.filter((i) => i.genre === 'poem'), `poem:${lang}`), [items, lang]);
  const saying = useMemo(() => itemOfTheDay(PROVERBS[lang] ?? [], `saying:${lang}`), [lang]);
  const [busy, setBusy] = useState<string | null>(null);

  const readSaying = async () => {
    if (!saying || busy) return;
    setBusy('saying');
    try {
      const id = await addText({ lang, title: saying.length > 40 ? `${saying.slice(0, 37)}…` : saying, kind: 'article', source: 'paste', chapters: [{ blocks: [{ t: 'p', text: saying }] }] });
      navigate(`/codex/read/${id}`);
    } catch {
      toast('That couldn’t be added.', { tone: 'error' });
    } finally {
      setBusy(null);
    }
  };
  const readHistory = async () => {
    if (!history?.page || busy) return;
    setBusy('history');
    try {
      navigate(`/codex/read/${await importWikipedia(lang, history.page)}`);
    } catch (error) {
      toast(error instanceof DiscoverError || error instanceof Error ? error.message : 'That couldn’t be added.', { tone: 'error' });
    } finally {
      setBusy(null);
    }
  };

  if (!saying && !poem && !history) return null;
  const card = 'group flex min-h-40 flex-col rounded-[24px] border border-line bg-surface/70 p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:bg-raised hover:shadow-elev-2 active:scale-[0.98]';
  const label = 'flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-accent-text uppercase';
  return (
    <section aria-label={translateUi('Today')} className="mb-6">
      <h2 className="mb-3 font-serif text-[21px] font-semibold tracking-tight text-ink sm:text-[24px]"><UiText source={'Today'} /></h2>
      <div className="grid gap-3.5 md:grid-cols-3">
        {saying && (
          <button type="button" onClick={() => void readSaying()} className={card}>
            <span className={label}><Quote size={13} aria-hidden /> <UiText source={'Saying of the day'} /></span>
            <span lang={lang} className="mt-3 font-serif text-[20px] leading-snug font-semibold text-ink">{saying}</span>
            <span className="mt-auto flex items-center gap-1 pt-3 text-[11.5px] font-semibold text-ink-faint group-hover:text-accent-text">{busy === 'saying' ? <LoaderCircle size={12} className="animate-spin" aria-hidden /> : null}<UiText source={'Tap to read it word by word'} /></span>
          </button>
        )}
        {poem && (
          <button type="button" onClick={() => void opener.open(poem)} className={card}>
            <span className={label}><Hand name="quill" size={16} className="text-accent-text!" /> <UiText source={'Poem of the day'} /></span>
            <span lang={lang} className="mt-3 font-serif text-[20px] leading-snug font-semibold text-ink">{poem.title}</span>
            {poem.author && <span lang={lang} className="mt-0.5 font-serif text-[13.5px] text-ink-soft italic">{poem.author}</span>}
            <span className="mt-auto flex items-center gap-2 pt-3 text-[11.5px] font-semibold text-ink-faint group-hover:text-accent-text"><Clock size={12} aria-hidden /> <UiText source={'{0} min'} values={[poem.minutes ?? 1]} /> <StatusPill item={poem} opener={opener} /></span>
          </button>
        )}
        {history && (
          <button type="button" onClick={() => void readHistory()} disabled={!history.page} className={cx(card, !history.page && 'cursor-default')}>
            <span className={label}><Hand name="day" size={16} className="text-accent-text!" /> <UiText source={'Today in history'} /></span>
            <span className="mt-3 font-serif text-[26px] leading-none font-bold text-accent-text tabular-nums">{history.year}</span>
            <span lang={lang} className="mt-1.5 line-clamp-4 font-serif text-[15px] leading-snug text-ink">{history.text}</span>
            {history.page && <span className="mt-auto flex items-center gap-1 pt-3 text-[11.5px] font-semibold text-ink-faint group-hover:text-accent-text">{busy === 'history' ? <LoaderCircle size={12} className="animate-spin" aria-hidden /> : null}<UiText source={'Read about it'} /></span>}
          </button>
        )}
      </div>
    </section>
  );
}

/** The Picture & comics tab: every picture book, any level, as a grid. */
export function PictureBooksGrid({ lang, items, learner, opener }: { lang: string; items: CatalogueItem[]; learner: string; opener: Opener }) {
  const translateUi = useUi();
  const shown = useMemo(() => byLevelCloseness(items.filter((i) => i.kind === 'picture'), learner), [items, learner]);
  if (!shown.length) return null;
  return (
    <section aria-label={translateUi('Picture books')} className="mb-6">
      <h2 className="mb-3 font-serif text-[21px] font-semibold tracking-tight text-ink sm:text-[24px]"><UiText source={'Picture books'} /> <span className="align-middle text-[12px] font-bold text-ink-faint tabular-nums">{shown.length}</span></h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {shown.map((item) => <PictureCard key={item.id} item={item} lang={lang} opener={opener} />)}
      </div>
      <p className="mt-3 text-[11.5px] text-ink-faint"><UiText source={CATALOGUE_CREDITS.storyweaver} /></p>
    </section>
  );
}

/** The Books tab: short reads as a shelf above the books. */
export function ShortReadsGrid({ lang, items, learner, opener }: { lang: string; items: CatalogueItem[]; learner: string; opener: Opener }) {
  return <ShortReadsShelf lang={lang} items={items} learner={learner} opener={opener} />;
}

// ── Comic series and old magazines ───────────────────────────────────────────

/** A comic series: its first page as a cover, and a click opens the series page. */
export function SeriesCard({ series, lang }: { series: ComicSeries; lang: string }) {
  return (
    <Link to={`/explora/series/${series.id}`} className="group block w-full text-left">
      <span className="relative block aspect-[3/4] w-full overflow-hidden rounded-[18px] border border-line bg-raised transition-colors duration-200 group-hover:border-accent">
        <img src={series.cover} alt="" loading="lazy" className="size-full object-cover" />
        <span className="absolute top-2.5 left-2.5"><LevelBadge level={series.level} size="sm" /></span>
        <span className="absolute right-2.5 bottom-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[10.5px] font-bold text-white/95 backdrop-blur-sm">{series.pages} <UiText source={'pages'} /></span>
      </span>
      <h4 lang={lang} className="mt-2 line-clamp-1 font-serif text-[14px] font-semibold text-ink transition-colors group-hover:text-accent-text">{series.title}</h4>
      <p className="line-clamp-1 text-[11.5px] text-ink-faint">{series.author} · {series.years}</p>
    </Link>
  );
}

/** An article of an old magazine, as the magazine's cover: its name on top, the headline set big, the years and minutes at the foot. */
export function MagazineCard({ item, lang, opener }: { item: CatalogueItem; lang: string; opener: Opener }) {
  const translateUi = useUi();
  const c = item.magazine?.colour ?? '#3f6b5b';
  return (
    <button type="button" onClick={() => void opener.open(item)} aria-label={translateUi('View {0}', [item.title])} className="group relative block aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-[4px] text-left text-white shadow-elev-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-elev-3" style={{ background: `linear-gradient(160deg, ${c}, color-mix(in oklab, ${c} 62%, black))` }}>
      <span aria-hidden className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/35 to-transparent" />
      <span aria-hidden className="absolute -right-10 -bottom-10 size-40 rounded-full bg-white/10" />
      <span lang={lang} className="absolute inset-x-5 top-4 line-clamp-2 border-b-2 border-white/70 pb-1.5 text-center font-serif text-[12.5px] font-bold tracking-[0.14em] uppercase">{item.magazine?.name}</span>
      <h3 lang={lang} className="absolute inset-x-5 top-[4.5rem] bottom-14 line-clamp-6 overflow-hidden font-serif text-[18px] leading-[1.2] font-bold tracking-tight">{item.title}</h3>
      <span className="absolute inset-x-5 bottom-3.5 flex items-center justify-between border-t border-white/40 pt-2 text-[10.5px] font-bold tracking-[0.12em] uppercase"><span>{item.magazine?.years}</span><span className="inline-flex items-center gap-1">{opener.busy === item.id ? <LoaderCircle size={12} className="animate-spin" aria-hidden /> : <Clock size={11} aria-hidden />} <UiText source={'{0} min'} values={[item.minutes ?? 1]} /></span></span>
    </button>
  );
}

/** The old magazines' articles, as a shelf of covers. */
export function OldMagazinesShelf({ lang, items, opener, limit = 12 }: { lang: string; items: CatalogueItem[]; opener: Opener; limit?: number }) {
  const translateUi = useUi();
  const shown = useMemo(() => items.filter((i) => i.kind === 'article').slice(0, limit), [items, limit]);
  if (!shown.length) return null;
  return (
    <div>
      <MediaShelf id="old-magazines" title={translateUi('Old magazines')} count={shown.length} itemClass="w-[190px] sm:w-[210px]">
        {shown.map((item) => <MagazineCard key={item.id} item={item} lang={lang} opener={opener} />)}
      </MediaShelf>
      <p className="-mt-3 mb-6 text-[11.5px] text-ink-faint"><UiText source={CATALOGUE_CREDITS.magazines} /></p>
    </div>
  );
}

/** Comics: Pepper&Carrot's card first (passed in), then every series in the language, as one shelf. */
export function ComicSeriesShelf({ lang, series, first }: { lang: string; series: ComicSeries[]; first?: React.ReactNode }) {
  const translateUi = useUi();
  const cards = [...(first ? [first] : []), ...series.map((s) => <SeriesCard key={s.id} series={s} lang={lang} />)];
  if (!cards.length) return null;
  return (
    <div>
      <MediaShelf id="comic-series" title={translateUi('Comics')} count={cards.length}>{cards}</MediaShelf>
      {series.length > 0 && <p className="-mt-3 mb-6 text-[11.5px] text-ink-faint"><UiText source={CATALOGUE_CREDITS.commons} /></p>}
    </div>
  );
}
