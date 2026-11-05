// Home style 5, "Focus": almost nothing. One sentence, one button, a hairline of numbers, a few quiet links.
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { UiText } from '@/design/i18n/UiText';
import { useHomeFacts } from './useHomeFacts';
import { NextTitle } from './parts';

export function HomeFocus() {
  const f = useHomeFacts();
  const { header, leftOff, whatNext, due, goal, minutesToday, streak, tools } = f;
  const name = header.name;
  return (
    <div className="relative mx-auto flex min-h-[calc(100dvh-9rem)] max-w-[720px] flex-col items-center justify-center px-2 pb-8 text-center">
      <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 -z-10 size-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl [background:radial-gradient(circle,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_65%)]" />
      <p className="text-[12px] font-semibold tracking-[0.3em] text-ink-faint uppercase">{header.eyebrow}</p>

      <h1 className="mt-10 font-serif text-[40px] leading-[1.12] font-medium tracking-tight text-balance text-ink sm:text-[58px]">
        {leftOff.isStarter ? <UiText source={'Ready to begin, {0}?'} values={[name]} /> : <UiText source={'Back to “{0}”?'} values={[leftOff.title]} />}
      </h1>
      {!leftOff.isStarter && <p className="mt-3 font-serif text-[18px] text-ink-soft italic">{leftOff.author} · {leftOff.percent}%</p>}

      <Link to={leftOff.to} className="mt-10 inline-flex h-14 items-center gap-3 rounded-full bg-ink px-9 text-[16px] font-semibold text-bg shadow-elev-2 transition-transform hover:-translate-y-0.5 active:scale-95">
        <UiText source={leftOff.isStarter ? 'Begin' : 'Continue'} /> <ArrowRight size={18} aria-hidden />
      </Link>

      {/* One hairline of numbers */}
      <p className="mt-14 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[13.5px] text-ink-soft tabular-nums">
        <Link to="/thesaurus/study/all?mode=recall" className="hover:text-accent-text"><b className="font-semibold text-ink">{due?.due ?? 0}</b> <UiText source={'words due'} /></Link>
        <span aria-hidden className="h-3 w-px bg-line-strong" />
        <span><b className="font-semibold text-ink">{minutesToday}</b> / {goal} <UiText source={'min today'} /></span>
        <span aria-hidden className="h-3 w-px bg-line-strong" />
        <span><b className="font-semibold text-ink">{streak}</b> <UiText source={'day streak'} /></span>
      </p>

      {/* Three quiet suggestions */}
      <ul className="mt-8 space-y-1.5">
        {whatNext.slice(0, 3).map((item) => (
          <li key={item.id}><Link to={item.to} className="font-serif text-[17px] text-ink-soft underline decoration-line-strong decoration-1 underline-offset-[6px] transition-colors hover:text-accent-text hover:decoration-accent"><NextTitle item={item} /></Link></li>
        ))}
      </ul>

      <nav aria-label="Tools" className="mt-14 flex flex-wrap items-center justify-center gap-x-1 text-[12.5px] text-ink-faint">
        {tools.map((t, i) => (
          <span key={t.id}>{i > 0 && <span className="px-1.5">/</span>}<Link to={t.to} className="lowercase transition-colors hover:text-ink">{t.name}</Link></span>
        ))}
      </nav>
    </div>
  );
}
