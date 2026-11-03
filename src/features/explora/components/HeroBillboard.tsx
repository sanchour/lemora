import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bookmark,
  BookOpen,
  Captions,
  ChevronLeft,
  ChevronRight,
  Film,
  Headphones,
  Info,
  Play,
  Radio,
  Tv,
} from 'lucide-react';
import type { Level } from '@/core/lang/levels';
import type { PickGroup } from '@/core/mundus/types';
import { serviceById } from '@/core/mundus/services';
import { Button } from '@/design/primitives';
import { cx } from '@/lib/cx';
import { Art } from '@/features/mundus/Art';
import { ServiceMark } from '@/features/mundus/ServiceBadge';
import { Artwork } from '@/features/sonus/library/Artwork';
import { pickImageQuery } from '@/services/mundus/images';
import { posterUrl } from '@/services/mundus/tmdb';
import type { PickLookup } from '@/features/mundus/hooks';
import type { ExploraItem } from '../types';
import { LevelBadge } from './LevelBadge';

const KIND_ICONS: Record<string, typeof Tv> = {
  series: Tv,
  films: Film,
  books: BookOpen,
  audiobooks: Headphones,
  podcasts: Headphones,
  music: Play,
  radio: Radio,
};

interface HeroBillboardProps {
  items: ExploraItem[];
  lang: string;
  learnerLevel: Level;
  lookups: Map<string, PickLookup>;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpenDetails: (item: ExploraItem) => void;
  onPrimaryAction: (item: ExploraItem) => void;
  streamingServices: string[];
}

