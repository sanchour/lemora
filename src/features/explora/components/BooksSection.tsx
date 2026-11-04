import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpRight, BookCheck, BookOpen, LoaderCircle, Newspaper } from 'lucide-react';
import { getLanguage } from '@/core/lang/languages';
import { NEWS_SOURCES } from '@/core/lang/news';
import type { NewsSource } from '@/core/lang/news';
import type { NewsItem } from '@/core/parsers/article';
import { useLibrary } from '@/data/library';
import { cx } from '@/lib/cx';
import { LEVELS } from '@/core/mundus/explore';
import type { PickLevel } from '@/core/mundus/types';
import { FilterMenu, SortMenu } from '@/design/primitives';
import {
  gutenbergBooks,
  importGutenberg,
  importWikipedia,
  wikipediaToday,
} from '@/services/discover/discover';
import { addArticle, latestNews, readArticle } from '@/services/news/news';
import { toast } from '@/state/ui';
import { BookCover } from '@/features/codex/library/BookCover';
import { MediaShelf } from './MediaShelf';
import { MediaCard } from './MediaCard';
import type { ExploraItem } from '../types';

type Load<T> = { state: 'loading' } | { state: 'ready'; items: T } | { state: 'failed'; message: string };

function useLoad<T>(load: () => Promise<T>, deps: unknown[]): [Load<T>, () => void] {
  const [result, setResult] = useState<Load<T>>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setResult({ state: 'loading' });
    load().then(
      (items) => live && setResult({ state: 'ready', items }),
      (error: unknown) =>
        live &&
        setResult({
          state: 'failed',
          message: error instanceof Error ? error.message : 'That couldn’t be loaded.',
        }),
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);
  return [result, () => setAttempt((a) => a + 1)];
}

const PICTURE_BOOKS = [
  { name: 'StoryWeaver', url: 'https://storyweaver.org.in/', what: 'Graded picture books in hundreds of languages, CC BY.' },
  { name: 'African Storybook', url: 'https://www.africanstorybook.org/', what: 'Picture books for young readers, CC BY.' },
  { name: 'Bloom Library', url: 'https://bloomlibrary.org/', what: 'Simple books made by communities, mostly CC BY.' },
  { name: 'Pepper&Carrot', url: 'https://www.peppercarrot.com/', what: 'A comic about a young witch, CC BY, in many languages.' },
];

