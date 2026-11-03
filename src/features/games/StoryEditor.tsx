// Custom games (6-21, F1220): write a story in plain text, check that it can be played, keep it. It then plays like any other story.
import { useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { parseStory, SAMPLE } from '@/core/games/customStory';
import type { ParseError } from '@/core/games/customStory';
import { checkStory } from '@/core/games/story';
import type { StoryCheck } from '@/core/games/story';
import { saveCustom, useCustom } from '@/data/games';
import { useApp } from '@/app/context';
import { buttonClasses } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { useStudySession } from '@/features/lesson/useStudySession';

interface Result {
  errors: ParseError[];
  check?: StoryCheck;
  title?: string;
}

export default function StoryEditorPage() {
  const { language } = useApp();
  // Ludus's time, toward the day and Ludus's own goal (core/goals/tools).
  useStudySession(language.id, 'ludus', 'story-editor');
  const lang = language.id;
  const t = useUi();
  const saved = useCustom(lang);
  const [editing, setEditing] = useState<string | null>(null);
  const [source, setSource] = useState(SAMPLE);
  const [result, setResult] = useState<Result | null>(null);
  const [kept, setKept] = useState(false);

  const test = (): Result => {
    const { story, errors } = parseStory(source, editing ?? 'custom');
    const out = story ? { errors, check: checkStory(story), title: story.title } : { errors };
    setResult(out);
    setKept(false);
    return out;
  };
  const keep = async () => {
    const r = test();
    if (!r.check?.ok) return;
    const id = editing ?? `custom:${Date.now().toString(36)}`;
    await saveCustom(lang, [...(saved ?? []).filter((c) => c.id !== id), { id, source }]);
    setEditing(id);
    setKept(true);
  };
  const titleOf = (src: string) => /^title:\s*(.+)$/m.exec(src)?.[1] ?? '…';
  const ok = result?.check?.ok;
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-6">
      <Link to="/thesaurus/games/story" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft hover:text-ink"><ArrowLeft size={15} aria-hidden /> <UiText source={'Back to the story game'} /></Link>
      <h1 className="mt-4 font-display text-3xl font-semibold"><UiText source={'Write a story'} /></h1>
      <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-ink-soft">
        <UiText source={'Scenes go in [square brackets]. A choice starts with >, then its words, then -> and the scene it leads to. A choice can need something (| needs: key), a scene can give it (gives: key) or end the story (end: win or end: lose), and health: 3 gives a story strength that a choice can use up (| cost: 1).'} />
      </p>
      {!!saved?.length && (
        <section className="mt-6" aria-label={t('Your stories')}>
          <h2 className="mb-2 text-[12px] font-bold tracking-[0.12em] text-ink-faint uppercase"><UiText source={'Your stories'} /></h2>
          <ul className="divide-y divide-line/70 rounded-2xl border border-line/70 bg-surface">
            {saved.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="min-w-0 flex-1 truncate font-serif text-lg font-semibold">{titleOf(c.source)}</span>
                <button type="button" onClick={() => { setEditing(c.id); setSource(c.source); setResult(null); setKept(false); }} className={buttonClasses('secondary', 'sm')}><UiText source={'Edit'} /></button>
                <button type="button" onClick={() => { void saveCustom(lang, saved.filter((x) => x.id !== c.id)); if (editing === c.id) { setEditing(null); setSource(SAMPLE); setResult(null); } }} aria-label={t('Delete')} className={buttonClasses('ghost', 'sm')}><Trash2 size={14} aria-hidden /></button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <textarea value={source} onChange={(e) => { setSource(e.target.value); setResult(null); setKept(false); }} spellCheck={false} aria-label={t('The story')} rows={18} className="mt-6 w-full rounded-2xl border border-line bg-raised p-4 font-mono text-[14px] leading-relaxed outline-none focus:border-line-strong" />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={test} className={buttonClasses('secondary', 'md')}><UiText source={'Check it'} /></button>
        <button type="button" onClick={() => void keep()} className={buttonClasses('primary', 'md')}><UiText source={'Keep it'} /></button>
        {editing && <button type="button" onClick={() => { setEditing(null); setSource(SAMPLE); setResult(null); setKept(false); }} className={buttonClasses('ghost', 'md')}><UiText source={'Write another'} /></button>}
      </div>
      {result && (
        <div className="mt-4 space-y-1 text-[14px]" role="status">
          {result.errors.map((e, i) => <p key={i} className="text-accent-text">{t(e[0], e.slice(1))}</p>)}
          {result.check && (ok ? <p className="text-sage-text"><UiText source={'It can be played: the shortest way is {0} choices.'} values={[result.check.shortest]} /></p> : result.check.problems.map((p, i) => <p key={i} className="text-accent-text">{p}</p>))}
          {kept && <p className="font-semibold"><UiText source={'Kept. It is in the story game now.'} /></p>}
        </div>
      )}
    </div>
  );
}