export function HeroBillboard({
  items,
  lang,
  learnerLevel,
  lookups,
  savedIds,
  onToggleSave,
  onOpenDetails,
  onPrimaryAction,
  streamingServices,
}: HeroBillboardProps) {
  const translateUi = useUi();
  const featured = items.slice(0, 5);
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeIndex = featured.length > 0 ? index % featured.length : 0;
  const current = featured[activeIndex];

  // Auto-advance slides every 7 seconds, paused on hover
  useEffect(() => {
    if (featured.length <= 1 || isHovered) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % featured.length);
    }, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [featured.length, isHovered]);

  if (!current) return null;

  const lookup =
    current.pick && (current.kind === 'series' || current.kind === 'films')
      ? lookups.get(current.pick.title)
      : undefined;

  const poster = posterUrl(lookup?.title.posterPath, 'w500');
  const isSaved = savedIds.includes(current.id);
  const KindIcon = KIND_ICONS[current.kind] ?? Tv;

  const serviceId = (current.pick?.on ?? []).find((s) => streamingServices.includes(s));
  const service = serviceId ? serviceById(serviceId) : undefined;

  const nextSlide = () => setIndex((i) => (i + 1) % featured.length);
  const prevSlide = () => setIndex((i) => (i - 1 + featured.length) % featured.length);

  const actionLabel = (() => {
    if (current.kind === 'series' || current.kind === 'films') return translateUi('Watch with Subtitles');
    if (current.kind === 'books') return translateUi('Read in Codex');
    if (current.kind === 'audiobooks') return translateUi('Listen in Sonus');
    if (current.kind === 'podcasts') return translateUi('Follow Podcast');
    if (current.kind === 'radio') return translateUi('Tune in Live');
    if (current.kind === 'music') return translateUi('Sing in Sonus');
    return translateUi('Open');
  })();

  const ActionIcon = (() => {
    if (current.kind === 'series' || current.kind === 'films') return Captions;
    if (current.kind === 'books') return BookOpen;
    if (current.kind === 'audiobooks' || current.kind === 'podcasts') return Headphones;
    if (current.kind === 'radio') return Radio;
    return Play;
  })();

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-[24px] sm:rounded-[30px] bg-neutral-950 text-white shadow-elev-3 ring-1 ring-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Cinematic Art with Soft Gradients */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="size-full"
          >
            {poster ? (
              <img
                src={poster}
                alt=""
                className="size-full object-cover object-center opacity-50 blur-[1px] md:blur-none"
              />
            ) : current.station ? (
              <Artwork
                title={current.station.name}
                coverUrl={current.station.favicon}
                className="size-full object-cover opacity-45"
              />
            ) : current.book ? (
              <Artwork
                title={current.book.title}
                coverUrl={current.book.coverUrl}
                className="size-full object-cover opacity-45"
              />
            ) : current.pick ? (
              <div className="size-full opacity-45">
                <Art
                  query={pickImageQuery(current.pick, current.kind as PickGroup, lang)}
                  fit="cover"
                  fallback={<div className="size-full bg-gradient-to-tr from-accent/30 to-sage/20" />}
                />
              </div>
            ) : (
              <div className="size-full bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-950" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Soft Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-transparent md:bg-gradient-to-r md:from-neutral-950 md:via-neutral-950/80 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-neutral-950" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-[250px] sm:min-h-[290px] md:min-h-[320px] flex-col justify-end p-5 sm:p-7 md:p-8 lg:w-7/12">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Cute Bubbly Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {service && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide uppercase text-white shadow-sm">
                  <ServiceMark service={serviceId!} size={14} />
                  {service.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase text-neutral-200 shadow-sm">
                <KindIcon size={12} aria-hidden />
                {translateUi(current.kind.toUpperCase())}
              </span>
              <LevelBadge level={current.level} estimated={current.estimated} size="sm" />
              {current.level === learnerLevel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-300 shadow-xs select-none">
                  ★ <UiText source={'At your level'} />
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-white drop-shadow-md leading-tight">
              {current.title}
            </h1>

            {/* Subtitle / Pitch */}
            <p className="mt-1.5 text-[12.5px] sm:text-[13.5px] leading-relaxed text-neutral-300 line-clamp-2 max-w-xl drop-shadow">
              {current.pick?.why ?? current.artist?.why ?? current.sub ?? (
                <UiText source={'Essential immersion material carefully selected for language learners.'} />
              )}
            </p>

            {/* Cute Round Action Buttons */}
            <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-2.5">
              <Button
                variant="accent"
                size="md"
                icon={ActionIcon}
                onClick={() => onPrimaryAction(current)}
                className="rounded-full px-5 h-10 shadow-elev-2 text-[13px] font-bold hover:scale-[1.02] active:scale-[0.95] transition-all"
              >
                {actionLabel}
              </Button>

              <button
                type="button"
                aria-pressed={isSaved}
                onClick={() => onToggleSave(current.id)}
                className={cx(
                  'flex h-10 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-bold transition-all duration-200 backdrop-blur-md shadow-elev-1 hover:scale-[1.02] active:scale-[0.95]',
                  isSaved
                    ? 'bg-white text-neutral-900'
                    : 'bg-white/20 text-white hover:bg-white/30',
                )}
              >
                <Bookmark size={14} className={isSaved ? 'fill-current' : ''} aria-hidden />
                <span>{isSaved ? translateUi('Saved') : translateUi('Watchlist')}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenDetails(current)}
                className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-elev-1"
                title={translateUi('More details')}
                aria-label={translateUi('View details')}
              >
                <Info size={17} aria-hidden />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next Slide Arrows (Round & bouncy) */}
      {featured.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label={translateUi('Previous featured item')}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 hidden md:grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:scale-110 active:scale-95 shadow-md"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label={translateUi('Next featured item')}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 hidden md:grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:scale-110 active:scale-95 shadow-md"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* 5 Bottom Indicator Bars (Cute rounded smooth pills) */}
      {featured.length > 1 && (
        <div
          role="tablist"
          aria-label={translateUi('Featured highlights')}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5"
        >
          {featured.map((item, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={active}
                aria-label={translateUi('Go to slide {0}: {1}', [String(idx + 1), item.title])}
                onClick={() => setIndex(idx)}
                className={cx(
                  'h-1.5 rounded-full transition-all duration-300',
                  active ? 'w-7 bg-white shadow-md' : 'w-2.5 bg-white/40 hover:bg-white/70 hover:w-4',
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
