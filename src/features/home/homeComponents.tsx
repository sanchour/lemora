import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Route,
  Languages,
  BookA,
  Tv,
  Film,
  Headphones,
  Layers,
} from 'lucide-react';
import { BookCover } from '@/features/codex/library/BookCover';
import { LevelBadge } from '@/features/explora/components/LevelBadge';
import { Art } from '@/features/mundus/Art';
import { LESSON_ICON } from '@/features/cursus/course/parts';
import { patchSetting } from '@/data/settings';
import { useDueWords } from '@/data/study';
import { useApp } from '@/app/context';
import type { Settings } from '@/data/settings';
import { UiText, useUi } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { Hand } from '@/design/drawings';
import {
  useHomeTools,
  type HomeToolItem,
  type LeftOffData,
  type CursusStepData,
  type WhatNextItem,
  type DiscoverItem,
} from './homeData';

/** Tactile 3D bottom bevel color matching Cursus AdventurePath */
export const cursusEdge = (hue: string, amount = 28) =>
  `color-mix(in oklab, ${hue} ${100 - amount}%, black)`;

// ── Hand-Drawn / Scriptorium Duotone Tool SVGs ───────────────────────────────

export function ToolDuotoneIcon({ id, className = 'size-8' }: { id: HomeToolItem['id']; className?: string }) {
  switch (id) {
    case 'codex':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M24 13C17 9 8 11 5 13v24c5-2 13-2 19 2 6-4 14-4 19-2V13c-3-2-12-4-19 0Z" stroke="var(--ink)" />
          <path d="M24 13v26" stroke="var(--ink)" />
          <path d="M33 11v14l-3-2.5-3 2.5V11" stroke="#6b8e78" fill="#6b8e78" fillOpacity={0.3} />
        </svg>
      );
    case 'sonus':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 26v-6a12 12 0 0 1 24 0v6" stroke="var(--ink)" />
          <rect x="8" y="24" width="7" height="13" rx="3.5" stroke="var(--ink)" fill="var(--accent)" fillOpacity={0.25} />
          <rect x="33" y="24" width="7" height="13" rx="3.5" stroke="var(--ink)" fill="var(--accent)" fillOpacity={0.25} />
          <path d="M8 20a16 16 0 0 1 32 0" stroke="var(--accent)" strokeWidth={1.8} />
        </svg>
      );
    case 'cantus':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 32V14l16-4v18" stroke="var(--ink)" />
          <path d="M19 14l16-4v4.5l-16 4Z" stroke="var(--ink)" fill="#b4587e" fillOpacity={0.35} />
          <ellipse cx="14.5" cy="33.5" rx="4.5" ry="3.5" transform="rotate(-18 14.5 33.5)" stroke="var(--ink)" fill="#b4587e" fillOpacity={0.3} />
          <ellipse cx="30.5" cy="29.5" rx="4.5" ry="3.5" transform="rotate(-18 30.5 29.5)" stroke="var(--ink)" fill="#b4587e" fillOpacity={0.3} />
          <path d="M38 18c2.5 2 3.8 5 3.2 8.5" stroke="#b4587e" strokeWidth={1.8} strokeLinecap="round" />
          <path d="M42 14c3.5 3.2 5.2 7.8 4.3 12.5" stroke="#b4587e" strokeWidth={1.8} strokeLinecap="round" opacity={0.6} />
        </svg>
      );
    case 'visio':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="7" y="16" width="34" height="23" rx="3" stroke="var(--ink)" fill="var(--surface)" />
          <path d="M7 16h34v-7H7v7Z" stroke="var(--ink)" fill="#6b8e78" fillOpacity={0.25} />
          <path d="M14 9l4 7M22 9l4 7M30 9l4 7" stroke="var(--ink)" strokeWidth={1.8} />
          <path d="M21 23l8 4.5-8 4.5V23Z" stroke="#6b8e78" fill="#6b8e78" fillOpacity={0.35} />
        </svg>
      );
    case 'thesaurus':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="14" y="8" width="26" height="28" rx="3.5" transform="rotate(6 27 22)" stroke="var(--ink)" strokeOpacity={0.35} />
          <rect x="8" y="12" width="26" height="28" rx="3.5" stroke="var(--ink)" fill="var(--surface)" />
          <circle cx="21" cy="26" r="6" stroke="#6b8e78" fill="#6b8e78" fillOpacity={0.25} />
          <path d="M18.5 26l2 2 3.5-4" stroke="#6b8e78" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'ludus':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="6" y="15" width="36" height="21" rx="10.5" stroke="var(--ink)" fill="var(--surface)" />
          <path d="M16 21v8M12 25h8" stroke="var(--ink)" strokeWidth={2.2} strokeLinecap="round" />
          <circle cx="30" cy="23" r="1.8" fill="var(--accent)" />
          <circle cx="34" cy="27" r="1.8" fill="var(--accent)" />
        </svg>
      );
    case 'mentis':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M16 41h16M24 23v18" stroke="var(--ink)" />
          <path d="M15 23h18l-3.5-12h-11L15 23Z" stroke="var(--ink)" fill="var(--accent)" fillOpacity={0.25} />
          <path d="M18 27c2 2 6 2 12 0" stroke="var(--accent)" strokeWidth={1.8} strokeLinecap="round" />
        </svg>
      );
    case 'diarium':
      // A quill over a page, its last line still wet in the accent.
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 12h17M10 19h13M10 26h9" stroke="var(--ink)" opacity={0.55} />
          <path d="M10 33c4-2 7 1.5 11-0.5" stroke="var(--accent)" strokeWidth={1.9} />
          <path d="M40 7C30 9 23 17 20 30l2.5-1.5C26 20 32 13 40 7Z" stroke="var(--ink)" fill="#9d8fcb" fillOpacity={0.3} />
          <path d="M20 30l-2 6" stroke="var(--ink)" />
        </svg>
      );
    case 'atlas':
      // Words as stars joined by threads: a small constellation, one word in the accent.
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M13 34L23 15L35 29M13 34L35 29M35 29L41 39" stroke="var(--ink)" strokeWidth={1.6} opacity={0.55} />
          <circle cx="23" cy="14" r="5.5" stroke="var(--ink)" fill="var(--accent)" fillOpacity={0.3} />
          <circle cx="12.5" cy="34.5" r="4.5" stroke="var(--ink)" fill="#6b8e78" fillOpacity={0.3} />
          <circle cx="35.5" cy="28.5" r="4" stroke="var(--ink)" />
          <circle cx="41.5" cy="39.5" r="2.2" stroke="var(--accent)" />
        </svg>
      );
    case 'alphabet':
      // A letter in two hands: a capital drawn in ink, its small one in the accent, on a ruled line.
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8 36L16.5 12L25 36M11.5 27h10" stroke="var(--ink)" />
          <path d="M37 24c-4.5-1.5-8 0.5-8 5.5s3.5 7 8 5.5V22" stroke="var(--accent)" strokeWidth={2} />
          <path d="M6 40.5c12-1 24-1 36 0" stroke="#6f9cc0" strokeWidth={1.8} opacity={0.7} />
        </svg>
      );
    case 'cursus':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 36c6-1 8-8 15-8s9-8 16-9" stroke="var(--ink)" strokeDasharray="2.5 2.5" />
          <circle cx="12" cy="35.5" r="2.5" fill="#6b8e78" />
          <circle cx="24" cy="28" r="2.5" fill="#6b8e78" />
          <path d="M35 10v16" stroke="var(--accent)" />
          <path d="M35 10.5 43 13.5l-8 3.5V10.5Z" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} />
        </svg>
      );
  }
}

