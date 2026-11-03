import { usePlan } from '@/features/plans/usePlan';
import { useUI } from '@/state/ui';
import { UiText } from '@/design/i18n/UiText';
import {
  useHomeHeader,
  useHomeLeftOff,
  useHomeCursus,
  useHomeContinue,
  useHomeDiscover,
} from './homeData';
import {
  ToolsBar,
  WhereLeftOffCard,
  CursusNextStepCard,
  ContinueLearningSection,
  DiscoverMoreSection,
  AskFloatingButton,
  HomeLayoutSwitcher,
  GreetingWithNameUnderline,
} from './homeComponents';

/**
 * Layout 1: Topline Tools
 * - Tools are compact at the top on a single clean line
 * - Goal is completely removed
 * - Center 2-column hero: "Where you left off" + "Next in Cursus" (Alphabet/Marks/Course)
 * - "Continue learning" 4-card grid across active media
 * - "Discover more" 4-card Explora recommendations
 */
export function HomeTopline() {
  const plan = usePlan();
  const openPlans = useUI((s) => s.openPlans);
  const { eyebrow, greeting, name } = useHomeHeader();

  const leftOff = useHomeLeftOff();
  const cursusStep = useHomeCursus();
  const continueItems = useHomeContinue();
  const discoverItems = useHomeDiscover();

  return (
    <div className="mx-auto max-w-[1072px] space-y-6 pb-20">
      {/* ── Top Header with Layout Switcher ──────────────────────────────────── */}
      <header className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-sans text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-1 font-serif text-[34px] leading-tight font-semibold tracking-tight text-ink sm:text-[40px]">
            <GreetingWithNameUnderline greeting={greeting} name={name} />
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <HomeLayoutSwitcher current="topline" />
          {plan === 'free' && (
            <button
              type="button"
              onClick={() => openPlans()}
              className="inline-flex h-8 items-center rounded-full border border-line-strong/60 bg-raised/40 px-3.5 text-[13px] font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-raised hover:text-ink"
            >
              <UiText source={'Lingua{0}'} values={[<span key="plus" className="text-accent-text">+</span>]} />
            </button>
          )}
        </div>
      </header>

      {/* ── Tools: Small, Top, on ONE Single Line ────────────────────────────── */}
      <div className="rounded-[22px] border border-line/75 bg-surface/50 p-2 sm:p-2.5">
        <ToolsBar mode="topline" />
      </div>

      {/* ── Center Stage: Where you left off & Next in Cursus ─────────────────── */}
      <section aria-label="Current studies" className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-2">
        <WhereLeftOffCard data={leftOff} variant="hero" className="h-full" />
        <CursusNextStepCard data={cursusStep} variant="card" className="h-full" />
      </section>

      {/* ── Continue Learning ─────────────────────────────────────────────────── */}
      <ContinueLearningSection items={continueItems} variant="grid4" />

      {/* ── Discover More ─────────────────────────────────────────────────────── */}
      <DiscoverMoreSection items={discoverItems} variant="cards4" />

      {/* ── Floating Ask ? ───────────────────────────────────────────────────── */}
      <AskFloatingButton />
    </div>
  );
}
