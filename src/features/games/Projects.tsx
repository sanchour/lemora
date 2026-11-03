// Projects (6-21 G7, F0885 and F1222 to F1244): small chains across rooms. Each step opens the room that does it; tick it when it is done.
import { useState } from 'react';
import { ArrowLeft, Check, ExternalLink, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { carried, CHOOSES, MAKES, progress, setNote, startProject, stepTarget, STEPS, TEMPLATES, templateOf, toggleStep } from '@/core/games/projects';
import type { Project, ProjectTemplate } from '@/core/games/projects';
import { getLanguage, isRtl } from '@/core/lang/languages';
import { saveProjects, useProjectMaterial, useProjects } from '@/data/games';
import { SpeakButton } from '@/features/speech/SpeakButton';
import { useApp } from '@/app/context';
import { PageHeader } from '@/app/PageHeader';
import { buttonClasses, Card } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { useStudySession } from '@/features/lesson/useStudySession';

function Strip({ done, of }: { done: number; of: number }) {
  return (
    <div className="flex gap-1" aria-hidden>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} className={cx('h-1.5 flex-1 rounded-full', i < done ? 'bg-sage-text' : 'bg-line')} />
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  const { language } = useApp();
  // Ludus's time, toward the day and Ludus's own goal (core/goals/tools).
  useStudySession(language.id, 'ludus', 'projects');
  const lang = language.id;
  const t = useUi();
  const navigate = useNavigate();
  const id = useParams().project;
  const projects = useProjects(lang);
  const material = useProjectMaterial(lang);
  const [topic, setTopic] = useState('');
  const name = getLanguage(lang)?.name ?? lang;
  const save = (next: Project[]) => void saveProjects(lang, next);
  const project = projects?.find((p) => p.id === id);

  if (id && projects && !project)
    return (
      <p className="p-10 text-ink-soft">
        <UiText source={'That project is not here.'} />{' '}
        <Link to="/thesaurus/games/projects" className="font-semibold text-ink underline decoration-line-strong underline-offset-4"><UiText source={'All projects'} /></Link>
      </p>
    );

  if (project) {
    const tpl = templateOf(project.template)!;
    const p = progress(project);
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-5 flex items-center justify-between border-b border-line/60 pb-3">
          <Link to="/thesaurus/games/projects" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft hover:text-ink"><ArrowLeft size={15} aria-hidden /> <UiText source={'All projects'} /></Link>
          <p className="text-[13px] text-ink-soft tabular-nums">{p.finished ? <UiText source={'Finished.'} /> : <UiText source={'{0} of {1} steps done'} values={[p.done, p.of]} />}</p>
        </div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">{t(tpl.title)}{project.topic ? ` · ${project.topic}` : ''}</h1>
        <p className="mt-1 text-[14.5px] text-ink-soft">{t(tpl.detail)}</p>
        <div className="mt-4"><Strip done={p.done} of={p.of} /></div>
        <ol className="mt-6 space-y-2.5">
          {tpl.steps.map((k, i) => {
            const step = STEPS[k];
            const done = project.done.includes(i);
            const choose = CHOOSES[k];
            const options = material ? (choose === 'text' ? material.texts : choose === 'audio' ? material.audio : choose === 'video' ? material.video : []) : [];
            const chosen = choose === 'text' ? project.material?.textId : project.material?.mediaId;
            const before = carried(project, i);
            const update = (next: typeof project) => save(projects!.map((x) => (x.id === project.id ? next : x)));
            return (
              <li key={i} className="rounded-2xl border border-line/70 bg-surface px-5 py-4">
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => update(toggleStep(project, i))} aria-pressed={done} aria-label={t(step.label)} className={cx('grid size-8 shrink-0 place-items-center rounded-full border', done ? 'border-sage-text bg-sage-soft text-sage-text' : 'border-line-strong')}>
                    {done && <Check size={16} aria-hidden />}
                  </button>
                  <span className={cx('min-w-0 flex-1 text-[16px] font-semibold', done && 'text-ink-soft line-through')}>
                    {i + 1}. {t(step.label)}{step.max && <span className="ms-2 text-[12px] font-normal text-ink-faint"><UiText source={'Needs Max; skip it without.'} /></span>}
                  </span>
                  <Link to={stepTarget(project, k)} className={buttonClasses('secondary', 'sm')}><UiText source={'{0} Open'} values={[<ExternalLink size={14} aria-hidden />]} /></Link>
                </div>
                {choose && (
                  <div className="mt-3">
                    {options.length ? (
                      <select value={chosen ?? ''} aria-label={choose === 'text' ? t('Choose a text') : choose === 'audio' ? t('Choose a recording') : t('Choose a video')} onChange={(e) => update({ ...project, material: { ...project.material, ...(choose === 'text' ? { textId: e.target.value || undefined } : { mediaId: e.target.value || undefined, mediaKind: choose }) } })} className="h-9 w-full rounded-lg border border-line bg-raised px-3 text-[14px]">
                        <option value="">{choose === 'text' ? t('Choose a text') : choose === 'audio' ? t('Choose a recording') : t('Choose a video')}</option>
                        {options.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
                      </select>
                    ) : (
                      <p className="text-[13px] text-ink-faint"><UiText source={'Nothing to choose from yet: add one in its room.'} /></p>
                    )}
                  </div>
                )}
                {before && (
                  <div className="mt-3 rounded-xl bg-sunken px-4 py-3">
                    <p className="text-[12px] font-bold tracking-[0.12em] text-ink-faint uppercase"><UiText source={'From the step before'} /></p>
                    <p className="mt-1 whitespace-pre-wrap font-serif text-[16px] leading-snug" lang={lang} dir={isRtl(lang) ? 'rtl' : undefined}>{before}</p>
                    {k === 'talk' && <div className="mt-2"><SpeakButton lang={lang} text={before} size={18} className="inline-flex h-9 items-center gap-2 rounded-full bg-raised px-3" /></div>}
                  </div>
                )}
                {MAKES.includes(k) && (
                  <textarea defaultValue={project.notes?.[i] ?? ''} onBlur={(e) => e.target.value !== (project.notes?.[i] ?? '') && update(setNote(project, i, e.target.value))} lang={lang} dir={isRtl(lang) ? 'rtl' : undefined} rows={2} aria-label={t('What you wrote or made')} placeholder={t('What you wrote or made')} className="mt-3 w-full rounded-lg border border-line bg-raised px-3 py-2 text-[14px] outline-none focus:border-line-strong" />
                )}
              </li>
            );
          })}
        </ol>
        <button type="button" onClick={() => { save(projects!.filter((x) => x.id !== project.id)); navigate('/thesaurus/games/projects'); }} className={buttonClasses('ghost', 'sm') + ' mt-6'}>
          <UiText source={'{0} Delete this project'} values={[<Trash2 size={14} aria-hidden />]} />
        </button>
      </div>
    );
  }

  const begin = (tpl: ProjectTemplate) => {
    const p = startProject(tpl, topic, Date.now());
    save([p, ...(projects ?? [])]);
    setTopic('');
    navigate(`/thesaurus/games/projects/${p.id}`);
  };
  return (
    <>
      <PageHeader
        title={t('Projects')}
        eyebrow={t('{0}, in chains', [name])}
        actions={
          <Link to="/thesaurus/games" className={buttonClasses('secondary', 'md')}>
            <ArrowLeft size={16} aria-hidden />
            <UiText source={'Ludus'} />
          </Link>
        }
      />
      <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-ink-soft"><UiText source={'Small chains across rooms: each step opens the room that does it. Tick a step when you have done it.'} /></p>
      {!!projects?.length && (
        <section className="mt-8" aria-label={t('Your projects')}>
          <header className="mb-4 flex items-baseline gap-2.5 border-b border-line pb-2">
            <h2 className="font-serif text-xl font-semibold"><UiText source={'Your projects'} /></h2>
            <span className="text-sm font-bold text-ink-faint tabular-nums">{projects.length}</span>
          </header>
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => {
              const tpl = templateOf(p.template);
              const pr = progress(p);
              return tpl ? (
                <Link key={p.id} to={`/thesaurus/games/projects/${p.id}`} className="block rounded-2xl border border-line/70 bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-elev-1">
                  <p className="font-serif text-[17.5px] font-semibold">{t(tpl.title)}{p.topic ? ` · ${p.topic}` : ''}</p>
                  <div className="mt-3"><Strip done={pr.done} of={pr.of} /></div>
                  <p className="mt-2 text-[13px] text-ink-soft">{pr.finished ? <UiText source={'Finished.'} /> : <UiText source={'{0} of {1} steps done'} values={[pr.done, pr.of]} />}</p>
                </Link>
              ) : null;
            })}
          </div>
        </section>
      )}
      <section className="mt-9" aria-label={t('Start a project')}>
        <header className="mb-4 flex items-baseline gap-2.5 border-b border-line pb-2">
          <h2 className="font-serif text-xl font-semibold"><UiText source={'Start a project'} /></h2>
          <span className="text-sm font-bold text-ink-faint tabular-nums">{TEMPLATES.length}</span>
        </header>
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {TEMPLATES.map((tpl) => (
            <Card key={tpl.id} className="flex flex-col rounded-2xl border-line/70 p-5">
              <p className="font-serif text-[17.5px] font-semibold">{t(tpl.title)}</p>
              <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{t(tpl.detail)}</p>
              <p className="mt-3 border-t border-line/50 pt-3 text-[12px] text-ink-faint">{tpl.steps.map((k) => t(STEPS[k].label)).join(' → ')}</p>
              {tpl.topic && <input value={topic} onChange={(e) => setTopic(e.target.value)} aria-label={t('The topic')} placeholder={t('The topic')} className="mt-3 h-9 rounded-lg border border-line bg-raised px-3 text-[14px] outline-none focus:border-line-strong" />}
              <button type="button" onClick={() => begin(tpl)} className={buttonClasses('primary', 'sm') + ' mt-4 self-start'}><UiText source={'Start'} /></button>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
