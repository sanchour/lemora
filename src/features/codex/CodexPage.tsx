import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BookOpenText, BookUp, ClipboardPaste, Compass, LayoutGrid, Library, List, Newspaper, PanelsTopLeft, Plus, Search, SearchX, Sparkles } from 'lucide-react';
import { useApp } from '@/app/context';
import { movedPath } from '@/app/redirects';
import { useFullMotion } from '@/app/motion';
import { PageHeader } from '@/app/PageHeader';
import { SAMPLES } from '@/core/lang/samples';
import { refreshTextStats, useAllProgress, useLibrary } from '@/data/library';
import { patchSetting } from '@/data/settings';
import type { LibrarySort } from '@/data/settings';
import type { ReadingProgress, Text } from '@/data/types';
import { useHotkeys } from '@/design/hooks/useHotkeys';
import { useLayout } from '@/design/hooks/useLayout';
import { Button, buttonClasses, Card, IconButton, MenuItem, Popover, SearchInput, searchKey, Segmented, SortMenu } from '@/design/primitives';
import { fade, spring } from '@/design/motion';
import { quote } from '@/design/flavours';
import { cx } from '@/lib/cx';
import { attachEpub } from '@/services/import/importers';
import { pickFile } from '@/services/files/files';
import { toast } from '@/state/ui';
import { BookCard, BookRow } from './library/BookCard';
import { GradedTab } from './library/GradedTab';
import { LecternCard } from './library/LecternCard';
import { useImporter } from './library/useImporter';

type Group = 'reading' | 'next' | 'finished';
type Filter = 'all' | Group;

const GROUPS: Array<{ id: Group; title: string; hint?: string }> = [
  { id: 'reading', title: 'Reading' },
  { id: 'next', title: 'Up next' },
  { id: 'finished', title: 'Finished' },
];

const SORTS: Array<{ value: LibrarySort; label: string }> = [
  { value: 'recent', label: 'Recently read' },
  { value: 'added', label: 'Recently added' },
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
  { value: 'progress', label: 'Progress' },
  { value: 'known', label: 'Easiest first' },
];

function groupOf(t: Text, progress: Map<string, ReadingProgress> | undefined): Group {
  if (t.finishedAt || t.shelf === 'read') return 'finished';
  if (t.shelf === 'to-read') return 'next';
  return (progress?.get(t.id)?.percent ?? 0) > 0 || t.shelf === 'reading' ? 'reading' : 'next';
}

function sorter(sort: LibrarySort, progress: Map<string, ReadingProgress> | undefined, lang: string): (a: Text, b: Text) => number {
  const collator = new Intl.Collator(lang, { sensitivity: 'base', numeric: true });
  switch (sort) {
    case 'added':
      return (a, b) => b.createdAt - a.createdAt;
    case 'title':
      return (a, b) => collator.compare(a.title, b.title);
    case 'author':
      return (a, b) => collator.compare(a.author ?? '￿', b.author ?? '￿') || collator.compare(a.title, b.title);
    case 'progress':
      return (a, b) => (progress?.get(b.id)?.percent ?? 0) - (progress?.get(a.id)?.percent ?? 0);
    case 'known':
      return (a, b) => (b.stats?.knownShare ?? -1) - (a.stats?.knownShare ?? -1);
    default:
      return (a, b) => (b.lastOpenedAt ?? b.createdAt) - (a.lastOpenedAt ?? a.createdAt);
  }
}

