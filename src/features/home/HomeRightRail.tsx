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
  CursusNextStepCard,
  WhatNextSection,
  DiscoverMoreSection,
  AskFloatingButton,
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
  const { language } = useApp();
  const plan = usePlan();
  const openPlans = useUI((s) => s.openPlans);
  const { eyebrow, greeting, name } = useHomeHeader();
  const goal = language.dailyGoal?.readMinutes ?? 15;

  const leftOff = useHomeLeftOff();
  const cursusStep = useHomeCursus();
  const whatNextItems = useHomeWhatNext();
  const discoverItems = useHomeDiscover();

  return (
    <div className="mx-auto max-w-[1152px] pb-20">
      {/* ── Two-Column Atelier: Left Canvas (Header + Work area) + Right Rail (Tools high up) ─── */}
      <main className="space-y-6">
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_auto]">
          {/* Left Column: Header + Learning Content ──────────────────────────── */}
          <div className="min-w-0 space-y-5">
            {/* Top Header */}
            <header className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-sans text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase">
                  {eyebrow}
                </p>
                <h1 className="mt-1 font-serif text-[34px] leading-tight font-semibold tracking-tight text-ink sm:text-[40px]">
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

            {/* 1. Where you left off & Cute Time a Day Meter (Side by side, no background) */}
            <section aria-label="Current studies" className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-[1.55fr_1fr]">
              <WhereLeftOffCard data={leftOff} variant="hero" className="h-full bg-transparent" />
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
          <div className="pt-0.5 lg:pt-10">
            <ToolsBar mode="rail" />
          </div>
        </div>

        {/* ── Full-Width Sections: What next & Discover more (close to Next in Cursus) ── */}
        {/* 3. What next: Suggestions horizontally swipeable, filled up colored, minimal */}
        <WhatNextSection suggestions={whatNextItems} />

        {/* 4. Discover more: In style of Explora (all same size cards, daily rotating) */}
        <DiscoverMoreSection items={discoverItems} />
      </main>

      {/* ── Floating Ask ? ───────────────────────────────────────────────────── */}
      <AskFloatingButton />
    </div>
  );
}
