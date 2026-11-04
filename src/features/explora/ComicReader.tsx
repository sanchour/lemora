// /explora/comic/:episode (Lemora U4): a Pepper&Carrot episode in the learner's language, a page at a time, with its credit.
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/app/context';
import { comicEpisode, comicPage, PEPPER_CREDIT } from '@/core/comics/peppercarrot';
import { useHotkeys } from '@/design/hooks/useHotkeys';
import { UiText, useUi } from '@/design/i18n/UiText';
import { IconButton } from '@/design/primitives';

export default function ComicReader() {
  const translateUi = useUi();
  const { language } = useApp();
  const { episode = '' } = useParams();
  const ep = comicEpisode(episode);
  const [page, setPage] = useState(0);
  const last = (ep?.pages ?? 1) - 1;
  const go = (n: number) => setPage(Math.max(0, Math.min(last, n)));
  useHotkeys({ arrowleft: () => go(page - 1), arrowright: () => go(page + 1) });
  if (!ep) return <p className="py-20 text-center text-ink-soft"><UiText source={'That comic isn’t here.'} /></p>;
  return (
    <div className="mx-auto max-w-4xl pb-10">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/explora?kind=comics" className="hit inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-soft hover:text-ink"><ArrowLeft size={15} aria-hidden /> <UiText source={'Comics and magazines'} /></Link>
        <span className="ml-auto font-serif text-[15px] text-ink-faint tabular-nums">{page + 1} / {last + 1}</span>
        <IconButton icon={ChevronLeft} label={translateUi('Previous page')} onClick={() => go(page - 1)} disabled={page === 0} />
        <IconButton icon={ChevronRight} label={translateUi('Next page')} onClick={() => go(page + 1)} disabled={page === last} />
      </div>
      <img key={page} src={comicPage(language.id, ep, page)} alt={translateUi('Page {0}', [page + 1])} className="w-full rounded-2xl border border-line bg-raised" />
      <p className="mt-3 text-center text-[11.5px] text-ink-faint">{PEPPER_CREDIT}</p>
    </div>
  );
}