// ── Layout Switcher Pill ─────────────────────────────────────────────────────

export function HomeLayoutSwitcher({ current }: { current: Settings['ui']['homeLayout'] }) {
  const activeLayout = current === 'today' ? 'rail' : current;

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-line/75 bg-surface/80 p-1 shadow-sm backdrop-blur-md">
      <span className="hidden px-2 font-sans text-[11px] font-bold tracking-wider text-ink-faint uppercase sm:inline">
        <UiText source={'Layout:'} />
      </span>
      <button
        type="button"
        onClick={() => void patchSetting('ui', { homeLayout: 'topline' })}
        className={cx(
          'rounded-full px-3 py-1 font-sans text-[12.5px] font-medium transition-colors',
          activeLayout === 'topline'
            ? 'bg-raised font-semibold text-ink shadow-sm'
            : 'text-ink-soft hover:text-ink',
        )}
      >
        <UiText source={'Topline'} />
      </button>
      <button
        type="button"
        onClick={() => void patchSetting('ui', { homeLayout: 'rail' })}
        className={cx(
          'rounded-full px-3 py-1 font-sans text-[12.5px] font-medium transition-colors',
          activeLayout === 'rail'
            ? 'bg-raised font-semibold text-ink shadow-sm'
            : 'text-ink-soft hover:text-ink',
        )}
      >
        <UiText source={'Right rail'} />
      </button>
      <button
        type="button"
        onClick={() => void patchSetting('ui', { homeLayout: 'shelf' })}
        className={cx(
          'rounded-full px-3 py-1 font-sans text-[12.5px] font-medium transition-colors',
          activeLayout === 'shelf'
            ? 'bg-raised font-semibold text-ink shadow-sm'
            : 'text-ink-soft hover:text-ink',
        )}
      >
        <UiText source={'Bottom shelf'} />
      </button>
    </div>
  );
}

