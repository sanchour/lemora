// Home style 11, "Analytics": a product dashboard. KPI cards with sparklines, an area chart of the last fourteen days against
// the goal, the time split by tool as a donut, and a table of recent texts.
import { Link } from 'react-router';
import { ArrowDownRight, ArrowUpRight, Layers, Flame, BookOpen, Clock } from 'lucide-react';
import { UiText } from '@/design/i18n/UiText';
import { useToolDays } from '@/data/toolGoals';
import { cx } from '@/lib/cx';
import { useHomeFacts } from './useHomeFacts';
import { NextTitle } from './parts';

const COLOURS = ['#c86d51', '#3f6b5b', '#2f4a73', '#a8741f', '#6a4a7a', '#8a3a4a', '#5a8a7a', '#999'];

function Spark({ values, colour }: { values: number[]; colour: string }) {
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 100},${28 - (v / max) * 24}`).join(' ');
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      <polyline points={`0,30 ${pts} 100,30`} fill={colour} fillOpacity={0.14} stroke="none" />
      <polyline points={pts} fill="none" stroke={colour} strokeWidth={1.8} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

function Kpi({ icon: Icon, label, value, unit, delta, spark, colour }: { icon: typeof Clock; label: React.ReactNode; value: React.ReactNode; unit?: React.ReactNode; delta?: number; spark: number[]; colour: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-surface p-4 shadow-elev-1">
      <div className="flex items-center justify-between text-[12.5px] font-semibold text-ink-soft"><span className="inline-flex items-center gap-1.5"><Icon size={15} aria-hidden /> {label}</span>
        {delta !== undefined && <span className={cx('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold', delta >= 0 ? 'bg-sage-soft text-sage-text' : 'bg-accent-soft text-accent-text')}>{delta >= 0 ? <ArrowUpRight size={12} aria-hidden /> : <ArrowDownRight size={12} aria-hidden />}{Math.abs(delta)}</span>}
      </div>
      <p className="mt-2 font-sans text-[30px] leading-none font-bold tracking-tight text-ink tabular-nums">{value}<span className="ml-1 text-[14px] font-semibold text-ink-faint">{unit}</span></p>
      <div className="mt-2"><Spark values={spark} colour={colour} /></div>
    </div>
  );
}

export function HomeAnalytics() {
  const f = useHomeFacts();
  const { header, leftOff, whatNext, due, goal, minutesToday, streak, week, recent, progress, language } = f;
  const days = useToolDays(language.id, 14) ?? [];
  const mins = days.map((d) => Math.round(d.total / 60_000));
  const yesterday = mins.at(-2) ?? 0;
  const top = Math.max(goal, ...mins, 1);
  const W = 560, H = 170;
  const x = (i: number) => (i / Math.max(1, mins.length - 1)) * W;
  const y = (v: number) => H - 14 - (v / top) * (H - 34);
  const line = mins.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  // Time by tool over the fortnight, for the donut.
  const byTool = new Map<string, number>();
  for (const d of days) for (const [tool, ms] of Object.entries(d.byTool)) byTool.set(tool, (byTool.get(tool) ?? 0) + ms);
  const parts = [...byTool.entries()].filter(([, ms]) => ms > 0).sort((a, b) => b[1] - a[1]);
  const sum = parts.reduce((s, [, ms]) => s + ms, 0);
  const R = 52, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="mx-auto max-w-[1180px] pb-10">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12.5px] font-semibold text-ink-faint">{header.eyebrow}</p>
          <h1 className="font-sans text-[26px] font-bold tracking-tight text-ink sm:text-[32px]">{header.greeting}</h1>
        </div>
        <span className="rounded-lg border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft"><UiText source={'Last 14 days'} /></span>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Clock} label={<UiText source={'Study time today'} />} value={minutesToday} unit={<UiText source={'min'} />} delta={minutesToday - yesterday} spark={mins.slice(-7)} colour="#c86d51" />
        <Kpi icon={Layers} label={<UiText source={'Cards due'} />} value={due?.due ?? 0} spark={week.map((d) => d.minutes)} colour="#3f6b5b" />
        <Kpi icon={Flame} label={<UiText source={'Streak'} />} value={streak} unit={<UiText source={'days'} />} spark={week.map((d) => (d.minutes > 0 ? 1 : 0))} colour="#a8741f" />
        <Kpi icon={BookOpen} label={<UiText source={'Current book'} />} value={`${leftOff.percent}%`} spark={[0, leftOff.percent / 3, leftOff.percent / 2, leftOff.percent]} colour="#2f4a73" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-line/70 bg-surface p-5 shadow-elev-1">
          <div className="flex items-center justify-between"><h2 className="text-[15px] font-bold text-ink"><UiText source={'Study time'} /></h2><span className="text-[12px] font-semibold text-ink-faint"><UiText source={'goal {0} min'} values={[goal]} /></span></div>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-44 w-full" aria-hidden preserveAspectRatio="none">
            {[0, 0.5, 1].map((r) => <line key={r} x1={0} x2={W} y1={y(top * r)} y2={y(top * r)} className="stroke-line" strokeWidth={1} vectorEffect="non-scaling-stroke" />)}
            <line x1={0} x2={W} y1={y(goal)} y2={y(goal)} stroke="#3f6b5b" strokeDasharray="5 5" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            {mins.length > 1 && <><polyline points={`0,${H - 14} ${line} ${W},${H - 14}`} fill="#c86d51" fillOpacity={0.15} stroke="none" /><polyline points={line} fill="none" stroke="#c86d51" strokeWidth={2.4} strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></>}
            {mins.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === mins.length - 1 ? 4.5 : 2.5} fill="#c86d51" />)}
          </svg>
          <div className="mt-1 flex justify-between text-[11px] font-semibold text-ink-faint">{days.filter((_, i) => i % 3 === 0).map((d) => <span key={d.date}>{d.date.slice(5)}</span>)}</div>
        </section>

        <section className="rounded-2xl border border-line/70 bg-surface p-5 shadow-elev-1">
          <h2 className="text-[15px] font-bold text-ink"><UiText source={'Time by tool'} /></h2>
          {parts.length === 0 ? <p className="mt-6 text-[13px] text-ink-soft"><UiText source={'Nothing recorded yet. Read something and it appears here.'} /></p> : (
            <div className="mt-3 flex items-center gap-5">
              <svg viewBox="0 0 140 140" className="size-32 shrink-0 -rotate-90" aria-hidden>
                {parts.map(([tool, ms], i) => { const len = (ms / sum) * C; const el = <circle key={tool} cx={70} cy={70} r={R} fill="none" stroke={COLOURS[i % COLOURS.length]} strokeWidth={18} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />; offset += len; return el; })}
              </svg>
              <ul className="min-w-0 flex-1 space-y-1.5 text-[12.5px]">{parts.slice(0, 5).map(([tool, ms], i) => <li key={tool} className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: COLOURS[i % COLOURS.length] }} /><span className="flex-1 truncate font-semibold text-ink-soft capitalize">{tool}</span><span className="tabular-nums text-ink-faint">{Math.round(ms / 60_000)}m</span></li>)}</ul>
            </div>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-2xl border border-line/70 bg-surface shadow-elev-1">
          <h2 className="px-5 pt-4 pb-2 text-[15px] font-bold text-ink"><UiText source={'Recent texts'} /></h2>
          <table className="w-full text-left text-[13px]">
            <thead className="border-y border-line/70 bg-sunken/60 text-[11px] font-bold tracking-[0.08em] text-ink-faint uppercase"><tr><th className="px-5 py-2"><UiText source={'Title'} /></th><th className="py-2"><UiText source={'Progress'} /></th><th className="px-5 py-2 text-right"><UiText source={'Known'} /></th></tr></thead>
            <tbody>
              {recent.slice(0, 6).map((t) => {
                const pct = Math.round((progress?.get(t.id)?.percent ?? 0) * 100);
                return (
                  <tr key={t.id} className="border-b border-line/50 last:border-0 hover:bg-sunken/40">
                    <td className="px-5 py-2.5"><Link to={t.kind === 'article' ? `/codex/read/${t.id}` : `/codex/book/${t.id}`} lang={language.id} className="font-semibold text-ink hover:text-accent-text">{t.title}</Link></td>
                    <td className="w-40 py-2.5"><span className="flex items-center gap-2"><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken"><span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} /></span><span className="w-8 text-[11.5px] text-ink-faint tabular-nums">{pct}%</span></span></td>
                    <td className="px-5 py-2.5 text-right text-ink-soft tabular-nums">{t.stats ? `${Math.round(t.stats.knownShare * 100)}%` : ''}</td>
                  </tr>
                );
              })}
              {recent.length === 0 && <tr><td colSpan={3} className="px-5 py-6 text-center text-ink-soft"><UiText source={'No texts yet.'} /></td></tr>}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl border border-line/70 bg-surface p-5 shadow-elev-1">
          <h2 className="text-[15px] font-bold text-ink"><UiText source={'Recommended'} /></h2>
          <ul className="mt-2 divide-y divide-line/60">
            {whatNext.slice(0, 4).map((item) => (
              <li key={item.id}><Link to={item.to} className="group flex items-center justify-between gap-3 py-2.5"><span className="min-w-0"><span className="block truncate text-[13.5px] font-semibold text-ink group-hover:text-accent-text"><NextTitle item={item} /></span><span className="block text-[11.5px] text-ink-faint"><UiText source={item.room} /></span></span><span className="shrink-0 rounded-md border border-line px-2 py-1 text-[11.5px] font-bold text-ink-soft group-hover:border-accent group-hover:text-accent-text"><UiText source={'Open'} /></span></Link></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
