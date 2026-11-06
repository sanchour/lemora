// /explora/series/:id: a comic series from Wikimedia Commons (public domain): the pages as a grid, and a reader with arrow keys.
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useApp } from '@/app/context';
import { CATALOGUE_CREDITS, loadCatalogue } from '@/core/explora/catalogue';
import type { ComicSeries } from '@/core/explora/catalogue';
import { UiText, useUi } from '@/design/i18n/UiText';
import { useHotkeys } from '@/design/hooks/useHotkeys';
import { IconButton } from '@/design/primitives';
import { seriesPages } from '@/services/explora/series';
import { openCatalogueItem } from '@/services/explora/catalogue';
import { toast } from '@/state/ui';
import { useNavigate } from 'react-router';
import type { SeriesPage } from '@/services/explora/series';

export default function ExploraSeries() {
  const translateUi = useUi();
  const { language } = useApp();
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [series, setSeries] = useState<ComicSeries | null | undefined>(undefined);
  const [pages, setPages] = useState<SeriesPage[] | null | 'error'>(null);
  useEffect(() => {
    let live = true;
    setSeries(undefined);
    void loadCatalogue(language.id).then((c) => live && setSeries(c.series?.find((s) => s.id === id) ?? null));
    return () => {
      live = false;
    };
  }, [language.id, id]);
  useEffect(() => {
    if (!series) return;
    let live = true;
    seriesPages(series.category).then((p) => live && setPages(p), () => live && setPages('error'));
    return () => {
      live = false;
    };
  }, [series]);

  const open = params.get('p') === null ? null : Math.max(0, Number(params.get('p')) || 0);
  const list = Array.isArray(pages) ? pages : [];
  const go = (n: number | null) => setParams(n === null ? {} : { p: String(Math.max(0, Math.min(list.length - 1, n))) }, { replace: true });
  useHotkeys({ arrowleft: () => open !== null && go(open - 1), arrowright: () => open !== null && go(open + 1), escape: () => open !== null && go(null) });

  if (series === null) return <p className="py-20 text-center text-ink-soft"><UiText source={'That comic isn’t here.'} /></p>;
  if (!series) return <div className="h-96" />;
  return (
    <div className="mx-auto max-w-5xl pb-10">
      <Link to="/explora?kind=comics" className="hit inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-soft hover:text-ink"><ArrowLeft size={15} aria-hidden /> <UiText source={'Picture & comics'} /></Link>
      <header className="mt-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:gap-6 sm:text-left">
        <img src={series.cover} alt="" className="h-44 w-32 shrink-0 rounded-xl border border-line bg-raised object-cover shadow-elev-2" />
        <div>
          <h1 lang={language.id} className="font-serif text-[34px] leading-tight font-semibold tracking-tight text-ink">{series.title}</h1>
          <p className="mt-1 font-serif text-[15px] text-ink-soft italic">{series.author} · {series.years}</p>
          <p className="mt-2 max-w-md text-[14px] text-ink-soft"><UiText source={series.blurb} /></p>
          <p className="mt-2 text-[12px] font-bold tracking-[0.12em] text-accent-text uppercase">{series.pages} <UiText source={'pages'} /></p>
          {series.text && (
            // The words of the story as text: the pictures carry them too, but only text can be tapped word by word.
            <button type="button" disabled={adding} onClick={async () => {
              setAdding(true);
              try {
                const where = await openCatalogueItem(language.id, { id: `series:${series.id}`, kind: 'short', title: series.title, author: series.author, level: series.level, from: { type: 'wikisource', title: series.text! } });
                if ('to' in where) navigate(where.to);
              } catch (error) {
                toast(error instanceof Error ? error.message : 'That couldn’t be added.', { tone: 'error' });
              } finally {
                setAdding(false);
              }
            }} className="mt-3 inline-flex h-10 items-center rounded-full bg-accent-fill px-5 text-[13.5px] font-bold text-on-accent shadow-elev-1 transition hover:brightness-105 active:scale-95 disabled:opacity-60">
              <UiText source={'Read the words in Codex'} />
            </button>
          )}
        </div>
      </header>

      {pages === null && <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-surface" />)}</div>}
      {pages === 'error' && <p className="mt-10 text-center text-ink-soft"><UiText source={'The pages couldn’t be reached just now.'} /></p>}
      {list.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {list.map((p, i) => (
            <button key={p.title} type="button" onClick={() => go(i)} className="group block text-left">
              <span className="block aspect-[3/4] overflow-hidden rounded-[16px] border border-line bg-raised transition-colors group-hover:border-accent"><img src={p.thumb} alt="" loading="lazy" className="size-full object-cover" /></span>
              <span className="mt-1.5 block text-[12px] font-semibold text-ink-faint tabular-nums">{i + 1}</span>
            </button>
          ))}
        </div>
      )}
      <p className="mt-6 text-center text-[11.5px] text-ink-faint"><UiText source={CATALOGUE_CREDITS.commons} /></p>

      {open !== null && list[open] && (
        <div role="dialog" aria-modal="true" aria-label={series.title} className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="flex items-center gap-3 px-4 py-3 text-white">
            <span lang={language.id} className="font-serif text-[16px] font-bold">{series.title}</span>
            <span className="ml-auto font-serif text-[15px] text-white/60 tabular-nums">{open + 1} / {list.length}</span>
            <IconButton icon={ChevronLeft} label={translateUi('Previous page')} onClick={() => go(open - 1)} disabled={open === 0} />
            <IconButton icon={ChevronRight} label={translateUi('Next page')} onClick={() => go(open + 1)} disabled={open === list.length - 1} />
            <IconButton icon={X} label={translateUi('Close')} onClick={() => go(null)} />
          </div>
          <div className="grid min-h-0 flex-1 place-items-center p-3 sm:p-6"><img key={open} src={list[open].src} alt={translateUi('Page {0}', [open + 1])} className="max-h-full max-w-full rounded-lg bg-white object-contain" /></div>
        </div>
      )}
    </div>
  );
}
