import { interpolate } from '@/core/i18n/messages';
import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router';
import { useApp } from '@/app/context';
import { PageHeader } from '@/app/PageHeader';
import { InRoom } from '@/app/room';
import { getLanguage } from '@/core/lang/languages';
import { CourseTab } from './course/CourseTab';
import GrammaticaPage from '@/features/grammatica/GrammaticaPage';
import { SoundsTab } from './sounds/SoundsTab';
import { TypingTab } from './TypingTab';
import { ScriptMarksTab } from './studio/ScriptMarksTab';
import type { StudioToolId } from './studio/StudioDuotoneIcon';
import { RequirePlan } from '@/features/plans/Locked';

/**
 * Cursus:
 * Clean, unified language curriculum with the course adventure trail at its center,
 * and the foundational studio workshops (Grammar, Sounds, Special letters, Typing)
 * presented directly as hand-drawn icons in the same Scriptorium duotone aesthetic as Home.
 */
export default function CursusPage() {
  const translateUi = useUi();
  const { language } = useApp();
  const lang = language.id;
  const asked = useParams().tab;
  const [searchParams, setSearchParams] = useSearchParams();

  // Backward-compatible redirects for legacy URLs
  if (asked === 'grammatica') {
    return <Navigate to="/cursus?tool=grammar" replace />;
  }
  if (asked === 'sounds') {
    return <Navigate to="/cursus?tool=sounds" replace />;
  }
  if (asked === 'alphabets' || asked === 'marks') {
    return <Navigate to="/cursus?tool=script" replace />;
  }
  if (asked === 'typing') {
    return <Navigate to="/cursus?tool=typing" replace />;
  }
  if (asked === 'studio') {
    const t = searchParams.get('tool') ?? 'grammar';
    return <Navigate to={`/cursus?tool=${t}`} replace />;
  }
  if (asked === 'course') {
    return <Navigate to="/cursus" replace />;
  }

  const activeTool = (searchParams.get('tool') as StudioToolId | null) ?? null;
  const name = getLanguage(lang)?.name ?? lang;

  // Always start screen all the way up when navigating to Cursus
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [asked]);

  return (
    <>
      <PageHeader
        title={translateUi('Cursus')}
        englishTitle={'Cursus'}
        eyebrow={translateUi('Learn {0} step by step', [translateUi(name)])}
        englishEyebrow={interpolate('Learn {0} step by step', [name])}
      />

      <InRoom.Provider value>
        {activeTool ? (
          <div className="mb-6 flex items-center justify-between border-b border-line/60 pb-3">
            <button
              type="button"
              onClick={() => setSearchParams({}, { replace: true })}
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-accent-text transition-colors hover:underline"
            >
              ← <UiText source={'Course'} />
            </button>
            <p className="font-sans text-xs font-bold tracking-[0.12em] text-ink-faint uppercase">
              <UiText source={'Studio'} />
            </p>
          </div>
        ) : null}

        {!activeTool && (
          <RequirePlan feature="course">
            <CourseTab />
          </RequirePlan>
        )}
        {activeTool === 'grammar' && (
          <RequirePlan feature="grammatica">
            <GrammaticaPage />
          </RequirePlan>
        )}
        {activeTool === 'sounds' && <SoundsTab />}
        {activeTool === 'script' && <ScriptMarksTab />}
        {activeTool === 'typing' && (
          <RequirePlan feature="typing">
            <TypingTab />
          </RequirePlan>
        )}
      </InRoom.Provider>
    </>
  );
}
