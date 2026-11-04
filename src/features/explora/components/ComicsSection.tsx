// Explora › Comics and magazines (Lemora U4): only what is free to read and to use commercially with credit.
// Pepper&Carrot (CC BY 4.0) is read page by page in its own viewer; Global Voices (CC BY 3.0) stories open in Codex
// as articles, every word a tap away; the picture-book libraries stay as links, since they don't let apps read them.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LoaderCircle } from 'lucide-react';
import { comicCover, comicEpisodes, PEPPER_CREDIT } from '@/core/comics/peppercarrot';
import { UiText, useUi } from '@/design/i18n/UiText';
import { Hand } from '@/design/drawings';
import { addStory, GLOBAL_VOICES_CREDIT, hasMagazine, latestStories } from '@/services/magazine/globalVoices';
import type { Story } from '@/services/magazine/globalVoices';
import { toast } from '@/state/ui';
import { MediaShelf } from './MediaShelf';
import { PictureBooksSection } from './BooksSection';

/** Pepper&Carrot's episodes in the language, as covers on a shelf. */
export function ComicShelf({ lang }: { lang: string }) {
  const translateUi = useUi();
  const episodes = comicEpisodes(lang);
  if (!episodes.length) return null;
  return (
    <MediaShelf id="comics-shelf" title={translateUi('Comics')} count={episodes.length}>
      {episodes.map((ep) => (
        <Link key={ep.id} to={`/explora/comic/${ep.id}`} className="group block w-full text-left">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-[18px] border border-line bg-raised transition-transform duration-200 group-hover:-translate-y-1">
            <img src={comicCover(lang, ep)} alt="" loading="lazy" className="size-full object-cover" />
          </div>
          <h4 className="mt-2 line-clamp-1 font-serif text-[13.5px] font-semibold text-ink">
            <UiText source={'Episode {0}'} values={[ep.number]} />
          </h4>
        </Link>
      ))}
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
      <h2 className="mb-3 font-serif text-[17px] font-semibold text-ink sm:text-[19px]"><UiText source={'Magazine'} /></h2>
      {stories === null ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-36 animate-pulse rounded-[20px] bg-surface" />)}</div>
      ) : stories === 'error' ? (
        <p className="text-[13.5px] text-ink-soft"><UiText source={'The magazine couldn’t be reached just now.'} /></p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stories.map((s) => (
            <button key={s.id} type="button" onClick={() => void open(s)} className="group flex flex-col items-start rounded-[20px] border border-line p-4 text-left transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong">
              <span className="flex w-full items-center justify-between">
                <span className="grid size-9 place-items-center rounded-full bg-accent-soft transition-transform group-hover:-rotate-6"><Hand name="letter" size={20} /></span>
                {adding === s.id && <LoaderCircle size={15} className="animate-spin text-ink-faint" aria-hidden />}
              </span>
              <h3 lang={lang} className="mt-3 line-clamp-3 font-serif text-[15.5px] leading-snug font-semibold text-ink group-hover:text-accent-text">{s.title}</h3>
              <span className="mt-auto pt-3 text-[11.5px] text-ink-faint">{new Date(s.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
            </button>
          ))}
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