// ── Greeting with Minimal Aesthetic Line Under Name ──────────────────────────

export function GreetingWithNameUnderline({
  greeting,
  name,
}: {
  greeting: string;
  name?: string;
}) {
  if (!name) return <>{greeting}</>;
  const idx = greeting.lastIndexOf(name);
  if (idx === -1) return <>{greeting}</>;
  const before = greeting.slice(0, idx);
  const after = greeting.slice(idx + name.length);

  return (
    <>
      {before}
      <span className="relative inline-block pb-0.5">
        <span>{name}</span>
        <svg
          viewBox="0 0 120 8"
          preserveAspectRatio="none"
          aria-hidden
          className="pointer-events-none absolute -bottom-1 left-0 h-2 w-full overflow-visible text-accent"
        >
          <path
            d="M2 5.5C35 2.5 85 2.5 118 5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </span>
      {after}
    </>
  );
}

// ── Where You Left Off ───────────────────────────────────────────────────────

/** A pen-drawn vertical line, in the accent, a little uneven, fading at its ends. */
export function PenDivider({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 8 200" preserveAspectRatio="none" className={cx('hidden w-2 self-stretch overflow-visible text-accent md:block', className)}>
      <path d="M4.5 2C2 40 6.5 80 4 120C2 155 6 185 3.6 198" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.55} />
      <circle cx={4} cy={100} r={2.2} fill="currentColor" opacity={0.7} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Words for today: a few from the Thesaurus cards that are due, big and quiet, in the middle of their space. */
export function WordsTodayCard({ className }: { className?: string }) {
  const { language } = useApp();
  const words = useDueWords(language.id, 5);
  return (
    <Link to="/thesaurus/study/all?mode=recall" className={cx('group flex flex-col items-center justify-start text-center', className)}>
      <span className="inline-flex items-center gap-2">
        <Layers size={16} strokeWidth={2.3} className="text-accent-text" aria-hidden />
        <span className="font-serif text-[18px] font-bold tracking-tight text-ink transition-colors group-hover:text-accent-text"><UiText source={'Words for today'} /></span>
      </span>
      {words?.length ? (
        <ul className="mt-4 space-y-2.5">
          {words.map((w) => (
            <li key={w.term} className="leading-tight">
              <span className="block font-serif text-[20px] font-semibold text-ink">{w.term}</span>
              <span className="block max-w-[15rem] truncate text-[12.5px] text-ink-faint">{w.meaning}</span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="flex flex-1 items-center"><p className="max-w-[14rem] text-[13px] text-ink-faint"><UiText source={'Nothing due today. Add words to a deck to see them here.'} /></p></span>
      )}
      <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-ink-soft transition-colors group-hover:text-accent-text">
        <UiText source={'Review'} /> <ArrowRight size={12} aria-hidden />
      </span>
    </Link>
  );
}

export function WhereLeftOffCard({
  data,
  variant: _variant = 'hero',
  className,
}: {
  data: LeftOffData;
  variant?: 'hero' | 'banner' | 'lectern';
  className?: string;
}) {
  // The last book in Codex, centred: a large cover, its title, and a bar with a small percentage.
  return (
    <Link to={data.to} className={cx('group flex flex-col items-center justify-start text-center', className)}>
      <span className="inline-flex items-center gap-2">
        <BookOpen size={16} strokeWidth={2.3} className="text-accent-text" aria-hidden />
        <span className="font-serif text-[18px] font-bold tracking-tight text-ink"><UiText source={'Where you left off'} /></span>
      </span>

      <span className="mt-5 block h-52 w-[9.5rem] shrink-0 overflow-hidden rounded-xl bg-sunken shadow-elev-2 transition-transform duration-200 group-hover:-rotate-1">
        {data.book ? (
          <BookCover text={data.book} size="sm" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center bg-accent-soft text-accent-text"><BookOpen size={34} /></span>
        )}
      </span>

      <h3 className="mt-4 line-clamp-2 max-w-[16rem] font-serif text-[19px] leading-tight font-bold tracking-tight text-ink transition-colors group-hover:text-accent-text">{data.title}</h3>
      <span className="mt-3 flex w-40 items-center gap-2">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
          <span className="block h-full bg-accent transition-all duration-300" style={{ width: `${Math.max(4, data.percent)}%` }} />
        </span>
        <span className="text-[11px] font-semibold text-ink-faint tabular-nums">{data.percent}%</span>
      </span>
    </Link>
  );
}

// ── Next Step from Cursus ────────────────────────────────────────────────────

export function CursusNextStepCard({
  data,
  variant = 'banner',
  className,
}: {
  data: CursusStepData | null;
  variant?: 'card' | 'banner' | 'calligraphic';
  className?: string;
}) {
  if (!data) return null;
  const isAlphabet = data.type === 'alphabet';
  const isGrammar = data.type === 'grammar';
  const isBanner = variant === 'banner';

  const hue = data.unitHue ?? 'var(--accent)';
  const edgeColor = cursusEdge(hue);

  // Lesson icon from Cursus parts, with fallbacks for alphabet / grammar
  const LessonIcon = data.lessonId
    ? LESSON_ICON[data.lessonId] ?? Route
    : isAlphabet
      ? Languages
      : isGrammar
        ? BookA
        : Route;

  const isStart =
    (data.completedSteps === 0 || data.lessonIndex === 0) && data.progressPercent === 0;

  const totalLessons = data.totalLessonsInUnit ?? 5;
  const currentStep = data.lessonIndex ?? 0;

  return (
    <Link
      to={data.to}
      className={cx(
        'group block rounded-[24px] border border-line/80 bg-transparent p-5 transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-elev-1 sm:p-6',
        className,
      )}
    >
      {/* ── Top Header Row: Central, Fat, Clear Heading ─────────────────────── */}
      <div className="mb-4 grid grid-cols-1 items-center gap-2 sm:grid-cols-3">
        {/* Left: Cursus Level & Unit Subtitle */}
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          {data.unitLevel && (
            <span
              className="inline-grid size-5.5 place-items-center rounded-md font-sans text-[11px] font-bold text-white shadow-2xs"
              style={{ background: hue }}
            >
              {data.unitLevel}
            </span>
          )}
          <span className="font-sans text-[12.5px] font-bold text-ink-soft">
            {data.subtitle}
          </span>
        </div>

        {/* Center: Prominent, Fat Cursus Title */}
        <div className="flex items-center justify-center gap-2 text-center">
          <Route size={18} strokeWidth={2.3} className="text-accent-text" aria-hidden />
          <h2 className="font-serif text-[20px] font-bold tracking-tight text-ink sm:text-[22px]">
            <UiText source={isAlphabet ? 'Alphabet & Marks' : isGrammar ? 'Grammar Studio' : 'Next in Cursus'} />
          </h2>
        </div>

        {/* Right: Trail Step Progress Indicator */}
        <div className="flex items-center justify-center gap-2.5 sm:justify-end">
          <span className="font-sans text-[12px] font-semibold text-ink-soft tabular-nums">
            <UiText
              source={'Step {0} of {1}'}
              values={[Math.min(totalLessons, currentStep + 1), totalLessons]}
            />
          </span>

          {/* Cursus Adventure Trail Dots */}
          <div className="flex items-center gap-1" aria-hidden>
            {Array.from({ length: Math.min(8, totalLessons) }).map((_, i) => (
              <span
                key={i}
                className={cx(
                  'h-1.5 rounded-full transition-all duration-300',
                  i < currentStep
                    ? 'w-3.5'
                    : i === currentStep
                      ? 'w-5 shadow-2xs'
                      : 'w-1.5 bg-sunken/80',
                )}
                style={{
                  background: i <= currentStep ? hue : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Center Stage: Tactile Adventure Node + Unit Details + Cursus Button ── */}
      <div className={cx('flex gap-4 sm:gap-5', isBanner ? 'items-center' : 'items-start sm:items-center')}>
        {/* Cursus Trail Stop Node (Tactile 3D Pressed Circle) */}
        <div
          className="grid size-14 shrink-0 place-items-center rounded-full text-white sm:size-16"
          style={{
            background: hue,
            boxShadow: `0 4px 0 ${edgeColor}`,
          }}
          aria-hidden
        >
          {isAlphabet && data.glyphs && data.glyphs.length > 0 ? (
            <span className="font-serif text-[22px] font-bold sm:text-[24px]">
              {data.glyphs[0]}
            </span>
          ) : (
            <LessonIcon size={26} strokeWidth={2.4} />
          )}
        </div>

        {/* Text Details: Unit Title & Lesson Label */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[11.5px] font-bold tracking-[0.12em] uppercase text-ink-faint">
              {data.lessonTitle ? `${data.lessonTitle} · Lesson` : data.badge}
            </span>
          </div>

          <h3 className="mt-0.5 font-serif text-[21px] font-bold text-ink leading-snug transition-colors group-hover:text-accent-text sm:text-[24px]">
            {data.title}
          </h3>
        </div>

        {/* Cursus Tactile Action Button */}
        <div className="hidden shrink-0 sm:block">
          <span
            className="inline-flex h-9.5 items-center gap-2 rounded-xl px-4 font-sans text-[13px] font-bold tracking-[0.03em] uppercase text-white shadow-sm transition-all duration-150 group-hover:brightness-105 active:translate-y-0.5"
            style={{
              background: hue,
              boxShadow: `0 3px 0 ${edgeColor}`,
            }}
          >
            <span>
              <UiText source={isStart ? 'Start' : 'Continue'} />
            </span>
            <ArrowRight size={14} strokeWidth={2.5} aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Fallback Art Cover for Explora Cards ─────────────────────────────────────

function DefaultArtCover({ kind, title }: { kind: string; title: string }) {
  const Icon = (() => {
    if (kind === 'series') return Tv;
    if (kind === 'films') return Film;
    if (kind === 'books') return BookOpen;
    if (kind === 'podcasts' || kind === 'audiobooks') return Headphones;
    if (kind === 'themes') return Layers;
    return BookOpen;
  })();

  const gradient = (() => {
    if (kind === 'series') return 'from-[#2a3852] to-[#151c2c]';
    if (kind === 'films') return 'from-[#3c2a38] to-[#1f151e]';
    if (kind === 'books') return 'from-[#22352b] to-[#121c17]';
    if (kind === 'podcasts') return 'from-[#382b26] to-[#1d1613]';
    return 'from-[#363225] to-[#1d1b14]';
  })();

  return (
    <div className={cx('flex size-full flex-col justify-between p-3.5 bg-gradient-to-br text-white', gradient)}>
      <div className="flex w-full items-center justify-end opacity-40">
        <Icon size={20} strokeWidth={1.8} aria-hidden />
      </div>
      <div className="w-full text-left">
        <p className="line-clamp-2 font-serif text-[13.5px] font-bold leading-snug drop-shadow-sm text-white/95">
          {title}
        </p>
      </div>
    </div>
  );
}

// ── What Next (Suggestions that randomly cycle, horizontally swipeable) ────────

export function WhatNextSection({
  suggestions,
  items,
  variant: _variant = 'shelf',
}: {
  suggestions?: WhatNextItem[];
  items?: WhatNextItem[];
  variant?: 'shelf' | 'cards3' | 'grid4' | 'shelf5';
}) {
  // At most five, side by side, nothing to scroll: the order and the draw are made in useHomeWhatNext (best fit first).
  const shown = (suggestions ?? items ?? []).slice(0, 5);

  return (
    <section aria-label="What next" className="space-y-2.5">
      <h2 className="text-center font-serif text-[22px] font-bold tracking-tight text-ink sm:text-[24px]">
        <UiText source={'What next'} />
      </h2>

      <div aria-label="What next suggestions" className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-5">
        {shown.map((item) => {
          const Icon = item.icon;
          const literal = item.id.startsWith('tip:') || item.id.startsWith('next:') || item.title.startsWith('Review ') || item.title.startsWith('Read “') || item.title.startsWith('The next ');
          return (
            // No card: a drawn icon on a soft blob and the step's name; the one line of why appears when you point at it.
            <Link key={item.id} to={item.to} className="group relative flex min-w-0 flex-col items-center px-1 pt-1 text-center outline-none">
              <span className="relative grid size-16 place-items-center transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 group-focus-visible:scale-110">
                <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 size-full">
                  <path d="M24 3C34 2 45 10 45 22C46 35 37 46 25 45C12 46 2 36 3 24C3 12 12 4 24 3Z" style={{ fill: `color-mix(in oklab, ${item.hue} 26%, transparent)` }} />
                </svg>
                <span className="relative">{item.hand ? <Hand name={item.hand} size={34} /> : <Icon size={26} strokeWidth={1.7} aria-hidden className="text-ink" />}</span>
                {item.fresh && <span className="absolute top-0.5 right-0.5 size-3 rounded-full border-2 border-bg bg-accent" aria-hidden />}
              </span>
              <h3 className="mt-2 line-clamp-2 font-serif text-[16px] leading-snug font-bold tracking-tight text-ink transition-colors group-hover:text-accent-text group-focus-visible:text-accent-text">
                {literal ? item.title : <UiText source={item.title} />}
              </h3>
              <p className="mt-0.5 line-clamp-2 min-h-[2.4em] text-[12px] leading-snug text-ink-soft opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                {item.id.startsWith('tip:') || item.id.startsWith('next:') ? item.detail : <UiText source={item.detail} />}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// Keep ContinueLearningSection as alias so existing callers continue to work
export const ContinueLearningSection = WhatNextSection;

// ── Discover More (Explora Style, All Same Size, Horizontally Swipeable) ───────

export function DiscoverMoreSection({
  items,
  variant: _variant = 'shelf',
}: {
  items: DiscoverItem[];
  variant?: 'shelf' | 'cards4' | 'cards2' | 'grid4';
}) {
  const translateUi = useUi();
  const rowRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 6);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, []);

  // Start scrolled to the left whenever the picks change.
  useLayoutEffect(() => {
    if (rowRef.current) rowRef.current.scrollLeft = 0;
    updateScrollState();
  }, [items, updateScrollState]);

  useEffect(() => {
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState]);

  const scrollByAmount = (dir: number) => {
    const el = rowRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: 'smooth' });
  };

  const arrow = 'grid size-7.5 place-items-center rounded-full border border-line/70 bg-surface/80 text-ink shadow-2xs transition-all hover:border-accent hover:bg-raised active:scale-95 disabled:pointer-events-none disabled:opacity-30';

  return (
    <section aria-label="Discover more" className="-mt-5 space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <Link to="/explora" className="group inline-flex items-center gap-1.5 font-serif text-[22px] font-bold tracking-tight text-ink transition-colors hover:text-accent-text sm:text-[24px]">
          <span><UiText source={'Discover more'} /></span>
          <ChevronRight size={20} strokeWidth={2.4} className="text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:text-accent-text" aria-hidden />
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={() => scrollByAmount(-1)} disabled={!canPrev} aria-label={translateUi('Scroll left')} className={arrow}><ChevronLeft size={15} /></button>
          <button type="button" onClick={() => scrollByAmount(1)} disabled={!canNext} aria-label={translateUi('Scroll right')} className={arrow}><ChevronRight size={15} /></button>
        </div>
      </div>

      {/* Wide cards with soft corners, all the same size, scrolling sideways. */}
      <div
        ref={rowRef}
        onScroll={updateScrollState}
        tabIndex={0}
        aria-label="Discover more media"
        className="scrollbar-none -mx-4 flex snap-x justify-start gap-3.5 overflow-x-auto overscroll-x-contain px-4 pt-0.5 pb-2 outline-none [overflow-anchor:none] sm:mx-0 sm:px-0"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
      >
        {items.map((item) => (
          <Link key={item.id} to={item.to} className="group block w-[298px] shrink-0 snap-start text-left">
            <div className="relative aspect-[298/184] w-full overflow-hidden rounded-[28px] border border-line/60 bg-surface transition-colors duration-200 group-hover:border-accent">
              <Art query={item.query ?? null} fallback={<DefaultArtCover kind={item.kind} title={item.title} />} className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute top-3 left-3 z-10"><LevelBadge level={item.level} size="sm" /></div>
              <span className="absolute top-3 right-3 z-10 rounded-full bg-black/55 px-2.5 py-0.5 text-[10.5px] font-bold text-white/90 backdrop-blur-sm">{item.tag}</span>
            </div>
            <div className="mt-2 px-1">
              <h4 className="line-clamp-1 font-serif text-[14.5px] font-bold text-ink transition-colors group-hover:text-accent-text">{item.title}</h4>
              <p className="mt-0.5 truncate font-sans text-[11.5px] font-medium text-ink-soft">{item.sub || item.detail}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Tools Component: Topline, Right Rail, or Bottom Shelf ────────────────────

export function ToolsBar({
  mode,
}: {
  mode: 'topline' | 'rail' | 'shelf';
}) {
  const tools = useHomeTools();
  if (mode === 'topline') {
    return (
      <nav aria-label="Tools" className="w-full">
        <div className="flex flex-wrap items-center gap-2">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.to}
              className="group inline-flex h-9 items-center gap-2 rounded-full border border-line/70 bg-surface/80 px-3 py-1 text-ink transition-all hover:border-line-strong hover:bg-raised hover:shadow-xs active:scale-95"
            >
              <ToolDuotoneIcon id={tool.id} className="size-4" />
              <span className="font-sans text-[12.5px] font-semibold text-ink group-hover:text-accent-text">
                {tool.name}
              </span>
              <span className="hidden font-sans text-[11px] text-ink-soft sm:inline">
                · {tool.role}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    );
  }

  if (mode === 'rail') {
    return (
      <aside aria-label="Tools" className="flex flex-col items-center gap-3 lg:gap-3">
        <h2 className="text-center font-serif text-[20px] font-bold tracking-tight text-ink sm:text-[22px]">
          <UiText source={'Tools'} />
        </h2>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 lg:grid-cols-3 lg:gap-x-3 sm:gap-y-2.5">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.to}
              aria-label={`${tool.name} · ${tool.role}`}
              className="group relative flex flex-col items-center gap-1.5 text-center last:odd:col-span-2 last:odd:justify-self-center focus-visible:outline-none"
            >
              <span className="flex size-12 sm:size-13 items-center justify-center rounded-full border-[1.5px] border-line-strong/80 bg-transparent text-ink transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-accent group-hover:shadow-elev-2 group-hover:scale-105 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-accent">
                {/* Refined duotone icon perfectly sized for screen view */}
                <ToolDuotoneIcon
                  id={tool.id}
                  className="size-7 sm:size-7.5 text-ink transition-transform duration-200 group-hover:scale-110"
                />
              </span>

              <span className="font-serif text-[12.5px] sm:text-[13px] font-bold leading-tight text-ink transition-colors group-hover:text-accent-text">
                <UiText source={tool.name} />
              </span>

              {/* Smooth Hover Pop-up showing only what the tool is */}
              <div
                role="tooltip"
                className="pointer-events-none absolute right-full top-6 -translate-y-1/2 mr-3 z-40 hidden sm:flex items-center rounded-xl border border-line-strong/80 bg-raised/95 px-3 py-1.5 shadow-elev-2 backdrop-blur-md whitespace-nowrap opacity-0 -translate-x-1.5 scale-95 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:scale-100"
              >
                {/* Pop-up pointer notch */}
                <span
                  className="absolute -right-1.5 top-1/2 -translate-y-1/2 size-2.5 rotate-45 border-r border-t border-line-strong/80 bg-raised"
                  aria-hidden
                />
                <p className="relative z-10 font-sans text-[12px] font-medium text-ink">
                  {tool.role}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    );
  }

  // mode === 'shelf'
  return (
    <section aria-label="Tools" className="space-y-3 pt-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-[22px] font-semibold tracking-tight text-ink sm:text-[24px]">
          <UiText source={'Tools of the study'} />
        </h2>
        <span className="font-serif text-[12px] italic text-ink-faint">
          <UiText source={'At your desk'} />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            to={tool.to}
            className="group flex flex-col items-center rounded-[20px] border border-line/75 bg-surface/75 p-3 text-center transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface hover:shadow-elev-1"
          >
            <div className="flex size-11 items-center justify-center">
              <ToolDuotoneIcon id={tool.id} className="size-7.5" />
            </div>
            <span className="mt-1.5 font-sans text-[13.5px] font-semibold text-ink group-hover:text-accent-text">
              {tool.name}
            </span>
            <span className="mt-0.5 line-clamp-1 text-[11px] text-ink-soft">
              {tool.role}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Floating Ask ? Button ───────────────────────────────────────────────────

