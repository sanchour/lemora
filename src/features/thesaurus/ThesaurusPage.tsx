import { Art } from '@/design/drawings';
import { Phrasebook } from '@/features/phrasebook/Phrasebook';
import { UiText, useUi } from '@/design/i18n/UiText';
import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { BookA, Brain, Compass, Layers, LayoutGrid, List, MessageSquareQuote, Plus, Search, SearchX, Sparkles, Waypoints } from 'lucide-react';
import { useApp } from '@/app/context';
import { shows } from '@/product';
import { PageHeader } from '@/app/PageHeader';
import { RoomTabs } from '@/app/RoomTabs';
import type { RoomTab } from '@/app/RoomTabs';
import { STARTER_THEMES } from '@/core/lang/starter';
import { createDeck, createFolder, useDeckCounts, useDecks, useFolders } from '@/data/decks';
import { patchSetting } from '@/data/settings';
import type { DeckSort } from '@/data/settings';
import { starterKey, useStarterList } from '@/data/starter';
import type { StarterSpec } from '@/data/starter';
import { useStudyOutlook } from '@/data/study';
import type { Deck, Folder } from '@/data/types';
import { useHotkeys } from '@/design/hooks/useHotkeys';
import { useLayout } from '@/design/hooks/useLayout';
import { Button, Card, IconButton, SearchInput, searchKey, SortMenu } from '@/design/primitives';
import { fade, spring } from '@/design/motion';
import { cx } from '@/lib/cx';
import { THEME_ICONS } from './common/DeckIcon';
import { CsvImportDrawer } from './library/CsvImportDrawer';
import { DeckCards, DeckResults, DeckTree, deckOrder, sumCounts } from './library/DeckTree';
import type { TreeActions } from './library/DeckTree';
import { ConfirmDialog, MergeDialog, MoveDialog, NameDialog } from './library/dialogs';
import { FromListDialog } from './library/FromListDialog';
import type { MergeRequest } from './library/dialogs';
import { mergeDecks } from '@/data/deckTools';
import { toast } from '@/state/ui';
import type { ConfirmRequest, MoveRequest, NameRequest } from './library/dialogs';
import { JourneySection } from './library/JourneySection';
import { NewMenu } from './library/NewMenu';
import type { NewAction } from './library/NewMenu';
import { TodayCard } from './library/TodayCard';
import { DecksDesk } from './library/DecksDesk';
import { useDeckImport } from './library/useDeckImport';
import { DictionaryView, WordsView } from './dictionary/DictionaryView';

type Tab = 'decks' | 'dictionary' | 'words' | 'phrases' | 'atlas';
const DISCOVER = '/explora?kind=words';
// The Atlas draws on a canvas and loads its code only when its tab opens (6-29).
const AtlasTab = lazy(() => import('./atlas/AtlasTab'));

const SORTS: Array<{ value: DeckSort; label: string }> = [
  { value: 'due', label: 'Most to do' },
  { value: 'recent', label: 'Recently studied' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Most cards' },
  { value: 'hand', label: 'By hand' },
];

function ViewToggle({ view, onChange }: { view: 'list' | 'cards'; onChange: (v: 'list' | 'cards') => void }) {
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
        aria-checked={view === 'cards'}
        aria-label={translateUi('Cards')}
        title={translateUi('Cards')}
        onClick={() => onChange('cards')}
        className={cx(
          'relative grid size-8 place-items-center rounded-lg text-ink-soft transition-colors hover:text-ink',
          view === 'cards' && 'text-ink font-semibold',
        )}
      >
        {view === 'cards' && (
          <motion.span
            layoutId="thesaurus-view-glider"
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
            layoutId="thesaurus-view-glider"
            className="absolute inset-0 rounded-lg bg-surface shadow-elev-1"
            transition={spring.soft}
          />
        )}
        <List size={15} className="relative z-10" aria-hidden />
      </button>
    </div>
  );
}

