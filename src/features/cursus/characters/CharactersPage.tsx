import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useApp } from '@/app/context';
import { PageHeader } from '@/app/PageHeader';
import { Button, Card, Select } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { CATEGORY_LABELS, characterInfo, codeLabel, findCharacters, lookalikes, scriptOf } from '@/core/script/unicode';
import type { CharacterInfo, UnicodeIndex, UnicodeShard } from '@/core/script/unicode';
import { getLanguage } from '@/core/lang/languages';
import { howToType, LANG_LAYOUT } from '@/core/typing/layouts';
import type { CharReadings } from '@/core/script/hanzi';
import { loadUnicodeIndex, loadUnicodeReadings, loadUnicodeScript } from '@/services/script/unicode';
import type { UnicodeAsset } from '@/services/script/unicode';
import { cx } from '@/lib/cx';

const SCRIPT_NAMES: Record<string, string> = { Latn: 'Latin', Cyrl: 'Cyrillic', Grek: 'Greek', Arab: 'Arabic', Hans: 'Han', Hant: 'Han', Jpan: 'Hiragana', Kore: 'Hangul', Deva: 'Devanagari', Thai: 'Thai', Taml: 'Tamil', Geor: 'Georgian', Beng: 'Bengali', Guru: 'Gurmukhi', Hebr: 'Hebrew', Armn: 'Armenian', Mymr: 'Myanmar', Khmr: 'Khmer', Ethi: 'Ethiopic' };
const sequences = (s: string) => [...s].map((c) => codeLabel(c.codePointAt(0)!)).join(' ');
const visible = (s: string) => [...s].slice(0, 80).join('') + ([...s].length > 80 ? '…' : '');
const field = 'w-full rounded-xl border border-line bg-raised px-3 py-2 text-[15px] text-ink';

export default function CharactersPage() {
  const ui = useUi();
  const [params] = useSearchParams();
  const [index, setIndex] = useState<UnicodeAsset<UnicodeIndex>>();
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    setError('');
    void loadUnicodeIndex().then((data) => live && setIndex(data)).catch((e: Error) => live && setError(e.message));
    return () => { live = false; };
  }, [retry]);
  return <>
    <PageHeader title={ui('Characters')} eyebrow={ui('Unicode character reference')} actions={<Link className="text-[14px] font-semibold text-accent-text hover:underline" to="/cursus"><UiText source="Back to Cursus" /></Link>} />
    {error && <Card><p role="alert">{ui(error)}</p><Button onClick={() => setRetry((n) => n + 1)}>{ui('Try again')}</Button></Card>}
    {!index && !error && <p role="status">{ui('Loading character reference…')}</p>}
    {index && <Reference index={index.data} indexOffline={index.offline} initial={params.get('text') ?? 'aаα'} />}
  </>;
}