export interface BooksSectionProps {
  lang: string;
  curatedBooks: ExploraItem[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpenDetails: (item: ExploraItem) => void;
  streamingServices: string[];
}

/** Books Shelf: Graded stories and Gutenberg/Wikisource classics */
export function BooksShelf({
  lang,
  curatedBooks,
  savedIds,
  onToggleSave,
  onOpenDetails,
  streamingServices,
  layout = 'shelf',
}: BooksSectionProps & { layout?: 'shelf' | 'grid' }) {
  const translateUi = useUi();
  // Lemora U4: the Books tab opens on every book at once (what See all showed), with a filter and a sort.
  const [source, setSource] = useState<'all' | 'picked' | 'free'>('all');
  const [levelOnly, setLevelOnly] = useState<'all' | PickLevel>('all');
  const [order, setOrder] = useState<'suggested' | 'easiest' | 'title'>('suggested');
  const navigate = useNavigate();
  const texts = useLibrary(lang);
  const onShelf = useMemo(
    () => new Map((texts ?? []).flatMap((t) => (t.sourceUrl ? [[t.sourceUrl, t] as const] : []))),
    [texts],
  );
  const [adding, setAdding] = useState<string | null>(null);

  const add = async (url: string, work: () => Promise<string>, as: 'article' | 'book') => {
    const there = onShelf.get(url);
    if (there) return navigate(there.kind === 'article' ? `/codex/read/${there.id}` : `/codex/book/${there.id}`);
    if (adding) return;
    setAdding(url);
    try {
      const id = await work();
      navigate(as === 'article' ? `/codex/read/${id}` : `/codex/book/${id}?new=1`);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That couldn’t be added.', { tone: 'error' });
      setAdding(null);
    }
  };

  const status = (url: string) => (adding === url ? 'adding' : onShelf.has(url) ? 'shelved' : null);

  // Load free Gutenberg books
  const [gutenbergList] = useLoad(() => gutenbergBooks(lang), [lang]);

  const gutenbergCards =
    gutenbergList.state === 'ready'
      ? gutenbergList.items.map((b) => {
          const s = status(b.url);
          return ({ key: `pg-${b.id}`, title: b.title, level: undefined as PickLevel | undefined, free: true, node: (
            <button
              key={`pg-${b.id}`}
              type="button"
              onClick={() => void add(b.url, () => importGutenberg(lang, b), 'book')}
              className="group relative block w-full text-left cursor-pointer"
            >
              {s && (
                <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-raised/95 px-2 py-0.5 text-[10.5px] font-bold shadow-elev-1">
                  {s === 'adding' ? (
                    <LoaderCircle size={11} className="animate-spin text-ink" />
                  ) : (
                    <BookCheck size={11} className="text-sage-text" />
                  )}
                  {s === 'adding' ? translateUi('Adding…') : translateUi('On shelf')}
                </span>
              )}

              <div className="aspect-[2/3] w-full overflow-hidden rounded-[18px] sm:rounded-[20px] shadow-elev-1 transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-elev-2 group-active:scale-[0.96]">
                <BookCover
                  text={{ id: `pg-${b.id}`, title: b.title, author: b.author, lang, coverUrl: b.cover }}
                  className="size-full object-cover"
                />
              </div>
              <h4 lang={lang} className="mt-2 line-clamp-1 font-serif text-[13.5px] font-semibold text-ink">
                {b.title}
              </h4>
            </button>
          ) });
        })
      : [];

  const curatedCards = curatedBooks.map((item) => ({ key: item.id, title: item.title, level: item.level as PickLevel | undefined, free: false, node: (
    <MediaCard
      key={item.id}
      item={item}
      lang={lang}
      saved={savedIds.includes(item.id)}
      onToggleSave={() => onToggleSave(item.id)}
      onOpen={() => onOpenDetails(item)}
      streamingServices={streamingServices}
      preferredAspect="book"
    />
  ) }));

  const totalCards = [...curatedCards, ...gutenbergCards];

  if (layout === 'grid') {
    const shown = totalCards
      .filter((c) => (source === 'all' ? true : source === 'free' ? c.free : !c.free) && (levelOnly === 'all' || c.level === levelOnly))
      .sort((a, b) => (order === 'title' ? a.title.localeCompare(b.title, lang) : order === 'easiest' ? (a.level ? LEVELS.indexOf(a.level) : 9) - (b.level ? LEVELS.indexOf(b.level) : 9) : 0));
    return (
      <section aria-label={translateUi('Books')}>
        <div className="mb-4 flex items-center gap-1">
          <span className="mr-auto text-[13px] text-ink-faint tabular-nums"><UiText source={'{0} books'} values={[shown.length]} /></span>
          <FilterMenu
            active={source !== 'all' || levelOnly !== 'all'}
            lists={[
              { title: 'Books', value: source, onChange: (v) => setSource(v as typeof source), options: [{ value: 'all', label: 'All books' }, { value: 'picked', label: 'Picked for learners' }, { value: 'free', label: 'Free classics' }] },
              { title: 'Level', value: levelOnly, onChange: (v) => setLevelOnly(v as typeof levelOnly), options: [{ value: 'all', label: 'All levels' }, ...LEVELS.map((l) => ({ value: l, label: l }))] },
            ]}
          />
          <SortMenu value={order} onChange={setOrder} options={[{ value: 'suggested', label: 'Suggested' }, { value: 'easiest', label: 'Easiest first' }, { value: 'title', label: 'Title' }]} />
        </div>
        {gutenbergList.state === 'loading' && !curatedCards.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{Array.from({ length: 6 }, (_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-[18px] bg-surface" />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{shown.map((c) => <div key={c.key}>{c.node}</div>)}</div>
        )}
      </section>
    );
  }

  if (!totalCards.length) return null;

  return (
    <MediaShelf
      id="books-shelf"
      title={translateUi('Books')}
      subtitle={translateUi('Free books from Gutenberg & Wikisource, graded literature and stories.')}
      count={totalCards.length}
    >
      {totalCards.map((c) => <div key={c.key} className="contents">{c.node}</div>)}
    </MediaShelf>
  );
}

/** Wikipedia Shelf: Most read articles on Wikipedia */
export function WikipediaShelf({ lang }: { lang: string }) {
  const translateUi = useUi();
  const navigate = useNavigate();
  const name = getLanguage(lang)?.name ?? lang;
  const texts = useLibrary(lang);
  const onShelf = useMemo(
    () => new Map((texts ?? []).flatMap((t) => (t.sourceUrl ? [[t.sourceUrl, t] as const] : []))),
    [texts],
  );
  const [adding, setAdding] = useState<string | null>(null);

  const add = async (url: string, work: () => Promise<string>) => {
    const there = onShelf.get(url);
    if (there) return navigate(`/codex/read/${there.id}`);
    if (adding) return;
    setAdding(url);
    try {
      const id = await work();
      navigate(`/codex/read/${id}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That couldn’t be added.', { tone: 'error' });
      setAdding(null);
    }
  };

  const status = (url: string) => (adding === url ? 'adding' : onShelf.has(url) ? 'shelved' : null);

  const [wikiList] = useLoad(() => wikipediaToday(lang), [lang]);

  return (
    <section aria-label={translateUi('Most read on Wikipedia')}>
      <MediaShelf
        id="wikipedia-shelf"
        title={translateUi('Most read on Wikipedia')}
        subtitle={`What ${name} speakers are reading today. Whole articles with vocabulary aids.`}
        count={wikiList.state === 'ready' ? wikiList.items.length : undefined}
      >
        {wikiList.state === 'loading'
          ? Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-[18px] bg-sunken" />
            ))
          : wikiList.state === 'ready'
            ? wikiList.items.map((article) => {
                const s = status(article.url);
                return (
                  <div
                    key={article.url}
                    onClick={() => void add(article.url, () => importWikipedia(lang, article))}
                    className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[18px] sm:rounded-[20px] border border-line/60 bg-surface/85 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-elev-2 active:scale-[0.97]"
                  >
                    {s && (
                      <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-raised/95 px-2 py-0.5 text-[10.5px] font-bold shadow-elev-1">
                        {s === 'adding' ? (
                          <LoaderCircle size={11} className="animate-spin text-ink" />
                        ) : (
                          <BookCheck size={11} className="text-sage-text" />
                        )}
                        {s === 'adding' ? translateUi('Adding…') : translateUi('On shelf')}
                      </span>
                    )}

                    <div className="aspect-[16/10] w-full shrink-0 overflow-hidden bg-sunken">
                      {article.thumbnail ? (
                        <img
                          src={article.thumbnail}
                          alt=""
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid size-full place-items-center bg-sunken text-ink-faint">
                          <BookOpen size={22} />
                        </div>
                      )}
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
                      {article.featured && (
                        <span className="mb-1 inline-flex self-start rounded-full bg-sage-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sage-text">
                          ★ <UiText source={'Article of the day'} />
                        </span>
                      )}
                      <h4 lang={lang} className="font-serif text-[14px] font-semibold leading-snug line-clamp-2">
                        {article.title}
                      </h4>
                      <p lang={lang} className="mt-0.5 text-[11.5px] leading-relaxed text-ink-soft line-clamp-2">
                        {article.extract}
                      </p>
                    </div>
                  </div>
                );
              })
            : [
                <p key="err" className="text-sm text-ink-soft">
                  {wikiList.state === 'failed' ? wikiList.message : ''}
                </p>,
              ]}
      </MediaShelf>
    </section>
  );
}

/** In the news section */
export function NewsSection({ lang }: { lang: string }) {
  const translateUi = useUi();
  const navigate = useNavigate();
  const texts = useLibrary(lang);
  const onShelf = useMemo(
    () => new Map((texts ?? []).flatMap((t) => (t.sourceUrl ? [[t.sourceUrl, t] as const] : []))),
    [texts],
  );
  const [adding, setAdding] = useState<string | null>(null);

  const add = async (url: string, work: () => Promise<string>) => {
    const there = onShelf.get(url);
    if (there) return navigate(`/codex/read/${there.id}`);
    if (adding) return;
    setAdding(url);
    try {
      const id = await work();
      navigate(`/codex/read/${id}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That couldn’t be added.', { tone: 'error' });
      setAdding(null);
    }
  };

  const status = (url: string) => (adding === url ? 'adding' : onShelf.has(url) ? 'shelved' : null);
  const newsSources = (NEWS_SOURCES[lang] ?? []).slice(0, 2);

  if (!newsSources.length) return null;

  return (
    <section aria-label={translateUi('In the news')} className="mb-5 sm:mb-6">
      <div className="mb-2">
        <h2 className="font-serif text-[17px] sm:text-[19px] font-semibold text-ink">
          <UiText source={'In the news'} />
        </h2>
      </div>

      <div className={cx('grid gap-3 sm:gap-4', newsSources.length > 1 && 'md:grid-cols-2')}>
        {newsSources.map((source) => (
          <NewsSourceBox
            key={source.id}
            source={source}
            lang={lang}
            status={status}
            onAdd={(item) =>
              void add(
                item.link,
                async () => addArticle(lang, await readArticle(item.link, lang), item.link),
              )
            }
          />
        ))}
      </div>
    </section>
  );
}

/** Picture Books and Comics Section */
export function PictureBooksSection(_props: { lang: string }) {
  const translateUi = useUi();

  return (
    <section aria-label={translateUi('Picture books and comics')} className="mb-5 sm:mb-6">
      <div className="mb-2">
        <h2 className="font-serif text-[17px] sm:text-[19px] font-semibold text-ink">
          <UiText source={'Picture books and comics'} />
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PICTURE_BOOKS.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col rounded-[20px] border border-line/60 bg-surface/85 p-3.5 transition-all duration-200 hover:bg-raised hover:shadow-elev-1 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center gap-1.5 text-[13.5px] font-bold text-ink">
              {p.name}{' '}
              <ArrowUpRight
                size={14}
                className="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </span>
            <span className="mt-1 text-[12px] leading-snug text-ink-soft">{p.what}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

/** Full Books Section (used in the Books tab) */
export function BooksSection(props: BooksSectionProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <BooksShelf {...props} />
      <WikipediaShelf lang={props.lang} />
      <NewsSection lang={props.lang} />
      <PictureBooksSection lang={props.lang} />
    </div>
  );
}

function NewsSourceBox({
  source,
  lang,
  status,
  onAdd,
}: {
  source: NewsSource;
  lang: string;
  status: (url: string) => 'adding' | 'shelved' | null;
  onAdd: (item: NewsItem) => void;
}) {
  const [list, retry] = useLoad(() => latestNews(source), [source.id]);

  return (
    <div className="rounded-[20px] border border-line/60 bg-surface/85 p-3 shadow-sm">
      <p className="flex items-center gap-1.5 px-2 pt-0.5 pb-1.5 text-[11.5px] font-bold tracking-wider uppercase text-ink-faint">
        <Newspaper size={13} aria-hidden /> {source.name}
      </p>

      {list.state === 'loading' && <div className="m-1.5 h-36 animate-pulse rounded-2xl bg-sunken" />}
      {list.state === 'failed' && (
        <div className="p-2.5 text-[12.5px] text-ink-soft">
          {list.message}{' '}
          <button type="button" onClick={retry} className="text-accent-text hover:underline font-semibold ml-2">
            <UiText source={'Try again'} />
          </button>
        </div>
      )}
      {list.state === 'ready' && (
        <ul className="divide-y divide-line/35">
          {list.items.slice(0, 5).map((item) => {
            const s = status(item.link);
            return (
              <li key={item.link}>
                <button
                  type="button"
                  onClick={() => onAdd(item)}
                  className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-150 hover:bg-raised active:scale-[0.98]"
                >
                  <span lang={lang} className="min-w-0 flex-1 text-[13px] leading-snug font-semibold text-ink line-clamp-1">
                    {item.title}
                  </span>
                  {s === 'adding' && (
                    <LoaderCircle size={14} className="mt-0.5 shrink-0 animate-spin text-ink-faint" />
                  )}
                  {s === 'shelved' && (
                    <BookCheck size={14} className="mt-0.5 shrink-0 text-sage-text" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
