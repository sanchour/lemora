import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Bookmark,
  BookPlus,
  Captions,
  Check,
  ExternalLink,
  Film,
  Music2,
  Play,
  Rss,
} from 'lucide-react';
import { LEVEL_WHY } from '@/core/mundus/explore';
import { pickLinks } from '@/core/mundus/links';
import { countryName, matchProviders, serviceById } from '@/core/mundus/services';
import { GROUP_KIND } from '@/core/mundus/types';
import type { PickGroup } from '@/core/mundus/types';
import { Button, Dialog } from '@/design/primitives';
import { addBookToCodex, addSubtitlesFor, followPodcast } from '@/features/mundus/actions';
import { Art } from '@/features/mundus/Art';
import { LinkPill } from '@/features/mundus/PicksView';
import { ServiceMark } from '@/features/mundus/ServiceBadge';
import { Artwork } from '@/features/sonus/library/Artwork';
import { sonusBase } from '@/features/sonus/paths';
import { openLibrivoxBook } from '@/services/sonus/librivox';
import { pickImageQuery } from '@/services/mundus/images';
import { posterUrl, trailerUrl } from '@/services/mundus/tmdb';
import { toast } from '@/state/ui';
import type { PickLookup } from '@/features/mundus/hooks';
import type { ExploraItem } from '../types';
import { LevelBadge } from './LevelBadge';

interface MediaDetailModalProps {
  item: ExploraItem | null;
  onClose: () => void;
  lang: string;
  lookup?: PickLookup;
  saved: boolean;
  onToggleSave: () => void;
  streaming: {
    country: string;
    services: string[];
    token: string;
  };
}

