// Home style 10, "Poster": neo-brutalist. Flat saturated blocks, thick black borders, hard shadows and huge type; the day's minutes
// are the headline, the book is a block, the rest are stamps.
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { UiText } from '@/design/i18n/UiText';
import { LeftOffCover, NextTitle } from './parts';
import { useHomeFacts } from './useHomeFacts';

const box = 'border-[3px] border-black shadow-[6px_6px_0_0_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[9px_9px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[3px_3px_0_0_#000]';
const BLOCKS = ['#ffd23f', '#ff7a59', '#7be0ad', '#8ab4ff', '#f4a6d7'];

export function HomePoster() {
  const f = useHomeFacts();
  const { header, leftOff, whatNext, due, goal, minutesToday, streak, tools } = f;
  return (
    <div className="mx-auto max-w-[1100px] pb-12 text-black">
      <div className="grid gap-5 md:grid-cols-12">
        {/* Headline */}
        <div className={`${box} col-span-12 bg-[#fff4d6] p-6 md:col-span-8 md:p-8`}>
          <p className="inline-block border-[2px] border-black bg-black px-2 py-0.5 text-[12px] font-black tracking-[0.12em] text-white uppercase">{header.eyebrow}</p>
          <h1 className="mt-3 font-sans text-[44px] leading-[0.92] font-black tracking-tighter uppercase sm:text-[78px]">{minutesToday}<span className="text-[26px] tracking-normal sm:text-[36px]"> / {goal} <UiText source={'min'} /></span></h1>
          <p className="mt-3 max-w-md font-sans text-[16px] leading-snug font-bold">{header.greeting}</p>
        </div>

        {/* Streak stamp */}
        <div className={`${box} col-span-6 grid place-items-center bg-[#ff7a59] p-5 md:col-span-4`} style={{ transform: 'rotate(2deg)' }}>
          <p className="font-sans text-[72px] leading-none font-black tabular-nums">{streak}</p>
          <p className="text-[14px] font-black tracking-[0.1em] uppercase"><UiText source={'day streak'} /></p>
        </div>

        {/* The book */}
        <Link to={leftOff.to} className={`${box} col-span-12 flex items-stretch gap-5 bg-[#7be0ad] p-5 md:col-span-7`}>
          <span className="block aspect-[2/3] w-[120px] shrink-0 overflow-hidden border-[3px] border-black bg-white sm:w-[150px]"><LeftOffCover facts={f} /></span>
          <span className="flex min-w-0 flex-col justify-between">
            <span>
              <span className="text-[12px] font-black tracking-[0.14em] uppercase"><UiText source={'Continue reading'} /></span>
              <span lang={f.language.id} className="mt-1 block font-sans text-[28px] leading-[1.02] font-black tracking-tight uppercase sm:text-[40px]">{leftOff.title}</span>
              <span className="mt-1 block font-sans text-[14px] font-bold">{leftOff.author}</span>
            </span>
            <span className="mt-4 flex items-center gap-3"><span className="h-4 flex-1 border-[3px] border-black bg-white"><span className="block h-full bg-black" style={{ width: `${Math.max(3, leftOff.percent)}%` }} /></span><span className="font-black tabular-nums">{leftOff.percent}%</span></span>
          </span>
        </Link>

        {/* Cards due */}
        <Link to="/thesaurus/study/all?mode=recall" className={`${box} col-span-12 flex flex-col justify-between bg-[#8ab4ff] p-5 md:col-span-5`} style={{ transform: 'rotate(-1deg)' }}>
          <ArrowUpRight size={34} strokeWidth={3} className="self-end" aria-hidden />
          <span><span className="block font-sans text-[64px] leading-none font-black tabular-nums">{due?.due ?? 0}</span><span className="text-[15px] font-black uppercase"><UiText source={'words to review'} /></span></span>
        </Link>

        {/* Next steps as stamps */}
        {whatNext.slice(0, 4).map((item, i) => (
          <Link key={item.id} to={item.to} className={`${box} col-span-6 flex min-h-[120px] flex-col justify-between p-4 md:col-span-3`} style={{ background: BLOCKS[(i + 2) % BLOCKS.length], transform: `rotate(${[1, -1.5, 1.5, -1][i]}deg)` }}>
            <span className="text-[11px] font-black tracking-[0.14em] uppercase"><UiText source={item.room} /></span>
            <span className="font-sans text-[18px] leading-tight font-black"><NextTitle item={item} /></span>
          </Link>
        ))}

        {/* Tools */}
        <nav aria-label="Tools" className="col-span-12 flex flex-wrap gap-3">
          {tools.map((t, i) => <Link key={t.id} to={t.to} title={t.role} className={`${box} px-4 py-2 font-sans text-[14px] font-black uppercase`} style={{ background: BLOCKS[i % BLOCKS.length] }}>{t.name}</Link>)}
        </nav>
      </div>
    </div>
  );
}
