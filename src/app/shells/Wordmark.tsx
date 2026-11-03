import { cx } from '@/lib/cx';
import { PRODUCT } from '@/product';

/** App mark: a bookmark for the "l" and the full stop beside it, on its line (the same drawing as public/logo.svg). */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="120 0 272 420" className={className} aria-hidden>
      <path d="M196 0H264V346L230 314L196 346Z" fill="var(--ink)" />
      <circle cx="334" cy="314" r="34" fill="var(--accent)" />
      <path d="M140 392Q256 384 372 392" fill="none" stroke="var(--ink)" strokeWidth={12} strokeLinecap="round" opacity={0.25} />
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
