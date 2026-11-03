import { UiText, useUi } from '@/design/i18n/UiText';
import { Bookmark, BookOpen, Captions, Film, Headphones, Music, Radio, Tv } from 'lucide-react';
import type { PickGroup } from '@/core/mundus/types';
import { serviceById } from '@/core/mundus/services';
import { cx } from '@/lib/cx';
import { Art } from '@/features/mundus/Art';
import { ServiceMark } from '@/features/mundus/ServiceBadge';
import { Artwork } from '@/features/sonus/library/Artwork';
import { pickImageQuery } from '@/services/mundus/images';
import { posterUrl } from '@/services/mundus/tmdb';
import type { PickLookup } from '@/features/mundus/hooks';
import type { ExploraItem } from '../types';
import { LevelBadge } from './LevelBadge';

interface MediaCardProps {
  item: ExploraItem;
  lang: string;
  lookup?: PickLookup;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
  streamingServices: string[];
  preferredAspect?: 'landscape' | 'poster' | 'square' | 'book';
}

export function MediaCard({
  item,
  lang,
  lookup,
  saved,
  onToggleSave,
  onOpen,
  streamingServices,
  preferredAspect,
}: MediaCardProps) {
  const translateUi = useUi();

  const serviceId = (item.pick?.on ?? []).find((s) => streamingServices.includes(s));
  const service = serviceId ? serviceById(serviceId) : undefined;

  const aspectClass = (() => {
    if (preferredAspect === 'landscape') return 'aspect-[16/9]';
    if (preferredAspect === 'poster') return 'aspect-[2/3]';
    if (preferredAspect === 'square') return 'aspect-square';
    if (preferredAspect === 'book') return 'aspect-[2/3]';
    if (item.kind === 'books' || item.kind === 'audiobooks') return 'aspect-[2/3]';
    if (item.kind === 'series' || item.kind === 'films') return 'aspect-[16/10]';
    return 'aspect-square';
  })();

  const poster = posterUrl(lookup?.title.posterPath, 'w342');

  return (
    <div className="group relative block w-full text-left transition-all duration-200">
      {/* Cute Rounded Card Container */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={translateUi('View {0}', [item.title])}
        className={cx(
          'relative block w-full overflow-hidden rounded-[18px] sm:rounded-[20px] bg-surface/85 shadow-elev-1 transition-all duration-250 group-hover:-translate-y-1 group-hover:shadow-elev-2 group-active:scale-[0.96]',
          aspectClass,
          item.kind === 'books' && 'border-l-[4px] border-l-line-strong',
        )}
      >
        {/* Artwork Layer */}
        {poster ? (
          <img
            src={poster}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-400 group-hover:scale-105"
          />
        ) : item.station ? (
          <Artwork
            title={item.station.name}
            coverUrl={item.station.favicon}
            className="size-full object-cover"
            rounded="rounded-none"
          />
        ) : item.book ? (
          <Artwork
            title={item.book.title}
            coverUrl={item.book.coverUrl}
            className="size-full object-cover"
            rounded="rounded-none"
          />
        ) : item.artist ? (
          <Art
            query={{ kind: 'wiki', q: `${item.artist.name} singer band`, must: item.artist.name, lang }}
            fallback={<DefaultCover kind={item.kind} />}
          />
        ) : item.pick ? (
          <Art
            query={pickImageQuery(item.pick, item.kind as PickGroup, lang)}
            fit={item.kind === 'dictionaries' ? 'contain' : 'cover'}
            fallback={<DefaultCover kind={item.kind} />}
          />
        ) : (
          <DefaultCover kind={item.kind} />
        )}

        {/* Soft Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges (Cute pills) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          <LevelBadge level={item.level} estimated={item.estimated} size="sm" />
          {service && (
            <span
              title={service.name}
              className="inline-flex size-5.5 items-center justify-center rounded-full bg-black/60 backdrop-blur-md p-1 shadow-sm"
            >
              <ServiceMark service={serviceId!} size={13} />
            </span>
          )}
        </div>

        {/* Media Kind Tag (Cute mini pill on bottom left) */}
        <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 text-[11px] font-bold text-white/95 drop-shadow">
          <KindTag item={item} />
        </div>
      </button>

      {/* Floating Save Button (Cute bubbly circle on top right) */}
      <button
        type="button"
        aria-label={saved ? translateUi('Remove from saved') : translateUi('Save item')}
        aria-pressed={saved}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave();
        }}
        className={cx(
          'absolute top-2 right-2 z-20 grid size-7.5 place-items-center rounded-full backdrop-blur-md shadow-sm transition-all duration-200 hover:scale-110 active:scale-90',
          saved
            ? 'bg-accent text-white shadow-elev-1'
            : 'bg-black/50 text-white/90 hover:bg-black/75 hover:text-white',
        )}
      >
        <Bookmark size={13} className={saved ? 'fill-current' : ''} aria-hidden />
      </button>

      {/* Caption Information */}
      <div className="mt-2 px-0.5 min-w-0">
        <h4
          onClick={onOpen}
          className="line-clamp-1 cursor-pointer font-serif text-[13.5px] font-semibold text-ink hover:text-accent-text transition-colors"
        >
          {item.title}
        </h4>
        <p className="mt-0.5 truncate text-[11.5px] font-medium text-ink-soft">
          {item.sub || item.pick?.by || (item.kind === 'radio' ? 'Live Radio' : item.kind)}
        </p>
      </div>
    </div>
  );
}

function KindTag({ item }: { item: ExploraItem }) {
  if (item.kind === 'radio') {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-red-600/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
        <span className="size-1.5 rounded-full bg-white animate-pulse" />
        <span lang="en">LIVE</span>
      </span>
    );
  }
  if (item.kind === 'series' || item.kind === 'films') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-sm px-2.5 py-0.5 text-[10.5px]">
        <Captions size={11} />
        <UiText source={'Subtitles'} />
      </span>
    );
  }
  if (item.kind === 'books') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-sm px-2.5 py-0.5 text-[10.5px]">
        <BookOpen size={11} />
        <UiText source={'Codex'} />
      </span>
    );
  }
  if (item.kind === 'audiobooks' || item.kind === 'podcasts') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-sm px-2.5 py-0.5 text-[10.5px]">
        <Headphones size={11} />
        <UiText source={'Sonus'} />
      </span>
    );
  }
  if (item.kind === 'music' && item.artist) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-sm px-2.5 py-0.5 text-[10.5px]">
        <Music size={11} />
        {item.artist.ease}
      </span>
    );
  }
  return null;
}

function DefaultCover({ kind }: { kind: string }) {
  const Icon = (() => {
    if (kind === 'series') return Tv;
    if (kind === 'films') return Film;
    if (kind === 'books') return BookOpen;
    if (kind === 'audiobooks' || kind === 'podcasts') return Headphones;
    if (kind === 'radio') return Radio;
    if (kind === 'music') return Music;
    return BookOpen;
  })();

  return (
    <div className="flex size-full items-center justify-center bg-sunken text-ink-faint">
      <Icon size={28} strokeWidth={1.5} />
    </div>
  );
}
