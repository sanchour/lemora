import { memo } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BookOpen, Clapperboard, Headphones, Play } from 'lucide-react';
import { UiText, useUi } from '@/design/i18n/UiText';
import { BookCover } from '@/features/codex/library/BookCover';
import { Artwork } from '@/features/sonus/library/Artwork';
import { Poster } from '@/features/visio/library/Poster';
import type { ContinueItem } from './types';

interface ContinueCardProps {
  item: ContinueItem;
  lang: string;
}

export const ContinueCard = memo(function ContinueCard({ item, lang }: ContinueCardProps) {
  const translateUi = useUi();
  const pct = item.pct;

  return (
    <Link
      to={item.to}
      aria-label={translateUi('Continue {0}', [item.title])}
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-line/75 bg-surface/90 shadow-elev-1 transition-all duration-250 hover:-translate-y-1.5 hover:border-line-strong hover:shadow-elev-2 active:scale-[0.98]"
    >
      {/* Visual Showcase Stage */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-gradient-to-b from-sunken/40 via-sunken/65 to-sunken p-3 select-none flex items-center justify-center">
        {/* Artwork Layer with Authentic Aspect Ratio */}
        {item.kind === 'text' && item.text && (
          <div className="relative h-full aspect-[2/3] transition-transform duration-300 group-hover:scale-105">
            <BookCover text={item.text} size="sm" className="size-full shadow-elev-2" />
            {/* Swallowtail woven bookmark ribbon draped from top */}
            <div
              className="pointer-events-none absolute -top-1.5 right-2 z-10 h-7 w-3 bg-accent shadow-xs"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
              aria-hidden
            />
            {/* Obi-strip (Belly-band) */}
            {pct !== undefined && pct > 0 && (
              <div
                className="absolute inset-x-0 bottom-1.5 border-y border-line-strong/30 bg-surface/95 px-1.5 py-0.5 text-center shadow-xs backdrop-blur-xs"
                aria-hidden
              >
                <span className="text-[9.5px] font-bold text-ink tabular-nums">{pct}%</span>
              </div>
            )}
          </div>
        )}

        {item.kind === 'audio' && item.media && (
          <div className="relative h-full aspect-square transition-transform duration-300 group-hover:scale-105">
            <Artwork
              title={item.title}
              coverBlobId={item.media.coverBlobId}
              coverUrl={item.media.coverUrl}
              className="size-full shadow-elev-2"
              rounded="rounded-2xl"
            />
          </div>
        )}

        {item.kind === 'video' && item.video && (
          <div className="relative w-full aspect-video transition-transform duration-300 group-hover:scale-105">
            <Poster
              title={item.title}
              coverBlobId={item.video.coverBlobId}
              coverUrl={item.video.coverUrl}
              className="size-full rounded-2xl shadow-elev-2"
              fill
            />
          </div>
        )}

        {/* Top-Left Tool Glass Pill */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-bold text-white shadow-xs">
            {item.kind === 'text' ? (
              <BookOpen size={11} className="text-amber-300" aria-hidden />
            ) : item.kind === 'audio' ? (
              <Headphones size={11} className="text-emerald-400" aria-hidden />
            ) : (
              <Clapperboard size={11} className="text-sky-300" aria-hidden />
            )}
            {item.room}
          </span>
        </div>

        {/* Top-Right Progress Badge */}
        {pct !== undefined && pct > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white/90 tabular-nums shadow-xs">
              {pct}%
            </span>
          </div>
        )}

        {/* Explora-inspired Bouncy Hover Action Bubble */}
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="grid size-11 place-items-center rounded-full bg-surface/95 text-ink shadow-elev-2 transition-transform duration-200 group-hover:scale-110 active:scale-95">
            {item.kind === 'text' ? (
              <BookOpen size={17} aria-hidden />
            ) : item.kind === 'audio' ? (
              <Headphones size={17} aria-hidden />
            ) : (
              <Play size={17} fill="currentColor" aria-hidden />
            )}
          </span>
        </div>

        {/* Sleek Progress Bar Line at base of stage */}
        {pct !== undefined && pct > 0 && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-black/25" aria-hidden>
            <span
              className="block h-full origin-left bg-accent transition-transform duration-300"
              style={{ transform: `scaleX(${Math.min(1, Math.max(0.04, pct / 100))})` }}
            />
          </span>
        )}
      </div>

      {/* Card Information */}
      <div className="flex flex-1 flex-col justify-between p-3.5">
        <div className="min-w-0">
          <span
            lang={lang}
            className="line-clamp-2 font-serif text-[15px] leading-snug font-semibold text-ink transition-colors group-hover:text-accent-text"
          >
            {item.title}
          </span>
          {item.authorOrCollection && (
            <span className="mt-1 block truncate text-[12px] font-medium text-ink-soft">
              {item.authorOrCollection}
            </span>
          )}
        </div>

        {/* Bottom Status & Continue CTA */}
        <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-2 text-[11.5px]">
          <span className="font-semibold text-ink-soft tabular-nums truncate max-w-[55%]">
            {item.detail}
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-accent-text">
            <UiText source={'Continue'} />
            <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
});
