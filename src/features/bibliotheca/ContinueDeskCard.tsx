import { memo } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BookOpen, Clapperboard, Headphones } from 'lucide-react';
import { UiText, useUi } from '@/design/i18n/UiText';
import { buttonClasses } from '@/design/primitives';
import { BookCover } from '@/features/codex/library/BookCover';
import { Artwork } from '@/features/sonus/library/Artwork';
import { Poster } from '@/features/visio/library/Poster';
import type { ContinueItem } from './types';

interface ContinueDeskCardProps {
  item: ContinueItem;
  lang: string;
}

/**
 * Featured Study Desk: The item currently open on your study desk.
 * Open, airy, scholarly layout inspired by Codex's LecternCard and Explora's HeroBillboard.
 */
export const ContinueDeskCard = memo(function ContinueDeskCard({ item, lang }: ContinueDeskCardProps) {
  const translateUi = useUi();
  const pct = item.pct ?? 0;
  const known = item.text?.stats ? Math.round(item.text.stats.knownShare * 100) : null;

  return (
    <div className="relative flex flex-col gap-6 rounded-3xl border border-line/80 bg-raised/50 p-6 sm:p-7 shadow-elev-1 transition-all duration-300 hover:border-line-strong hover:shadow-elev-2 md:flex-row md:items-center md:gap-8 lg:gap-10">
      {/* Left: Media Artwork Stage */}
      {item.kind === 'text' && item.text && (
        <Link
          to={item.to}
          className="group/cover relative block shrink-0 self-center md:self-start"
          aria-label={translateUi('Continue reading {0}', [item.title])}
        >
          <div className="relative w-36 sm:w-44 transition-transform duration-300 group-hover/cover:-translate-y-1">
            <BookCover text={item.text} size="lg" className="w-full shadow-elev-3" />
            {/* Swallowtail woven bookmark ribbon draped from top */}
            <div
              className="pointer-events-none absolute -top-2.5 right-3 z-10 h-10 w-4.5 bg-accent shadow-sm"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
              aria-hidden
            />
            {/* Obi-strip */}
            {pct > 0 && (
              <div className="absolute inset-x-0 bottom-2 border-y border-line-strong/30 bg-surface/95 px-2 py-0.5 text-center shadow-xs backdrop-blur-xs">
                <span className="text-[10px] font-bold text-ink tabular-nums">
                  <UiText source={'{0}% read'} values={[pct]} />
                </span>
              </div>
            )}
          </div>
        </Link>
      )}

      {item.kind === 'audio' && item.media && (
        <Link
          to={item.to}
          className="group/cover relative block shrink-0 self-center md:self-start"
          aria-label={translateUi('Continue {0}', [item.title])}
        >
          <div className="relative size-36 sm:size-44 transition-transform duration-300 group-hover/cover:-translate-y-1">
            <Artwork
              title={item.title}
              coverBlobId={item.media.coverBlobId}
              coverUrl={item.media.coverUrl}
              className="size-full shadow-elev-3"
              rounded="rounded-2xl"
            />
          </div>
        </Link>
      )}

      {item.kind === 'video' && item.video && (
        <Link
          to={item.to}
          className="group/cover relative block shrink-0 self-center md:self-start"
          aria-label={translateUi('Continue {0}', [item.title])}
        >
          <div className="relative w-56 sm:w-64 aspect-video transition-transform duration-300 group-hover/cover:-translate-y-1">
            <Poster
              title={item.title}
              coverBlobId={item.video.coverBlobId}
              coverUrl={item.video.coverUrl}
              className="size-full rounded-2xl shadow-elev-3"
              fill
            />
          </div>
        </Link>
      )}

      {/* Center/Right: Information, Quote & Controls */}
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
        <div>
          {/* Eyebrow & Tool Pill */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="size-2 rounded-full bg-accent animate-pulse" aria-hidden />
            <span className="text-[11px] font-bold tracking-[0.14em] text-accent-text uppercase">
              {item.kind === 'text' ? (
                <UiText source={'Continue reading'} />
              ) : item.kind === 'audio' ? (
                <UiText source={'Continue listening'} />
              ) : (
                <UiText source={'Continue watching'} />
              )}
            </span>
            <span className="text-ink-faint">·</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sunken px-2.5 py-0.5 text-[11px] font-bold text-ink-soft">
              {item.kind === 'text' ? (
                <BookOpen size={11} className="text-amber-400" aria-hidden />
              ) : item.kind === 'audio' ? (
                <Headphones size={11} className="text-emerald-400" aria-hidden />
              ) : (
                <Clapperboard size={11} className="text-sky-400" aria-hidden />
              )}
              {item.room}
            </span>
          </div>

          {/* Title */}
          <Link to={item.to} className="group block">
            <h3
              lang={lang}
              className="font-serif text-2xl font-semibold leading-tight text-ink transition-colors group-hover:text-accent-text sm:text-3xl"
            >
              {item.title}
            </h3>
          </Link>
          {item.authorOrCollection && (
            <p className="mt-1 text-[15px] font-medium text-ink-soft">{item.authorOrCollection}</p>
          )}
        </div>

        {/* Progress & Stats */}
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm font-semibold">
            <span className="tabular-nums text-ink">{item.detail}</span>
            {known !== null && (
              <span className="tabular-nums text-ink-soft">
                <UiText source={'· {0}% known'} values={[known]} />
              </span>
            )}
            {item.text?.chapterCount && item.text.chapterCount > 1 && item.progress && (
              <span className="tabular-nums text-ink-faint">
                <UiText source={' · ch. {0} of {1}'} values={[item.progress.chapterIndex + 1, item.text.chapterCount]} />
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-2 max-w-md overflow-hidden rounded-full bg-sunken">
            <div
              className="h-full origin-left rounded-full bg-accent transition-transform duration-300"
              style={{ transform: `scaleX(${Math.max(0.02, pct / 100)})` }}
            />
          </div>

          {/* Primary Action Button */}
          <div className="pt-1.5">
            <Link to={item.to} className={buttonClasses('primary', 'md')}>
              <UiText source={'Continue {0}'} values={[<ArrowRight size={16} aria-hidden />]} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});
