import { UiText, useUi } from '@/design/i18n/UiText';
import { Link, useSearchParams } from 'react-router';
import { BookA, Brain } from 'lucide-react';
import { hasFullDictionary } from '@/core/dictionary/format';
import { getLanguage } from '@/core/lang/languages';
import { Card } from '@/design/primitives';
import { removeDictionary, useDictionaryState } from '@/services/dictionary/fullDict';
import { toast } from '@/state/ui';
import { DictionarySearch, entryPath } from './DictionarySearch';
import { PersonalDictionaryToolbar } from './DictionaryToolsPanel';
import { EntryView, InstallCard } from './Entry';
import { MemoryList, useWordMemory, WordPlaces } from './WordMemory';
import type { RememberedRow } from './WordMemory';

/**
 * Thesaurus › Dictionary: the full dictionary (core languages) and the word memory in one place.
 * Look any word up above; your own words are listed beside, and either opens on the right.
 */
export function DictionaryView({ lang, mode = 'both' }: { lang: string; mode?: 'both' | 'dictionary' }) {
  const translateUi = useUi();
  const [params, setParams] = useSearchParams();
  const word = params.get('word') ?? undefined;
  const full = hasFullDictionary(lang);
  const installed = useDictionaryState(lang);
  const ready = full && (installed?.state === 'ready' || installed?.state === 'old');
  const rows = useWordMemory(lang);
  const name = getLanguage(lang)?.name ?? lang;
  const selected = word ? rows?.find((r) => r.lemma === word || r.key === word || r.forms.includes(word)) : undefined;
  const open = (row: RememberedRow) => setParams({ tab: 'dictionary', word: row.lemma ?? row.key });

  // Lemora U10: the dictionary alone (your words have their own tab): the search with its two icons, then the word, full width.
  if (mode === 'dictionary') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          {full && <DictionarySearch lang={lang} size="lg" className="max-w-2xl flex-1" />}
          <PersonalDictionaryToolbar compact lang={lang} onOpenWord={(w) => setParams({ tab: 'dictionary', word: w })} />
          {ready && installed && <p className="ml-auto shrink-0 text-[12.5px] font-medium text-ink-faint tabular-nums"><UiText source={'{0} words · works offline'} values={[installed.words.toLocaleString()]} /></p>}
        </div>
        {full && installed?.state === 'none' && <InstallCard lang={lang} />}
        {installed?.state === 'old' && <InstallCard lang={lang} update />}
        <div className="min-w-0">{word ? <EntryView lang={lang} word={word} /> : <Welcome lang={lang} name={name} ready={ready} words={installed?.words ?? 0} recent={(rows ?? []).slice(0, 16)} />}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {full && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <DictionarySearch lang={lang} size="lg" className="max-w-2xl flex-1" />
          {ready && installed && <p className="shrink-0 text-[12.5px] font-medium text-ink-faint tabular-nums"><UiText source={'{0} words · works offline'} values={[installed.words.toLocaleString()]} /></p>}
        </div>
      )}
      {full && installed?.state === 'none' && (
        <div>
          <InstallCard lang={lang} />
        </div>
      )}
      {installed?.state === 'old' && (
        <div>
          <InstallCard lang={lang} update />
        </div>
      )}

      <PersonalDictionaryToolbar lang={lang} onOpenWord={(w) => setParams({ tab: 'dictionary', word: w })} />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section aria-label={translateUi('Your words')}>
          <header className="mb-3.5 flex items-baseline gap-2.5 border-b border-line pb-2">
            <h2 className="font-serif text-xl font-semibold"><UiText source={'Your words {0}'} values={[<span className="ml-1 font-sans text-sm font-bold text-ink-faint tabular-nums">{rows?.length ?? ''}</span>]} /></h2>
          </header>
          {rows && rows.length > 0 && <MemoryList lang={lang} rows={rows} selected={selected?.key} onSelect={open} />}
          {rows && rows.length === 0 && (
            <Card className="p-5">
              <Brain size={20} aria-hidden className="mb-2 text-sage-text" />
              <p className="text-[14px] leading-relaxed text-ink-soft"><UiText source={'Words you look up or mark while reading, listening or watching gather here, with the sentence and the place you met them.'} /></p>
            </Card>
          )}
        </section>

        <div className="min-w-0 overflow-y-auto overscroll-contain rounded-3xl border border-line/70 bg-surface p-6 shadow-elev-1 sm:p-8 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-48px)] [scrollbar-width:thin]">
          {word ? (
            <EntryView lang={lang} word={word} />
          ) : selected ? (
            <div>
              <p lang={lang} className="font-serif text-[36px] leading-tight font-semibold sm:text-[40px]">
                {selected.surface}
              </p>
              {selected.gloss && <p className="mt-1 mb-6 text-[16px] text-ink-soft">{selected.gloss}</p>}
              <WordPlaces lang={lang} sightings={selected.sightings} forms={selected.forms} />
            </div>
          ) : (
            <Welcome lang={lang} name={name} ready={ready} words={installed?.words ?? 0} recent={(rows ?? []).slice(0, 16)} />
          )}
        </div>
      </div>
    </div>
  );
}

