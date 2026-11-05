import { cx } from '@/lib/cx';
import { useApp } from '@/app/context';
import { usePlan } from '@/features/plans/usePlan';
import { useUI } from '@/state/ui';
import { UiText } from '@/design/i18n/UiText';
import {
  useHomeHeader,
  useHomeLeftOff,
  useHomeCursus,
  useHomeWhatNext,
  useHomeDiscover,
} from './homeData';
import {
  ToolsBar,
  WhereLeftOffCard,
  WordsTodayCard,
  PenDivider,
  CursusNextStepCard,
  WhatNextSection,
  DiscoverMoreSection,
  GreetingWithNameUnderline,
} from './homeComponents';
import { TimeADayMeter } from './TimeADayMeter';
import { shows } from '@/product';

/**
 * Lingua Home: Right Rail (Cozy Scriptorium Atelier)
 * - Tools are positioned high in a dedicated vertical rail to the right of the screen, one per row
 * - Main left canvas:
 *   - Top header with minimal color-scheme line under learner's name
 *   - Where you left off + Cute Time a Day Meter side-by-side (transparent background)
 *   - Next step from Cursus (Alphabet/Marks or Course unit)
 *   - What next: Suggestions horizontally swipeable, filled up colored, minimal
 *   - Discover more: In style of Explora (all same size cards, daily rotating)
 */
export function HomeRightRail() {
  const { language, settings } = useApp();
  const plan = usePlan();
  const openPlans = useUI((s) => s.openPlans);
  const { eyebrow, greeting, name } = useHomeHeader();
  const goal = language.dailyGoal?.readMinutes ?? 15;

  const leftOff = useHomeLeftOff();
  const cursusStep = useHomeCursus();
  const whatNextItems = useHomeWhatNext();
  const discoverItems = useHomeDiscover();
  // Lemora U3: Tools on Home can be turned off in Settings › Appearance.
  const showTools = settings.ui.homeTools !== false;
  // Header (date and greeting) at the left of Home, or in the centre.
  const centered = settings.ui.homeHeaderCentered === true;

  return (
    <div className="mx-auto max-w-[1152px]">
      {/* ── Two-Column Atelier: Left Canvas (Header + Work area) + Right Rail (Tools high up) ─── */}
      <main className="space-y-6">
        <div className={cx('grid grid-cols-1 items-start gap-7', showTools && 'lg:grid-cols-[1fr_auto]')}>
          {/* Left Column: Header + Learning Content ──────────────────────────── */}
          <div className="min-w-0 space-y-3">
            {/* Top Header */}
            <header className={cx('flex flex-col gap-3 pt-1 sm:flex-row sm:items-start', centered ? 'sm:justify-center' : 'sm:justify-between')}>
              <div className={cx(centered && 'text-center')}>
                <p className="font-sans text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase">
                  {eyebrow}
                </p>
                <h1 className="mt-0.5 font-serif text-[32px] leading-tight font-semibold tracking-tight text-ink sm:text-[36px]">
                  <GreetingWithNameUnderline greeting={greeting} name={name} />
                </h1>
              </div>

              {plan === 'free' && (
                <button
                  type="button"
                  onClick={() => openPlans()}
                  className="inline-flex h-8 shrink-0 items-center rounded-full border border-line-strong/60 bg-raised/40 px-3.5 text-[13px] font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-raised hover:text-ink"
                >
                  <UiText source={'Lingua{0}'} values={[<span key="plus" className="text-accent-text">+</span>]} />
                </button>
              )}
            </header>

            {/* A pen line under the greeting, over the three studies. */}
            <svg aria-hidden viewBox="0 0 400 8" preserveAspectRatio="none" className="mt-5 h-2 w-full overflow-visible text-accent">
              <path d="M2 4.6C60 2 120 6.8 200 4C280 1.6 340 6.4 398 3.6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.5} />
            </svg>

            {/* 1. Where you left off & Cute Time a Day Meter (Side by side, no background) */}
            <section aria-label="Current studies" className="mt-5 grid grid-cols-1 items-stretch gap-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1.2fr)]">
              <WhereLeftOffCard data={leftOff} variant="hero" className="h-full" />
              <PenDivider />
              <WordsTodayCard className="h-full" />
              <PenDivider />
              <TimeADayMeter lang={language.id} goalMinutes={goal} className="h-full bg-transparent" />
            </section>

            {/* 2. Next step from Cursus (Alphabet / Marks / Course), where the build has Cursus */}
            {shows('cursus') && (
              <section aria-label="Next step in Cursus">
                <CursusNextStepCard data={cursusStep} variant="banner" />
              </section>
            )}
          </div>

          {/* Right Column: Tools, its heading on the greeting's line and its icons level with the cards ─── */}
          {showTools && (
            <div className="pt-0.5 lg:pt-1">
              <ToolsBar mode="rail" />
            </div>
          )}
        </div>

        {/* ── Full-Width Sections: What next & Discover more (close to Next in Cursus) ── */}
        {/* 3. What next: Suggestions horizontally swipeable, filled up colored, minimal */}
        <WhatNextSection suggestions={whatNextItems} />

        {/* 4. Discover more: In style of Explora (all same size cards, daily rotating) */}
        <DiscoverMoreSection items={discoverItems} />
      </main>
    </div>
  );
}