function Reference({ index, indexOffline, initial }: { index: UnicodeIndex; indexOffline: boolean; initial: string }) {
  const ui = useUi();
  const { language } = useApp();
  const [text, setText] = useState(initial);
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const [script, setScript] = useState(SCRIPT_NAMES[getLanguage(language.id)?.script ?? 'Latn'] ?? 'Latin');
  const blocks = useMemo(() => index.blocks.filter(([a, b]) => index.scripts.some(([c, d, s]) => s === script && c <= b && d >= a)), [index, script]);
  const [blockId, setBlockId] = useState('');
  const block = blocks.find(([start]) => String(start) === blockId) ?? blocks[0];
  const [page, setPage] = useState(0);
  const [textPage, setTextPage] = useState(0);
  const [selected, setSelected] = useState(initial.codePointAt(0) ?? 0x61);
  const [shards, setShards] = useState<Record<string, UnicodeAsset<UnicodeShard>>>({});
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const pasted = useMemo(() => [...new Set([...text].map((c) => c.codePointAt(0)!))], [text]);
  const textPoints = pasted.slice(textPage * 48, (textPage + 1) * 48);
  const results = useMemo(() => findCharacters(index, deferred, script, block, page), [index, deferred, script, block, page]);
  const needed = [...new Set([...results, ...textPoints, selected].map((cp) => scriptOf(index, cp)))].sort().join(',');
  useEffect(() => {
    let live = true;
    setError('');
    void Promise.all(needed.split(',').map(async (name) => [name, await loadUnicodeScript(name)] as const)).then((data) => {
      if (live) setShards((old) => ({ ...old, ...Object.fromEntries(data) }));
    }).catch((e: Error) => live && setError(e.message));
    return () => { live = false; };
  }, [needed, retry]);
  const details = (cp: number) => { const data = shards[scriptOf(index, cp)]; return data ? characterInfo(index, data.data, cp) : undefined; };
  const info = details(selected);
  const ready = needed.split(',').every((s) => Boolean(shards[s]));
  const offline = indexOffline && needed.split(',').every((s) => shards[s]?.offline);
  const buttons = (points: number[]) => <div className="mt-3 grid grid-cols-8 gap-1.5" dir="ltr">{points.map((cp) => <button key={cp} type="button" aria-pressed={selected === cp} aria-label={`${codeLabel(cp)} ${details(cp)?.name ?? ''}`} title={`${codeLabel(cp)} ${details(cp)?.name ?? ''}`} onClick={() => setSelected(cp)} className={cx('min-h-12 min-w-0 rounded-lg border px-1 py-1.5 transition-colors hover:border-line-strong', selected === cp ? 'border-accent-text bg-accent-soft' : 'border-line bg-surface')}><bdi className="block font-serif text-[23px] leading-7">{/[\p{C}\p{Z}]/u.test(String.fromCodePoint(cp)) ? '·' : String.fromCodePoint(cp)}</bdi><span className="block text-[9px] text-ink-soft">{codeLabel(cp).slice(2)}</span></button>)}</div>;
  return <>
    <p className="mb-4 text-[13px] text-ink-soft" role="status">{offline ? ui('Ready offline for the characters shown. Other scripts need one first visit online.') : ready ? ui('The reference is loaded, but it could not be saved offline. A connection is needed after reopening.') : ui('Character data loads on first use. It works offline after it is saved on this device.')}</p>
    {error && <div role="alert" className="mb-4 rounded-xl border border-accent-text bg-accent-soft p-3">{ui(error)} <button type="button" className="font-semibold underline" onClick={() => setRetry((n) => n + 1)}>{ui('Try again')}</button></div>}
    <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-5">
      <div className="min-w-0 space-y-5">
        <Card>
          <label htmlFor="unicode-text" className="mb-2 block font-serif text-[21px] font-semibold">{ui('Inspect a text')}</label>
          <textarea id="unicode-text" value={text} onChange={(e) => { setText(e.target.value); setTextPage(0); if (e.target.value) setSelected(e.target.value.codePointAt(0)!); }} rows={2} dir="auto" className={field + ' font-serif text-[21px]'} placeholder={ui('Paste or type here')} />
          <p className="mt-2 text-[12px] text-ink-soft">{ui('Each tile is one code point, including spaces and combining marks. Repeated characters appear once. Text stays on this device.')}</p>
          {buttons(textPoints)}
          {pasted.length > 48 && <Pager page={textPage} next={(textPage + 1) * 48 < pasted.length} onPage={setTextPage} />}
          {!pasted.length && <p className="mt-3 text-ink-soft">{ui('Paste a text to inspect its characters.')}</p>}
          {text && <div className="mt-4 border-t border-line pt-3 text-[13px]"><p className="text-ink-soft">{ui('Normalization of the text (preview up to 80 code points)')}</p>{(['NFC', 'NFD'] as const).map((form) => <p key={form} className="mt-1 break-all"><b>{form}</b> <bdi className="font-serif text-[17px]">{visible(text.normalize(form))}</bdi><span className="ml-2 font-mono text-[11px] text-ink-soft">{sequences([...text.normalize(form)].slice(0, 80).join(''))}</span></p>)}</div>}
        </Card>
        <Card>
          <label htmlFor="unicode-search" className="mb-2 block font-serif text-[21px] font-semibold">{ui('Find a character')}</label>
          <input id="unicode-search" className={field} value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder={ui('Character, official name, or U+0041')} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Select label={ui('Script')} value={script} onChange={(s) => { setScript(s); setBlockId(''); setPage(0); setQuery(''); }} options={index.files.map((s) => ({ value: s, label: s.replaceAll('_', ' ') }))} />
            <Select label={ui('Block')} value={String(block[0])} onChange={(b) => { setBlockId(b); setPage(0); setQuery(''); }} options={blocks.map((b) => ({ value: String(b[0]), label: b[2] }))} />
          </div>
          <p className="mt-2 text-[12px] text-ink-soft">{query ? ui('Name searches cover all scripts; up to 96 matches are shown. Refine the search for more specific results.') : ui('Browse the selected script by Unicode block. Unassigned positions are labelled in the details.')}</p>
          {buttons(results)}
          {!results.length && <p className="mt-3 text-ink-soft">{ui('No matching characters. Try a name such as LATIN SMALL LETTER A or a code point such as U+0061.')}</p>}
          {!query && <Pager page={page} next={findCharacters(index, '', script, block, page + 1).length > 0} onPage={setPage} />}
        </Card>
      </div>
      <aside className="sticky top-5 min-w-0" aria-label={ui('Character details')}>
        {info ? <Details info={info} index={index} onSelect={setSelected} onInspect={(s) => { setText(s); setTextPage(0); setSelected(s.codePointAt(0)!); }} /> : <Card><p role="status">{ui('Loading character details…')}</p></Card>}
      </aside>
    </div>
    <p className="mt-5 text-[12px] text-ink-soft">{ui('Unicode')} {index.version} · <a className="underline" href="https://www.unicode.org/Public/17.0.0/ucd/" target="_blank" rel="noreferrer">{ui('Character data')}</a> · <a className="underline" href={`${import.meta.env.BASE_URL}chars/unicode/LICENSE.txt`} target="_blank" rel="noreferrer">{ui('Unicode licence')}</a> · {ui('Names are official Unicode names, shown in English. Normalization uses this device’s Unicode support.')}</p>
  </>;
}

