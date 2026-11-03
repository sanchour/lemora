import { UiText, useUi } from '@/design/i18n/UiText';
import { useMemo, useState } from 'react';
import { CheckSquare, Library, Square, Star } from 'lucide-react';
import type { GoodreadsBook } from '@/core/parsers/goodreads';
import { parseGoodreadsCsv } from '@/core/parsers/goodreads';
import { addShelfItems } from '@/data/library';
import { Button, Card, SearchInput, Segmented } from '@/design/primitives';
import { pickFile } from '@/services/files/files';
import { importGoodreads } from '@/services/import/importers';
import { toast } from '@/state/ui';

type ShelfFilter = 'all' | 'reading' | 'to-read' | 'read';

/** Choosing a Goodreads export: new books are added, books already here take its shelves, ratings and dates. */
export function useGoodreadsImport(lang: string, onDone?: () => void) {
  const [busy, setBusy] = useState(false);
  const choose = async () => {
    const file = await pickFile('.csv,text/csv');
    if (!file) return;
    setBusy(true);
    try {
      const added = await importGoodreads(lang, file);
      toast(added ? { source: 'Added {0} {1} to your Goodreads shelves.', values: [String(added), added === 1 ? { source: 'book' } : { source: 'books' }] } : 'Your Goodreads shelves are up to date.', { tone: 'success' });
      onDone?.();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That file couldn’t be read.', { tone: 'error' });
    } finally {
      setBusy(false);
    }
  };
  return { busy, choose };
}

