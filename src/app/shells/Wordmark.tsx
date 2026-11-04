import { cx } from '@/lib/cx';
import { PRODUCT } from '@/product';

/** App mark: two speech bubbles and a bookmark (the same drawing as public/logo.svg); its colours follow the light/dark theme. */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  const stroke = { fill: 'none', stroke: 'var(--ink)', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const back = 'M10 22Q10 12 20 12H52Q62 12 62 22V40Q62 50 52 50H34L22 60V50Q10 50 10 40Z';
  const front = 'M34 46Q34 36 44 36H78Q88 36 88 46V64Q88 74 78 74H74V87L60 74H44Q34 74 34 64Z';
  const ribbon = 'M74 36V52L78 48.5L82 52V36';
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className={className} aria-hidden>
      <path d={back} fill="var(--mark-sage)" />
      <path d={back} {...stroke} transform="translate(-1.4 1.2)" />
      <path d="M36 18V22M26 25H46M30 28Q33 37 44 42M42 28Q39 37 28 42" {...stroke} />
      <path d={front} fill="var(--mark-orange)" />
      <path d={front} {...stroke} transform="translate(-1.4 1.2)" />
      <path d="M51 67L61 43L71 67M55 60H67" {...stroke} />
      <path d={ribbon} fill="var(--mark-ribbon)" />
      <path d={ribbon} {...stroke} transform="translate(-1.4 1.2)" />
    </svg>
  );
}

/** Wordmark: the app's name in lowercase serif with an accent full stop ("lemora.", "lingua."). */
export function Wordmark({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' }) {
  return (
    <span className={cx('font-serif leading-none font-semibold tracking-tight text-ink', size === 'sm' ? 'text-[22px]' : 'text-[30px]', className)}>
      {PRODUCT.name.toLowerCase()}
      <span className="text-accent" aria-hidden>.</span>
    </span>
  );
}

/** Monogram: lowercase serif "l." with an accent full stop, in the style of the wordmark. */
export function Monogram({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' }) {
  return (
    <span className={cx('font-serif leading-none font-semibold tracking-tight text-ink select-none', size === 'sm' ? 'text-[20px]' : 'text-[24px]', className)}>
      l<span className="text-accent" aria-hidden>.</span>
    </span>
  );
}
