import { useUi } from '@/design/i18n/UiText';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLayout } from '@/design/hooks/useLayout';

interface MediaShelfProps {
  id: string;
  title: string;
  subtitle?: string;
  count?: number;
  badge?: ReactNode;
  children: ReactNode[];
}

// No line under the title (the user, 2026-11-04): `subtitle` is kept for callers, and not shown.
export function MediaShelf({ id, title, count, badge, children }: MediaShelfProps) {
  const translateUi = useUi();
  const { pointer } = useLayout();
  const [isExpanded, setIsExpanded] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ canPrev: false, canNext: true });

  const isMouse = pointer === 'fine';

  // Check scroll boundary
  const updateScrollState = () => {
    const el = rowRef.current;
    if (!el) return;
    const canPrev = el.scrollLeft > 6;
    const canNext = el.scrollLeft + el.clientWidth < el.scrollWidth - 10;
    setScrollState({ canPrev, canNext });
  };

  useEffect(() => {
    const el = rowRef.current;
    if (!el || isExpanded) return;
    updateScrollState();

    const handleScroll = () => updateScrollState();
    el.addEventListener('scroll', handleScroll, { passive: true });

    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      ro.disconnect();
    };
  }, [isExpanded, children.length]);

  // Smooth programmatic scroll when clicking arrows
  const scrollByAmount = (direction: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    const scrollOffset = el.clientWidth * 0.75 * direction;
    el.scrollBy({ left: scrollOffset, behavior: 'smooth' });
  };

  if (!children.length) return null;

  return (
    <section aria-labelledby={`shelf-title-${id}`} className="mb-5 sm:mb-6 group/shelf">
      {/* Shelf Header */}
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2
              id={`shelf-title-${id}`}
              className="font-serif text-[21px] sm:text-[24px] font-semibold text-ink truncate tracking-tight"
            >
              {title}
            </h2>
            {badge}
            {count !== undefined && (
              <span className="inline-flex h-4.5 items-center justify-center rounded-full bg-surface px-1.5 text-[10.5px] font-bold text-ink-faint tabular-nums shadow-xs">
                {count}
              </span>
            )}
          </div>
        </div>

        {/* Actions: Cute Bubbly "See all" Pill & Desktop Navigation Arrows */}
        <div className="flex items-center gap-1.5 shrink-0">
          {children.length > 4 && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="rounded-full bg-surface/70 px-2.5 py-0.5 text-[11.5px] font-bold text-ink-soft hover:bg-surface hover:text-ink active:scale-95 transition-all shadow-xs"
            >
              {isExpanded ? translateUi('Collapse row') : translateUi('See all')}
            </button>
          )}

          {!isExpanded && isMouse && (
            <div className="flex items-center gap-1 opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-200">
              <button
                type="button"
                aria-label={translateUi('Scroll left')}
                disabled={!scrollState.canPrev}
                onClick={() => scrollByAmount(-1)}
                className="grid size-7.5 place-items-center rounded-full bg-raised/90 border border-line/70 text-ink shadow-sm transition-all hover:bg-surface hover:scale-110 active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                aria-label={translateUi('Scroll right')}
                disabled={!scrollState.canNext}
                onClick={() => scrollByAmount(1)}
                className="grid size-7.5 place-items-center rounded-full bg-raised/90 border border-line/70 text-ink shadow-sm transition-all hover:bg-surface hover:scale-110 active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content: Horizontal Rail or Expanded Grid */}
      {isExpanded ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pt-1">
          {children}
        </div>
      ) : (
        <div
          ref={rowRef}
          tabIndex={0}
          aria-label={title}
          className="flex gap-3 sm:gap-3.5 overflow-x-auto pb-2.5 pt-0.5 overscroll-x-contain scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 outline-none"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
          }}
        >
          {children.map((child, idx) => (
            <div
              key={idx}
              className="w-[155px] sm:w-[185px] md:w-[205px] lg:w-[215px] shrink-0"
            >
              {child}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
