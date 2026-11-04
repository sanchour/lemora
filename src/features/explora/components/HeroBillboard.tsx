import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Bookmark,
  BookImage,
  BookOpen,
  Lightbulb,
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
import { Hand } from '@/design/drawings';

const KIND_ICONS: Record<string, typeof Tv> = {
  series: Tv,
  films: Film,
  books: BookOpen,
  audiobooks: Headphones,
  podcasts: Headphones,
  music: Play,
  radio: Radio,
  comic: BookImage,
  tip: Lightbulb,
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
  const still = useReducedMotion();
  const featured = items.slice(0, 7);
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
    if (current.kind === 'comic') return translateUi('Read');
    if (current.kind === 'tip') return translateUi('Try it');
    return translateUi('Open');
  })();

  const ActionIcon = (() => {
    if (current.kind === 'series' || current.kind === 'films') return Captions;
    if (current.kind === 'books') return BookOpen;
    if (current.kind === 'audiobooks' || current.kind === 'podcasts') return Headphones;
    if (current.kind === 'radio') return Radio;
    return Play;
  })();

  const cover = current.cover ? (
    <img src={current.cover} alt="" className="size-full object-cover" />
  ) : current.kind === 'tip' ? (
    <div className="grid size-full place-items-center bg-accent-soft"><Hand name="candle" size={72} /></div>
  ) : poster ? (
    <img src={poster} alt="" className="size-full object-cover" />
  ) : current.book ? (
    <Artwork title={current.book.title} coverUrl={current.book.coverUrl} className="size-full object-cover" />
  ) : current.station ? (
    <Artwork title={current.station.name} coverUrl={current.station.favicon} className="size-full object-cover" />
  ) : current.pick ? (
    <Art query={pickImageQuery(current.pick, current.kind as PickGroup, lang)} fit="cover" fallback={<CoverFallback title={current.title} />} />
  ) : (
    <CoverFallback title={current.title} />
  );

  return (
    // A book on the reading table (Lemora): paper, a cover standing like a book, the blurb set like the back of one.
    <div className="relative mb-6 overflow-hidden rounded-[28px] border border-line bg-surface" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(120%_90%_at_85%_10%,color-mix(in_oklab,var(--accent)_10%,transparent),transparent_60%)]" aria-hidden />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.id}
          initial={still ? { opacity: 0 } : { opacity: 0, rotateY: -8, x: 18 }}
          animate={still ? { opacity: 1 } : { opacity: 1, rotateY: 0, x: 0 }}
          exit={still ? { opacity: 0 } : { opacity: 0, rotateY: 6, x: -14 }}
          transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          style={{ transformPerspective: 1400 }}
          className="relative grid items-center gap-6 p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-9 sm:p-8"
        >
          {/* The cover, upright, with a spine and a page edge. */}
          <div className="relative mx-auto w-[150px] sm:mx-0 sm:w-[168px]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-r-xl rounded-l-[4px] bg-raised shadow-elev-2 ring-1 ring-line">
              {cover}
              <span className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 to-transparent" aria-hidden />
            </div>
            <span className="absolute inset-y-2 -right-1.5 w-1.5 rounded-r-sm bg-[repeating-linear-gradient(to_bottom,var(--color-raised)_0_2px,var(--color-line)_2px_3px)]" aria-hidden />
          </div>

          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-[11.5px] font-bold tracking-[0.14em] text-ink-faint uppercase">
              <KindIcon size={13} aria-hidden />
              <span>{translateUi(current.kind.toUpperCase())}</span>
              <LevelBadge level={current.level} estimated={current.estimated} size="sm" />
              {current.level === learnerLevel && <span className="tracking-normal text-sage-text normal-case">· <UiText source={'At your level'} /></span>}
              {service && (
                <span className="inline-flex items-center gap-1 tracking-normal normal-case">
                  · <ServiceMark service={serviceId!} size={13} /> {service.name}
                </span>
              )}
            </p>
            <h2 className="mt-2 font-serif text-[30px] leading-[1.1] font-semibold tracking-tight text-balance sm:text-[36px]">{current.title}</h2>
            {(current.pick?.by || current.book?.author) && <p className="mt-1 font-serif text-[16px] text-ink-soft italic">{current.pick?.by ?? current.book?.author}</p>}
            {/* A small drawn ornament, then the blurb as on a book's back. */}
            <Hand name="leaf" size={22} className="mt-3 text-ink-faint" />
            <p className="mt-1 max-w-xl font-serif text-[16.5px] leading-relaxed text-ink-soft">
              {current.blurb ?? current.pick?.why ?? current.artist?.why ?? current.sub ?? <UiText source={'Essential immersion material carefully selected for language learners.'} />}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Button variant="accent" size="md" icon={ActionIcon} onClick={() => onPrimaryAction(current)}>
                {actionLabel}
              </Button>
              <button
                type="button"
                aria-pressed={isSaved}
                onClick={() => onToggleSave(current.id)}
                className={cx('inline-flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-[13.5px] font-semibold transition-colors', isSaved ? 'border-transparent bg-sage-soft text-sage-text' : 'border-line bg-raised text-ink-soft hover:border-line-strong hover:text-ink')}
              >
                <Bookmark size={15} className={isSaved ? 'fill-current' : ''} aria-hidden />
                {isSaved ? translateUi('Saved') : translateUi('Save')}
              </button>
              <button type="button" onClick={() => onOpenDetails(current)} className="hit inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-soft hover:text-ink" aria-label={translateUi('View details')}>
                <Info size={15} aria-hidden /> <UiText source={'More details'} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Turning the pages: a quiet folio at the foot, "2 / 5", with the arrows beside it. */}
      {featured.length > 1 && (
        <div className="relative flex items-center justify-end gap-3 border-t border-line/60 px-6 py-2.5 sm:px-8">
          <div role="tablist" aria-label={translateUi('Featured highlights')} className="mr-auto flex items-center gap-1.5">
            {featured.map((item, idx) => {
              const active = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={active}
                  aria-label={translateUi('Go to slide {0}: {1}', [String(idx + 1), item.title])}
                  onClick={() => setIndex(idx)}
                  className={cx('h-1.5 rounded-full transition-all duration-300', active ? 'w-6 bg-ink-soft' : 'w-1.5 bg-line-strong hover:bg-ink-faint')}
                />
              );
            })}
          </div>
          <button type="button" onClick={prevSlide} aria-label={translateUi('Previous featured item')} className="grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-sunken hover:text-ink">
            <ChevronLeft size={17} aria-hidden />
          </button>
          <span className="font-serif text-[14px] text-ink-faint tabular-nums">{activeIndex + 1} / {featured.length}</span>
          <button type="button" onClick={nextSlide} aria-label={translateUi('Next featured item')} className="grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-sunken hover:text-ink">
            <ChevronRight size={17} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

/** A cover with no picture: a plain cloth binding with its title set on it. */
function CoverFallback({ title }: { title: string }) {
  return (
    <div className="grid size-full place-items-center bg-[color-mix(in_oklab,var(--sage)_22%,var(--color-raised))] p-4 text-center">
      <span className="font-serif text-[15px] leading-snug font-semibold text-ink-soft">{title}</span>
    </div>
  );
}
