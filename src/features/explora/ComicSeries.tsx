// /explora/comics/:series: a comic as a series, with all its episodes (Pepper&Carrot, in the learner's language).
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/app/context';
import { comicCover, comicEpisodes, PEPPER_CREDIT } from '@/core/comics/peppercarrot';
import { UiText } from '@/design/i18n/UiText';

export default function ComicSeries() {
  const { language } = useApp();
  const { series = '' } = useParams();
  const episodes = series === 'pepper-carrot' ? comicEpisodes(language.id) : [];
  if (!episodes.length) return <p className="py-20 text-center text-ink-soft"><UiText source={'That comic isn’t here.'} /></p>;
  return (
    <div className="mx-auto max-w-5xl pb-10">
      <Link to="/explora?kind=comics" className="hit inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-soft hover:text-ink"><ArrowLeft size={15} aria-hidden /> <UiText source={'Comics and magazines'} /></Link>

      <header className="mt-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:gap-6 sm:text-left">
        <img src={comicCover(language.id, episodes[0])} alt="" className="h-40 w-30 shrink-0 rounded-xl border border-line bg-raised object-cover shadow-elev-2" />
        <div>
          <h1 className="font-serif text-[34px] leading-tight font-semibold tracking-tight text-ink">{'Pepper&Carrot'}</h1>
          <p className="mt-1 max-w-md text-[14px] text-ink-soft"><UiText source={'A short, funny comic about a young witch and her cat, page by page.'} /></p>
          <p className="mt-2 text-[12px] font-bold tracking-[0.12em] text-accent-text uppercase">{episodes.length} <UiText source={'episodes'} /></p>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {episodes.map((ep) => (
          <Link key={ep.id} to={`/explora/comic/${ep.id}`} className="group block text-left">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-[18px] border border-line bg-raised transition-colors duration-200 group-hover:border-accent">
              <img src={comicCover(language.id, ep)} alt="" loading="lazy" className="size-full object-cover" />
            </div>
            <h4 className="mt-2 line-clamp-1 font-serif text-[14px] font-semibold text-ink transition-colors group-hover:text-accent-text"><UiText source={'Episode {0}'} values={[ep.number]} /></h4>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-[11.5px] text-ink-faint">{PEPPER_CREDIT}</p>
    </div>
  );
}
