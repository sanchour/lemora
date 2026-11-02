import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router';
import { Trash2 } from 'lucide-react';
import { db } from '@/data/db';
import { getLanguage } from '@/core/lang/languages';
import { piperVoice } from '@/core/audio/piper';
import { removePack, usePackJobs } from '@/services/packs/packs';
import { removeDictionary, useDictJobs } from '@/services/dictionary/fullDict';
import { removePiperVoice, storedPiperVoices } from '@/services/speech/piper';
import { formatBytes } from '@/lib/format';
import { Button, Dialog } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { toast } from '@/state/ui';

type Resource = { kind: 'pack' | 'dictionary' | 'voice'; id: string; label: string; detail: string };

export function StoredResources({ onChange }: { onChange: () => void }) {
  const t = useUi();
  const [pending, setPending] = useState<Resource | null>(null);
  const [busy, setBusy] = useState(false);
  const [voices, setVoices] = useState<Array<{ id: string; bytes: number }>>([]);
  const [voiceError, setVoiceError] = useState(false);
  const packJobs = usePackJobs((s) => s.jobs);
  const dictJobs = useDictJobs((s) => s.jobs);
  const data = useLiveQuery(async () => {
    try {
      const packs = await db.dictPacks.toArray();
      const langs = await db.fullDict.orderBy('lang').uniqueKeys();
      const dictionaries = await Promise.all(langs.map(async (lang) => ({ lang: String(lang), words: await db.fullDict.where('lang').equals(lang).filter((r) => r.key !== '#version').count() })));
      return { packs, dictionaries, error: false };
    } catch { return { packs: [], dictionaries: [], error: true }; }
  }, []);
  useEffect(() => {
    let active = true;
    const refresh = () => void storedPiperVoices().then((rows) => { if (active) { setVoices(rows); setVoiceError(false); } }).catch(() => { if (active) setVoiceError(true); });
    refresh();
    window.addEventListener('lingua:voices-changed', refresh);
    return () => { active = false; window.removeEventListener('lingua:voices-changed', refresh); };
  }, []);
  const remove = async () => {
    if (!pending || busy) return;
    setBusy(true);
    try {
      if (pending.kind === 'pack') await removePack(pending.id);
      else if (pending.kind === 'dictionary') await removeDictionary(pending.id);
      else await removePiperVoice(pending.id);
      setPending(null); onChange();
    } catch (error) { toast(error instanceof Error ? error.message : 'Could not change stored media.', { tone: 'error' }); }
    finally { setBusy(false); }
  };
  const language = (id: string) => getLanguage(id)?.name ?? id;
  const resources: Resource[] = [
    ...(data?.packs ?? []).map((p) => ({ kind: 'pack' as const, id: p.lang, label: t('Language pack: {0}', [language(p.lang)]), detail: formatBytes(p.sizeBytes) })),
    ...(data?.dictionaries ?? []).map((d) => ({ kind: 'dictionary' as const, id: d.lang, label: t('Full dictionary: {0}', [language(d.lang)]), detail: t('{0} offline words', [d.words.toLocaleString()]) })),
    ...voices.map((v) => ({ kind: 'voice' as const, id: v.id, label: t('Downloaded voice: {0}', [piperVoice(v.id)?.name ?? v.id]), detail: `${piperVoice(v.id)?.locale ?? v.id} · ${formatBytes(v.bytes)}` })),
  ];
  return <section className="mt-5 border-t border-line pt-4" aria-label={t('Downloaded resources')}>
    <h3 className="font-semibold"><UiText source="Downloaded resources" /></h3>
    <p className="mt-1 text-sm text-ink-soft"><UiText source="Remove only downloaded packs, dictionaries or voices. Your words, cards and progress stay. Undo does not download anything." /></p>
    {(data?.error || voiceError) && <p role="alert" className="mt-2 text-sm text-accent-text"><UiText source="Some downloaded resources could not be listed. Try opening this page again." /></p>}
    {!data && <p role="status" className="mt-2 text-sm"><UiText source="Loading…" /></p>}
    {data && !resources.length && <p className="mt-3 text-sm text-ink-soft"><UiText source="No downloaded packs, dictionaries or voices on this device." /></p>}
    <ul className="mt-3 divide-y divide-line">{resources.map((r) => <li key={`${r.kind}:${r.id}`} className="flex items-center justify-between gap-4 py-2">
      <span className="min-w-0 break-words text-sm">{r.label}<span className="block text-xs text-ink-soft">{r.detail}</span></span>
      <Button size="sm" variant="ghost" icon={Trash2} disabled={busy || Boolean(packJobs[r.id] || dictJobs[r.id])} onClick={() => setPending(r)}>{t('Remove {0}', [r.label])}</Button>
    </li>)}</ul>
    <p className="mt-2 text-sm"><Link className="underline" to="/settings/languages"><UiText source="Languages" /></Link><span aria-hidden> · </span><Link className="underline" to="/settings/languages"><UiText source="Voice" /></Link></p>
    <Dialog open={pending !== null} onClose={() => !busy && setPending(null)} title={t('Remove {0}?', [pending?.label ?? ''])} actions={<>
      <Button variant="secondary" disabled={busy} onClick={() => setPending(null)}><UiText source="Cancel" /></Button>
      <Button variant="danger" loading={busy} onClick={() => void remove()}><UiText source="Remove" /></Button>
    </>}><p><UiText source="The download goes; your learning stays. Use Undo in the message before dismissing it or reloading the app." /></p></Dialog>
  </section>;
}
