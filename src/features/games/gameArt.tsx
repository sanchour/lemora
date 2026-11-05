// One hand-drawn picture for each game (Explora › Ludus cards): fine ink line, a soft accent wash and one accent stroke, on a 64-point square.
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

const A = 'var(--accent)';
const WASH = { fill: A, fillOpacity: 0.2, stroke: 'none' } as const;
const ACC = { stroke: A, strokeWidth: 2.6 } as const;

const ART: Record<string, ReactNode> = {
  daily: (<><path d="M10 14Q32 12 54 14V54Q32 56 10 54Z" /><path d="M10 25Q32 23 54 25" /><path d="M20 8V18M44 8V18" /><path {...WASH} d="M10 25Q32 23 54 25V54Q32 56 10 54Z" /><path {...ACC} d="M32 32L34.6 38H41L36 41.8L38 48L32 44.4L26 48L28 41.8L23 38H29.4Z" /></>),
  weekly: (<><path d="M8 14Q32 12 56 14V54Q32 56 8 54Z" /><path d="M8 24Q32 22 56 24" /><path d="M18 8V18M46 8V18" /><path d="M16 32H18M26 32H28M36 32H38M46 32H48M16 41H18M26 41H28M36 41H38M46 41H48M16 49H18M26 49H28" /><circle cx={42} cy={49} r={4.4} {...WASH} /><path {...ACC} d="M38.5 49.4L41 52L46 46.4" /></>),
  tournament: (<><path d="M20 10H44V28Q44 38 32 38Q20 38 20 28Z" {...WASH} /><path d="M20 10H44V28Q44 38 32 38Q20 38 20 28Z" /><path d="M20 15H12Q12 26 21 27M44 15H52Q52 26 43 27" /><path d="M32 38V46M22 54H42M25 46H39V54H25Z" /><path {...ACC} d="M32 16L33.8 20.4L38.4 20.8L35 23.8L36 28.4L32 26L28 28.4L29 23.8L25.6 20.8L30.2 20.4Z" /></>),
  hangman: (<><path d="M8 56H40M16 56V8H44V15" /><path d="M16 17L24 8" /><circle cx={44} cy={21} r={5.6} /><path d="M44 27V40M44 31L37 36M44 31L51 36M44 40L38 50" /><path {...ACC} d="M46 22.6Q47.4 24 49 23" /><path d="M46 52H56" strokeDasharray="3 3" /></>),
  anagram: (<><path d="M7 22L21 18L25 33L11 37Z" {...WASH} /><path d="M7 22L21 18L25 33L11 37Z" /><path d="M24 30L38 31L37 46L23 45Z" /><path d="M41 16L56 21L51 36L36 31Z" /><path d="M14 31L17 24L20 31M15 29.4H19M28 36H33Q35 37 33 39H28ZM28 39H33.4Q35.6 40.4 33 42.4H28ZM43 26L48 28.4L46 34" strokeWidth={1.8} /><path {...ACC} d="M14 50Q32 60 52 48M47 46L52 48L49 53" /></>),
  missing: (<><path d="M6 20H20V36H6ZM23 20H37V36H23ZM40 20H54V36H40Z" /><path d="M10 31L13 25L16 31M11 29.2H15M44 25H50M47 25V31" strokeWidth={1.8} /><path {...ACC} d="M27 31H33" /><path d="M27 24Q30 22 33 24" strokeDasharray="2 3" /><path d="M10 46H50M10 52H36" opacity={0.5} /></>),
  clues: (<><path d="M32 8Q48 8 48 24Q48 33 41 38V44H23V38Q16 33 16 24Q16 8 32 8Z" {...WASH} /><path d="M32 8Q48 8 48 24Q48 33 41 38V44H23V38Q16 33 16 24Q16 8 32 8Z" /><path d="M24 50H40M27 56H37M28 44V32L32 27L36 32V44" /><path {...ACC} d="M32 1V4M8 8L10.4 10.4M56 8L53.6 10.4M4 24H8M56 24H60" /></>),
  wordsearch: (<><path d="M8 10Q32 8 56 10V54Q32 56 8 54Z" /><path d="M8 24Q32 22 56 24M8 38Q32 36 56 38M22 10V54M36 10V54M46 10V54" opacity={0.35} /><path d="M13 16H17M26 16H31M40 16H44M13 30H18M27 31L31 29M13 46H17M40 46H44" strokeWidth={1.8} /><path d="M10 33Q12 20 22 20H46Q56 20 56 30Q56 42 46 42H22Q12 42 10 33Z" {...WASH} /><path {...ACC} d="M10 33Q12 20 22 20H46Q56 20 56 30Q56 42 46 42H22Q12 42 10 33Z" /></>),
  hunt: (<><path d="M8 10Q24 8 40 10V50Q24 52 8 50Z" /><path d="M14 18H34M14 25H30M14 32H34M14 39H26" opacity={0.55} /><circle cx={40} cy={36} r={11} {...WASH} /><circle cx={40} cy={36} r={11} /><path {...ACC} d="M48 44L58 55" /><path d="M34 33Q37 29 42 30" strokeWidth={1.6} /></>),
  crossword: (<><path d="M8 8Q32 6 56 8V56Q32 58 8 56Z" /><path d="M8 20Q32 18 56 20M8 32Q32 30 56 32M8 44Q32 42 56 44M20 8V56M32 8V56M44 8V56" opacity={0.4} /><path d="M8 8H20V20H8ZM44 20H56V32H44ZM20 44H32V56H20Z" {...WASH} /><path d="M8 8H20V20H8ZM44 20H56V32H44ZM20 44H32V56H20Z" /><path {...ACC} d="M24 36L27 26L30 36M25 33.5H29" strokeWidth={2} /></>),
  synonyms: (<><path d="M6 12Q22 10 34 12V30Q22 32 16 32L10 38V32Q8 32 6 30Z" {...WASH} /><path d="M6 12Q22 10 34 12V30Q22 32 16 32L10 38V32Q8 32 6 30Z" /><path d="M30 28Q44 26 58 28V46Q56 46 54 46V52L48 46Q40 48 30 46Z" /><path {...ACC} d="M14 20H26M14 25H26" /><path d="M37 35H51M37 40H49" opacity={0.6} /></>),
  antonyms: (<><circle cx={17} cy={32} r={11} {...WASH} /><circle cx={17} cy={32} r={11} /><circle cx={47} cy={32} r={11} /><path d="M12 32H22M42 32H52M47 27V37" /><path {...ACC} d="M27 26H37M33 22L37 26L33 30M37 38H27M31 34L27 38L31 42" /></>),
  association: (<><circle cx={32} cy={32} r={8} {...WASH} /><circle cx={32} cy={32} r={8} /><circle cx={11} cy={14} r={5} /><circle cx={53} cy={14} r={5} /><circle cx={12} cy={51} r={5} /><circle cx={52} cy={50} r={5} /><path d="M15 18L26 27M49 18L38 27M16 47L26 38M48 46L38 37" /><path {...ACC} d="M29 32H35M32 29V35" /></>),
  sorting: (<><path d="M6 38H24V56H6ZM23 38H41V56H23ZM40 38H58V56H40Z" /><path d="M6 38L9 33H21L24 38M23 38L26 33H38L41 38M40 38L43 33H55L58 38" opacity={0.55} /><circle cx={15} cy={12} r={5} {...WASH} /><circle cx={15} cy={12} r={5} /><path d="M26 8H38V18H26Z" /><path d="M48 18L52 8L56 18Z" /><path {...ACC} d="M15 19V30M32 20V30M52 20V30M12 27L15 31L18 27M29 27L32 31L35 27M49 27L52 31L55 27" strokeWidth={2} /></>),
  odd: (<><circle cx={18} cy={18} r={9} /><circle cx={46} cy={18} r={9} /><circle cx={18} cy={46} r={9} /><circle cx={46} cy={46} r={9} {...WASH} /><path {...ACC} d="M40 44L44.5 49L53 41" /><path d="M13 18H23M41 18H51M13 46H23" opacity={0.5} strokeWidth={1.8} /></>),
  definition: (<><path d="M8 8Q32 6 56 8V28Q32 30 8 28Z" {...WASH} /><path d="M8 8Q32 6 56 8V28Q32 30 8 28Z" /><path {...ACC} d="M28 14Q28 11 32 11Q36 11 36 15Q36 18 32 20V22M32 25.4V26" /><path d="M8 36H28V44H8ZM36 36H56V44H36ZM8 49H28V57H8ZM36 49H56V57H36Z" strokeWidth={2} /><path d="M12 40H22M40 40H50M12 53H20M40 53H48" opacity={0.5} strokeWidth={1.6} /></>),
  picture: (<><path d="M7 11Q32 9 57 11V53Q32 55 7 53Z" /><path d="M11 15Q32 13 53 15V49Q32 51 11 49Z" {...WASH} /><path d="M11 44L25 28L35 40L42 33L53 44" /><circle cx={43} cy={22} r={4.4} /><path {...ACC} d="M43 14V16M51 22H49M35 22H37" /></>),
  memory: (<><path d="M6 18L26 14L32 44L12 48Z" {...WASH} /><path d="M6 18L26 14L32 44L12 48Z" /><path d="M31 14Q41 12 51 14V46Q41 48 31 46Z" /><path {...ACC} d="M41 24C37 20 33 24 37 28L41 32L45 28C49 24 45 20 41 24Z" /><path d="M14 28Q18 26 21 33M13 36L20 34" strokeWidth={1.6} opacity={0.7} /><path d="M33 54H55" opacity={0.5} /></>),
  bingo: (<><path d="M8 10Q32 8 56 10V54Q32 56 8 54Z" /><path d="M8 24Q32 22 56 24M8 38Q32 36 56 38M24 10V54M40 10V54" opacity={0.5} /><circle cx={16} cy={17} r={4.6} {...WASH} /><circle cx={48} cy={31} r={4.6} {...WASH} /><circle cx={32} cy={46} r={4.6} {...WASH} /><circle cx={32} cy={31} r={4.6} {...WASH} /><path {...ACC} d="M11 12L21 22M43 26L53 36M27 41L37 51M27 26L37 36" strokeWidth={2.2} /></>),
  parts: (<><path d="M6 20H24V28Q28 28 28 32Q28 36 24 36V44H6Z" {...WASH} /><path d="M6 20H24V28Q28 28 28 32Q28 36 24 36V44H6Z" /><path d="M32 20H46Q44 24 48 24Q52 24 50 20H58V44H32Z" /><path d="M32 50H58V58H32Z" /><path {...ACC} d="M10 52H22M16 49V55" /><path d="M38 32H52" strokeWidth={1.8} opacity={0.5} /></>),
  translate: (<><path d="M6 8Q20 6 34 8V26Q24 28 18 28L12 34V28Q8 28 6 26Z" /><path d="M13 22L18 11L23 22M14.6 18H21.4" strokeWidth={1.9} /><path d="M30 28Q44 26 58 28V46Q56 46 54 46V52L48 46Q40 48 30 46Z" {...WASH} /><path d="M30 28Q44 26 58 28V46Q56 46 54 46V52L48 46Q40 48 30 46Z" /><path {...ACC} d="M36 34H52M44 31V34M40 34Q41 41 36 43M48 34Q47 41 52 43" strokeWidth={1.8} /></>),
  dictation: (<><path d="M10 36V30Q10 12 28 12Q46 12 46 30V36" /><path d="M6 34Q6 32 9 32H13V46H9Q6 46 6 44Z" {...WASH} /><path d="M6 34Q6 32 9 32H13V46H9Q6 46 6 44Z" /><path d="M43 32H47Q50 32 50 34V44Q50 46 47 46H43Z" /><path {...ACC} d="M54 24Q58 30 54 36M58 20Q64 30 58 40" strokeWidth={2} /><path d="M20 54H44" strokeDasharray="3 3" /></>),
  story: (<><path d="M10 14Q10 6 20 6Q30 6 30 14V54H10Z" {...WASH} /><path d="M10 14Q10 6 20 6Q30 6 30 14V54H10Z" /><path d="M10 54H34M30 18L36 15V51" /><circle cx={25} cy={32} r={1.8} fill={A} stroke="none" /><circle cx={47} cy={24} r={6} {...ACC} fill="none" /><path {...ACC} d="M47 30V54M47 42H53M47 49H52" /></>),
  complete: (<><path d="M8 10Q32 8 56 10V40Q42 40 36 40L26 50V40Q16 40 8 40Z" {...WASH} /><path d="M8 10Q32 8 56 10V40Q42 40 36 40L26 50V40Q16 40 8 40Z" /><path d="M15 19H33M15 26H27M15 33H24" opacity={0.6} /><path {...ACC} d="M31 33H49" strokeDasharray="3 3" /><path d="M42 24L50 17" strokeWidth={2} /><path d="M12 56H36" opacity={0.4} /></>),
  projects: (<><circle cx={12} cy={42} r={7} /><circle cx={32} cy={20} r={7} {...WASH} /><circle cx={52} cy={42} r={7} /><circle cx={32} cy={20} r={7} /><path d="M17 37L27 25M37 25L47 37" /><path {...ACC} d="M19 48Q32 56 45 48M41 50L45 48L43 44" /><path d="M10 42H14M30 20H34M50 42H54" strokeWidth={2} /></>),
  ladder: (<><path d="M18 6L12 58M46 6L52 58" /><path d="M16 18H48M14 30H50M13 42H51" /><path d="M13 53H51" opacity={0.5} /><rect x={22} y={21} width={20} height={6.4} rx={1.6} {...WASH} /><path {...ACC} d="M25 25L28 23L31 25L34 23L37 25M26 37H38" strokeWidth={2} /></>),
};

export const hasGameArt = (id: string) => id in ART;

/** The game's picture, drawn on a 64-point square. */
export function GameArt({ id, size = 72, className }: { id: string; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className={cx('shrink-0 text-ink-soft', className)}>
      <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {ART[id]}
      </g>
    </svg>
  );
}
