// Home style 2, "Bento": a dashboard of tiles in different sizes and tints. The book you are reading is the big tile; the
// day's goal is a ring, the streak and the week are bars, the words due are a count, and the rest are small tiles.
import { Link } from 'react-router';
import { ArrowRight, Flame, Layers, Route as RouteIcon } from 'lucide-react';
import { UiText } from '@/design/i18n/UiText';
import { Art } from '@/features/mundus/Art';
import { cx } from '@/lib/cx';
import { ToolDuotoneIcon } from '../homeComponents';
import { useHomeFacts } from './useHomeFacts';
import { LeftOffCover, NextDetail, NextTitle, WeekBars } from './parts';

const tile = 'relative overflow-hidden rounded-[28px] border border-line/60 p-5 shadow-elev-1';

export function HomeBento() {
  const f = useHomeFacts();
  const { header, leftOff, whatNext, discover, cursus, words, due, goal, week, minutesToday, streak, tools } = f;
  const ratio = Math.min(1, minutesToday / Math.max(1, goal));
  const R = 46;
  return (
    <div className="mx-auto max-w-[1152px] pb-10">
      <header className="mb-5">
        <p className="text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase">{header.eyebrow}</p>
        <h1 className="font-serif text-[34px] leading-tight font-semibold tracking-tight text-ink sm:text-[44px]">{header.greeting}</h1>
      </header>

      <div className="grid auto-rows-[minmax(150px,auto)] grid-cols-2 gap-3.5 lg:grid-cols-4">
        {/* Reading: big */}
        <Link to={leftOff.to} className={cx(tile, 'group col-span-2 row-span-2 flex flex-col justify-between bg-[linear-gradient(145deg,var(--accent-fill),color-mix(in_oklab,var(--accent-fill)_70%,black))] text-on-accent')}>
          <span className="flex items-start justify-between gap-4">
            <span>
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase opacity-80"><UiText source={'Continue reading'} /></span>
              <span className="mt-1 block font-serif text-[30px] leading-tight font-bold text-balance sm:text-[36px]">{leftOff.title}</span>
              <span className="mt-1 block text-[14px] opacity-85">{leftOff.author}</span>
            </span>
            <span className="block h-44 w-[7.5rem] shrink-0 -rotate-3 overflow-hidden rounded-xl shadow-elev-3 ring-1 ring-white/30 transition-transform duration-300 group-hover:rotate-0"><LeftOffCover facts={f} /></span>
          </span>
          <span>
            <span className="flex items-center justify-between text-[12.5px] font-bold"><span>{leftOff.percent}%</span><span className="inline-flex items-center gap-1"><UiText source={leftOff.isStarter ? 'Begin' : 'Read on'} /> <ArrowRight size={14} aria-hidden /></span></span>
            <span className="mt-2 block h-2 overflow-hidden rounded-full bg-white/25"><span className="block h-full rounded-full bg-white" style={{ width: `${Math.max(4, leftOff.percent)}%` }} /></span>
          </span>
        </Link>

        {/* Goal ring */}
        <div className={cx(tile, 'flex flex-col items-center justify-center bg-sage-soft')}>
          <svg viewBox="0 0 110 110" className="size-28 -rotate-90" aria-hidden>
            <circle cx={55} cy={55} r={R} fill="none" strokeWidth={10} className="stroke-black/10" />
            <circle cx={55} cy={55} r={R} fill="none" strokeWidth={10} strokeLinecap="round" strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * (1 - ratio)} className="stroke-sage-text transition-all duration-700" />
          </svg>
          <span className="-mt-[4.6rem] mb-6 font-serif text-[28px] font-bold text-ink tabular-nums">{minutesToday}</span>
          <span className="text-[11.5px] font-bold tracking-[0.1em] text-sage-text uppercase"><UiText source={'of {0} min'} values={[goal]} /></span>
        </div>

        {/* Streak and week */}
        <div className={cx(tile, 'flex flex-col justify-between bg-accent-soft')}>
          <span className="flex items-center gap-2 text-accent-text"><Flame size={22} aria-hidden /><span className="font-serif text-[34px] leading-none font-bold tabular-nums">{streak}</span></span>
          <span className="text-[12.5px] font-semibold text-ink-soft"><UiText source={'day streak'} /></span>
          <WeekBars week={week} goal={goal} className="h-14" />
        </div>

        {/* Words due */}
        <Link to="/thesaurus/study/all?mode=recall" className={cx(tile, 'group flex flex-col justify-between bg-surface')}>
          <span className="flex items-center justify-between text-ink-faint"><Layers size={20} aria-hidden /><ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden /></span>
          <span><span className="block font-serif text-[44px] leading-none font-bold text-ink tabular-nums">{due?.due ?? 0}</span><span className="text-[12.5px] font-semibold text-ink-soft"><UiText source={'words to review'} /></span></span>
          <span className="flex flex-wrap gap-1">{words.slice(0, 3).map((w) => <span key={w.term} className="rounded-full bg-sunken px-2 py-0.5 text-[11.5px] font-semibold text-ink-soft">{w.term}</span>)}</span>
        </Link>

        {/* Cursus */}
        {cursus ? (
          <Link to={cursus.to} className={cx(tile, 'group flex flex-col justify-between')} style={{ background: `color-mix(in oklab, ${cursus.unitHue ?? 'var(--accent)'} 22%, var(--color-raised))` }}>
            <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-ink-soft uppercase"><RouteIcon size={14} aria-hidden /> {cursus.badge}</span>
            <span className="font-serif text-[21px] leading-snug font-bold text-ink">{cursus.title}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-black/10"><span className="block h-full rounded-full bg-ink" style={{ width: `${cursus.progressPercent}%` }} /></span>
          </Link>
        ) : <div className={cx(tile, 'bg-sunken')} />}

        {/* What next */}
        <div className={cx(tile, 'col-span-2 bg-surface')}>
          <h2 className="mb-2 text-[11px] font-bold tracking-[0.16em] text-ink-faint uppercase"><UiText source={'What next'} /></h2>
          <ul className="divide-y divide-line/70">
            {whatNext.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link to={item.to} className="group flex items-center gap-3 py-2.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-110" style={{ background: `color-mix(in oklab, ${item.hue} 28%, transparent)` }}><Icon size={19} className="text-ink" aria-hidden /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-serif text-[16px] font-bold text-ink"><NextTitle item={item} /></span><span className="block truncate text-[12.5px] text-ink-soft"><NextDetail item={item} /></span></span>
                    <ArrowRight size={15} className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Discover: three pictures */}
        <div className={cx(tile, 'col-span-2 grid grid-cols-3 gap-2 bg-sunken p-3')}>
          {discover.slice(0, 3).map((d) => (
            <Link key={d.id} to={d.to} className="group relative block overflow-hidden rounded-[20px] bg-raised">
              <span className="block aspect-[3/4]">{d.query ? <Art query={d.query} fit="cover" fallback={<span className="block size-full bg-surface" />} /> : <span className="block size-full bg-surface" />}</span>
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5 pt-8 text-white"><span className="line-clamp-2 block font-serif text-[13.5px] leading-snug font-bold">{d.title}</span></span>
            </Link>
          ))}
        </div>

        {/* Tools */}
        <div className={cx(tile, 'col-span-2 bg-surface lg:col-span-4')}>
          <div className="grid grid-cols-5 gap-x-2 gap-y-3 lg:flex lg:justify-around">
            {tools.map((t) => (
              <Link key={t.id} to={t.to} title={t.role} className="group flex flex-col items-center gap-1 text-center">
                <span className="grid size-11 place-items-center rounded-2xl bg-sunken transition-all group-hover:-translate-y-0.5 group-hover:bg-accent-soft"><ToolDuotoneIcon id={t.id} className="size-6 text-ink" /></span>
                <span className="text-[11.5px] font-bold text-ink-soft group-hover:text-accent-text">{t.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
