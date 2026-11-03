// Projects (6-21 G7, F0885 and F1222 to F1244): small chains across rooms. Each step opens the room that does it; tick it when it is done.
import { useState } from 'react';
import { ArrowLeft, Check, ExternalLink, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { progress, startProject, STEPS, TEMPLATES, templateOf, toggleStep } from '@/core/games/projects';
import type { Project, ProjectTemplate } from '@/core/games/projects';
import { getLanguage } from '@/core/lang/languages';
import { saveProjects, useProjects } from '@/data/games';
import { useApp } from '@/app/context';
import { PageHeader } from '@/app/PageHeader';
import { buttonClasses, Card } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';

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
  const lang = language.id;
  const t = useUi();
  const navigate = useNavigate();
  const id = useParams().project;
  const projects = useProjects(lang);
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
      <div className="mx-auto w-full max-w-3xl px-6 py-6">
        <Link to="/thesaurus/games/projects" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft hover:text-ink"><ArrowLeft size={15} aria-hidden /> <UiText source={'All projects'} /></Link>
        <h1 className="mt-4 font-display text-3xl font-semibold">{t(tpl.title)}{project.topic ? ` · ${project.topic}` : ''}</h1>
        <p className="mt-1 text-ink-soft">{t(tpl.detail)}</p>
        <div className="mt-4"><Strip done={p.done} of={p.of} /></div>
        <p className="mt-2 text-[14px] text-ink-soft">{p.finished ? <UiText source={'Finished.'} /> : <UiText source={'{0} of {1} steps done'} values={[p.done, p.of]} />}</p>
        <ol className="mt-6 space-y-3">
          {tpl.steps.map((k, i) => {
            const step = STEPS[k];
            const done = project.done.includes(i);
            return (
              <li key={i} className="flex items-center gap-4 rounded-2xl border border-line/70 bg-surface px-5 py-4">
                <button type="button" onClick={() => save(projects!.map((x) => (x.id === project.id ? toggleStep(x, i) : x)))} aria-pressed={done} aria-label={t(step.label)} className={cx('grid size-8 shrink-0 place-items-center rounded-full border', done ? 'border-sage-text bg-sage-soft text-sage-text' : 'border-line-strong')}>
                  {done && <Check size={16} aria-hidden />}
                </button>
                <span className={cx('min-w-0 flex-1 text-[16px] font-semibold', done && 'text-ink-soft line-through')}>
                  {i + 1}. {t(step.label)}{step.max && <span className="ms-2 text-[12px] font-normal text-ink-faint"><UiText source={'Needs Max; skip it without.'} /></span>}
                </span>
                <Link to={step.to} className={buttonClasses('secondary', 'sm')}><UiText source={'{0} Open'} values={[<ExternalLink size={14} aria-hidden />]} /></Link>
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
      <PageHeader title={t('Projects')} eyebrow={t('{0}, in chains', [name])} />
      <p className="max-w-2xl text-[15px] leading-relaxed text-ink-soft"><UiText source={'Small chains across rooms: each step opens the room that does it. Tick a step when you have done it.'} /></p>
      {!!projects?.length && (
        <section className="mt-8" aria-label={t('Your projects')}>
          <h2 className="mb-3 text-[12px] font-bold tracking-[0.12em] text-ink-faint uppercase"><UiText source={'Your projects'} /></h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => {
              const tpl = templateOf(p.template);
              const pr = progress(p);
              return tpl ? (
                <Link key={p.id} to={`/thesaurus/games/projects/${p.id}`} className="block rounded-3xl border border-line/70 bg-surface p-5 transition-colors hover:border-line-strong">
                  <p className="font-serif text-lg font-semibold">{t(tpl.title)}{p.topic ? ` · ${p.topic}` : ''}</p>
                  <div className="mt-3"><Strip done={pr.done} of={pr.of} /></div>
                  <p className="mt-2 text-[13px] text-ink-soft">{pr.finished ? <UiText source={'Finished.'} /> : <UiText source={'{0} of {1} steps done'} values={[pr.done, pr.of]} />}</p>
                </Link>
              ) : null;
            })}
          </div>
        </section>
      )}
      <section className="mt-8" aria-label={t('Start a project')}>
        <h2 className="mb-3 text-[12px] font-bold tracking-[0.12em] text-ink-faint uppercase"><UiText source={'Start a project'} /></h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {TEMPLATES.map((tpl) => (
            <Card key={tpl.id} className="flex flex-col p-5">
              <p className="font-serif text-lg font-semibold">{t(tpl.title)}</p>
              <p className="mt-1 flex-1 text-[14px] leading-snug text-ink-soft">{t(tpl.detail)}</p>
              <p className="mt-2 text-[12.5px] text-ink-faint">{tpl.steps.map((k) => t(STEPS[k].label)).join(' → ')}</p>
              {tpl.topic && <input value={topic} onChange={(e) => setTopic(e.target.value)} aria-label={t('The topic')} placeholder={t('The topic')} className="mt-3 h-9 rounded-lg border border-line bg-raised px-3 text-[14px] outline-none focus:border-line-strong" />}
              <button type="button" onClick={() => begin(tpl)} className={buttonClasses('primary', 'sm') + ' mt-4 self-start'}><UiText source={'Start'} /></button>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
