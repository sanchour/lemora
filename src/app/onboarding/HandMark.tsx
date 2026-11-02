import { motion } from 'motion/react';

const PATHS: { d: string; color?: string; opacity?: number }[] = [
  { d: 'M48 40Q34 30 12 34V72Q34 68 48 78Q62 68 84 72V34Q62 30 48 40Z' },
  { d: 'M48 40V78' },
  { d: 'M20 44Q30 43 40 46M20 52Q30 51 40 54M20 60Q29 59 38 62', opacity: 0.5 },
  { d: 'M56 46Q66 43 76 44M56 54Q66 51 76 52', opacity: 0.5 },
  { d: 'M48 38Q46 26 52 16', color: 'var(--sage, #6b8e78)' },
  { d: 'M52 16Q60 14 62 8Q54 8 52 16Z', color: 'var(--sage, #6b8e78)' },
  { d: 'M49 28Q41 27 38 21Q46 21 49 28Z', color: 'var(--sage, #6b8e78)' },
  { d: 'M68 72V84L72 80.5L76 84V71', color: 'var(--accent)' },
];

/** The app's small icon in the icons' hand: an open book, a sprig growing from its spine and a terracotta ribbon. It draws itself in. */
export function HandMark({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        {PATHS.map((p, i) => (
          <motion.path
            key={i}
            d={p.d}
            stroke={p.color}
            opacity={p.opacity}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.1 + i * 0.12, ease: 'easeInOut' }}
          />
        ))}
      </g>
    </svg>
  );
}
