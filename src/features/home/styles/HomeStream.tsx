// Home style 6, "Stream": a streaming service's home. A full-bleed billboard of the book you are reading over its own blurred
// cover, a tab bar of the tools, and rows of cards: up next, picked for you, and your library.
import { Link } from 'react-router';
import { ArrowRight, Info, Play } from 'lucide-react';
import { UiText } from '@/design/i18n/UiText';
import { Art } from '@/features/mundus/Art';
import { BookCover } from '@/features/codex/library/BookCover';
import { LevelBadge } from '@/features/explora/components/LevelBadge';
import { useHomeFacts } from './useHomeFacts';
import { LeftOffCover, NextDetail, NextTitle } from './parts';

function Row({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-2.5 font-sans text-[17px] font-bold tracking-tight text-ink">{title}</h2>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3 scrollbar-none">{children}</div>
    </section>
  );
}

export function HomeStream() {
  const f = useHomeFacts();
  const { leftOff, whatNext, discover, recent, tools, header, due, minutesToday, goal, language } = f;
  return (
    <div className="mx-auto max-w-[1180px] pb-10">
      {/* The tab bar */}
      <nav aria-label="Tools" className="mb-4 flex items-center gap-1 overflow-x-auto border-b border-line scrollbar-none">
        <span className="mr-3 shrink-0 font-serif text-[22px] font-black tracking-tight text-accent-text">{language.id.toUpperCase()}</span>
        {tools.map((t) => <Link key={t.id} to={t.to} className="shrink-0 border-b-2 border-transparent px-3 py-2 text-[13.5px] font-semibold text-ink-soft transition-colors hover:border-accent hover:text-ink">{t.name}</Link>)}
      </nav>

      {/* The billboard */}
      <div className="relative isolate overflow-hidden rounded-[28px] bg-[#16110e] text-white shadow-elev-3">
        <div aria-hidden className="absolute inset-0 -z-10 scale-125 opacity-60 blur-3xl saturate-150"><LeftOffCover facts={f} /></div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
        <div className="grid items-center gap-8 p-7 sm:grid-cols-[minmax(0,1fr)_230px] sm:p-12">
          <div>
            <p className="text-[12px] font-bold tracking-[0.2em] text-white/70 uppercase">{header.eyebrow}</p>
            <h1 className="mt-3 font-serif text-[42px] leading-[1.02] font-black tracking-tight text-balance sm:text-[64px]">{leftOff.title}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-3 text-[14px] font-semibold text-white/80">
              <span className="rounded bg-white/15 px-2 py-0.5 text-[12px] font-bold">{leftOff.percent}%</span>
              <span>{leftOff.author}</span>
              <span className="text-white/50">·</span>
              <span><UiText source={'{0} of {1} min today'} values={[minutesToday, goal]} /></span>
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={leftOff.to} className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-7 text-[16px] font-bold text-black transition hover:bg-white/85 active:scale-95"><Play size={18} className="fill-current" aria-hidden /> <UiText source={leftOff.isStarter ? 'Begin' : 'Continue'} /></Link>
              <Link to="/thesaurus/study/all?mode=recall" className="inline-flex h-12 items-center gap-2 rounded-lg bg-white/20 px-6 text-[15px] font-bold backdrop-blur transition hover:bg-white/30 active:scale-95"><Info size={18} aria-hidden /> <UiText source={'{0} words to review'} values={[due?.due ?? 0]} /></Link>
            </div>
          </div>
          <Link to={leftOff.to} className="hidden aspect-[2/3] overflow-hidden rounded-lg shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)] ring-1 ring-white/20 transition-transform duration-300 hover:scale-105 sm:block"><LeftOffCover facts={f} /></Link>
        </div>
      </div>

      <Row title={<UiText source={'Up next for you'} />}>
        {whatNext.map((item) => (
          <Link key={item.id} to={item.to} className="group relative flex h-[132px] w-[250px] shrink-0 flex-col justify-end overflow-hidden rounded-xl p-3.5 text-white shadow-elev-1 transition-transform duration-200 hover:scale-[1.04]" style={{ background: `linear-gradient(150deg, color-mix(in oklab, ${item.hue} 80%, black), color-mix(in oklab, ${item.hue} 35%, black))` }}>
            <item.icon aria-hidden size={46} strokeWidth={1.3} className="absolute top-3 right-3 opacity-25 transition-transform duration-300 group-hover:scale-125" />
            <span className="text-[10.5px] font-bold tracking-[0.16em] text-white/70 uppercase"><UiText source={item.room} /></span>
            <span className="font-serif text-[18px] leading-tight font-bold"><NextTitle item={item} /></span>
            <span className="line-clamp-1 text-[12px] text-white/75"><NextDetail item={item} /></span>
          </Link>
        ))}
      </Row>

      <Row title={<UiText source={'Picked for you'} />}>
        {discover.map((d) => (
          <Link key={d.id} to={d.to} className="group relative block aspect-[2/3] w-[158px] shrink-0 overflow-hidden rounded-lg bg-sunken shadow-elev-1 transition-transform duration-200 hover:z-10 hover:scale-[1.07]">
            {d.query ? <Art query={d.query} fit="cover" fallback={<span className="block size-full bg-surface" />} /> : <span className="block size-full bg-surface" />}
            <span className="absolute top-2 left-2"><LevelBadge level={d.level} size="sm" /></span>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2.5 pt-10 text-white"><span className="line-clamp-2 block font-serif text-[13.5px] leading-snug font-bold">{d.title}</span></span>
          </Link>
        ))}
      </Row>

      {recent.length > 0 && (
        <Row title={<UiText source={'Your library'} />}>
          {recent.map((t) => (
            <Link key={t.id} to={t.kind === 'article' ? `/codex/read/${t.id}` : `/codex/book/${t.id}`} className="group block aspect-[2/3] w-[130px] shrink-0 overflow-hidden rounded-lg shadow-elev-1 transition-transform duration-200 hover:z-10 hover:scale-[1.07]">
              <BookCover text={t} className="size-full object-cover" />
            </Link>
          ))}
        </Row>
      )}
      <Link to="/explora" className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-accent-text hover:underline"><UiText source={'Browse everything in Explora'} /> <ArrowRight size={14} aria-hidden /></Link>
    </div>
  );
}