function EmptyBookSlot({ view }: { view: 'grid' | 'list' }) {
  const translateUi = useUi();

  if (view === 'list') {
    return (
      <Link
        to="/explora?tab=read"
        aria-label={translateUi('Discover')}
        className="group flex items-center gap-3.5 rounded-2xl border border-transparent px-2 py-2 transition-[background-color,border-color,box-shadow] duration-200 hover:border-accent/55 hover:bg-accent-soft/20 hover:shadow-[0_0_0_3px_var(--accent-soft)]"
      >
        <div className="relative flex aspect-[2/3] w-11 shrink-0 items-center justify-center rounded-r-md rounded-l-xs border border-dashed border-line-strong/60 bg-sunken/30 text-ink-faint transition-all duration-200 group-hover:border-accent/80 group-hover:bg-accent-soft/30 group-hover:text-accent-text">
          <Compass size={17} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-ink transition-colors group-hover:text-accent-text">
            <UiText source={'Discover'} />
          </span>
          <span className="block truncate text-[12.5px] text-ink-soft">
            <UiText source={'Explora ›'} />
          </span>
        </div>
        <ArrowRight size={14} className="mr-2 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent-text" aria-hidden />
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        to="/explora?tab=read"
        className="block w-full text-left"
        aria-label={translateUi('Discover')}
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-r-md rounded-l-xs border border-dashed border-line-strong/60 bg-sunken/25 ring-2 ring-transparent ring-offset-2 ring-offset-bg transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out group-hover:border-accent/80 group-hover:bg-accent-soft/20 group-hover:ring-accent/65 group-hover:shadow-[0_0_0_4px_var(--accent-soft)] group-active:scale-[0.98]">
          {/* Subtle book spine hinge on left */}
          <div className="absolute inset-y-0 left-0 w-2.5 border-r border-line/40 bg-black/[0.03] dark:bg-white/[0.03]" aria-hidden />

          {/* Minimal center content */}
          <div className="flex h-full flex-col items-center justify-center p-3 text-center">
            <div className="grid size-9 place-items-center rounded-xl bg-surface/80 text-ink-faint shadow-xs transition-colors group-hover:text-accent-text">
              <Compass size={18} aria-hidden />
            </div>
            <span className="mt-2.5 font-serif text-xs font-semibold text-ink-soft transition-colors group-hover:text-ink">
              <UiText source={'Discover'} />
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-2.5">
        <Link
          to="/explora?tab=read"
          className="block group-hover:text-accent-text transition-colors"
        >
          <p className="line-clamp-1 text-[14px] leading-snug font-semibold text-ink group-hover:text-accent-text">
            <UiText source={'Discover'} />
          </p>
          <p className="mt-0.5 truncate text-[12px] text-ink-faint">
            <UiText source={'Explora ›'} />
          </p>
        </Link>
      </div>
    </div>
  );
}

function Shelf({
  texts,
  progress,
  view,
  onAttach,
  showDiscover = false,
}: {
  texts: Text[];
  progress?: Map<string, ReadingProgress>;
  view: 'grid' | 'list';
  onAttach: (t: Text) => void;
  showDiscover?: boolean;
}) {
  // Full motion: books glide to their new places when the sort or filter changes.
  const layout = useFullMotion() ? 'position' : undefined;
  if (view === 'list') {
    return (
      <div className="-mx-2 flex flex-col">
        {texts.map((t, i) => (
          <motion.div key={t.id} layout={layout} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: Math.min(i, 10) * 0.02, layout: spring.fluid }}>
            <BookRow text={t} progress={progress?.get(t.id)} onAttach={onAttach} />
          </motion.div>
        ))}
        {showDiscover && (
          <motion.div layout={layout} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: Math.min(texts.length, 10) * 0.02, layout: spring.fluid }}>
            <EmptyBookSlot view="list" />
          </motion.div>
        )}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {texts.map((t, i) => (
        <motion.div key={t.id} layout={layout} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: Math.min(i, 10) * 0.03, layout: spring.fluid }}>
          <BookCard text={t} progress={progress?.get(t.id)} onAttach={onAttach} />
        </motion.div>
      ))}
      {showDiscover && (
        <motion.div layout={layout} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: Math.min(texts.length, 10) * 0.03, layout: spring.fluid }}>
          <EmptyBookSlot view="grid" />
        </motion.div>
      )}
    </div>
  );
}

