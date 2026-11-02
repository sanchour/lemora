import { motion } from 'motion/react';

const BACK = 'M10 22Q10 12 20 12H52Q62 12 62 22V40Q62 50 52 50H34L22 60V50Q10 50 10 40Z';
const FRONT = 'M34 46Q34 36 44 36H78Q88 36 88 46V64Q88 74 78 74H74V87L60 74H44Q34 74 34 64Z';
const RIBBON = 'M74 36V52L78 48.5L82 52V36';

/** One shape: a flat colour block, and beside it (nudged a hair, like a misregistered print) the pen line that draws itself. */
function Shape({ d, fill, delay }: { d: string; fill: string; delay: number }) {
  return (
    <>
      <motion.path d={d} fill={fill} stroke="none" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay }} style={{ transformOrigin: '48px 48px' }} />
      <motion.path d={d} fill="none" transform="translate(-1.4 1.2)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: delay + 0.1, ease: 'easeInOut' }} />
    </>
  );
}

/**
 * The app's small icon, filled but still drawn: two speech bubbles (a sage one with a Chinese character, a terracotta-orange one
 * with an A) and a bookmark ribbon hanging from the front one.
 */
export function HandMark({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <Shape d={BACK} fill="#a9c4ae" delay={0} />
        <motion.path d="M36 18V22M26 25H46M30 28Q33 37 44 42M42 28Q39 37 28 42" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.5 }} />
        <Shape d={FRONT} fill="#ee8b48" delay={0.25} />
        <motion.path d="M51 67L61 43L71 67M55 60H67" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.75 }} />
        <Shape d={RIBBON} fill="#b4452a" delay={0.5} />
      </g>
    </svg>
  );
}