export default function ThesaurusPage() {
  const translateUi = useUi();
  const { language, settings } = useApp();
  const lang = language.id;
  const navigate = useNavigate();
  const { pointer } = useLayout();
  const allDecks = useDecks(lang);
  // Archived decks are out of the way until asked for (6-2).
  const [showArchived, setShowArchived] = useState(false);
  const archivedCount = allDecks?.filter((d) => d.archived).length ?? 0;
  const decks = useMemo(() => allDecks?.filter((d) => showArchived || !d.archived), [allDecks, showArchived]);
  const folders = useFolders(lang);
  const counts = useDeckCounts(decks);
  const outlook = useStudyOutlook(decks);
  const imports = useDeckImport(lang);
  const { deckSort: sort, deckView: view } = settings.ui;
  const totals = useMemo(() => counts && sumCounts([...counts.values()]), [counts]);

  const [params] = useSearchParams();
  const hasDecks = Boolean(allDecks?.length);
  // The tab you pick wins; with nothing chosen, Thesaurus opens on My decks with the Lexicon desk.
  const picked = params.get('tab');
  // "memory" was the word memory's own tab before it joined the dictionary.
  const tab: Tab = picked === 'decks' || picked === 'dictionary' || picked === 'phrases' || picked === 'atlas' || (picked === 'words' && shows('words')) ? picked : picked === 'memory' ? (shows('words') ? 'words' : 'dictionary') : 'decks';
  // Ready-made decks are found in Explora › Word decks, with the rest of what there is to discover.
  const browse = () => navigate(DISCOVER);
  // The room's tabs (5.1-3b), as Codex's and Mentis's: 1 2 3 open them.
  const tabs: Array<RoomTab<Tab>> = [
    { id: 'decks', label: 'My decks', to: '/thesaurus?tab=decks', icon: Layers },
    { id: 'dictionary', label: 'Dictionary', to: '/thesaurus?tab=dictionary', icon: BookA },
    ...(shows('words') ? [{ id: 'words' as const, label: 'Words', to: '/thesaurus?tab=words', icon: Brain }] : []),
    { id: 'phrases', label: 'Phrases', to: '/thesaurus?tab=phrases', icon: MessageSquareQuote },
    ...(shows('atlas') ? [] : [{ id: 'atlas' as const, label: 'Atlas', to: '/thesaurus?tab=atlas', icon: Waypoints }]),
  ];

  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  useHotkeys({ '/': () => (searching ? searchRef.current?.focus() : setSearching(true)) }, pointer === 'fine' && tab === 'decks');

  const openStarter = (spec: StarterSpec) => navigate('/thesaurus/ready/' + starterKey(spec));
  const [naming, setNaming] = useState<NameRequest | null>(null);
  const [confirming, setConfirming] = useState<ConfirmRequest | null>(null);
  const [moving, setMoving] = useState<MoveRequest | null>(null);
  const [merging, setMerging] = useState<MergeRequest | null>(null);
  const [fromList, setFromList] = useState(false);

  const newDeck = (folderId: string | null) =>
    setNaming({
      title: 'New deck',
      label: 'Name',
      confirm: 'Create deck',
      folders: folders ?? [],
      folderId,
      onConfirm: async (name, folder) => navigate(`/thesaurus/deck/${await createDeck(lang, { name, folderId: folder })}`),
    });

  const merge = (deck: Deck) =>
    setMerging({
      title: `Merge “${deck.name}” into…`,
      decks: (allDecks ?? []).filter((d) => d.id !== deck.id && !d.deletedAt),
      onConfirm: async (into) => {
        const moved = await mergeDecks(into, [deck.id]);
        toast({ source: '{0} {1} moved', values: [String(moved), moved === 1 ? { source: 'card' } : { source: 'cards' }] }, { tone: 'success' });
      },
    });

  const actions: TreeActions = { ask: setNaming, confirm: setConfirming, move: setMoving, merge, newDeck, byHand: sort === 'hand' };

  const choose = (action: NewAction) => {
    if (action === 'deck') newDeck(null);
    else if (action === 'folder')
      setNaming({ title: 'New folder', label: 'Name', confirm: 'Create folder', folders: folders ?? [], onConfirm: (name, parent) => void createFolder(lang, name, parent) });
    else if (action === 'list') setFromList(true);
    else if (action === 'make') navigate('/thesaurus/make');
    else if (action === 'csv') void imports.pickCsv();
    else void imports.pickApkg();
  };

  const order = useMemo(() => deckOrder(sort, decks ?? [], folders ?? [], counts, outlook?.lastStudied), [sort, decks, folders, counts, outlook]);

  const closeSearch = () => {
    setQuery('');
    setSearching(false);
  };

  if (picked === 'discover') return <Navigate to={DISCOVER} replace />;
  // Where the atlas is a room of its own, its old tab address (and the word it was on) opens the room.
  if (picked === 'atlas' && shows('atlas')) return <Navigate to={`/atlas${params.get('word') ? `?${new URLSearchParams({ word: params.get('word')!, ...(params.get('view') ? { view: params.get('view')! } : {}) })}` : ''}`} replace />;
  return (
    <>
      <PageHeader
        title={translateUi('Thesaurus')}
        englishTitle={'Thesaurus'}
        actions={
          <div className="flex items-center gap-2">
            <IconButton icon={Compass} label={translateUi('Discover')} onClick={browse} />
            <NewMenu busy={imports.apkgProgress !== null} onChoose={choose} />
          </div>
        }
      />
      <RoomTabs label={translateUi('Thesaurus sections')} tabs={tabs} active={tab} keys={!searching} />

      {imports.apkgProgress !== null && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-sm font-semibold text-ink-soft" role="status"><UiText source={'Importing the Anki deck…{0}'} values={[<span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
            <span className="block h-full origin-left rounded-full bg-sage transition-transform duration-300" style={{ transform: `scaleX(${Math.max(0.04, imports.apkgProgress)})` }} />
          </span>]} /></div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {tab === 'words' ? (
          <motion.section key="words" aria-label={translateUi('Words')} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={spring.snappy}>
            <WordsView lang={lang} />
          </motion.section>
        ) : tab === 'phrases' ? <Phrasebook key={lang} lang={lang} /> : tab === 'atlas' ? (
          <Suspense key="atlas" fallback={null}>
            <AtlasTab key={lang} lang={lang} />
          </Suspense>
        ) : tab === 'decks' ? (
          <motion.div
            key="decks"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={spring.snappy}
            className="mt-2 space-y-8"
          >
            {/* Lemora U9: Today first and the decks down the right, unless the earlier design is chosen in Settings. */}
            {!settings.ui.classicDecks && !query.trim() && hasDecks && folders && decks ? (
              <DecksDesk
                lang={lang}
                decks={decks}
                folders={folders}
                counts={counts}
                totals={totals}
                forecast={outlook?.forecast}
                lastStudied={outlook?.lastStudied}
                order={order}
                tools={
                  <>
                    <IconButton icon={Search} label={translateUi('Search')} shortcut="/" onClick={() => setSearching(true)} />
                    <SortMenu value={sort} options={SORTS} onChange={(deckSort) => void patchSetting('ui', { deckSort })} />
                  </>
                }
                below={
                  <>
                    {archivedCount > 0 && (
                      <button type="button" onClick={() => setShowArchived((v) => !v)} className="text-[13.5px] font-semibold text-ink-soft underline decoration-line-strong underline-offset-4"><UiText source={'{0} {1} archived {2}'} values={[showArchived ? <UiText source={'Hide'} /> : <UiText source={'Show'} />, archivedCount, archivedCount === 1 ? <UiText source={'deck'} /> : <UiText source={'decks'} />]} /></button>
                    )}
                    <JourneySection lang={lang} onOpen={openStarter} />
                  </>
                }
              />
            ) : (<>
            {!query.trim() && (
              <section aria-label={translateUi('Today')} className="pb-1">
                <TodayCard lang={lang} totals={totals} forecast={outlook?.forecast} onDiscover={browse} />
              </section>
            )}

            <section
              aria-label={translateUi('My decks')}
              className={!query.trim() ? 'border-t border-line/60 pt-6' : undefined}
            >
              <div className="mb-5 flex h-11 items-center gap-2 border-b border-line pb-2.5">
                <div className="relative h-full min-w-0 flex-1">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {searching ? (
                      <motion.div key="search" className="absolute inset-0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={fade}>
                        <SearchInput
                          ref={searchRef}
                          value={query}
                          onChange={setQuery}
                          placeholder={translateUi('Search decks, folders and themes')}
                          onClose={closeSearch}
                          autoFocus
                        />
                      </motion.div>
                    ) : (
                      <motion.div key="title" className="flex h-full items-baseline gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
                        <h2 className="font-serif text-xl font-semibold"><UiText source={'My decks'} /></h2>
                        <span className="text-sm font-bold text-ink-faint tabular-nums">{decks?.length ?? 0}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {hasDecks && (
                  <>
                    {!searching && <IconButton icon={Search} label={translateUi('Search')} shortcut="/" onClick={() => setSearching(true)} />}
                    <SortMenu value={sort} options={SORTS} onChange={(deckSort) => void patchSetting('ui', { deckSort })} />
                    <ViewToggle view={view} onChange={(deckView) => void patchSetting('ui', { deckView })} />
                  </>
                )}
              </div>

              {query.trim() ? (
                <SearchResults lang={lang} query={query} decks={decks ?? []} folders={folders ?? []} order={order.decks} onOpenStarter={openStarter}>
                  {(found) => <DeckResults decks={found} folders={folders ?? []} counts={counts} lastStudied={outlook?.lastStudied} actions={actions} />}
                </SearchResults>
              ) : (
                <>
                  {hasDecks &&
                    folders &&
                    (view === 'cards' ? (
                      <DeckCards decks={decks!} folders={folders} counts={counts} lastStudied={outlook?.lastStudied} actions={actions} order={order} />
                    ) : (
                      <DeckTree decks={decks!} folders={folders} counts={counts} lastStudied={outlook?.lastStudied} actions={actions} order={order} />
                    ))}
                  {archivedCount > 0 && (
                    <button type="button" onClick={() => setShowArchived((v) => !v)} className="mt-5 text-[13.5px] font-semibold text-ink-soft underline decoration-line-strong underline-offset-4"><UiText source={'{0} {1} archived {2}'} values={[showArchived ? <UiText source={'Hide'} /> : <UiText source={'Show'} />, archivedCount, archivedCount === 1 ? <UiText source={'deck'} /> : <UiText source={'decks'} />]} /></button>
                  )}
                  {decks && !hasDecks && <NoDecks onBrowse={browse} onNew={() => newDeck(null)} onImport={(kind) => choose(kind)} />}
                  <JourneySection lang={lang} onOpen={openStarter} />
                </>
              )}
            </section>
            </>)}
          </motion.div>
        ) : (
          <motion.section key="dictionary" aria-label={translateUi('Dictionary')} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={spring.snappy}>
            <DictionaryView lang={lang} mode={shows('words') ? 'dictionary' : 'both'} />
          </motion.section>
        )}
      </AnimatePresence>

      <CsvImportDrawer lang={lang} source={imports.csv} folders={folders ?? []} onClose={imports.closeCsv} />
      <NameDialog request={naming} onClose={() => setNaming(null)} />
      <ConfirmDialog request={confirming} onClose={() => setConfirming(null)} />
      <MoveDialog request={moving} onClose={() => setMoving(null)} />
      <MergeDialog request={merging} onClose={() => setMerging(null)} />
      <FromListDialog open={fromList} lang={lang} onClose={() => setFromList(false)} onMade={(id) => navigate(`/thesaurus/deck/${id}`)} />
    </>
  );
}

/** My decks, before there are any: the three ways to start. */
function NoDecks({ onBrowse, onNew, onImport }: { onBrowse: () => void; onNew: () => void; onImport: (kind: 'apkg' | 'csv') => void }) {
  return (
    <Card className="flex flex-col items-center px-6 py-7 text-center sm:py-8">
      <Art name="empty" size={96} className="mb-3 text-ink-soft" />
      <p className="font-serif text-xl font-semibold"><UiText source={'No decks yet'} /></p>
      <p className="mt-1.5 max-w-sm text-[14.5px] leading-relaxed text-ink-soft"><UiText source={'Start with ready-made words, make a deck of your own, or bring one from Anki. Words you mark as Learning while reading arrive on their own.'} /></p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button icon={Sparkles} onClick={onBrowse}><UiText source={'Browse ready-made decks'} /></Button>
        <Button variant="secondary" icon={Plus} onClick={onNew}><UiText source={'New deck'} /></Button>
      </div>
      <p className="mt-4 text-[13px] text-ink-soft"><UiText source={'Or import{0}{1}{2}or{3}{4}.'} values={[' ', <button type="button" onClick={() => onImport('apkg')} className="font-semibold text-accent-text underline-offset-2 hover:underline"><UiText source={'an Anki deck'} /></button>, ' ', ' ', <button type="button" onClick={() => onImport('csv')} className="font-semibold text-accent-text underline-offset-2 hover:underline"><UiText source={'a spreadsheet (CSV)'} /></button>]} /></p>
    </Card>
  );
}

interface SearchResultsProps {
  lang: string;
  query: string;
  decks: Deck[];
  order: (a: Deck, b: Deck) => number;
  onOpenStarter: (spec: StarterSpec) => void;
  folders: Folder[];
  children: (found: Deck[]) => ReactNode;
}

/** Decks whose name matches, and ready-made themes that match by name or description. */
function SearchResults({ lang, query, decks, folders, order, onOpenStarter, children }: SearchResultsProps) {
  const list = useStarterList(lang);
  const q = searchKey(query.trim());
  // A deck matches by its own name or the name of any folder it sits in.
  const folderNames = (id: string | null): string => {
    const f = id ? folders.find((x) => x.id === id) : undefined;
    return f ? `${f.name} ${folderNames(f.parentId)}` : '';
  };
  const found = decks.filter((d) => searchKey(`${d.name} ${folderNames(d.folderId)}`).includes(q)).sort(order);
  const themes = STARTER_THEMES.filter((t) => list?.themes[t.id]?.length && searchKey(`${t.name} ${t.blurb}`).includes(q));

  if (!found.length && !themes.length) {
    return (
      <div className="flex flex-col items-center py-14 text-center text-ink-soft">
        <SearchX size={28} className="mb-3 text-ink-faint" aria-hidden />
        <p className="font-semibold text-ink"><UiText source={'No decks or themes match “{0}”'} values={[query.trim()]} /></p>
        <p className="mt-1 text-sm"><UiText source={'Try a shorter word, or browse Discover.'} /></p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {found.length > 0 && (
        <div>
          <p className="mb-2.5 text-[12px] font-bold tracking-[0.1em] text-ink-faint uppercase"><UiText source={'Your decks · {0}'} values={[found.length]} /></p>
          {children(found)}
        </div>
      )}
      {themes.length > 0 && (
        <div>
          <p className="mb-2.5 text-[12px] font-bold tracking-[0.1em] text-ink-faint uppercase"><UiText source={'Ready-made themes'} /></p>
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => {
              const Icon = THEME_ICONS[t.id];
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onOpenStarter({ kind: 'theme', id: t.id })}
                  className="no-callout flex items-center gap-2 rounded-2xl border border-line bg-raised py-2 pr-3.5 pl-2 text-sm font-semibold transition-[border-color,transform] hover:border-line-strong active:scale-[0.97]"
                >
                  <span className="grid size-8 place-items-center rounded-xl bg-sage-soft text-sage-text">
                    <Icon size={16} aria-hidden />
                  </span>
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