function AddCodexMenu({ triggerLabel }: { triggerLabel?: ReactNode }) {
  const translateUi = useUi();
  const navigate = useNavigate();
  const items = [
    { way: 'book', icon: BookUp, label: translateUi('Import a book') },
    { way: 'write', icon: ClipboardPaste, label: translateUi('Write or paste') },
    { way: 'comic', icon: PanelsTopLeft, label: translateUi('Import a comic') },
    { way: 'news', icon: Newspaper, label: translateUi('News & links') },
    { way: 'goodreads', icon: Library, label: translateUi('Goodreads') },
  ] as const;

  return (
    <Popover
      label={translateUi('Add to your library')}
      placement="bottom-end"
      className="w-60 p-1.5"
      trigger={(props) => (
        <Button {...props} variant="primary" size="md">
          {triggerLabel ?? <UiText source={'{0} Add'} values={[<Plus size={17} aria-hidden />]} />}
        </Button>
      )}
    >
      {(close) => (
        <div className="flex flex-col gap-0.5">
          {items.map((item) => (
            <MenuItem
              key={item.way}
              icon={item.icon}
              label={item.label}
              onClick={() => {
                close();
                navigate(`/codex/new?way=${item.way}`);
              }}
            />
          ))}
        </div>
      )}
    </Popover>
  );
}

function EmptyLibrary({ lang, busy, onSample }: { lang: string; busy: boolean; onSample: () => void }) {
  return (
    <Card className="flex flex-col items-center px-6 py-8 text-center sm:py-10">
      <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-sage-soft text-sage-text">
        <BookOpenText size={28} aria-hidden />
      </div>
      <h2 className="font-serif text-2xl font-semibold"><UiText source={'Your shelves are waiting'} /></h2>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-soft"><UiText source={'Add a book, a text file or something you pasted. Or start with a short page, written for you.'} /></p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <AddCodexMenu triggerLabel={<UiText source={'{0} Add a book or text'} values={[<Plus size={17} aria-hidden />]} />} />
        <Link to="/explora?tab=read" className={buttonClasses('secondary', 'md')}><UiText source={'Discover'} /></Link>
        <Button variant="ghost" icon={Sparkles} onClick={onSample} loading={busy}><UiText source={'Read {0}'} values={[quote(SAMPLES[lang] ? lang : 'en', SAMPLES[lang]?.title ?? SAMPLES.en.title)]} /></Button>
      </div>
    </Card>
  );
}

function ViewToggle({ view, onChange }: { view: 'grid' | 'list'; onChange: (v: 'grid' | 'list') => void }) {
  const translateUi = useUi();
  return (
    <div
      role="radiogroup"
      aria-label={translateUi('Show as')}
      className="inline-flex h-9 items-center rounded-xl border border-line bg-sunken/60 p-0.5"
    >
      <button
        type="button"
        role="radio"
        aria-checked={view === 'grid'}
        aria-label={translateUi('Grid')}
        title={translateUi('Grid')}
        onClick={() => onChange('grid')}
        className={cx(
          'relative grid size-8 place-items-center rounded-lg text-ink-soft transition-colors hover:text-ink',
          view === 'grid' && 'text-ink font-semibold',
        )}
      >
        {view === 'grid' && (
          <motion.span
            layoutId="library-view-glider"
            className="absolute inset-0 rounded-lg bg-surface shadow-elev-1"
            transition={spring.soft}
          />
        )}
        <LayoutGrid size={15} className="relative z-10" aria-hidden />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={view === 'list'}
        aria-label={translateUi('List')}
        title={translateUi('List')}
        onClick={() => onChange('list')}
        className={cx(
          'relative grid size-8 place-items-center rounded-lg text-ink-soft transition-colors hover:text-ink',
          view === 'list' && 'text-ink font-semibold',
        )}
      >
        {view === 'list' && (
          <motion.span
            layoutId="library-view-glider"
            className="absolute inset-0 rounded-lg bg-surface shadow-elev-1"
            transition={spring.soft}
          />
        )}
        <List size={15} className="relative z-10" aria-hidden />
      </button>
    </div>
  );
}