export function GoodreadsImport({ lang, onDone }: { lang: string; onDone?: () => void }) {
  const translateUi = useUi();
  const [busy, setBusy] = useState(false);
  const [books, setBooks] = useState<GoodreadsBook[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [shelfFilter, setShelfFilter] = useState<ShelfFilter>('all');
  const [query, setQuery] = useState('');
  const [shelfOverrides, setShelfOverrides] = useState<Map<string, GoodreadsBook['shelf']>>(new Map());

  const chooseFile = async () => {
    const file = await pickFile('.csv,text/csv');
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = parseGoodreadsCsv(text);
      if (!parsed.length) {
        toast('No books found in this file.', { tone: 'error' });
        return;
      }
      setBooks(parsed);
      // Pre-select all books initially
      setSelectedIds(new Set(parsed.map((b) => b.bookId ?? b.title)));
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That file couldn’t be read.', { tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const idOf = (b: GoodreadsBook) => b.bookId ?? b.title;

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    const q = query.trim().toLowerCase();
    return books.filter((b) => {
      const currentShelf = shelfOverrides.get(idOf(b)) ?? b.shelf;
      if (shelfFilter !== 'all' && currentShelf !== shelfFilter) return false;
      if (q && !b.title.toLowerCase().includes(q) && !(b.author ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [books, shelfFilter, query, shelfOverrides]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!books) return;
    const allFilteredSelected = filteredBooks.every((b) => selectedIds.has(idOf(b)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const b of filteredBooks) {
        const id = idOf(b);
        if (allFilteredSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  };

  const setBookShelf = (id: string, shelf: GoodreadsBook['shelf']) => {
    setShelfOverrides((prev) => {
      const next = new Map(prev);
      next.set(id, shelf);
      return next;
    });
  };

  const addSelected = async () => {
    if (!books) return;
    const toAdd = books
      .filter((b) => selectedIds.has(idOf(b)))
      .map((b) => ({
        ...b,
        shelf: shelfOverrides.get(idOf(b)) ?? b.shelf,
      }));

    if (!toAdd.length) {
      toast('Select at least one book to add.');
      return;
    }

    setBusy(true);
    try {
      await addShelfItems(lang, toAdd);
      toast('Added to your library.', { tone: 'success' });
      onDone?.();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not add the books.', { tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  // Step 1: File selection
  if (!books) {
    return (
      <Card className="max-w-2xl p-6">
        <p className="font-serif text-xl font-semibold"><UiText source={'Bring your Goodreads shelves'} /></p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[14.5px] leading-relaxed text-ink-soft">
          <li><UiText source={'On goodreads.com, open My Books → Import and export.'} /></li>
          <li><UiText source={'Choose “Export Library” and download the CSV file.'} /></li>
          <li><UiText source={'Choose it below. Your shelves, ratings and dates come along; add an EPUB to any book to read it here.'} /></li>
        </ol>
        <Button className="mt-5" icon={Library} loading={busy} onClick={() => void chooseFile()}><UiText source={'Choose the Goodreads CSV'} /></Button>
      </Card>
    );
  }

  // Step 2: Choose what to add and how
  const allFilteredSelected = filteredBooks.length > 0 && filteredBooks.every((b) => selectedIds.has(idOf(b)));

  return (
    <Card className="max-w-3xl p-6 space-y-5">
      <div>
        <p className="font-serif text-2xl font-semibold text-ink"><UiText source={'Your Goodreads books'} /></p>
        <p className="mt-1 text-sm text-ink-soft"><UiText source={'Choose it below. Your shelves, ratings and dates come along; add an EPUB to any book to read it here.'} /></p>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented<ShelfFilter>
          label={translateUi('Shelf')}
          value={shelfFilter}
          onChange={setShelfFilter}
          options={[
            { value: 'all', label: translateUi('All') },
            { value: 'reading', label: translateUi('Reading') },
            { value: 'to-read', label: translateUi('Next up') },
            { value: 'read', label: translateUi('Finished') },
          ]}
        />
        <div className="w-full sm:w-64">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={translateUi('Search titles and authors')}
            onClose={() => setQuery('')}
          />
        </div>
      </div>

      {/* Select all toggle */}
      <div className="flex items-center justify-between border-b border-line pb-2 text-xs font-semibold text-ink-faint">
        <button
          type="button"
          onClick={toggleSelectAll}
          className="flex items-center gap-2 hover:text-ink transition-colors"
        >
          {allFilteredSelected ? <CheckSquare size={16} className="text-accent" /> : <Square size={16} />}
          <UiText source={'Select all'} />
        </button>
        <span className="tabular-nums">
          {selectedIds.size} / {books.length}
        </span>
      </div>

      {/* Book selection list */}
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {filteredBooks.map((b) => {
          const id = idOf(b);
          const isSelected = selectedIds.has(id);
          const currentShelf = shelfOverrides.get(id) ?? b.shelf;
          return (
            <div
              key={id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                isSelected ? 'border-line-strong bg-raised' : 'border-line/60 bg-surface/40 opacity-70'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleSelect(id)}
                className="grid size-6 shrink-0 place-items-center text-ink hover:text-accent"
                aria-label={b.title}
              >
                {isSelected ? <CheckSquare size={18} className="text-accent" /> : <Square size={18} />}
              </button>

              <div className="min-w-0 flex-1">
                <p lang={lang} className="truncate font-serif text-[15px] font-semibold text-ink">
                  {b.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-ink-soft">
                  {b.author && <span className="truncate">{b.author}</span>}
                  {b.rating ? (
                    <span className="inline-flex items-center gap-0.5 text-ink-faint">
                      <Star size={11} className="fill-current text-accent" aria-hidden />
                      {b.rating}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Shelf destination selector */}
              <div className="shrink-0">
                <select
                  value={currentShelf}
                  onChange={(e) => setBookShelf(id, e.target.value as GoodreadsBook['shelf'])}
                  className="rounded-lg border border-line bg-surface px-2 py-1 text-xs font-semibold text-ink"
                  aria-label={translateUi('Shelf')}
                >
                  <option value="reading">{translateUi('Reading')}</option>
                  <option value="to-read">{translateUi('Next up')}</option>
                  <option value="read">{translateUi('Finished')}</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-line pt-4">
        <Button
          loading={busy}
          disabled={selectedIds.size === 0}
          onClick={() => void addSelected()}
        >
          <UiText source={'Add to your library'} />
        </Button>
        <Button variant="ghost" onClick={() => setBooks(null)}>
          <UiText source={'Cancel'} />
        </Button>
      </div>
    </Card>
  );
}
