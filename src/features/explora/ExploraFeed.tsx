// Explora › Flick: everything in Explora one at a time, full height, scrolled like a short-video feed. Wheel, arrow
// keys or the buttons move on; S or a double click saves; Enter opens; Esc closes.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Bookmark, ChevronLeft, ChevronRight, Info, RotateCcw, X } from 'lucide-react';
import type { Level } from '@/core/lang/levels';
import { UiText, useUi } from '@/design/i18n/UiText';
import { Hand } from '@/design/drawings';
import { cx } from '@/lib/cx';
import { posterUrl } from '@/services/mundus/tmdb';
import type { PickLookup } from '@/features/mundus/hooks';
import type { ExploraItem } from './types';
import { ItemCover, KIND_ICONS, actionIconFor, actionLabelFor } from './components/HeroBillboard';
import { LevelBadge } from './components/LevelBadge';

/** Flick's hand-drawn mark: three cards fanned along a line, the front one carrying the accent bookmark. */
export function FlickMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden className={cx('shrink-0', className)}>
      <g fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 14Q7 12.5 9 13.5L10 36Q8 37.5 6 36.5Z" opacity={0.45} />
        <path d="M11 11Q14 9.5 17 10.5L18.5 38Q15 39.5 12 38.5Z" opacity={0.7} />
        <path d="M20 8Q30 6.5 40 8Q41.5 8.5 41.5 10.5V37.5Q41.5 39.5 40 40Q30 41.5 20 40Q18.5 39.5 18.5 37.5V10.5Q18.5 8.5 20 8Z" />
        <path stroke="var(--accent)" d="M27 8.6V19L31 16L35 19V8.8" />
        <path d="M24 28H36M24 33H32" opacity={0.6} />
        <path stroke="var(--accent)" d="M42 22L46 24L42 26" />
      </g>
    </svg>
  );
}

