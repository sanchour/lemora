import { UiText, useUi } from '@/design/i18n/UiText';
import { isRtl } from '@/core/lang/languages';
import { NotebookConnections } from './Connections';
import { NotebookStudyTools } from './StudyTools';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { useApp } from '@/app/context';
import { filterLibrary, NOTE_KINDS, noteLinkPath, tagsOf } from '@/core/notebook/library';
import type { NotebookNote, NoteLink } from '@/core/notebook/library';
import { loadGrammar } from '@/core/grammar/load';
import { topicsOf } from '@/core/grammar/types';
import { OUTLINE, LESSON_IDS, LESSONS } from '@/core/course/outline';
import { hasCourse } from '@/core/course/load';
import { db } from '@/data/db';
import { newNotebookNote, removeLibrary, saveLibrary, useLibrary } from '@/data/notebook';
import { getGrammarNotesMap } from '@/data/grammarUserData';
import { useLibrary as useTexts } from '@/data/library';
import { Button, Segmented } from '@/design/primitives';
import { DiaryEditor } from '@/features/codex/diarium/DiaryEditor';
import { ErrorLogPanel } from '@/features/ratio/ErrorLogPanel';
import { WeakSpotsPanel } from '@/features/ratio/WeakSpotsPanel';
import { saveFile, frontMatter } from '@/services/export';
import { toast } from '@/state/ui';
import { cx } from '@/lib/cx';
import { Field, inputClass } from './fields';
import { Markdown } from './Markdown';

type NotebookMode = 'notes' | 'sources' | 'errors' | 'connections';

export function Notebook() {
  const { language } = useApp();
  return <NotebookBody key={language.id} lang={language.id} />;
}

