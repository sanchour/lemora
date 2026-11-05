// Home style 1, "Gazette": a newspaper front page. A masthead between double rules, the book you are reading as the lead
// story, the next steps as numbered briefs, then three ruled columns (words, the day's goal, from the archive).
import { Link } from 'react-router';
import { UiText } from '@/design/i18n/UiText';
import { ArrowRight } from 'lucide-react';
import { useHomeFacts } from './useHomeFacts';
import { LeftOffCover, NextDetail, NextTitle } from './parts';

export function HomeEditorial() {
  const f = useHomeFacts();
  const { header, leftOff, whatNext, discover, words, due, goal, minutesToday, streak, tools } = f;
  const pct = Math.min(100, Math.round((minutesToday / Math.max(1, goal)) * 100));
  return (
    <div className="mx-auto max-w-[1100px] pb-10">
      {/* Masthead */}
      <header className="border-y-[3px] border-double border-ink py-3 text-center">
        <div className="flex items-center justify-between text-[11px] font-bold tracking-[0.16em] text-ink-soft uppercase">
          <span>{header.eyebrow.split(' · ')[0]}</span>
          <span className="hidden sm:inline"><UiText source={'The reader’s edition'} /></span>
          <span>{header.eyebrow.split(' · ')[1]}</span>
        </div>
        <h1 className="mt-1 font-serif text-[46px] leading-none font-black tracking-tight text-ink sm:text-[72px]"><UiText source={'The Daily Reader'} /></h1>
        <p className="mt-2 font-serif text-[16px] text-ink-soft italic">{header.greeting}</p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:divide-x lg:divide-line-strong">
        {/* Lead story */}
        <article className="lg:pr-8">
          <p className="text-[11px] font-bold tracking-[0.18em] text-accent-text uppercase"><UiText source={'Continue reading'} /></p>
          <div className="mt-3 grid gap-6 sm:grid-cols-[200px_minmax(0,1fr)]">
            <Link to={leftOff.to} className="block aspect-[2/3] overflow-hidden rounded-[3px] shadow-elev-2 ring-1 ring-line transition-transform hover:-rotate-1"><LeftOffCover facts={f} /></Link>
            <div>
              <h2 className="font-serif text-[34px] leading-[1.05] font-bold tracking-tight text-balance text-ink sm:text-[46px]">{leftOff.title}</h2>
              <p className="mt-2 font-serif text-[17px] text-ink-soft italic">{leftOff.author}</p>
              <p className="mt-4 border-t border-line-strong pt-3 font-serif text-[16.5px] leading-relaxed text-ink-soft first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-[56px] first-letter:leading-[0.85] first-letter:font-bold first-letter:text-ink">
                {leftOff.isStarter ? <UiText source={'Nothing begun yet. Open your first text and let the words find you, one tap at a time.'} /> : <UiText source={'You are {0}% of the way through. Pick up where you left off: the page is waiting.'} values={[leftOff.percent]} />}
              </p>
              <Link to={leftOff.to} className="mt-4 inline-flex items-center gap-2 border-b-2 border-ink pb-0.5 font-serif text-[16px] font-bold text-ink transition-colors hover:border-accent hover:text-accent-text"><UiText source={leftOff.isStarter ? 'Begin' : 'Read on'} /> <ArrowRight size={16} aria-hidden /></Link>
            </div>
          </div>
        </article>

        {/* Briefs */}
        <aside className="lg:pl-8">
          <h3 className="border-b-2 border-ink pb-1 text-[12px] font-black tracking-[0.2em] uppercase"><UiText source={'In brief'} /></h3>
          <ol className="divide-y divide-line">
            {whatNext.slice(0, 5).map((item, i) => (
              <li key={item.id}>
                <Link to={item.to} className="group block py-3">
                  <span className="text-[10.5px] font-bold tracking-[0.16em] text-ink-faint uppercase">{i + 1} · <UiText source={item.room} /></span>
                  <span className="mt-0.5 block font-serif text-[18px] leading-snug font-bold text-ink transition-colors group-hover:text-accent-text"><NextTitle item={item} /></span>
                  <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-ink-soft"><NextDetail item={item} /></span>
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      {/* Three columns */}
      <div className="mt-8 grid gap-8 border-t-[3px] border-double border-ink pt-6 md:grid-cols-3 md:divide-x md:divide-line-strong">
        <section className="md:pr-6">
          <h3 className="text-[12px] font-black tracking-[0.2em] uppercase"><UiText source={'Words of the day'} /></h3>
          {words.length ? (
            <dl className="mt-3 space-y-2.5">
              {words.slice(0, 5).map((w) => (
                <div key={w.term}><dt className="font-serif text-[20px] font-bold text-ink">{w.term}</dt><dd className="text-[13px] text-ink-soft">{w.meaning}</dd></div>
              ))}
            </dl>
          ) : <p className="mt-3 font-serif text-[15px] text-ink-soft italic"><UiText source={'No words are due. A quiet day for the cards.'} /></p>}
          <Link to="/thesaurus/study/all?mode=recall" className="mt-3 inline-block text-[12.5px] font-bold text-accent-text hover:underline"><UiText source={'{0} to review'} values={[due?.due ?? 0]} /> →</Link>
        </section>

        <section className="md:px-6">
          <h3 className="text-[12px] font-black tracking-[0.2em] uppercase"><UiText source={'The day’s goal'} /></h3>
          <p className="mt-3 font-serif text-[64px] leading-none font-black tracking-tight text-ink tabular-nums">{minutesToday}<span className="text-[26px] font-semibold text-ink-faint"> / {goal}</span></p>
          <p className="mt-1 text-[12px] font-bold tracking-[0.14em] text-ink-faint uppercase"><UiText source={'minutes today'} /></p>
          <div className="mt-3 h-2 border border-ink"><div className="h-full bg-ink" style={{ width: `${pct}%` }} /></div>
          <p className="mt-3 font-serif text-[15px] text-ink-soft italic">{streak > 0 ? <UiText source={'Day {0} of your streak.'} values={[streak]} /> : <UiText source={'Begin a streak today.'} />}</p>
        </section>

        <section className="md:pl-6">
          <h3 className="text-[12px] font-black tracking-[0.2em] uppercase"><UiText source={'From the archive'} /></h3>
          <ul className="mt-3 space-y-3">
            {discover.slice(0, 4).map((d) => (
              <li key={d.id}>
                <Link to={d.to} className="group block">
                  <span className="text-[10.5px] font-bold tracking-[0.16em] text-ink-faint uppercase">{d.tag} · {d.level}</span>
                  <span className="block font-serif text-[17px] leading-snug font-bold text-ink transition-colors group-hover:text-accent-text">{d.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Index of the paper's sections */}
      <nav aria-label="Tools" className="mt-8 border-t border-line-strong pt-3 text-center text-[12.5px] font-bold tracking-[0.1em] text-ink-soft uppercase">
        {tools.map((t, i) => (
          <span key={t.id}>{i > 0 && <span className="mx-2.5 text-ink-faint">·</span>}<Link to={t.to} className="transition-colors hover:text-accent-text">{t.name}</Link></span>
        ))}
      </nav>
    </div>
  );
}
