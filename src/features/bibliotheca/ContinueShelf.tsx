import { memo, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UiText, useUi } from '@/design/i18n/UiText';
import { useLayout } from '@/design/hooks/useLayout';
import { ContinueCard } from './ContinueCard';
import { ContinueDeskCard } from './ContinueDeskCard';
import type { ContinueItem } from './types';

interface ContinueShelfProps {
  items: ContinueItem[];
  lang: string;
}

export const ContinueShelf = memo(function ContinueShelf({ items, lang }: ContinueShelfProps) {
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
    if (!el || isExpanded || items.length < 4) return;
    updateScrollState();

    const handleScroll = () => updateScrollState();
    el.addEventListener('scroll', handleScroll, { passive: true });

    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      ro.disconnect();
    };
  }, [isExpanded, items.length]);

  const scrollByAmount = (direction: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    const scrollOffset = el.clientWidth * 0.75 * direction;
    el.scrollBy({ left: scrollOffset, behavior: 'smooth' });
  };

  if (!items.length) return null;

  // Single active item: featured scholar's study desk layout
  if (items.length === 1) {
    return (
      <section aria-label={translateUi('Continue learning')} className="mb-12">
        <div className="mb-3.5 flex items-baseline justify-between">
          <h2 className="font-serif text-[22px] font-semibold tracking-tight">
            <UiText source={'Continue learning'} />
          </h2>
          <span className="inline-flex h-5 items-center justify-center rounded-full bg-surface px-2 text-[11px] font-bold text-ink-faint tabular-nums shadow-xs">
            <UiText source={'{0} active'} values={[1]} />
          </span>
        </div>
        <ContinueDeskCard item={items[0]} lang={lang} />
      </section>
    );
  }

  // 2 or 3 active items: balanced, spacious grid
  if (items.length <= 3) {
    return (
      <section aria-label={translateUi('Continue learning')} className="mb-12">
        <div className="mb-3.5 flex items-baseline justify-between">
          <h2 className="font-serif text-[22px] font-semibold tracking-tight">
            <UiText source={'Continue learning'} />
          </h2>
          <span className="inline-flex h-5 items-center justify-center rounded-full bg-surface px-2 text-[11px] font-bold text-ink-faint tabular-nums shadow-xs">
            <UiText source={'{0} active'} values={[items.length]} />
          </span>
        </div>
        <div
          className={
            items.length === 2
              ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5'
              : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5'
          }
        >
          {items.map((item) => (
            <div key={item.id} className="h-full">
              <ContinueCard item={item} lang={lang} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 4+ active items: Explora-inspired horizontal shelf with controls and expansion
  return (
    <section aria-label={translateUi('Continue learning')} className="group/shelf mb-12">
      {/* Shelf Header */}
      <div className="mb-3.5 flex items-baseline justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="font-serif text-[22px] font-semibold tracking-tight text-ink">
            <UiText source={'Continue learning'} />
          </h2>
          <span className="inline-flex h-5 items-center justify-center rounded-full bg-surface px-2 text-[11px] font-bold text-ink-faint tabular-nums shadow-xs">
            <UiText source={'{0} active'} values={[items.length]} />
          </span>
        </div>

        {/* Shelf Actions: "See all" pill and desktop hover arrows */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="rounded-full bg-surface/80 px-3 py-1 text-[12.5px] font-bold text-ink-soft hover:bg-surface hover:text-ink active:scale-95 transition-all shadow-xs"
          >
            {isExpanded ? translateUi('Show less') : translateUi('See all')}
          </button>

          {!isExpanded && isMouse && (
            <div className="flex items-center gap-1.5 opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-200">
              <button
                type="button"
                aria-label={translateUi('Previous')}
                disabled={!scrollState.canPrev}
                onClick={() => scrollByAmount(-1)}
                className="grid size-8 place-items-center rounded-full bg-raised/90 border border-line/70 text-ink shadow-sm transition-all hover:bg-surface hover:scale-110 active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label={translateUi('Next')}
                disabled={!scrollState.canNext}
                onClick={() => scrollByAmount(1)}
                className="grid size-8 place-items-center rounded-full bg-raised/90 border border-line/70 text-ink shadow-sm transition-all hover:bg-surface hover:scale-110 active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content: Carousel Rail or Expanded Grid */}
      {isExpanded ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 pt-1">
          {items.map((item) => (
            <div key={item.id} className="h-full">
              <ContinueCard item={item} lang={lang} />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={rowRef}
          tabIndex={0}
          aria-label={translateUi('Continue learning')}
          className="flex gap-4 sm:gap-4.5 overflow-x-auto pb-3 pt-1 overscroll-x-contain scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 outline-none"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="w-[215px] sm:w-[235px] md:w-[250px] shrink-0 snap-start">
              <ContinueCard item={item} lang={lang} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
});
