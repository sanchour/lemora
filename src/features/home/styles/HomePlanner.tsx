// Home style 8, "Planner": a day planner. Hours down the left, today's steps as coloured blocks on the timeline, the goal as a
// bar along the top, and the rest of the week as small day cards.
import { Link } from 'react-router';
import { UiText } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { useHomeFacts } from './useHomeFacts';
import { NextDetail, NextTitle } from './parts';

const HOURS = [8, 10, 12, 14, 16, 18, 20];
const DAY = (date: string) => new Date(`${date}T12:00`).toLocaleDateString(undefined, { weekday: 'short' });

export function HomePlanner() {
  const f = useHomeFacts();
  const { header, leftOff, whatNext, due, goal, minutesToday, week, cursus, streak } = f;
  const now = new Date();
  const nowFraction = Math.min(1, Math.max(0, (now.getHours() + now.getMinutes() / 60 - 8) / 12));
  const blocks = [
    { at: 8.5, len: 1, colour: '#c86d51', to: '/thesaurus/study/all?mode=recall', title: <UiText source={'Review {0} words'} values={[due?.due ?? 0]} />, sub: <UiText source={'The cards first, while the mind is fresh'} /> },
    { at: 11, len: 2, colour: '#3f6b5b', to: leftOff.to, title: <span lang={f.language.id}>{leftOff.title}</span>, sub: <UiText source={'{0} min of reading, {1}% done'} values={[goal, leftOff.percent]} /> },
    ...(cursus ? [{ at: 14.5, len: 1.25, colour: '#6a4a7a', to: cursus.to, title: <>{cursus.title}</>, sub: <>{cursus.badge}</> }] : []),
    ...(whatNext[2] ? [{ at: 17, len: 1.25, colour: '#2f4a73', to: whatNext[2].to, title: <NextTitle item={whatNext[2]} />, sub: <NextDetail item={whatNext[2]} /> }] : []),
  ];
  const pxPerHour = 64;
  return (
    <div className="mx-auto max-w-[1000px] pb-10">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase">{header.eyebrow}</p>
          <h1 className="font-serif text-[32px] leading-tight font-semibold tracking-tight text-ink sm:text-[42px]">{header.greeting}</h1>
        </div>
        <div className="w-full max-w-[280px]">
          <div className="flex items-baseline justify-between text-[12.5px] font-semibold text-ink-soft"><span><UiText source={'Today’s goal'} /></span><span className="tabular-nums">{minutesToday} / {goal} <UiText source={'min'} /></span></div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-sunken"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(100, (minutesToday / Math.max(1, goal)) * 100)}%` }} /></div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        {/* The day */}
        <div className="relative rounded-[26px] border border-line/70 bg-surface/60 py-4 pr-4 pl-16" style={{ height: 12 * pxPerHour + 40 }}>
          {HOURS.map((h) => (
            <div key={h} className="absolute inset-x-0 flex items-center" style={{ top: 16 + (h - 8) * pxPerHour }}>
              <span className="w-12 pr-3 text-right text-[11.5px] font-bold text-ink-faint tabular-nums">{String(h).padStart(2, '0')}:00</span>
              <span className="h-px flex-1 bg-line" />
            </div>
          ))}
          {/* Now */}
          <div className="absolute inset-x-0 z-10 flex items-center" style={{ top: 16 + nowFraction * 12 * pxPerHour }} aria-hidden>
            <span className="ml-[3.2rem] size-2.5 rounded-full bg-accent" /><span className="h-0.5 flex-1 bg-accent" />
          </div>
          {blocks.map((b, i) => (
            <Link key={i} to={b.to} className="group absolute right-4 left-16 overflow-hidden rounded-xl border-l-[5px] px-3.5 py-2 shadow-elev-1 transition-transform hover:-translate-y-0.5 hover:shadow-elev-2" style={{ top: 16 + (b.at - 8) * pxPerHour, height: b.len * pxPerHour - 6, borderColor: b.colour, background: `color-mix(in oklab, ${b.colour} 16%, var(--color-raised))` }}>
              <span className="block truncate font-serif text-[16px] leading-tight font-bold text-ink">{b.title}</span>
              <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-ink-soft">{b.sub}</span>
            </Link>
          ))}
        </div>

        {/* The week */}
        <aside className="space-y-3">
          <p className="text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase"><UiText source={'This week'} /></p>
          {week.map((d, i) => (
            <div key={d.date} className={cx('flex items-center gap-3 rounded-2xl border px-3.5 py-2.5', i === week.length - 1 ? 'border-accent bg-accent-soft' : 'border-line/70 bg-surface/60')}>
              <span className="w-10 text-[12px] font-bold text-ink-soft uppercase">{DAY(d.date)}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-sunken"><span className="block h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (d.minutes / Math.max(1, goal)) * 100)}%` }} /></span>
              <span className="w-12 text-right text-[12px] font-semibold text-ink-soft tabular-nums">{d.minutes} <UiText source={'min'} /></span>
            </div>
          ))}
          <p className="pt-1 font-serif text-[14.5px] text-ink-soft italic"><UiText source={'Day {0} of your streak.'} values={[streak]} /></p>
        </aside>
      </div>
    </div>
  );
}
