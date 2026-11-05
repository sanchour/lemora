// Home style 3, "Journey": a game-like path. Today's steps are round buttons on a winding trail, the next one pulsing; a
// speech bubble greets you, and the streak, the week and the day's goal sit alongside.
import { Link } from 'react-router';
import { Check, Flame, Gift } from 'lucide-react';
import { Hand } from '@/design/drawings';
import type { HandName } from '@/design/drawings';
import { UiText } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { useHomeFacts } from './useHomeFacts';
import { WeekBars } from './parts';

const ROW = 168;
const W = 460;
const C = 230;
const OFFSETS = [0, 62, 92, 56, -20, -78, -50];

interface Step {
  id: string;
  to: string;
  hand: HandName;
  title: React.ReactNode;
  sub: React.ReactNode;
  done: boolean;
  colour: string;
}

export function HomeJourney() {
  const f = useHomeFacts();
  const { header, leftOff, cursus, discover, whatNext, due, goal, minutesToday, streak, week } = f;
  const goalMet = minutesToday >= goal;
  const duePending = (due?.due ?? 0) > 0;
  const next = cursus ?? null;
  const steps: Step[] = [
    { id: 'words', to: '/thesaurus/study/all?mode=recall', hand: 'cards', title: <UiText source={'Review your words'} />, sub: duePending ? <UiText source={'{0} words are waiting'} values={[due?.due ?? 0]} /> : <UiText source={'All caught up'} />, done: !duePending, colour: '#c86d51' },
    { id: 'read', to: leftOff.to, hand: 'book', title: <UiText source={leftOff.isStarter ? 'Begin your first text' : 'Read on'} />, sub: <span lang={f.language.id}>{leftOff.title}</span>, done: false, colour: '#3f6b5b' },
    { id: 'time', to: leftOff.to, hand: 'clock', title: <UiText source={'Reach your goal'} />, sub: <UiText source={'{0} of {1} min'} values={[minutesToday, goal]} />, done: goalMet, colour: '#a8741f' },
    ...(next ? [{ id: 'cursus', to: next.to, hand: 'flag' as HandName, title: <>{next.title}</>, sub: <>{next.badge}</>, done: false, colour: '#6a4a7a' }] : []),
    { id: 'new', to: discover[0]?.to ?? '/explora', hand: 'leaf', title: <UiText source={'Find something new'} />, sub: <>{discover[0]?.title ?? whatNext[0]?.title ?? ''}</>, done: false, colour: '#2f4a73' },
  ];
  const current = steps.findIndex((s) => !s.done);
  const height = (steps.length + 1) * ROW;
  const xOf = (i: number) => C + OFFSETS[i % OFFSETS.length];
  const path = [...steps.map((_, i) => ({ x: xOf(i), y: i * ROW + 44 })), { x: C, y: steps.length * ROW + 44 }].reduce((d, p, i, all) => (i === 0 ? `M${p.x} ${p.y}` : `${d} C${all[i - 1].x} ${(all[i - 1].y + p.y) / 2} ${p.x} ${(all[i - 1].y + p.y) / 2} ${p.x} ${p.y}`), '');

  return (
    <div className="mx-auto grid max-w-[1000px] gap-10 pb-12 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        {/* A speech bubble from a little quill */}
        <div className="flex items-end gap-3">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-accent-soft"><Hand name="quill" size={38} /></span>
          <div className="relative rounded-3xl rounded-bl-md border border-line-strong/60 bg-raised px-5 py-3 shadow-elev-1">
            <p className="text-[11px] font-bold tracking-[0.14em] text-accent-text uppercase">{header.eyebrow}</p>
            <p className="font-serif text-[22px] leading-snug font-bold text-ink sm:text-[26px]">{header.greeting}</p>
          </div>
        </div>

        {/* The trail */}
        <div className="relative mx-auto mt-8 max-w-full" style={{ height, width: W }}>
          <svg viewBox={`0 0 ${W} ${height}`} className="absolute inset-0 size-full" aria-hidden>
            <path d={path} fill="none" strokeWidth={6} strokeLinecap="round" strokeDasharray="2 14" className="stroke-line-strong" />
          </svg>
          {steps.map((s, i) => (
            <Link key={s.id} to={s.to} className="group absolute block w-[88px]" style={{ left: xOf(i) - 44, top: i * ROW }}>
              <span
                className={cx('relative grid size-[88px] place-items-center rounded-full border-b-[7px] text-white shadow-elev-2 transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-1 group-active:border-b-2', i === current && 'ring-[6px] ring-accent/30 motion-safe:animate-pulse')}
                style={{ background: s.done ? '#7a9a6b' : s.colour, borderBottomColor: `color-mix(in oklab, ${s.done ? '#7a9a6b' : s.colour} 65%, black)` }}
              >
                {s.done ? <Check size={38} strokeWidth={3.2} aria-hidden /> : <Hand name={s.hand} size={42} className="text-white!" />}
                {i === current && <span className="absolute -top-7 rounded-full bg-ink px-3 py-1 text-[11px] font-black tracking-wider text-bg uppercase shadow-elev-1"><UiText source={'Start'} /></span>}
              </span>
              {/* The words sit beside the button, on the side with room. */}
              <span className={cx('absolute top-1/2 w-44 -translate-y-1/2', OFFSETS[i % OFFSETS.length] > 20 ? 'right-[104px] text-right' : 'left-[104px] text-left')}>
                <span className="block font-serif text-[17px] leading-tight font-bold text-ink">{s.title}</span>
                <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-ink-soft">{s.sub}</span>
              </span>
            </Link>
          ))}
          {/* The chest at the end */}
          <div className="absolute flex w-44 -translate-x-1/2 flex-col items-center text-center" style={{ left: C, top: steps.length * ROW }}>
            <span className={cx('grid size-[88px] place-items-center rounded-[28px] border-b-[7px] border-[#8a5a14] bg-[#d9a23a] text-white shadow-elev-2', !goalMet && 'grayscale-[0.5]')}><Gift size={40} aria-hidden /></span>
            <span className="mt-2 font-serif text-[16.5px] font-bold text-ink"><UiText source={'Today’s treasure'} /></span>
            <span className="text-[12.5px] text-ink-soft">{goalMet ? <UiText source={'Goal reached. Well done!'} /> : <UiText source={'Reach your goal to open it'} />}</span>
          </div>
        </div>
      </div>

      {/* Side cards */}
      <aside className="space-y-4 lg:pt-20">
        <div className="rounded-[26px] border border-line/70 bg-surface p-5">
          <p className="flex items-center gap-2 font-serif text-[34px] leading-none font-bold text-accent-text tabular-nums"><Flame size={28} aria-hidden /> {streak}</p>
          <p className="mt-1 text-[12.5px] font-semibold text-ink-soft"><UiText source={'day streak'} /></p>
          <WeekBars week={week} goal={goal} className="mt-4 h-12" />
        </div>
        <div className="rounded-[26px] border border-line/70 bg-surface p-5">
          <p className="text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase"><UiText source={'Daily goal'} /></p>
          <p className="mt-1 font-serif text-[28px] font-bold text-ink tabular-nums">{minutesToday}<span className="text-[16px] font-semibold text-ink-faint"> / <UiText source={'{0} min'} values={[goal]} /></span></p>
          <span className="mt-2 block h-3 overflow-hidden rounded-full bg-sunken"><span className="block h-full rounded-full bg-sage-text transition-all" style={{ width: `${Math.min(100, (minutesToday / Math.max(1, goal)) * 100)}%` }} /></span>
        </div>
        <div className="rounded-[26px] border border-line/70 bg-surface p-5">
          <p className="text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase"><UiText source={'Quests'} /></p>
          <ul className="mt-2 space-y-2">
            {whatNext.slice(0, 3).map((item) => (
              <li key={item.id}><Link to={item.to} className="flex items-center gap-2.5 text-[13.5px] font-semibold text-ink-soft hover:text-accent-text"><span className="size-2 shrink-0 rounded-full" style={{ background: item.hue }} /> <span className="line-clamp-1">{item.title}</span></Link></li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
