import { UiText, useUi } from '@/design/i18n/UiText';
import { useNavigate, useSearchParams } from 'react-router';
import { phraseToCard } from '@/data/notebook';
import { phrasebookSpecs } from '@/core/exercise/phrasebook';
import { templateSlots } from '@/core/notebook/library';
import { PhraseRecall } from './Recall';
import { TemplateForm } from './Template';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, FileSpreadsheet, Plus, Search } from 'lucide-react';
import { Art, Hand } from '@/design/drawings';
import { filterLibrary, PHRASE_KINDS, tagsOf } from '@/core/notebook/library';
import type { SavedPhrase } from '@/core/notebook/library';
import { db } from '@/data/db';
import { newPhrase, removeLibrary, saveLibrary, useLibrary } from '@/data/notebook';
import { phrasebookToCsv, phrasebookToMarkdown, saveFile, savedPhrasesForExport } from '@/services/export';
import { Button, Drawer, IconButton } from '@/design/primitives';
import { SpeakButton } from '@/features/speech/SpeakButton';
import { Field, inputClass } from '@/features/notebook/fields';
import { toast } from '@/state/ui';

export function Phrasebook({ lang }: { lang: string }) {
  const t = useUi(); const navigate = useNavigate(); const [practice, setPractice] = useState<SavedPhrase[] | null>(null); const [template, setTemplate] = useState<SavedPhrase | null>(null); const [makingCard, setMakingCard] = useState(false);
  const data = useLibrary('phrasebook', lang);
  const [params] = useSearchParams();
  const requested = params.get('phrase');
  const [query, setQuery] = useState(''); const [folder, setFolder] = useState(''); const [kind, setKind] = useState('');
  const [selected, select] = useState<string>(); const [editing, edit] = useState<SavedPhrase | null>(null);
  useEffect(() => { if (requested) { select(requested); setQuery(''); setFolder(''); setKind(''); } }, [requested, lang]);
  const list = filterLibrary(data?.items ?? [], query, folder).filter((p) => !kind || p.kind === kind);
  const phrase = list.find((p) => p.id === selected) ?? list[0];
  const folders = [...new Set((data?.items ?? []).map((p) => p.folder).filter(Boolean))].sort();
  const exportList = (csv: boolean) => {
    const items = savedPhrasesForExport(list);
    void saveFile(`phrasebook-${lang}.${csv ? 'csv' : 'md'}`, new Blob([csv ? phrasebookToCsv(items) : phrasebookToMarkdown(items, lang)], { type: csv ? 'text/csv;charset=utf-8' : 'text/markdown;charset=utf-8' }));
  };
  if (practice) return <PhraseRecall phrases={practice} onDone={() => setPractice(null)} />;
  return (
    <section className="space-y-6" aria-label={t('Phrasebook')}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-baseline gap-2.5">
          <h2 className="font-serif text-xl font-semibold"><UiText source="Your phrasebook" /></h2>
          <span className="text-sm font-bold text-ink-faint tabular-nums">{list.length}</span>
        </div>
        {/* Lemora U11: quiet icons for the less used actions; the drawn circle for practising. */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" disabled={!phrasebookSpecs(list).length} onClick={() => setPractice(list)} aria-label={t('Practise recall')} title={t('Practise recall')} className="grid size-10 place-items-center rounded-full border border-line transition-[transform,border-color] hover:-rotate-6 hover:border-line-strong disabled:opacity-40">
            <Hand name="repeat" size={22} />
          </button>
          <IconButton icon={Download} label={t('Export Markdown')} disabled={!list.length} onClick={() => exportList(false)} />
          <IconButton icon={FileSpreadsheet} label={t('Export CSV')} disabled={!list.length} onClick={() => exportList(true)} />
          <Button size="sm" icon={Plus} onClick={() => edit(newPhrase(lang))}>
            <UiText source="New phrase" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(200px,1fr)_190px_190px]">
        <Field title={t('Search phrases')}>
          <div className="relative">
            <Search className="pointer-events-none absolute top-3 left-3 text-ink-faint" size={16} />
            <input
              aria-label={t('Search phrases')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={inputClass + ' pl-9'}
            />
          </div>
        </Field>
        <Field title={t('Folder or trip')}>
          <select className={inputClass} value={folder} onChange={(e) => setFolder(e.target.value)}>
            <option value="">{t('Every folder')}</option>
            {folders.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field title={t('Kind')}>
          <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">{t('Every kind')}</option>
            {PHRASE_KINDS.map((k) => (
              <option key={k} value={k}>
                {t(k)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {data?.error && <p role="alert">{data.error}</p>}

      {!phrase ? (
        <div className="p-10 text-center text-ink-soft">
          <Art name="empty" size={110} className="mx-auto mb-4 text-ink-soft" />
          <p className="font-serif text-lg font-semibold text-ink"><UiText source="Save your first phrase, or change the filters." /></p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
            <UiText source="Phrases, replies and templates you choose. Text and attached audio stay on this device and work offline." />
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ul aria-label={t('Saved phrases')} className="max-h-[68vh] divide-y divide-line/70 overflow-y-auto border-y border-line/70 pr-1 [scrollbar-width:thin]">
            {list.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={phrase.id === p.id}
                  onClick={() => select(p.id)}
                  className={
                    'relative w-full py-3 pr-2 pl-4 text-left transition-colors ' +
                    (phrase.id === p.id ? 'text-ink before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full before:bg-accent' : 'text-ink-soft hover:text-ink')
                  }
                >
                  <span lang={lang} className="block font-serif text-[17px] leading-snug font-semibold text-ink">
                    {p.text}
                  </span>
                  {p.translation && <span className="mt-0.5 block truncate text-[13px] text-ink-soft">{p.translation}</span>}
                </button>
              </li>
            ))}
          </ul>

          <article className="min-w-0 lg:border-l lg:border-line/70 lg:pl-10">
            <p className="text-[11.5px] font-bold tracking-[0.12em] text-ink-faint uppercase">
              {[t(phrase.kind), phrase.folder, phrase.situation, phrase.topic, ...phrase.tags].filter(Boolean).join(' · ')}
            </p>
            <h3 lang={lang} dir="auto" className="mt-2 font-serif text-2xl leading-snug font-semibold sm:text-3xl">
              {phrase.text}
            </h3>
            {phrase.translation && (
              <p className="mt-2 whitespace-pre-wrap font-serif text-lg text-ink-soft">{phrase.translation}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2 border-y border-line/60 py-3.5">
              <SpeakButton lang={lang} text={phrase.text} />
              <Button
                size="sm"
                variant="secondary"
                disabled={makingCard || !phrase.translation.trim()}
                onClick={() => {
                  setMakingCard(true);
                  void phraseToCard(phrase)
                    .then((id) =>
                      toast('Phrase card is ready.', {
                        action: { label: 'Open deck', onClick: () => navigate('/thesaurus/deck/' + id) },
                      }),
                    )
                    .catch((e: unknown) => toast(e instanceof Error ? e.message : 'Could not make the card.', { tone: 'error' }))
                    .finally(() => setMakingCard(false));
                }}
              >
                <UiText source="Make a card" />
              </Button>
              {templateSlots(phrase.text).length > 0 && (
                <Button size="sm" variant="secondary" onClick={() => setTemplate(phrase)}>
                  <UiText source="Use template" />
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => edit(phrase)}>
                <UiText source="Edit phrase" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  void removeLibrary('phrasebook', phrase)
                    .then(() =>
                      toast('Phrase removed.', {
                        action: {
                          label: 'Undo',
                          onClick: () => {
                            void saveLibrary('phrasebook', phrase);
                          },
                        },
                      }),
                    )
                    .catch((e: unknown) => toast(e instanceof Error ? e.message : 'Could not remove the phrase.', { tone: 'error' }))
                }
              >
                <UiText source="Remove phrase" />
              </Button>
            </div>

            {phrase.audioBlobId && <AudioClip id={phrase.audioBlobId} />}

            {(phrase.formal || phrase.informal) && (
              <div className="mt-5 space-y-2 rounded-2xl bg-sunken/50 p-4 text-sm">
                {phrase.formal && (
                  <p>
                    <strong className="font-semibold text-ink-soft"><UiText source="Formal" />: </strong>
                    <span lang={lang} className="font-serif text-[16px]">{phrase.formal}</span>
                  </p>
                )}
                {phrase.informal && (
                  <p>
                    <strong className="font-semibold text-ink-soft"><UiText source="Informal" />: </strong>
                    <span lang={lang} className="font-serif text-[16px]">{phrase.informal}</span>
                  </p>
                )}
              </div>
            )}

            {phrase.notes && <p className="mt-4 whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-soft">{phrase.notes}</p>}

            {phrase.source && (
              <p className="mt-4 break-words text-xs text-ink-faint">
                <UiText source="Source" />:{' '}
                {phrase.source.startsWith('/') && !phrase.source.startsWith('//') ? (
                  <Link className="underline" to={phrase.source}>
                    {phrase.source}
                  </Link>
                ) : (
                  phrase.source
                )}
              </p>
            )}
          </article>
        </div>
      )}

      {template && (
        <TemplateForm
          phrase={template}
          onClose={() => setTemplate(null)}
          onMake={(p) => {
            setTemplate(null);
            edit(p);
          }}
        />
      )}
      {editing && (
        <PhraseEditor
          initial={editing}
          onClose={() => edit(null)}
          onSaved={(p) => {
            select(p.id);
            edit(null);
          }}
        />
      )}
    </section>
  );
}
export function AudioClip({ id }: { id: string }) {
  const t = useUi();
  const blob = useLiveQuery(() => db.blobs.get(id), [id]); const [url, setUrl] = useState('');
  useEffect(() => { if (!blob?.blob) return; const next = URL.createObjectURL(blob.blob); setUrl(next); return () => URL.revokeObjectURL(next); }, [blob]);
  return url ? <audio className="mt-4 w-full" controls src={url} aria-label={t('Attached phrase audio')} /> : <p className="mt-3 text-sm text-ink-soft"><UiText source="Attached audio is not on this device. Restore a backup with media to hear it." /></p>;
}
export function PhraseEditor({ initial, onClose, onSaved }: { initial: SavedPhrase; onClose: () => void; onSaved: (p: SavedPhrase) => void }) {
  const t = useUi(); const [draft, setDraft] = useState(initial); const [audio, setAudio] = useState<File>(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const field = (key: 'text' | 'translation' | 'situation' | 'topic' | 'formal' | 'informal' | 'notes' | 'folder' | 'source', title: string, multiline = false) => <Field title={title}>{multiline ? <textarea lang={key === 'text' ? draft.lang : undefined} dir="auto" className={inputClass} rows={3} maxLength={key === 'text' ? 4000 : 10000} value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} /> : <input className={inputClass} value={draft[key]} maxLength={key === 'folder' ? 120 : 1000} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />}</Field>;
  const close = () => { if (!busy && (JSON.stringify(draft) === JSON.stringify(initial) && !audio || window.confirm(t('Discard unsaved changes?')))) onClose(); };
  const save = async () => { setBusy(true); setError(''); try { const p = await saveLibrary('phrasebook', { ...draft, title: draft.text.slice(0, 200) }, audio); onSaved(p); } catch (e) { setError(e instanceof Error ? e.message : 'Could not save the phrase.'); } finally { setBusy(false); } };
  return <Drawer open onClose={close} title={t('Save a phrase')} footer={<Button block disabled={busy || !draft.text.trim()} loading={busy} onClick={() => void save()}><UiText source="Save phrase" /></Button>}><fieldset disabled={busy} className="space-y-4 py-4">{field('text', 'Phrase or {template}', true)}{field('translation', 'Translation', true)}<Field title={t('Kind')}><select className={inputClass} value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as SavedPhrase['kind'] })}>{PHRASE_KINDS.map((k) => <option key={k} value={k}>{t(k)}</option>)}</select></Field>{field('folder', 'Folder or trip')}{field('situation', 'Situation')}{field('topic', 'Topic')}{field('formal', 'Formal alternative')}{field('informal', 'Informal alternative')}{field('notes', 'Personal notes', true)}<Field title={t('Tags, separated by commas')}><input className={inputClass} defaultValue={draft.tags.join(', ')} onChange={(e) => setDraft({ ...draft, tags: tagsOf(e.target.value) })} /></Field>{field('source', 'Source')}<Field title={t('Attach local audio (up to 20 MB)')}><input className={inputClass} type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files?.[0])} /></Field>{draft.audioBlobId && <Button size="sm" variant="ghost" onClick={() => setDraft({ ...draft, audioBlobId: undefined })}><UiText source="Detach audio" /></Button>}{error && <p role="alert" className="text-sm text-accent-text"><UiText source={error} /></p>}</fieldset></Drawer>;
}