function NotebookBody({ lang }: { lang: string }) {
  const t = useUi();
  const data = useLibrary('notebook', lang);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState('');
  const [mode, setMode] = useState<NotebookMode>('notes');
  const [editing, edit] = useState<NotebookNote | null>(() => {
    try {
      const n = JSON.parse(localStorage.getItem('notebook.draft:' + lang) ?? 'null') as NotebookNote | null;
      return n?.lang === lang && typeof n.id === 'string' && typeof n.body === 'string' ? n : null;
    } catch {
      return null;
    }
  });
  const list = filterLibrary(data?.items ?? [], query, folder);
  const requested = params.get('note');
  const selected = requested ? data?.items.find((n) => n.id === requested) : list[0];

  const choose = (id?: string) => {
    if (editing && !window.confirm(t('Discard unsaved changes?'))) return;
    localStorage.removeItem('notebook.draft:' + lang);
    edit(null);
    setParams(id ? { note: id } : {});
  };

  const start = (note: NotebookNote) => {
    if (!editing || window.confirm(t('Discard unsaved changes?'))) {
      edit(note);
      setMode('notes');
    }
  };

  const switchMode = (next: NotebookMode) => {
    if (!editing || window.confirm(t('Discard unsaved changes?'))) {
      localStorage.removeItem('notebook.draft:' + lang);
      edit(null);
      setMode(next);
    }
  };

  return (
    <section aria-label={t('Notebook')} className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-baseline gap-2.5">
            <h2 className="font-serif text-xl font-semibold"><UiText source="Your notebook" /></h2>
            <span className="text-sm font-bold text-ink-faint tabular-nums">{(data?.items ?? []).length}</span>
          </div>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
            <UiText source="Markdown notes and connections, kept on this device. Use folders, tags and search to find them again." />
          </p>
        </div>
        <Button size="sm" onClick={() => start(newNotebookNote(lang))}><UiText source="New note" /></Button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label={t('Notebook view')}>
          <Segmented<NotebookMode>
            label={t('Notebook view')}
            value={mode}
            onChange={switchMode}
            options={[
              { value: 'notes', label: t('My notes') },
              { value: 'sources', label: t('Notes elsewhere') },
              { value: 'connections', label: t('Connections') },
              { value: 'errors', label: t('Error log') },
            ]}
          />
        </nav>

        {mode !== 'errors' && (
          <div className="grid flex-1 gap-3 sm:max-w-xl sm:grid-cols-[minmax(180px,1fr)_180px]">
            <Field title={t('Search all notes')}>
              <input className={inputClass} value={query} onChange={(e) => setQuery(e.target.value)} />
            </Field>
            <Field title={t('Folder')}>
              <select className={inputClass} value={folder} onChange={(e) => setFolder(e.target.value)}>
                <option value="">{t('Every folder')}</option>
                {[...new Set((data?.items ?? []).map((n) => n.folder).filter(Boolean))].sort().map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Field>
          </div>
        )}
      </div>

      {data?.error && <p role="alert" className="text-sm text-accent-text">{data.error}</p>}

      {mode === 'connections' ? (
        <NotebookConnections items={list} onOpenNote={() => setMode('notes')} />
      ) : mode === 'errors' ? (
        <div className="space-y-6">
          <ErrorLogPanel lang={lang} />
          <WeakSpotsPanel lang={lang} />
          <p className="text-[13.5px] text-ink-soft">
            <UiText source="Mistakes from your learner record appear here when there is evidence. Practise links return to the existing lesson or practice tools." />
          </p>
        </div>
      ) : mode === 'sources' ? (
        <LegacyNotes lang={lang} query={query} onCopy={start} />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="max-h-[72vh] overflow-y-auto pr-1">
            <ul className="space-y-1.5">
              {list.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    aria-pressed={selected?.id === n.id}
                    onClick={() => choose(n.id)}
                    className={cx(
                      'w-full rounded-xl border p-3.5 text-left transition-all',
                      selected?.id === n.id
                        ? 'border-accent/50 bg-accent-soft/60 shadow-elev-1'
                        : 'border-line/70 bg-surface hover:border-line-strong hover:bg-raised',
                    )}
                  >
                    <span className="block font-serif text-[16.5px] leading-snug font-semibold">
                      {n.title || t('Untitled note')}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-ink-faint">
                      {[n.folder, ...n.tags].filter(Boolean).join(' · ') || t(n.kind)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {!list.length && (
              <p className="rounded-xl border border-dashed border-line p-4 text-[13.5px] text-ink-soft">
                <UiText source="No notes match. Create one or change the filters." />
              </p>
            )}
          </aside>

          <article className="min-w-0 rounded-3xl border border-line/70 bg-surface p-6 shadow-elev-1 sm:p-8">
            {editing ? (
              <NotebookEditor
                key={editing.id}
                initial={editing}
                notes={data?.items ?? []}
                onCancel={() => {
                  if (window.confirm(t('Discard unsaved changes?'))) {
                    localStorage.removeItem('notebook.draft:' + lang);
                    edit(null);
                  }
                }}
                onSaved={(n) => {
                  edit(null);
                  setParams({ note: n.id });
                }}
              />
            ) : selected ? (
              <>
                <header className="mb-5 flex items-start justify-between gap-3 border-b border-line/60 pb-4">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                      {selected.title || t('Untitled note')}
                    </h3>
                    <p className="mt-1.5 text-[12px] font-semibold text-ink-faint">
                      {[t(selected.kind), selected.folder, ...selected.tags].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => edit(selected)}>
                    <UiText source="Edit note" />
                  </Button>
                </header>
                <Markdown text={selected.body} />
                {!!selected.links.length && (
                  <section className="mt-6 border-t border-line/60 pt-4" aria-label={t('Linked learning')}>
                    <h4 className="text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase">
                      <UiText source="Linked learning" />
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {selected.links.map((l, i) => (
                        <li key={i} className="text-[13.5px]">
                          <Link className="font-semibold text-accent-text underline decoration-line-strong underline-offset-4" to={noteLinkPath(l)}>
                            {l.label || l.target}
                          </Link>
                          <span className="ml-2 text-xs text-ink-faint">{t(l.kind)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {(data?.items ?? []).some((n) => n.links.some((l) => l.kind === 'note' && l.target === selected.id)) && (
                  <section className="mt-5 border-t border-line/60 pt-4">
                    <h4 className="text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase">
                      <UiText source="Notes that link here" />
                    </h4>
                    {(data?.items ?? [])
                      .filter((n) => n.links.some((l) => l.kind === 'note' && l.target === selected.id))
                      .map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="mt-2 block text-[13.5px] font-semibold text-accent-text underline decoration-line-strong underline-offset-4"
                          onClick={() => choose(n.id)}
                        >
                          {n.title}
                        </button>
                      ))}
                  </section>
                )}
                <NotebookStudyTools key={`${selected.id}:${selected.updatedAt}`} note={selected} notes={list} />
                <div className="mt-6 flex flex-wrap gap-2 border-t border-line/60 pt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      saveFile(
                        `note-${selected.id}.md`,
                        frontMatter({ title: selected.title, lang, tags: selected.tags, folder: selected.folder }) +
                          '\n\n' +
                          selected.body +
                          '\n\n' +
                          selected.links.map((l) => `- [${l.label || l.target}](${noteLinkPath(l)})`).join('\n'),
                        'text/markdown;charset=utf-8',
                      )
                    }
                  >
                    <UiText source="Export Markdown" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void removeLibrary('notebook', selected)
                        .then(() =>
                          toast('Note removed.', {
                            action: {
                              label: 'Undo',
                              onClick: () => {
                                void saveLibrary('notebook', selected);
                              },
                            },
                          }),
                        )
                        .catch((e: unknown) => toast(e instanceof Error ? e.message : 'Could not remove the note.', { tone: 'error' }))
                    }
                  >
                    <UiText source="Remove note" />
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-[14.5px] leading-relaxed text-ink-soft">
                <UiText source={requested ? 'This note is no longer available in this language.' : 'A page for grammar, words, books, media and expressions you want to understand.'} />
              </p>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
function NotebookEditor({ initial, notes, onCancel, onSaved }: { initial: NotebookNote; notes: NotebookNote[]; onCancel: () => void; onSaved: (n: NotebookNote) => void }) {
  const t = useUi(); const [draft, set] = useState(initial); const [raw, setRaw] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => { try { localStorage.setItem('notebook.draft:' + draft.lang, JSON.stringify(draft)); } catch { setError('This draft could not be kept on the device. Save it before leaving.'); } }, [draft]);
  const save = async () => { setBusy(true); setError(''); try { const saved = await saveLibrary('notebook', draft); localStorage.removeItem('notebook.draft:' + draft.lang); onSaved(saved); } catch (e) { setError(e instanceof Error ? e.message : 'Could not save the note.'); } finally { setBusy(false); } };
  return <div className="space-y-4"><fieldset disabled={busy} className="space-y-4"><p className="text-xs text-ink-faint"><UiText source="Your unfinished draft is kept on this device until you save or discard it." /></p><Field title={t('Title')}><input className={inputClass} value={draft.title} maxLength={200} onChange={(e) => set({ ...draft, title: e.target.value })} /></Field><div className="grid grid-cols-2 gap-3"><Field title={t('Kind')}><select className={inputClass} value={draft.kind} onChange={(e) => set({ ...draft, kind: e.target.value as NotebookNote['kind'] })}>{NOTE_KINDS.map((k) => <option key={k} value={k}>{t(k)}</option>)}</select></Field><Field title={t('Folder')}><input className={inputClass} value={draft.folder} maxLength={120} onChange={(e) => set({ ...draft, folder: e.target.value })} /></Field></div><Field title={t('Tags, separated by commas')}><input className={inputClass} defaultValue={draft.tags.join(', ')} onChange={(e) => set({ ...draft, tags: tagsOf(e.target.value) })} /></Field><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={raw} onChange={(e) => setRaw(e.target.checked)} /><UiText source="Edit Markdown source" /></label>{raw ? <Field title={t('Markdown')}><textarea className={inputClass + ' min-h-72 font-mono'} maxLength={100000} value={draft.body} onChange={(e) => set({ ...draft, body: e.target.value })} /></Field> : <DiaryEditor key={raw ? 'raw' : 'rich'} value={draft.body} lang={draft.lang} rtl={isRtl(draft.lang)} placeholder={t('Write your note…')} onChange={(body) => set({ ...draft, body })} />}
    <LinkEditor lang={draft.lang} noteId={draft.id} notes={notes} links={draft.links} onChange={(links) => set({ ...draft, links })} /></fieldset>{error && <p role="alert" className="text-sm text-accent-text"><UiText source={error} /></p>}<div className="flex gap-2"><Button loading={busy} disabled={busy} onClick={() => void save()}><UiText source="Save note" /></Button><Button variant="ghost" disabled={busy} onClick={onCancel}><UiText source="Cancel" /></Button></div></div>;
}
function LinkEditor({ lang, noteId, notes, links, onChange }: { lang: string; noteId: string; notes: NotebookNote[]; links: NoteLink[]; onChange: (links: NoteLink[]) => void }) {
  const t = useUi(); const [kind, setKind] = useState<NoteLink['kind']>('word'); const [target, setTarget] = useState(''); const [topics, setTopics] = useState<{ id: string; title: string }[]>([]); const texts = useTexts(lang);
  useEffect(() => { let live = true; void loadGrammar(lang).then((g) => { if (live) setTopics(g ? topicsOf(g) : []); }); return () => { live = false; }; }, [lang]);
  const options = kind === 'grammar' ? topics.map((g) => ({ id: g.id, title: g.title })) : kind === 'text' ? (texts ?? []).map((x) => ({ id: x.id, title: x.title })) : kind === 'note' ? notes.filter((n) => n.id !== noteId).map((n) => ({ id: n.id, title: n.title || t('Untitled note') })) : kind === 'lesson' && hasCourse(lang) ? OUTLINE.flatMap((u) => LESSON_IDS.map((l) => ({ id: `${u.id}/${l}`, title: `${u.title} · ${LESSONS[l].title}` }))) : [];
  const add = () => { const value = target.trim(); if (!value || links.some((l) => l.kind === kind && l.target === value)) return; onChange([...links, { kind, target: value, label: options.find((o) => o.id === value)?.title ?? value }]); setTarget(''); };
  return <section className="space-y-3 border-t border-line pt-4"><h4 className="font-semibold"><UiText source="Linked learning" /></h4><div className="grid grid-cols-[140px_minmax(0,1fr)_auto] items-end gap-2"><Field title={t('Link kind')}><select className={inputClass} value={kind} onChange={(e) => { setKind(e.target.value as NoteLink['kind']); setTarget(''); }}>{(['word', 'grammar', 'lesson', 'text', 'note'] as const).map((k) => <option key={k} value={k}>{t(k)}</option>)}</select></Field><Field title={kind === 'word' ? t('Word') : t('Choose a link')}>{kind === 'word' ? <input className={inputClass} value={target} maxLength={300} onChange={(e) => setTarget(e.target.value)} /> : <select className={inputClass} value={target} onChange={(e) => setTarget(e.target.value)}><option value="">{t('Choose…')}</option>{options.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</select>}</Field><Button size="sm" variant="secondary" disabled={!target.trim() || links.length >= 50} onClick={add}><UiText source="Add link" /></Button></div><ul className="space-y-2">{links.map((l, i) => <li key={i} className="flex items-center justify-between gap-3 text-sm"><span>{l.label} · {t(l.kind)}</span><button type="button" className="underline" onClick={() => onChange(links.filter((_, j) => i !== j))}><UiText source="Remove link" /></button></li>)}</ul></section>;
}
function LegacyNotes({ lang, query, onCopy }: { lang: string; query: string; onCopy: (n: NotebookNote) => void }) {
  const notes = useLiveQuery(async () => {
    const grammar = await getGrammarNotesMap(lang); const pairs = await db.settings.where('key').startsWith('compare:notes:').toArray();
    return [...Object.entries(grammar).filter(([, n]) => n && typeof n.note === 'string').map(([id, n]) => ({ title: id, body: n.note, link: { kind: 'grammar' as const, target: id, label: id } })), ...pairs.filter((r) => typeof r.value === 'string' && (r.key.endsWith('-' + lang) || r.key.includes(':' + lang + '-'))).map((r) => ({ title: r.key.slice('compare:notes:'.length), body: r.value as string, link: undefined }))].filter((n) => n.body.trim() && `${n.title} ${n.body}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  }, [lang, query]);
  return <section className="space-y-4"><p className="text-sm text-ink-soft"><UiText source="Existing grammar and language-pair notes stay in their original tools. Copy one here when you want notebook folders, tags or more links." /></p>{notes?.map((n) => <article key={n.title} className="rounded-xl border border-line bg-raised p-4"><h3 className="font-serif text-lg">{n.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm">{n.body}</p><Button size="sm" variant="ghost" onClick={() => onCopy({ ...newNotebookNote(lang), title: n.title, body: n.body, kind: n.link ? 'Grammar' : 'Language pair', links: n.link ? [n.link] : [] })}><UiText source="Copy into Notebook" /></Button></article>)}</section>;
}
