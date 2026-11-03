import { UiText, useUi } from '@/design/i18n/UiText';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useApp } from '@/app/context';
import type { ReadingProgress, Text } from '@/data/types';
import { buttonClasses } from '@/design/primitives';
import { BookCover } from './BookCover';
import { codexGoal, GoalRing, useReadToday } from '../reader/readingGoal';

interface LecternCardProps {
  text: Text;
  progress: ReadingProgress;
}

/**
 * The Scholar's Reading Desk: The book currently resting open on the study desk.
 * Open and airy without a bounding background box:
 * Left: 2:3 book cover with bookmark ribbon
 * Center: Eyebrow, Title, Subtitle/Author, Progress bar, and Action buttons
 * Right: Minimalist, aesthetic reading statistics (Daily goal, To finish book, Known vocabulary)
 */
export function LecternCard({ text, progress }: LecternCardProps) {
  const translateUi = useUi();
  const { language } = useApp();
  const pct = Math.round(progress.percent * 100);
  const known = text.stats ? Math.round(text.stats.knownShare * 100) : null;
  const level = text.level ?? text.stats?.level;

  // Daily goal in Codex
  const readTodayMs = useReadToday(text.lang) ?? 0;
  const todayMinutes = Math.round(readTodayMs / 60_000);
  const goalMinutes = codexGoal(language);

  // Time remaining estimate (approx 160 words per minute)
  const wordsTotal = text.wordCount ?? 0;
  const wordsLeft = Math.max(0, Math.round(wordsTotal * (1 - progress.percent)));
  const minutesLeft = Math.round(wordsLeft / 160);

  const timeLeftDisplay = useMemo(() => {
    if (pct >= 100 || text.finishedAt) return '0 min';
    if (minutesLeft >= 60) {
      const h = Math.floor(minutesLeft / 60);
      const m = minutesLeft % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${Math.max(1, minutesLeft)} min`;
  }, [pct, text.finishedAt, minutesLeft]);

  return (
    <div>
      <h2 className="mb-5 font-serif text-2xl font-semibold tracking-tight text-accent-text sm:text-[28px]">
        <UiText source={'Continue reading'} />
      </h2>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-start lg:gap-12 xl:gap-16">
        {/* Left + Center: Cover and Book Information (anchored to the left) */}
        <div className="flex min-w-0 max-w-2xl shrink-0 items-stretch gap-5 sm:gap-7 lg:gap-8">
          {/* Book Cover with swallowtail bookmark ribbon */}
          <Link
            to={`/codex/read/${text.id}`}
            className="group relative block shrink-0 self-start"
            aria-label={translateUi('Continue reading {0}', [text.title])}
          >
            <BookCover
              text={text}
              size="lg"
              className="w-32 shadow-elev-2 ring-2 ring-transparent ring-offset-2 ring-offset-bg transition-shadow duration-200 group-hover:ring-accent/65 group-hover:shadow-[0_0_0_4px_var(--accent-soft)] sm:w-36 lg:w-40"
            />
            {/* Swallowtail woven bookmark ribbon draped from top */}
            <div
              className="pointer-events-none absolute -top-2.5 right-3.5 z-10 h-10 w-4 bg-accent shadow-xs"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
              aria-hidden
            />
          </Link>

          {/* Title, Subtitle at top; Progress bar & Action buttons aligned to bottom line of book */}
          <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5">
            <div>
              <Link to={`/codex/read/${text.id}`} className="group block">
                <h3 lang={text.lang} className="font-serif text-2xl font-semibold leading-tight text-ink transition-colors group-hover:text-accent-text sm:text-[26px] lg:text-[28px]">
                  {text.title}
                </h3>
              </Link>
              {text.author && <p className="mt-1.5 text-[15px] font-medium text-ink-soft">{text.author}</p>}
            </div>

            {/* Reading progress, progress bar & action buttons shifted to bottom line of book */}
            <div className="mt-4 space-y-2.5">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 text-[13.5px] font-semibold">
                <span className="tabular-nums text-accent-text">
                  <UiText source={'{0}% read'} values={[pct]} />
                </span>
                {text.chapterCount > 1 && (
                  <span className="tabular-nums text-ink-faint">
                    <UiText source={' · ch. {0} of {1}'} values={[progress.chapterIndex + 1, text.chapterCount]} />
                  </span>
                )}
              </div>

              <div className="h-2 max-w-xs overflow-hidden rounded-full bg-accent-soft">
                <div
                  className="h-full origin-left rounded-full bg-accent transition-transform duration-300"
                  style={{ transform: `scaleX(${Math.max(0.02, progress.percent)})` }}
                />
              </div>

              {/* Action buttons: Continue reading + minimal Grade your book */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link to={`/codex/read/${text.id}`} className={buttonClasses('accent', 'md')}>
                  <UiText source={'Continue reading'} />
                  <ArrowRight size={15} aria-hidden />
                </Link>
                <Link
                  to="/codex/graded"
                  className="no-callout inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-sage/35 bg-sage-soft px-4 text-sm font-semibold text-sage-text transition-colors hover:border-sage/60 hover:bg-sage-soft/80 active:scale-[0.97]"
                >
                  <UiText source={'Grade your book'} />
                  {level && (
                    <span className="ml-0.5 rounded-md bg-raised/80 px-1.5 py-0.5 text-[11px] font-bold text-sage-text">
                      {level}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

      {/* Right: Minimalist & aesthetic reading statistics (pulled in closer to the left) */}
      <div className="grid grid-cols-3 gap-3 border-t border-line/60 pt-4 sm:gap-6 lg:mt-0 lg:flex lg:w-64 xl:w-72 lg:shrink-0 lg:flex-col lg:justify-between lg:self-stretch lg:border-t-0 lg:border-l lg:pl-8 xl:pl-10 lg:pt-0 lg:py-0.5">
        {/* Metric 1: Daily goal */}
        <div>
          <p className="text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">
            <UiText source={'Daily goal'} />
          </p>
          <div className="mt-1 flex items-center gap-2.5">
            <GoalRing value={todayMinutes / Math.max(1, goalMinutes)} size={32} stroke={3} />
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-xl lg:text-2xl font-semibold leading-none text-ink tabular-nums">
                {todayMinutes}
              </span>
              <span className="text-xs font-semibold text-ink-faint">
                <UiText source={'of {0} min'} values={[goalMinutes]} />
              </span>
            </div>
          </div>
        </div>

        {/* Subtle hairline divider on desktop */}
        <div className="hidden h-px w-full bg-line/60 lg:block" aria-hidden />

        {/* Metric 2: Estimated time to finish book */}
        <div>
          <p className="text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">
            <UiText source={'To finish book'} />
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
            <span className="font-serif text-xl lg:text-2xl font-semibold leading-none text-ink tabular-nums">
              {timeLeftDisplay}
            </span>
            {wordsLeft > 0 && (
              <span className="text-xs text-ink-faint tabular-nums">
                <span aria-hidden>· </span>
                <UiText source={'{0} words'} values={[wordsLeft.toLocaleString()]} />
              </span>
            )}
          </div>
        </div>

        {/* Subtle hairline divider on desktop */}
        <div className="hidden h-px w-full bg-line/60 lg:block" aria-hidden />

        {/* Metric 3: Known vocabulary */}
        <div>
          <p className="text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">
            <UiText source={'Known vocabulary'} />
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
            <span className="font-serif text-xl lg:text-2xl font-semibold leading-none text-ink tabular-nums">
              {known !== null ? `${known}%` : level ?? '—'}
            </span>
            {text.stats?.newWords !== undefined && (
              <span className="text-xs font-semibold text-sage-text tabular-nums">
                <span aria-hidden>· </span>
                <UiText source={'{0} to learn'} values={[text.stats.newWords.toLocaleString()]} />
              </span>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
