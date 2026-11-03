import { cx } from '@/lib/cx';
import { PRODUCT } from '@/product';

/** App mark: two solid pages with a ribbon cut out of one (same drawing as public/logo.svg). */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="108 140 296 252" className={className} aria-hidden>
      <path d="M250 184C216 160 166 150 116 156V352C166 346 216 356 250 380Z" fill="var(--accent)" />
      <path d="M262 184C296 160 346 150 396 156V352C346 346 296 356 262 380Z" fill="var(--accent)" />
      <path d="M318 154V262l22-16 22 16V152Z" fill="var(--surface)" />
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
