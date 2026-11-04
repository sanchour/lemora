// Lemora U12: a sentence in the language whose English rises above it on hover or focus, instead of a line under it.
import { cx } from '@/lib/cx';

export function HoverTranslation({ text, en, lang, className }: { text: string; en?: string; lang: string; className?: string }) {
  if (!en) return <span lang={lang} className={className}>{text}</span>;
  return (
    <span tabIndex={0} className={cx('group relative inline cursor-help rounded-md decoration-line-strong decoration-dotted underline-offset-[6px] outline-none hover:underline focus-visible:underline', className)}>
      <span lang={lang}>{text}</span>
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 w-max max-w-sm -translate-x-1/2 translate-y-1 rounded-xl bg-inverse px-3.5 py-2 font-sans text-[13.5px] leading-snug font-medium text-on-inverse not-italic opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        {en}
      </span>
    </span>
  );
}
