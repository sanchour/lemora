import { UiText, useUi } from '@/design/i18n/UiText';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Route } from 'lucide-react';
import { useApp } from '@/app/context';
import { getLanguage } from '@/core/lang/languages';
import { hasScript } from '@/core/script/load';
import { hasMarks } from '../marks/MarksTab';
import { nextLesson, useCourseProgress } from '@/data/course';
import { Card, EmptyState } from '@/design/primitives';
import { spring } from '@/design/motion';
import { AdventurePath } from './AdventurePath';
import { useCourse } from './parts';
import { StudioDuotoneIcon, type StudioToolId } from '../studio/StudioDuotoneIcon';

interface StudioToolItem {
  id: StudioToolId;
  name: string;
  role: string;
}

/** Cursus › Course: the course as a trail of lessons, where you are on it, and the next lesson a click away. */
export function CourseTab() {
  const translateUi = useUi();
  const { language } = useApp();
  const lang = language.id;
  const loaded = useCourse(lang);
  const progress = useCourseProgress(lang);

  if (loaded === undefined || !progress) return null;
  if (loaded === null) {
    return (
      <Card className="mt-8">
        <EmptyState icon={Route} title={translateUi('The {0} course is being written', [getLanguage(lang)?.name ?? lang])}><UiText source={'A path of units named by what you can do after them. Spanish is ready; the other core languages follow. Until then, Grammatica and the rest of Lingua work as always.'} /></EmptyState>
      </Card>
    );
  }
  const next = nextLesson(progress, loaded.lessonsOf);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_88px] xl:grid-cols-[minmax(0,1fr)_96px]">
      <AdventurePath progress={progress} lessonsOf={loaded.lessonsOf} next={next} />
      <WhereYouAre lang={lang} />
    </div>
  );
}

function WhereYouAre({ lang }: { lang: string }) {
  const core = getLanguage(lang)?.tier === 1;

  const studioTools = useMemo(() => {
    const list: StudioToolItem[] = [
      { id: 'grammar', name: 'Grammar', role: 'Grammar topics' },
    ];
    if (core) {
      list.push({ id: 'sounds', name: 'Sounds', role: 'Listen' });
    }
    if (hasScript(lang) || hasMarks(lang)) {
      list.push({ id: 'script', name: 'Special letters', role: 'Alphabet' });
    }
    if (core) {
      list.push({ id: 'typing', name: 'Typing', role: 'Practice' });
    }
    return list;
  }, [core, lang]);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={spring.soft}
      aria-label="Studio"
      className="lg:sticky lg:top-8 flex flex-row flex-wrap justify-center lg:flex-col lg:items-center gap-5.5 py-1"
    >
      {studioTools.map((tool) => (
        <Link
          key={tool.id}
          to={`/cursus?tool=${tool.id}`}
          className="group flex flex-col items-center text-center transition-all outline-none"
        >
          <div
            className="flex size-14 sm:size-15 items-center justify-center rounded-full border-2 border-line-strong/80 bg-raised shadow-xs transition-all duration-200 group-hover:-translate-y-1 group-hover:border-accent group-hover:bg-surface group-hover:shadow-elev-2 active:translate-y-0"
            style={{ boxShadow: '0 4px 0 var(--line-strong)' }}
          >
            <StudioDuotoneIcon id={tool.id} className="size-8 transition-transform duration-200 group-hover:scale-110" />
          </div>
          <span className="mt-1.5 font-sans text-[11.5px] font-semibold text-ink-soft transition-colors group-hover:text-accent-text whitespace-nowrap">
            <UiText source={tool.name} />
          </span>
        </Link>
      ))}
    </motion.aside>
  );
}
