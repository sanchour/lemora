// Home style 9, "Terminal": a command line. Monospace on a dark screen, a prompt, today's report as text with block-character
// bars, and the tools as commands you can click.
import { Link } from 'react-router';
import { useHomeFacts } from './useHomeFacts';
import { NextTitle } from './parts';

const bar = (ratio: number, width = 24) => '█'.repeat(Math.round(Math.min(1, ratio) * width)).padEnd(width, '░');

export function HomeTerminal() {
  const f = useHomeFacts();
  const { header, leftOff, whatNext, due, goal, minutesToday, streak, week, tools, words, language } = f;
  const line = 'leading-7';
  return (
    <div className="mx-auto max-w-[900px] pb-10">
      <div className="overflow-hidden rounded-2xl bg-[#14181c] font-mono text-[14px] text-[#cfe3d4] shadow-elev-3 ring-1 ring-black/40">
        <div className="flex items-center gap-2 border-b border-white/10 bg-[#1c2228] px-4 py-2.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" /><span className="size-3 rounded-full bg-[#febc2e]" /><span className="size-3 rounded-full bg-[#28c840]" />
          <span className="mx-auto text-[12px] text-white/50">lemora — {language.id} — 80×24</span>
        </div>
        <div className="space-y-5 p-5 sm:p-7">
          <div>
            <p className={line}><span className="text-[#7fd6a0]">reader@lemora</span><span className="text-white/50">:</span><span className="text-[#79b8ff]">~/{language.id}</span><span className="text-white/50">$</span> today</p>
            <p className="text-white/50">{header.eyebrow}</p>
            <p className="text-[18px] font-bold text-white sm:text-[22px]">{header.greeting}</p>
          </div>

          <div>
            <p className={line}><span className="text-[#7fd6a0]">$</span> goal --week</p>
            <p className={line}>today&nbsp;&nbsp; <span className="text-[#f2c06b]">{bar(minutesToday / Math.max(1, goal))}</span> {minutesToday}/{goal} min</p>
            {week.map((d) => <p key={d.date} className="leading-6 text-white/60">{d.date.slice(5)}&nbsp;&nbsp;&nbsp; <span className="text-[#79b8ff]/80">{bar(d.minutes / Math.max(1, goal), 16)}</span> {d.minutes}</p>)}
            <p className={line}>streak&nbsp; <span className="text-[#7fd6a0]">{streak}</span> day{streak === 1 ? '' : 's'}</p>
          </div>

          <div>
            <p className={line}><span className="text-[#7fd6a0]">$</span> resume</p>
            <Link to={leftOff.to} className="block rounded px-2 py-1 transition-colors hover:bg-white/10">
              <span className="text-[#f2c06b]">▶</span> <span lang={language.id} className="font-bold text-white">{leftOff.title}</span> <span className="text-white/50">— {leftOff.author} [{leftOff.percent}%]</span>
            </Link>
            <p className={line}><span className="text-[#7fd6a0]">$</span> review --due</p>
            <Link to="/thesaurus/study/all?mode=recall" className="block rounded px-2 py-1 transition-colors hover:bg-white/10">
              <span className="text-[#ff7b72]">{due?.due ?? 0}</span> cards due{words[0] ? <span className="text-white/50"> · next: <span lang={language.id} className="text-white">{words[0].term}</span></span> : null}
            </Link>
          </div>

          <div>
            <p className={line}><span className="text-[#7fd6a0]">$</span> next --suggest</p>
            {whatNext.slice(0, 5).map((item, i) => (
              <Link key={item.id} to={item.to} className="block rounded px-2 py-0.5 transition-colors hover:bg-white/10"><span className="text-white/40">[{i + 1}]</span> <span className="text-[#79b8ff]"><NextTitle item={item} /></span></Link>
            ))}
          </div>

          <div>
            <p className={line}><span className="text-[#7fd6a0]">$</span> ls tools/</p>
            <p className="flex flex-wrap gap-x-5">{tools.map((t) => <Link key={t.id} to={t.to} title={t.role} className="text-[#79b8ff] hover:underline">{t.name.toLowerCase()}/</Link>)}</p>
          </div>
          <p className={line}><span className="text-[#7fd6a0]">$</span> <span className="inline-block h-4 w-2 translate-y-0.5 bg-[#cfe3d4] motion-safe:animate-pulse" /></p>
        </div>
      </div>
    </div>
  );
}
