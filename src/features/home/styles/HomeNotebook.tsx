// Home style 7, "Notebook": a bullet journal. Dotted paper, a hand-ruled checklist for today, a habit tracker for the week, the
// book you are reading as a taped-in polaroid, and the next steps as small stickers.
import { Link } from 'react-router';
import { Check } from 'lucide-react';
import { Hand } from '@/design/drawings';
import { UiText } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { ToolDuotoneIcon } from '../homeComponents';
import { useHomeFacts } from './useHomeFacts';
import { LeftOffCover, NextTitle } from './parts';

const TAPE = ['#f4b6a0', '#b9dcb0', '#bcd3ee', '#f6e27f'];
const DAY = (date: string) => new Date(`${date}T12:00`).toLocaleDateString(undefined, { weekday: 'narrow' });

function Tape({ colour, className }: { colour: string; className?: string }) {
  return <span aria-hidden className={cx('absolute h-6 w-20 opacity-80 shadow-sm', className)} style={{ background: colour, clipPath: 'polygon(4% 0,100% 0,96% 100%,0 100%)' }} />;
}

export function HomeNotebook() {
  const f = useHomeFacts();
  const { header, leftOff, cursus, whatNext, due, goal, minutesToday, week, streak, tools, words } = f;
  const day = new Date().getDate();
  const todo = [
    { id: 'words', to: '/thesaurus/study/all?mode=recall', done: (due?.due ?? 0) === 0, text: <UiText source={'Review {0} words'} values={[due?.due ?? 0]} /> },
    { id: 'read', to: leftOff.to, done: false, text: <><UiText source={leftOff.isStarter ? 'Begin' : 'Read on'} /> <i lang={f.language.id}>{leftOff.title}</i></> },
    { id: 'time', to: leftOff.to, done: minutesToday >= goal, text: <UiText source={'Study for {0} minutes'} values={[goal]} /> },
    ...(cursus ? [{ id: 'cursus', to: cursus.to, done: false, text: <>{cursus.title}</> }] : []),
  ];
  return (
    <div className="mx-auto max-w-[1050px] pb-12">
      <div className="relative rounded-[10px] border border-line-strong/50 bg-[#fffdf6] px-6 pt-9 pb-10 shadow-elev-2 [background-image:radial-gradient(circle,rgba(120,100,70,0.28)_1.1px,transparent_1.3px)] [background-size:22px_22px] sm:px-12 dark:bg-[#242019]">
        <span aria-hidden className="absolute top-0 bottom-0 left-6 hidden w-px bg-[#e49a8d]/50 sm:block" />
        <Tape colour={TAPE[0]} className="-top-2.5 left-14 -rotate-3" />
        <Tape colour={TAPE[2]} className="-top-2.5 right-20 rotate-2" />

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-[76px] place-items-center rounded-full border-[3px] border-accent font-serif text-[34px] font-bold text-accent-text [border-radius:55%_45%_52%_48%/48%_55%_45%_52%]">{day}</span>
            <div>
              <p className="font-serif text-[15px] text-ink-faint italic">{header.eyebrow}</p>
              <h1 className="font-serif text-[30px] leading-tight font-medium text-ink italic sm:text-[40px]">{header.greeting}</h1>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <h2 className="font-serif text-[24px] font-bold text-ink underline decoration-accent decoration-2 underline-offset-[7px]"><UiText source={'Today'} /></h2>
            <ul className="mt-4">
              {todo.map((t) => (
                <li key={t.id} className="border-b border-dashed border-line-strong/70">
                  <Link to={t.to} className="group flex items-center gap-3.5 py-3">
                    <span className={cx('grid size-6 shrink-0 place-items-center border-2 border-ink [border-radius:35%_45%_40%_50%] transition-colors group-hover:border-accent', t.done && 'bg-sage-text/20')}>{t.done && <Check size={16} strokeWidth={3.4} className="text-sage-text" aria-hidden />}</span>
                    <span className={cx('font-serif text-[19px] text-ink', t.done && 'line-through decoration-2 opacity-55')}>{t.text}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-9 font-serif text-[22px] font-bold text-ink underline decoration-sage-text decoration-2 underline-offset-[7px]"><UiText source={'This week'} /></h2>
            <div className="mt-4 flex items-end gap-3">
              {week.map((d, i) => (
                <span key={d.date} className="flex flex-col items-center gap-1.5">
                  <span className={cx('grid size-9 place-items-center border-2 [border-radius:48%_52%_50%_50%/52%_48%_52%_48%]', d.minutes > 0 ? 'border-accent bg-accent/25' : 'border-line-strong', i === week.length - 1 && 'ring-2 ring-ink/30 ring-offset-2 ring-offset-transparent')}>{d.minutes > 0 && <Check size={16} strokeWidth={3.4} className="text-accent-text" aria-hidden />}</span>
                  <span className="font-serif text-[13px] text-ink-faint italic">{DAY(d.date)}</span>
                </span>
              ))}
              <span className="ml-3 self-center font-serif text-[18px] text-ink-soft italic"><UiText source={'Day {0} of your streak.'} values={[streak]} /></span>
            </div>
          </div>

          <div className="space-y-8">
            {/* The book, taped in like a polaroid */}
            <Link to={leftOff.to} className="group relative mx-auto block w-[230px] rotate-2 bg-white p-3 pb-12 text-center shadow-elev-2 transition-transform hover:rotate-0">
              <Tape colour={TAPE[3]} className="-top-3 left-1/2 w-24 -translate-x-1/2 rotate-1" />
              <span className="block aspect-[2/3] overflow-hidden bg-sunken"><LeftOffCover facts={f} /></span>
              <span lang={f.language.id} className="absolute inset-x-3 bottom-2.5 line-clamp-2 font-serif text-[15px] leading-tight text-black/75 italic">{leftOff.title} · {leftOff.percent}%</span>
            </Link>

            {/* Stickers */}
            <div className="flex flex-wrap justify-center gap-3">
              {whatNext.slice(0, 4).map((item, i) => (
                <Link key={item.id} to={item.to} className="group flex max-w-[150px] flex-col items-center rounded-2xl border-[3px] border-white bg-surface px-3 py-2.5 text-center shadow-elev-1 transition-transform hover:-translate-y-1 hover:rotate-0" style={{ transform: `rotate(${[-3, 2, -1.5, 3][i]}deg)` }}>
                  {item.hand ? <Hand name={item.hand} size={32} /> : <item.icon size={28} className="text-ink" aria-hidden />}
                  <span className="mt-1 line-clamp-2 font-serif text-[13.5px] leading-tight font-bold text-ink"><NextTitle item={item} /></span>
                </Link>
              ))}
            </div>
            {words.length > 0 && <p className="text-center font-serif text-[15px] text-ink-soft italic">{words.slice(0, 3).map((w) => w.term).join(' · ')}</p>}
          </div>
        </div>

        <nav aria-label="Tools" className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-dashed border-line-strong/70 pt-5">
          {tools.map((t) => <Link key={t.id} to={t.to} title={t.role} className="inline-flex items-center gap-1.5 font-serif text-[15px] text-ink-soft italic transition-colors hover:text-accent-text"><ToolDuotoneIcon id={t.id} className="size-4" /> {t.name}</Link>)}
        </nav>
      </div>
    </div>
  );
}