export default function CodexPage() {
  const translateUi = useUi();
  const { language, settings } = useApp();
  const lang = language.id;
  const all = useLibrary(lang);
  const texts = useMemo(() => all ?? [], [all]);
  const progress = useAllProgress();
  const { busy, run } = useImporter(lang);
  const navigate = useNavigate();
  const { pointer } = useLayout();
  const [filter, setFilter] = useState<Filter>('all');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const { librarySort: sort, libraryView: view } = settings.ui;
  const { pathname, search } = useLocation();
  const moved = movedPath('/codex', search);

  useHotkeys({ '/': () => (searching ? searchRef.current?.focus() : setSearching(true)) }, pointer === 'fine' && Boolean(texts?.length));

  // Comprehension drifts as words become known; refresh quietly, one book at a time.
  useEffect(() => {
    if (!texts) return;
    let cancelled = false;
    const stale = texts.filter((t) => !t.stats || Date.now() - t.stats.computedAt > 120_000);
    void (async () => {
      for (const t of stale) {
        if (cancelled) return;
        await refreshTextStats(t.id);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Keyed on the number of books, not on every stats update (which would loop).
  }, [texts?.length, lang]);

  const current = useMemo(
    () => texts?.find((t) => !t.finishedAt && progress?.has(t.id)),
    [texts, progress],
  );

  const grouped = useMemo(() => {
    const out = new Map<Group, Text[]>(GROUPS.map((g) => [g.id, []]));
    const q = searchKey(query.trim());
    const compare = sorter(sort, progress, lang);
    for (const t of texts ?? []) {
      if (q && !searchKey(`${t.title} ${t.author ?? ''}`).includes(q)) continue;
      out.get(groupOf(t, progress))!.push(t);
    }
    for (const list of out.values()) list.sort(compare);
    return out;
  }, [texts, progress, query, sort, lang]);

  // Filter chips only for shelves that have books (ignoring the search, so they don't jump).
  const inUse = useMemo(() => new Set((texts ?? []).map((t) => groupOf(t, progress))), [texts, progress]);
  useEffect(() => {
    if (filter !== 'all' && !inUse.has(filter)) setFilter('all');
  }, [filter, inUse]);

  const sections = GROUPS.filter((g) => (filter === 'all' || filter === g.id) && grouped.get(g.id)!.length > 0);
  const showHeadings = filter === 'all' && inUse.size > 1;
  const matches = sections.reduce((n, g) => n + grouped.get(g.id)!.length, 0);

  const attach = async (item: Text) => {
    const file = await pickFile('.epub,application/epub+zip');
    if (!file) return;
    try {
      const id = await attachEpub(item, file);
      navigate(`/codex/read/${id}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That EPUB couldn’t be opened.', { tone: 'error' });
    }
  };

  const closeSearch = () => {
    setQuery('');
    setSearching(false);
  };

  if (moved) return <Navigate to={moved} replace />;
  if (pathname.startsWith('/codex/goodreads')) return <Navigate to="/codex" replace />;
  if (pathname.startsWith('/codex/discover')) return <Navigate to="/explora?tab=read" replace />;
  if (pathname.startsWith('/codex/graded')) {
    return (
      <>
        <PageHeader
          title={translateUi('Your graded shelf')} englishTitle={'Graded shelf'}
          actions={
            <Link to="/codex" className={buttonClasses('secondary', 'md')}><UiText source={'Back to your library'} /></Link>
          }
        />
        <div className="mt-8">
          <GradedTab lang={lang} texts={texts ?? []} />
        </div>
      </>
    );
  }
  return (
    <>
      <div className="pl-2 sm:pl-5 lg:pl-8">
        <PageHeader
          title={translateUi('Codex')} englishTitle={'Codex'}
          actions={<AddCodexMenu />}
        />
      </div>

      {texts && texts.length === 0 && (
        <EmptyLibrary lang={lang} busy={busy === 'sample'} onSample={() => void run('sample')} />
      )}

      {texts && texts.length > 0 && (() => {
        const stacksContent = (
          <>
            <div className="mb-6 flex h-11 items-center gap-2">
              <div className="relative h-full min-w-0 flex-1">
                <AnimatePresence mode="popLayout" initial={false}>
                  {searching ? (
                    <motion.div key="search" className="absolute inset-0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={fade}>
                      <SearchInput ref={searchRef} value={query} onChange={setQuery} placeholder={translateUi('Search titles and authors')} onClose={closeSearch} autoFocus />
                    </motion.div>
                  ) : (
                    <motion.div key="filter" className="absolute inset-0 overflow-x-auto [scrollbar-width:none]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
                      {inUse.size > 1 ? (
                        <Segmented<Filter>
                          label={translateUi('Shelf')}
                          value={filter}
                          onChange={setFilter}
                          options={[{ value: 'all', label: translateUi('All') }, ...GROUPS.filter((g) => inUse.has(g.id)).map((g) => ({ value: g.id, label: g.title }))]}
                        />
                      ) : (
                        <p className="flex h-full items-center font-serif text-lg font-semibold"><UiText source={'Your shelf {0}'} values={[<span className="ml-2 font-sans text-sm font-bold text-ink-faint tabular-nums">{texts.length}</span>]} /></p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {!searching && <IconButton icon={Search} label={translateUi('Search')} shortcut="/" onClick={() => setSearching(true)} />}
              <SortMenu value={sort} options={SORTS} onChange={(librarySort) => void patchSetting('ui', { librarySort })} />
              <ViewToggle view={view} onChange={(libraryView) => void patchSetting('ui', { libraryView })} />
            </div>

            {query && (
              <p className="-mt-3 mb-5 text-[13px] font-semibold text-ink-faint" aria-live="polite">
                {matches === 0 ? '' : `${matches} ${matches === 1 ? 'book' : 'books'}`}
              </p>
            )}

            {matches === 0 && query ? (
              <div className="flex flex-col items-center py-14 text-center text-ink-soft">
                <SearchX size={28} className="mb-3 text-ink-faint" aria-hidden />
                <p className="font-semibold text-ink"><UiText source={'Nothing on your shelves matches “{0}”'} values={[query.trim()]} /></p>
                <p className="mt-1 text-sm"><UiText source={'Try part of the title or the author’s surname.'} /></p>
              </div>
            ) : (
              <div className="space-y-10">
                {sections.map((g, idx) => {
                  const isLast = idx === sections.length - 1;
                  const showDiscover = !query && (filter === g.id || isLast);
                  return (
                    <section key={g.id} aria-label={g.title}>
                      {showHeadings && (
                        <header className="mb-4 flex items-baseline gap-2.5 border-b border-line pb-2">
                          <h2 className="font-serif text-xl font-semibold">{g.title}</h2>
                          <span className="text-sm font-bold text-ink-faint tabular-nums">{grouped.get(g.id)!.length}</span>
                          {g.hint && <span className="ml-auto hidden text-[12.5px] text-ink-faint sm:block">{g.hint}</span>}
                        </header>
                      )}
                      <Shelf
                        texts={grouped.get(g.id)!}
                        progress={progress}
                        view={view}
                        onAttach={(t) => void attach(t)}
                        showDiscover={showDiscover}
                      />
                    </section>
                  );
                })}
              </div>
            )}
          </>
        );

        return (
          <div className="mt-6 space-y-8">
            {current && progress && !query && (
              <section aria-label={translateUi('Continue reading')} className="pb-1 pl-2 sm:pl-5 lg:pl-8">
                <LecternCard text={current} progress={progress.get(current.id)!} />
              </section>
            )}
            <div className={current && progress && !query ? 'border-t border-line/60 pt-6' : ''}>
              {stacksContent}
            </div>
          </div>
        );
      })()}
    </>
  );
}




