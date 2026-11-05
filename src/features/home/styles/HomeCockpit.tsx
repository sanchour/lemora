// Home style 12, "Cockpit": a dark monitoring dashboard. Status pills, a gauge for the day's goal, a twelve-week heat map,
// bars for today's time by tool, and the queue of what to do next.
import { Link } from 'react-router';
import { useToolDays } from '@/data/toolGoals';
import { UiText } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { useHomeFacts } from './useHomeFacts';
import { NextTitle } from './parts';

const panel = 'rounded-xl border border-white/10 bg-[#161b22] p-4';
const label = 'text-[11px] font-semibold tracking-[0.12em] text-white/45 uppercase';

function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold', ok ? 'border-[#2ea043]/50 bg-[#2ea043]/15 text-[#56d364]' : 'border-[#d29922]/50 bg-[#d29922]/15 text-[#e3b341]')}><span className={cx('size-1.5 rounded-full', ok ? 'bg-[#56d364]' : 'bg-[#e3b341]')} />{children}</span>;
}

export function HomeCockpit() {
  const f = useHomeFacts();
  const { header, leftOff, whatNext, due, goal, minutesToday, streak, language } = f;
  const days = useToolDays(language.id, 84) ?? [];
  const mins = days.map((d) => Math.round(d.total / 60_000));
  const today = days.at(-1);
  const toolsToday = today ? Object.entries(today.byTool).filter(([, ms]) => ms > 0).sort((a, b) => b[1] - a[1]) : [];
  const ratio = Math.min(1, minutesToday / Math.max(1, goal));
  const R = 54, C = Math.PI * R;
  const weeks = Array.from({ length: 12 }, (_, w) => mins.slice(w * 7, w * 7 + 7));
  const level = (m: number) => (m <= 0 ? 'bg-white/[0.06]' : m < goal / 2 ? 'bg-[#0e4429]' : m < goal ? 'bg-[#26a641]' : 'bg-[#56d364]');
  return (
    <div className="mx-auto max-w-[1180px] rounded-[22px] bg-[#0d1117] p-5 pb-6 text-[#e6edf3] shadow-elev-3 ring-1 ring-black/40 sm:p-7">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-[12px] font-semibold tracking-[0.12em] text-white/45 uppercase">{header.eyebrow}</p><h1 className="font-sans text-[24px] font-bold tracking-tight text-white sm:text-[30px]">{header.greeting}</h1></div>
        <div className="flex flex-wrap gap-2">
          <Pill ok={streak > 0}><UiText source={'Streak {0}d'} values={[streak]} /></Pill>
          <Pill ok={(due?.due ?? 0) === 0}><UiText source={'{0} cards due'} values={[due?.due ?? 0]} /></Pill>
          <Pill ok={minutesToday >= goal}><UiText source={'Goal {0}%'} values={[Math.round(ratio * 100)]} /></Pill>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Gauge */}
        <section className={panel}>
          <p className={label}><UiText source={'Daily goal'} /></p>
          <div className="relative mx-auto mt-3 w-[200px]">
            <svg viewBox="0 0 140 80" className="w-full" aria-hidden>
              <path d="M16 70 A54 54 0 0 1 124 70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={12} strokeLinecap="round" />
              <path d="M16 70 A54 54 0 0 1 124 70" fill="none" stroke={ratio >= 1 ? '#56d364' : '#e3b341'} strokeWidth={12} strokeLinecap="round" strokeDasharray={`${ratio * C} ${C}`} />
            </svg>
            <p className="absolute inset-x-0 bottom-0 text-center font-mono text-[30px] leading-none font-bold tabular-nums">{minutesToday}<span className="text-[14px] text-white/45">/{goal}m</span></p>
          </div>
        </section>

        {/* Heat map */}
        <section className={`${panel} lg:col-span-2`}>
          <p className={label}><UiText source={'Activity, 12 weeks'} /></p>
          <div className="mt-3 flex gap-1">
            {weeks.map((w, i) => <div key={i} className="flex flex-1 flex-col gap-1">{Array.from({ length: 7 }, (_, d) => <span key={d} className={cx('aspect-square rounded-[3px]', level(w[d] ?? 0))} title={`${w[d] ?? 0} min`} />)}</div>)}
          </div>
        </section>

        {/* Current */}
        <Link to={leftOff.to} className={`${panel} group block transition-colors hover:border-[#58a6ff]/60`}>
          <p className={label}><UiText source={'Now reading'} /></p>
          <p lang={language.id} className="mt-2 font-serif text-[22px] leading-tight font-bold text-white group-hover:text-[#79c0ff]">{leftOff.title}</p>
          <p className="mt-0.5 text-[13px] text-white/55">{leftOff.author}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#58a6ff]" style={{ width: `${Math.max(3, leftOff.percent)}%` }} /></div>
          <p className="mt-1 font-mono text-[12px] text-white/55">{leftOff.percent}%</p>
        </Link>

        {/* Today by tool */}
        <section className={panel}>
          <p className={label}><UiText source={'Today by tool'} /></p>
          {toolsToday.length === 0 ? <p className="mt-3 text-[13px] text-white/50"><UiText source={'Nothing recorded yet today.'} /></p> : (
            <ul className="mt-3 space-y-2.5">{toolsToday.slice(0, 5).map(([tool, ms]) => <li key={tool}><div className="flex justify-between font-mono text-[12px] text-white/70"><span>{tool}</span><span>{Math.round(ms / 60_000)}m</span></div><div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#bc8cff]" style={{ width: `${Math.min(100, (ms / Math.max(1, toolsToday[0][1])) * 100)}%` }} /></div></li>)}</ul>
          )}
        </section>

        {/* Queue */}
        <section className={panel}>
          <p className={label}><UiText source={'Queue'} /></p>
          <ul className="mt-2 divide-y divide-white/10">
            {whatNext.slice(0, 5).map((item, i) => (
              <li key={item.id}><Link to={item.to} className="flex items-center gap-3 py-2 text-[13.5px] hover:text-[#79c0ff]"><span className="font-mono text-[11px] text-white/35">#{i + 1}</span><span className="min-w-0 flex-1 truncate font-semibold"><NextTitle item={item} /></span><span className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10.5px] text-white/50 uppercase"><UiText source={item.room} /></span></Link></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
