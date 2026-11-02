import { motion } from 'motion/react';

/** One pen stroke per letter, in the icons' hand (fine line, round caps, a little wobble). */
const STROKES = [
  'M12 70C22 64 30 38 30 22C30 12 22 12 22 24C22 44 22 66 36 70C40 71 44 68 46 64',
  'M50 52C49 60 48 68 56 70C60 71 64 68 66 64',
  'M68 54C67 62 66 68 67 70M67 60C70 51 80 50 82 57C83 62 81 67 83 70C86 71 90 68 92 64',
  'M118 54C108 48 100 56 101 64C102 72 112 72 118 58C118 72 119 88 114 96C109 104 98 100 102 94C106 90 114 90 122 84',
  'M128 54C127 62 126 68 130 70C136 72 140 64 142 54C141 62 141 68 146 70C149 71 152 68 154 64',
  'M178 56C168 48 158 56 159 64C160 72 172 72 178 58C177 64 177 68 181 70C185 71 188 68 190 64',
];

/** The hand-drawn Lingua logo: "lingua" in looped cursive, a sprig for the i's dot and a terracotta full stop. */
export function HandLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 214 112" className={className} role="img" aria-label="Lingua">
      <g fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
        {STROKES.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.1 + i * 0.16, ease: 'easeInOut' }}
          />
        ))}
        <g stroke="var(--sage, #6b8e78)" strokeWidth={2.4}>
          <path d="M53 40Q52 32 57 26" />
          <path d="M57 26Q65 24 66 17Q59 17 57 26Z" />
        </g>
      </g>
      <motion.circle cx={202} cy={68} r={4.6} fill="var(--accent)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 1.2 }} style={{ transformOrigin: '202px 68px' }} />
    </svg>
  );
}