function Pager({ page, next, onPage }: { page: number; next: boolean; onPage: (page: number) => void }) {
  const ui = useUi();
  return <div className="mt-3 flex items-center justify-between text-[13px]"><button className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40" disabled={!page} onClick={() => onPage(page - 1)}>{ui('Previous')}</button><span>{ui('Page {0}', [page + 1])}</span><button className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40" disabled={!next} onClick={() => onPage(page + 1)}>{ui('Next')}</button></div>;
}

function Details({ info, index, onSelect, onInspect }: { info: CharacterInfo; index: UnicodeIndex; onSelect: (cp: number) => void; onInspect: (s: string) => void }) {
  const ui = useUi();
  const { language } = useApp();
  const [readings, setReadings] = useState<UnicodeAsset<Record<string, CharReadings>>>();
  const [readingError, setReadingError] = useState(false);
  const [readingRetry, setReadingRetry] = useState(0);
  const [copied, setCopied] = useState('');
  useEffect(() => {
    let live = true;
    setReadingError(false);
    setCopied('');
    if (info.script === 'Han') void loadUnicodeReadings().then((r) => live && setReadings(r)).catch(() => live && setReadingError(true));
    return () => { live = false; };
  }, [info.script, info.cp, readingRetry]);
  const aliases = useMemo(() => lookalikes(index, info.char), [index, info.char]);
  const typing = LANG_LAYOUT[language.id] ? howToType(LANG_LAYOUT[language.id], info.char) : null;
  const reading = readings?.data[info.char];
  const pairs: Array<[string, string]> = [['Code point', codeLabel(info.cp)], ['Script', info.script.replaceAll('_', ' ')], ['Block', info.block], ['General category', `${ui(CATEGORY_LABELS[info.category] ?? info.category)} (${info.category})`], ['Simple uppercase', info.upper], ['Simple lowercase', info.lower], ['NFC', `${info.nfc} · ${sequences(info.nfc)}`], ['NFD', `${info.nfd} · ${sequences(info.nfd)}`], ['UTF-8 bytes (hex)', info.utf8 ?? ui('No UTF-8 encoding for an isolated surrogate')]];
  return <Card>
    <bdi className="block text-center font-serif text-[80px] leading-tight">{/[\p{C}\p{Z}]/u.test(info.char) ? '·' : info.char}</bdi>
    <h2 className="mt-3 break-words text-[14px] font-semibold" dir="ltr">{info.name || ui(info.noncharacter ? 'Noncharacter — permanently reserved' : info.category === 'Co' ? 'Private-use character — no official name' : info.category === 'Cs' ? 'Surrogate — not a standalone Unicode character' : info.category === 'Cc' ? 'Control character — no official name' : 'Unassigned code point — no official name')}</h2>
    {info.controlLabel && <p className="mt-1 text-[12px] text-ink-soft">{ui('Unicode 1.0 label')}: {info.controlLabel}</p>}
    <dl className="mt-4 space-y-2">{pairs.map(([label, value]) => <div key={label}><dt className="text-[11px] font-semibold text-ink-soft">{ui(label)}</dt><dd className="break-words text-[14px]" dir="ltr"><bdi>{value}</bdi></dd></div>)}</dl>
    <p className="mt-2 text-[11px] text-ink-soft">{ui('Simple case pairs do not include multi-character changes such as ß → SS.')}</p>
    <Button className="mt-4" onClick={() => { if (!navigator.clipboard) { setCopied(ui('Could not copy. Select the character above to copy it.')); return; } void navigator.clipboard.writeText(info.char).then(() => setCopied(ui('Copied'))).catch(() => setCopied(ui('Could not copy. Select the character above to copy it.'))); }}>{ui('Copy character')}</Button><p className="mt-1 text-[12px]" role="status">{copied}</p>
    <div className="mt-4 border-t border-line pt-3"><h3 className="text-[14px] font-semibold">{ui('How to type it')}</h3><p className="mt-1 text-[13px] text-ink-soft">{typing ? `${getLanguage(language.id)?.name}: ${typing}` : ui('Use your system’s character viewer or copy the character. Choose the matching language keyboard for direct typing.')}</p>{getLanguage(language.id)?.tier === 1 && <Link className="mt-2 inline-block text-[13px] text-accent-text underline" to="/cursus/typing">{ui('Open the current language’s typing layout')}</Link>}</div>
    <div className="mt-4 border-t border-line pt-3"><h3 className="text-[14px] font-semibold">{ui('Possible lookalikes')}</h3>{aliases.length ? <><p className="mt-1 text-[12px] text-ink-soft">{ui('These may look similar but have different code points. This is a reference, not a security verdict.')}</p><div className="mt-2 flex flex-wrap gap-2" dir="ltr">{aliases.map((s) => <button key={s} type="button" className="rounded-lg border border-line px-2 py-1 text-[17px]" title={ui('Inspect {0}', [sequences(s)])} onClick={() => [...s].length > 1 ? onInspect(s) : onSelect(s.codePointAt(0)!)}><bdi>{s}</bdi> <span className="text-[10px]">{sequences(s)}</span></button>)}</div></> : <p className="mt-1 text-[12px] text-ink-soft">{ui('No lookalike mapping in this dataset. This does not prove the character is visually unique.')}</p>}</div>
    {info.script === 'Han' && <div className="mt-4 border-t border-line pt-3"><h3 className="text-[14px] font-semibold">{ui('Bundled CJK readings')}</h3>{reading ? <div className="mt-2 space-y-1 text-[13px]">{reading.d && <p>{reading.d}</p>}{reading.on && <p>{ui('Japanese on (romaji)')}: {reading.on.join(', ')}</p>}{reading.kun && <p>{ui('Japanese kun (romaji)')}: {reading.kun.join(', ')}</p>}{reading.ko && <p>{ui('Korean')}: <bdi>{reading.ko.join(', ')}</bdi></p>}<p className="text-[11px] text-ink-soft">{ui('Unihan')} · {readings?.offline ? ui('Saved offline') : ui('Not saved offline')}</p></div> : <div className="mt-2 text-[12px] text-ink-soft"><p>{readingError ? ui('Readings are unavailable. Connect once to save them offline.') : readings ? ui('No bundled reading for this character.') : ui('Loading readings…')}</p>{readingError && <button type="button" className="mt-1 underline" onClick={() => setReadingRetry((n) => n + 1)}>{ui('Try again')}</button>}</div>}</div>}
  </Card>;
}
