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
 * Layout 3: Bottom Shelf Tools
 * - Tools are positioned at the bottom of the screen as an illustrated workbench shelf
 * - Goal is completely removed
 * - Center Stage:
 *   - Where you left off (Lectern format with large cover art)
 *   - Next step in Cursus (Alphabet/Marks with botanical/calligraphic styling)
 * - Continue learning (5-column horizontal media shelf)
 * - Discover more (Gallery row)
 * - Bottom: Tools of the Study workbench
 */
export function HomeBottomShelf() {
  const plan = usePlan();
  const openPlans = useUI((s) => s.openPlans);
  const { eyebrow, greeting, name } = useHomeHeader();

  const leftOff = useHomeLeftOff();
  const cursusStep = useHomeCursus();
  const continueItems = useHomeContinue();
  const discoverItems = useHomeDiscover();

  return (
    <div className="mx-auto max-w-[1072px] space-y-8 pb-20">
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
          <HomeLayoutSwitcher current="shelf" />
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

      {/* ── Focal Center Stage: Where you left off & Next in Cursus ───────────── */}
      <section aria-label="Focal studies" className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2">
        <WhereLeftOffCard data={leftOff} variant="lectern" className="h-full" />
        <CursusNextStepCard data={cursusStep} variant="card" className="h-full" />
      </section>

      {/* ── Continue Learning: 5-Column Shelf ─────────────────────────────────── */}
      <ContinueLearningSection items={continueItems} variant="shelf5" />

      {/* ── Discover More ─────────────────────────────────────────────────────── */}
      <DiscoverMoreSection items={discoverItems} variant="cards4" />

      {/* ── Tools at the Bottom: Workbench Shelf ──────────────────────────────── */}
      <div className="rounded-[24px] border border-line/75 bg-surface/60 p-5 sm:p-6">
        <ToolsBar mode="shelf" />
      </div>

      {/* ── Floating Ask ? ───────────────────────────────────────────────────── */}
      <AskFloatingButton />
    </div>
  );
}
