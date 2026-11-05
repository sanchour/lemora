// Explora › Comics and magazines (Lemora U4): only what is free to read and to use commercially with credit.
// Pepper&Carrot (CC BY 4.0) is read page by page in its own viewer; Global Voices (CC BY 3.0) stories open in Codex
// as articles, every word a tap away; the picture-book libraries stay as links, since they don't let apps read them.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LoaderCircle } from 'lucide-react';
import { comicCover, comicEpisodes, PEPPER_CREDIT } from '@/core/comics/peppercarrot';
import { UiText, useUi } from '@/design/i18n/UiText';
import { addStory, GLOBAL_VOICES_CREDIT, hasMagazine, latestStories } from '@/services/magazine/globalVoices';
import type { Story } from '@/services/magazine/globalVoices';
import { toast } from '@/state/ui';
import { MediaShelf } from './MediaShelf';
import { PictureBooksSection } from './BooksSection';

const COVER_COLOURS = ['#b4452a', '#3f6b5b', '#2f4a73', '#a8741f', '#6a4a7a', '#8a3a4a'];

/** Pepper&Carrot as one series on the shelf: its cover, and a click opens a page with every episode. */
export function ComicShelf({ lang }: { lang: string }) {
  const translateUi = useUi();
  const episodes = comicEpisodes(lang);
  if (!episodes.length) return null;
  return (
    <MediaShelf id="comics-shelf" title={translateUi('Comics')} count={1}>
      {[
        <Link key="pepper-carrot" to="/explora/comics/pepper-carrot" className="group block w-full text-left">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[18px] border border-line bg-raised transition-colors duration-200 group-hover:border-accent">
            <img src={comicCover(lang, episodes[0])} alt="" loading="lazy" className="size-full object-cover" />
            <span className="absolute right-2.5 bottom-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[10.5px] font-bold text-white/95 backdrop-blur-sm">{episodes.length} <UiText source={'episodes'} /></span>
          </div>
          <h4 className="mt-2 line-clamp-1 font-serif text-[14px] font-semibold text-ink transition-colors group-hover:text-accent-text">{'Pepper&Carrot'}</h4>
          <p className="text-[11.5px] text-ink-faint"><UiText source={'Series'} /></p>
        </Link>,
      ]}
    </MediaShelf>
  );
}

/** Global Voices' latest stories in the language: a click puts one on the shelf and opens it. */
export function MagazineSection({ lang }: { lang: string }) {
  const translateUi = useUi();
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[] | null | 'error'>(null);
  const [adding, setAdding] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    setStories(null);
    if (hasMagazine(lang)) latestStories(lang, 8).then((s) => alive && setStories(s), () => alive && setStories('error'));
    return () => {
      alive = false;
    };
  }, [lang]);
  if (!hasMagazine(lang)) return null;
  const open = async (story: Story) => {
    if (adding) return;
    setAdding(story.id);
    try {
      navigate(`/codex/read/${await addStory(lang, story)}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That story couldn’t be added.', { tone: 'error' });
      setAdding(null);
    }
  };
  return (
    <section aria-label={translateUi('Magazine')} className="mb-6">
      <h2 className="mb-3 font-serif text-[21px] font-semibold tracking-tight text-ink sm:text-[24px]"><UiText source={'Magazine'} /></h2>
      {stories === null ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-36 animate-pulse rounded-[20px] bg-surface" />)}</div>
      ) : stories === 'error' ? (
        <p className="text-[13.5px] text-ink-soft"><UiText source={'The magazine couldn’t be reached just now.'} /></p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {stories.map((s) => {
            const c = COVER_COLOURS[s.id % COVER_COLOURS.length];
            return (
              // A magazine cover: masthead on top, the headline set big, the date and issue number at the foot, a spine along the left.
              <button
                key={s.id}
                type="button"
                onClick={() => void open(s)}
                className="group relative aspect-[3/4] overflow-hidden rounded-[4px] text-left text-white shadow-elev-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-elev-3"
                style={{ background: `linear-gradient(160deg, ${c}, color-mix(in oklab, ${c} 62%, black))` }}
              >
                <span aria-hidden className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/35 to-transparent" />
                <span aria-hidden className="absolute -right-10 -bottom-10 size-40 rounded-full bg-white/10" />
                <span className="absolute inset-x-5 top-4 border-b-2 border-white/70 pb-1.5 text-center font-serif text-[12px] font-bold tracking-[0.32em] uppercase">{'Global Voices'}</span>
                <h3 lang={lang} className="absolute inset-x-5 top-16 bottom-14 line-clamp-6 overflow-hidden font-serif text-[18px] leading-[1.2] font-bold tracking-tight">{s.title}</h3>
                <span className="absolute inset-x-5 bottom-3.5 flex items-center justify-between border-t border-white/40 pt-2 text-[10.5px] font-bold tracking-[0.12em] uppercase">
                  <span>{new Date(s.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {adding === s.id ? <LoaderCircle size={13} className="animate-spin" aria-hidden /> : <span>Nº {s.id % 1000}</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <p className="mt-3 text-[11.5px] text-ink-faint">{GLOBAL_VOICES_CREDIT}</p>
    </section>
  );
}

/** The whole tab: comics, the magazine, then the picture-book libraries. */
export function ComicsSection({ lang }: { lang: string }) {
  return (
    <div className="space-y-2">
      <ComicShelf lang={lang} />
      <p className="-mt-3 mb-6 text-[11.5px] text-ink-faint">{PEPPER_CREDIT}</p>
      <MagazineSection lang={lang} />
      <PictureBooksSection lang={lang} />
    </div>
  );
}