function Welcome({ lang, name, ready, words, recent }: { lang: string; name: string; ready: boolean; words: number; recent: RememberedRow[] }) {
  const translateUi = useUi();
  return (
    <div className="py-6 text-center">
      <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-sage-soft text-sage-text">
        <BookA size={26} aria-hidden />
      </span>
      <p className="font-serif text-2xl font-semibold">{ready ? translateUi('Look up any word') : translateUi('Your words')}</p>
      <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
        {ready ? translateUi('{0} {1} words, from Wiktionary. Type above, choose one of your words, or right-click a word while reading and choose Open dictionary.', [words.toLocaleString(), name]) : translateUi('Choose one of your words to see where you met it.')}
      </p>
      {recent.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {recent.map((r) => (
            <Link key={r.key} to={entryPath(r.lemma ?? r.key)} lang={lang} className="rounded-full bg-surface px-3.5 py-1.5 font-serif text-[16px] transition-colors hover:bg-sunken">
              {r.surface}
            </Link>
          ))}
        </div>
      )}
      {ready && (
        <button
          type="button"
          onClick={() => void removeDictionary(lang).then(() => toast('The dictionary was removed from this device.'))}
          className="hit mt-10 text-[12.5px] font-semibold text-ink-faint underline-offset-2 hover:text-ink-soft hover:underline"
        ><UiText source={'Remove the dictionary from this device'} /></button>
      )}
    </div>
  );
}

/** Lemora U10: your words, a tab of their own: every word you looked up or marked, and where you met it. */
export function WordsView({ lang }: { lang: string }) {
  const [params, setParams] = useSearchParams();
  const word = params.get('word') ?? undefined;
  const rows = useWordMemory(lang);
  const selected = word ? rows?.find((r) => r.lemma === word || r.key === word || r.forms.includes(word)) : rows?.[0];
  const open = (row: RememberedRow) => setParams({ tab: 'words', word: row.lemma ?? row.key });
  if (rows && rows.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-ink-soft">
        <Brain size={24} aria-hidden className="mx-auto mb-3 text-sage-text" />
        <p className="text-[14.5px] leading-relaxed"><UiText source={'Words you look up or mark while reading, listening or watching gather here, with the sentence and the place you met them.'} /></p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section aria-label={'Words'}>{rows && <MemoryList lang={lang} rows={rows} selected={selected?.key} onSelect={open} />}</section>
      <div className="min-w-0 lg:sticky lg:top-6">
        {selected && (selected.lemma || hasFullDictionary(lang) ? <EntryView lang={lang} word={selected.lemma ?? selected.key} /> : (
          <div>
            <p lang={lang} className="font-serif text-[36px] leading-tight font-semibold">{selected.surface}</p>
            {selected.gloss && <p className="mt-1 mb-6 text-[16px] text-ink-soft">{selected.gloss}</p>}
            <WordPlaces lang={lang} sightings={selected.sightings} forms={selected.forms} />
          </div>
        ))}
      </div>
    </div>
  );
}