/** A fresh order each time the feed opens: closest to the learner's level first, shuffled within each step. */
export function feedOrder(items: ExploraItem[], learnerLevel: Level, random = Math.random): ExploraItem[] {
  const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const me = LEVELS.indexOf(learnerLevel);
  const seen = new Set<string>();
  return items
    .filter((i) => !seen.has(i.id) && seen.add(i.id))
    .map((item) => ({ item, key: Math.abs(LEVELS.indexOf(item.level) - me) + random() * 1.5 }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.item);
}

interface ExploraFeedProps {
  items: ExploraItem[];
  lang: string;
  learnerLevel: Level;
  lookups: Map<string, PickLookup>;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpen: (item: ExploraItem) => void;
  onDetails: (item: ExploraItem) => void;
  onClose: () => void;
}

export function ExploraFeed({ items, lang, learnerLevel, lookups, savedIds, onToggleSave, onOpen, onDetails, onClose }: ExploraFeedProps) {
  const translateUi = useUi();
  const still = useReducedMotion();
  // The order is drawn once per opening, so saving or closing a dialog never reshuffles what you are looking at.
  const [order, setOrder] = useState(() => feedOrder(items, learnerLevel));
  const [index, setIndex] = useState(0);
  const [burst, setBurst] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const total = order.length;
  const current = order[index];

  const goTo = useCallback((to: number) => {
    const box = scroller.current;
    if (!box) return;
    const target = Math.max(0, Math.min(total, to));
    box.scrollTo({ left: target * box.clientWidth, behavior: still ? 'auto' : 'smooth' });
  }, [total, still]);

  const save = useCallback((item: ExploraItem, onlyAdd = false) => {
    const isSaved = savedIds.includes(item.id);
    if (!isSaved || !onlyAdd) onToggleSave(item.id);
    if (!isSaved) {
      setBurst(item.id);
      setTimeout(() => setBurst(null), 700);
    }
  }, [savedIds, onToggleSave]);

  // Which slide is showing follows the scroll (wheel, trackpad, touch and the buttons all end up here).
  const onScroll = () => {
    const box = scroller.current;
    if (box) setIndex(Math.round(box.scrollLeft / Math.max(1, box.clientWidth)));
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    scroller.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // One turn of the wheel or a trackpad swipe moves exactly one slide, then waits for the glide to finish.
  const wheelLock = useRef(0);
  const at = useRef(index);
  at.current = index;
  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // A mouse wheel turns vertically, a trackpad swipe sideways: either one turns the page.
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const now = Date.now();
      if (Math.abs(delta) < 8 || now < wheelLock.current) return;
      wheelLock.current = now + 650;
      goTo(at.current + (delta > 0 ? 1 : -1));
    };
    box.addEventListener('wheel', onWheel, { passive: false });
    return () => box.removeEventListener('wheel', onWheel);
  }, [goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A dialog opened from the feed (details) owns the keys while it is up.
      if (document.querySelector('[role="alertdialog"]') || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest('input, textarea, [contenteditable="true"]')) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'l' || e.key === 'PageDown' || e.key === ' ') goTo(index + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'h' || e.key === 'PageUp') goTo(index - 1);
      else if (e.key === 'Home') goTo(0);
      else if (e.key === 'End') goTo(total);
      else if ((e.key === 's' || e.key === 'S') && current) save(current);
      else if (e.key === 'Enter' && current) onOpen(current);
      else return;
      e.preventDefault();
    };
    // In the capture phase, so a dialog that closes itself on Esc is still there when this looks for it.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [index, total, current, goTo, save, onOpen, onClose]);

  const restart = () => {
    setOrder(feedOrder(items, learnerLevel));
    setIndex(0);
    // After the new order is drawn, so the browser has nothing to keep in view but the top.
    requestAnimationFrame(() => scroller.current?.scrollTo({ left: 0, behavior: 'auto' }));
  };

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={translateUi('Flick through Explora')}
      data-feed
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-[color-mix(in_oklab,var(--bg)_88%,black)]"
    >
      {/* Top bar: close, the name, where you are. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6">
        <button type="button" onClick={onClose} aria-label={translateUi('Close')} className="pointer-events-auto grid size-10 place-items-center rounded-full border border-line/70 bg-raised/90 text-ink-soft shadow-elev-1 backdrop-blur transition hover:text-ink active:scale-95">
          <X size={18} />
        </button>
        <span className="font-serif text-[18px] font-bold tracking-tight text-ink"><UiText source={'Flick'} /></span>
        <span className="min-w-10 rounded-full bg-raised/90 px-3 py-1.5 text-center text-[12px] font-bold text-ink-soft tabular-nums shadow-elev-1 backdrop-blur">
          {Math.min(index + 1, total)} / {total}
        </span>
      </div>

      <div
        ref={scroller}
        tabIndex={-1}
        onScroll={onScroll}
        style={{ overflowAnchor: 'none' }}
        dir="ltr"
        className="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-contain outline-none scrollbar-none"
      >
        {order.map((item, i) => (
          <FeedSlide
            key={item.id}
            item={item}
            lang={lang}
            learnerLevel={learnerLevel}
            near={Math.abs(i - index) <= 2}
            poster={item.pick && (item.kind === 'series' || item.kind === 'films') ? posterUrl(lookups.get(item.pick.title)?.title.posterPath, 'w500') : undefined}
            saved={savedIds.includes(item.id)}
            burst={burst === item.id}
            onSave={(onlyAdd) => save(item, onlyAdd)}
            onOpen={() => onOpen(item)}
            onDetails={() => onDetails(item)}
          />
        ))}

        {/* The end: start again in a new order, or go back. */}
        <section className="grid h-full w-full shrink-0 snap-start place-items-center px-6">
          <div className="flex max-w-sm flex-col items-center text-center">
            <Hand name="seal" size={64} className="text-accent" />
            <h2 className="mt-4 font-serif text-[28px] font-bold tracking-tight text-ink"><UiText source={'You’ve seen it all'} /></h2>
            <p className="mt-2 text-[14px] text-ink-soft"><UiText source={'{0} saved so far. Your saved things wait in Explora › Saved.'} values={[savedIds.length]} /></p>
            <div className="mt-6 flex gap-2.5">
              <button type="button" onClick={restart} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-accent-fill px-5 text-[13.5px] font-bold text-on-accent shadow-elev-1 transition active:scale-95">
                <RotateCcw size={15} aria-hidden /> <UiText source={'Shuffle again'} />
              </button>
              <button type="button" onClick={onClose} className="inline-flex h-10 items-center rounded-full border border-accent/50 px-5 text-[13.5px] font-bold text-accent-text transition hover:bg-accent-soft active:scale-95">
                <UiText source={'Back to Explora'} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Back and forward, at the sides (desktop). */}
      <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label={translateUi('Previous')} className="absolute top-1/2 left-4 z-20 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-line/70 bg-raised/90 text-ink-soft shadow-elev-1 transition hover:text-ink active:scale-95 disabled:opacity-35 md:grid lg:left-8">
        <ChevronLeft size={22} />
      </button>
      <button type="button" onClick={() => goTo(index + 1)} disabled={index >= total} aria-label={translateUi('Next')} className="absolute top-1/2 right-4 z-20 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-line/70 bg-raised/90 text-ink-soft shadow-elev-1 transition hover:text-ink active:scale-95 disabled:opacity-35 md:grid lg:right-8">
        <ChevronRight size={22} />
      </button>

      {/* The keys, quietly, at the foot (desktop). */}
      <p className="pointer-events-none absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 text-[11.5px] text-ink-faint lg:block">
        <UiText source={'← → to move · S to save · Enter to open · Esc to close'} />
      </p>
    </motion.div>,
    document.body,
  );
}