export function MediaDetailModal({
  item,
  onClose,
  lang,
  lookup,
  saved,
  onToggleSave,
  streaming,
}: MediaDetailModalProps) {
  const translateUi = useUi();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [trailer, setTrailer] = useState<string | null>(null);

  const screen = item?.kind === 'series' || item?.kind === 'films';

  useEffect(() => {
    setTrailer(null);
    if (!screen || !lookup || !streaming.token) return;
    let alive = true;
    trailerUrl(lookup.title.type, lookup.title.id, streaming.token)
      .then((url) => alive && setTrailer(url))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [screen, lookup, streaming.token]);

  const links = useMemo(
    () =>
      item?.pick
        ? pickLinks(item.pick, GROUP_KIND[item.kind as PickGroup], {
            lang,
            country: streaming.country,
            services: streaming.services,
          })
        : [],
    [item, lang, streaming.country, streaming.services],
  );

  const mine =
    screen && item?.pick
      ? lookup
        ? matchProviders(lookup.where.stream, streaming.services)
        : (item.pick.on ?? []).filter((id: string) => streaming.services.includes(id))
      : [];

  const description =
    item?.pick?.why ??
    item?.artist?.why ??
    (item?.station
      ? 'Live radio: the quickest way to hear how people really talk.'
      : item?.book
        ? 'A free LibriVox recording read aloud: follow it with the text.'
        : '');

  const overview = lookup?.title.overview;
  const poster = posterUrl(lookup?.title.posterPath, 'w342');

  const run = async (job: () => Promise<void>) => {
    setBusy(true);
    try {
      await job();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That didn’t work. Try again in a moment.', {
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={Boolean(item)} onClose={onClose} title={item.title} maxWidth="max-w-2xl">
      <div className="-mt-1 space-y-5">
        {/* Header Preview & Info (Round, Smooth) */}
        <div className="flex gap-4 sm:gap-5 items-start">
          <div className="w-24 sm:w-28 shrink-0 overflow-hidden rounded-[22px] shadow-elev-1 aspect-[2/3] bg-sunken">
            {poster ? (
              <img src={poster} alt="" className="size-full object-cover" />
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
            ) : item.pick ? (
              <Art
                query={pickImageQuery(item.pick, item.kind as PickGroup, lang)}
                fit="cover"
                fallback={<div className="size-full bg-sunken" />}
              />
            ) : (
              <div className="size-full bg-sunken" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sunken px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider uppercase text-ink-faint">
                {item.kind}
              </span>
              <LevelBadge level={item.level} estimated={item.estimated} size="sm" />
            </div>

            <h3 className="mt-1.5 font-serif text-2xl font-bold text-ink leading-snug">
              {item.title}
            </h3>

            {(item.pick?.en || item.sub) && (
              <p className="mt-0.5 text-[13px] font-medium text-ink-soft">
                {[item.pick?.en, item.sub].filter(Boolean).join(' · ')}
              </p>
            )}

            {/* Level context note */}
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
              {LEVEL_WHY[item.level as keyof typeof LEVEL_WHY]}
              {item.estimated && ' (Estimated level)'}
            </p>
          </div>
        </div>

        {/* Learning Pitch (Cute & Cozy Box) */}
        {description && (
          <div className="rounded-2xl bg-surface/80 p-4 border border-line/60 shadow-xs">
            <p className="text-[13.5px] leading-relaxed text-ink font-medium">{description}</p>
          </div>
        )}

        {/* Synopsis / Overview */}
        {overview && (
          <p className="text-[13px] leading-relaxed text-ink-soft line-clamp-4">{overview}</p>
        )}

        {/* Where to watch / Stream */}
        {screen && (
          <div className="border-t border-line/50 pt-3">
            <p className="text-[11.5px] font-bold tracking-wider uppercase text-ink-faint">
              <UiText source={'Where to watch'} />
            </p>
            {mine.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-sage-text">
                <Check size={14} strokeWidth={3} aria-hidden />
                {mine.map((id: string) => (
                  <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-2.5 py-1">
                    <ServiceMark service={id} size={16} /> {serviceById(id)?.name}
                  </span>
                ))}
                <span className="font-normal text-ink-soft">
                  <UiText source={'in {0}'} values={[countryName(streaming.country)]} />
                </span>
              </div>
            ) : (
              lookup &&
              streaming.services.length > 0 && (
                <p className="mt-1.5 text-[12.5px] text-ink-faint">
                  <UiText
                    source={'Not on your active services in {0}.'}
                    values={[countryName(streaming.country)]}
                  />
                </p>
              )
            )}
          </div>
        )}

        {/* Cute Round Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          {item.kind === 'books' && item.pick && (
            <Button
              variant="accent"
              icon={BookPlus}
              loading={busy}
              onClick={() =>
                void run(async () => {
                  const added = await addBookToCodex(lang, item.pick!);
                  toast(
                    added
                      ? {
                          source: '“{0}” is on your Codex wishlist.',
                          values: [String(item.pick!.title)],
                        }
                      : 'It’s already in Codex.',
                    {
                      tone: added ? 'success' : 'default',
                      action: { label: 'Codex', onClick: () => navigate('/codex') },
                    },
                  );
                })
              }
              className="rounded-full px-5 h-11 font-bold shadow-elev-1 active:scale-95"
            >
              <UiText source={'Add to Codex'} />
            </Button>
          )}

          {screen && item.pick && (
            <Button
              variant="accent"
              icon={Captions}
              loading={busy}
              onClick={() =>
                void run(async () => {
                  const id = await addSubtitlesFor(lang, item.pick!.title);
                  if (id) navigate(`/visio/watch/${id}`);
                })
              }
              className="rounded-full px-5 h-11 font-bold shadow-elev-1 active:scale-95"
            >
              <UiText source={'Add its subtitles in Visio'} />
            </Button>
          )}

          {item.kind === 'podcasts' && item.pick && (
            <Button
              variant="accent"
              icon={Rss}
              loading={busy}
              onClick={() =>
                void run(async () => {
                  const feedId = await followPodcast(lang, item.pick!);
                  if (feedId) navigate(`${sonusBase()}/podcast/${feedId}`);
                  else
                    toast(
                      'Podcast directory doesn’t have it under that name. Try Spotify or Apple Podcasts.',
                      { duration: 6000 },
                    );
                })
              }
              className="rounded-full px-5 h-11 font-bold shadow-elev-1 active:scale-95"
            >
              <UiText source={'Follow in Sonus'} />
            </Button>
          )}

          {item.station && (
            <Button
              variant="accent"
              icon={Play}
              onClick={() => navigate(`${sonusBase()}/station/${item.station!.id}`)}
              className="rounded-full px-5 h-11 font-bold shadow-elev-1 active:scale-95"
            >
              <UiText source={'Tune in in Sonus'} />
            </Button>
          )}

          {item.book && (
            <Button
              variant="accent"
              icon={Play}
              loading={busy}
              onClick={() =>
                void run(async () => {
                  const id = await openLibrivoxBook(lang, item.book!.identifier);
                  navigate(`${sonusBase()}/book/${id}`);
                })
              }
              className="rounded-full px-5 h-11 font-bold shadow-elev-1 active:scale-95"
            >
              <UiText source={'Listen in Sonus'} />
            </Button>
          )}

          {item.artist && (
            <Button
              variant="accent"
              icon={Music2}
              onClick={() =>
                navigate(`/sonus?tab=music&q=${encodeURIComponent(item.artist!.name)}`)
              }
              className="rounded-full px-5 h-11 font-bold shadow-elev-1 active:scale-95"
            >
              <UiText source={'Songs in Sonus'} />
            </Button>
          )}

          {/* Cute Bubbly Save / Bookmark toggle */}
          <Button
            variant={saved ? 'primary' : 'secondary'}
            icon={Bookmark}
            aria-pressed={saved}
            onClick={onToggleSave}
            className="rounded-full px-5 h-11 font-bold active:scale-95"
          >
            {saved ? translateUi('Saved') : translateUi('Save to Watchlist')}
          </Button>

          {/* Cute Round Trailer pill */}
          {screen && trailer && (
            <a
              href={trailer}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line/80 bg-raised px-4 text-[13px] font-bold text-ink hover:bg-surface active:scale-95 transition-all shadow-xs"
            >
              <Film size={14} />
              <UiText source={'Trailer'} />
              <ExternalLink size={12} className="text-ink-faint" />
            </a>
          )}
        </div>

        {/* Links */}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {links.map((l) => (
              <LinkPill key={l.label} link={l} />
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