function FeedSlide({ item, lang, learnerLevel, near, poster, saved, burst, onSave, onOpen, onDetails }: {
  item: ExploraItem;
  lang: string;
  learnerLevel: Level;
  near: boolean;
  poster?: string;
  saved: boolean;
  burst: boolean;
  onSave: (onlyAdd?: boolean) => void;
  onOpen: () => void;
  onDetails: () => void;
}) {
  const translateUi = useUi();
  const KindIcon = KIND_ICONS[item.kind] ?? Info;
  const ActionIcon = actionIconFor(item.kind);
  const author = item.pick?.by ?? item.book?.author ?? (item.sub && item.sub !== 'Artist' ? item.sub : undefined);
  const blurb = item.blurb ?? item.pick?.why ?? item.artist?.why;

  return (
    <section aria-label={item.title} className="flex h-full w-full shrink-0 snap-start snap-always items-center justify-center gap-5 px-3 py-16 sm:px-6">
      {/* The card: tall like a phone screen, the picture filling it, the words over a soft shade at the foot. Only slides near the one showing draw their picture. */}
      <div onDoubleClick={() => onSave(true)} className="relative h-full max-h-[860px] w-full max-w-[min(480px,calc((100dvh-8rem)*0.62))] overflow-hidden rounded-[28px] bg-raised shadow-elev-3 ring-1 ring-line select-none">
        {near && (
          <>
            <div className="absolute inset-0 scale-110 opacity-70 blur-2xl" aria-hidden><ItemCover item={item} lang={lang} poster={poster} /></div>
            <div className="absolute inset-x-[21%] top-[6%] aspect-[2/3] overflow-hidden rounded-r-xl rounded-l-[4px] shadow-elev-3 ring-1 ring-black/10">
              <ItemCover item={item} lang={lang} poster={poster} />
              <span className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 to-transparent" aria-hidden />
            </div>
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/85 via-black/55 to-transparent" aria-hidden />

        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
          <p className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-white/75 uppercase">
            <KindIcon size={13} aria-hidden />
            <span>{translateUi(item.kind.toUpperCase())}</span>
            <LevelBadge level={item.level} estimated={item.estimated} size="sm" />
            {item.level === learnerLevel && <span className="tracking-normal normal-case">· <UiText source={'At your level'} /></span>}
          </p>
          <h2 className="mt-2 font-serif text-[26px] leading-[1.12] font-bold tracking-tight text-balance">{item.title}</h2>
          {author && <p className="mt-0.5 font-serif text-[15px] text-white/80 italic">{author}</p>}
          {blurb && <p className="mt-2 line-clamp-3 text-[13.5px] leading-snug text-white/85">{blurb}</p>}
          <button type="button" onClick={onOpen} className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-accent-fill px-5 text-[13.5px] font-bold text-on-accent shadow-elev-1 transition hover:brightness-105 active:scale-95">
            <ActionIcon size={15} aria-hidden /> {actionLabelFor(item.kind, translateUi)} <ArrowRight size={14} aria-hidden />
          </button>
        </div>

        {/* A double click saves: a bookmark pops in the middle. */}
        <AnimatePresence>
          {burst && (
            <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1.15, opacity: 1 }} exit={{ scale: 1.4, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 18 }} className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
              <Bookmark size={96} className="fill-accent text-accent drop-shadow-lg" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* The rail beside the card: save, details, open. */}
      <div className="flex shrink-0 flex-col items-center gap-4 self-end pb-6">
        <RailButton label={saved ? translateUi('Saved') : translateUi('Save')} pressed={saved} onClick={() => onSave()}>
          <Bookmark size={22} className={cx(saved && 'fill-current')} />
        </RailButton>
        <RailButton label={translateUi('Details')} onClick={onDetails}>
          <Info size={22} />
        </RailButton>
        <RailButton label={translateUi('Open')} onClick={onOpen}>
          <ArrowRight size={22} />
        </RailButton>
      </div>
    </section>
  );
}

function RailButton({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={pressed} className="group flex flex-col items-center gap-1 text-[11.5px] font-bold text-ink-soft">
      <span className={cx('grid size-12 place-items-center rounded-full border shadow-elev-1 transition group-hover:-translate-y-0.5 group-active:scale-90', pressed ? 'border-accent bg-accent-fill text-on-accent' : 'border-line/70 bg-raised text-ink-soft group-hover:border-accent/60 group-hover:text-accent-text')}>
        {children}
      </span>
      {label}
    </button>
  );
}
