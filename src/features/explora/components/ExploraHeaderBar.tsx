import { UiText, useUi } from '@/design/i18n/UiText';
import { useRef, useState, useEffect } from 'react';
import {
  Bookmark,
  BookImage,
  Gamepad2,
  Newspaper,
  BookOpen,
  Check,
  Film,
  Headphones,
  Layers,
  Lightbulb,
  Music,
  LayoutGrid,
  Star,
} from 'lucide-react';
import type { Level } from '@/core/lang/levels';
import type { LevelFilter } from '@/core/mundus/explore';
import { LEVELS } from '@/core/mundus/explore';
import { cx } from '@/lib/cx';
import type { ExploraCategory } from '../types';
import { shows } from '@/product';
import { useApp } from '@/app/context';

interface ExploraHeaderBarProps {
  category: ExploraCategory;
  onSelectCategory: (cat: ExploraCategory) => void;
  savedCount: number;
  learnerLevel: Level;
  levelFilter: LevelFilter;
  onSelectLevelFilter?: (filter: LevelFilter) => void;
}

interface LevelFilterProps {
  learnerLevel: Level;
  levelFilter: LevelFilter;
  onSelectLevelFilter: (filter: LevelFilter) => void;
}

export function ExploraHeaderBar({ category, onSelectCategory, savedCount, learnerLevel, levelFilter, onSelectLevelFilter }: ExploraHeaderBarProps) {
  const translateUi = useUi();
  // Settings › Appearance can bring back the earlier look: round tabs on a soft background, the dark one selected.
  const classic = useApp().settings.ui.classicExploraTabs === true;
  const tab = (active: boolean) =>
    cx(
      'group flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-bold transition-all duration-150 active:scale-95',
      classic
        ? active ? 'bg-inverse text-on-inverse shadow-elev-1' : 'bg-surface/70 text-ink-soft hover:bg-surface hover:text-ink'
        : active ? 'border border-accent bg-accent-fill text-on-accent shadow-elev-1' : 'border border-accent/50 text-ink-soft hover:bg-accent-soft hover:text-accent-text',
    );
  // Lemora U4: All · Books · Articles · Comics and magazines · Word decks · Ludus · Things to try (and Lingua's rooms where it has them).
  const categories = ([
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'articles', label: 'Articles', icon: Newspaper },
    { id: 'comics', label: 'Comics and magazines', icon: BookImage },
    { id: 'screen', label: 'Series & Films', icon: Film },
    { id: 'audio', label: 'Audio & Podcasts', icon: Headphones },
    { id: 'music', label: 'Music & Radio', icon: Music },
    { id: 'words', label: 'Word decks', icon: Layers },
    { id: 'ludus', label: 'Ludus', icon: Gamepad2 },
    // Lemora keeps Things to try here, with what to discover (src/product.ts); Lingua has it in Mundus.
    ...(shows('try') && !shows('mundus') ? [{ id: 'try' as const, label: 'Things to try', icon: Lightbulb }] : []),
  ] satisfies Array<{ id: ExploraCategory; label: string; icon: typeof LayoutGrid }>).filter((c) => (c.id === 'screen' ? shows('visio') : c.id === 'audio' ? shows('sonus') : c.id === 'music' ? shows('cantus') || shows('sonus') : true));

  return (
    <div className="mb-3.5 sm:mb-4 flex flex-wrap items-center justify-between gap-2.5">
      {/* Category Pills (Pure Round & Smooth) */}
      <nav
        aria-label={translateUi('Explore categories')}
        className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      >
        {categories.map((c) => {
          const Icon = c.icon;
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectCategory(c.id)}
              className={tab(active)}
            >
              <Icon
                size={13.5}
                className={cx(
                  'transition-transform duration-150',
                  active ? (classic ? 'text-on-inverse' : 'text-on-accent') : 'text-ink-faint group-hover:text-accent-text',
                )}
              />
              <span>{translateUi(c.label)}</span>
            </button>
          );
        })}

        {savedCount > 0 && (
          <button
            type="button"
            aria-pressed={category === 'saved'}
            onClick={() => onSelectCategory('saved')}
            className={tab(category === 'saved')}
          >
            <Bookmark
              size={13.5}
              className={category === 'saved' ? (classic ? 'text-on-inverse fill-current' : 'text-on-accent fill-current') : 'text-ink-faint'}
            />
            <span><UiText source={'Saved'} /></span>
            <span
              className={cx(
                'ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-extrabold tabular-nums',
                category === 'saved' ? 'bg-white/20 text-white' : 'bg-sunken text-ink-soft',
              )}
            >
              {savedCount}
            </span>
          </button>
        )}
      </nav>

      {onSelectLevelFilter && <LevelFilterButton learnerLevel={learnerLevel} levelFilter={levelFilter} onSelectLevelFilter={onSelectLevelFilter} />}
    </div>
  );
}

/** The level, in the same quiet style as the tabs: "Level B2" with a pen underline; it opens a small list of levels, the chosen one filled orange. */
export function LevelFilterButton({ learnerLevel, levelFilter, onSelectLevelFilter }: LevelFilterProps) {
  const translateUi = useUi();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('mousedown', outside);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('mousedown', outside);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);

  const shown = levelFilter === 'any' ? translateUi('All') : levelFilter === 'mine' ? learnerLevel : levelFilter;
  const label = levelFilter === 'mine' ? translateUi('Around {0}', [learnerLevel]) : levelFilter === 'any' ? translateUi('All levels') : `Level ${levelFilter}`;
  const pick = (f: LevelFilter) => {
    onSelectLevelFilter(f);
    setOpen(false);
  };
  const row = (active: boolean) => cx('flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-[12.5px] font-bold transition-colors', active ? 'bg-accent-fill text-on-accent' : 'text-ink-soft hover:text-accent-text');

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button type="button" aria-expanded={open} aria-haspopup="true" aria-label={translateUi('Filter by level: currently {0}', [label])} title={label} onClick={() => setOpen((v) => !v)} className="group flex h-8 items-center gap-1.5 rounded-full px-2 text-[12.5px] font-bold text-ink-soft transition-colors hover:text-accent-text">
        <span className="text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase"><UiText source={'Level'} /></span>
        <span className="relative font-serif text-[16px] font-bold text-accent-text">
          {shown}
          <svg aria-hidden viewBox="0 0 30 6" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-1 h-1.5 w-full overflow-visible"><path d="M1 3.4C8 1.2 14 5 20 2.8C23 1.8 26 2.6 29 2.2" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.7} /></svg>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-line/80 bg-raised p-3 shadow-elev-3">
          <button type="button" onClick={() => pick('mine')} className={cx(row(levelFilter === 'mine'), 'w-full justify-between')}>
            <span className="inline-flex items-center gap-1.5"><Star size={12} className="fill-current" aria-hidden /> <UiText source={'Around {0}'} values={[learnerLevel]} /></span>
            {levelFilter === 'mine' && <Check size={13} className="stroke-[3]" aria-hidden />}
          </button>
          <div className="my-2 grid grid-cols-5 gap-1">
            {LEVELS.map((lvl) => (
              <button key={lvl} type="button" title={lvl === learnerLevel ? `${lvl} (${translateUi('Your level')})` : lvl} onClick={() => pick(lvl)} className={cx(row(levelFilter === lvl), 'relative px-0')}>
                {lvl}
                {lvl === learnerLevel && <span aria-hidden className="absolute top-0.5 right-1 size-1.5 rounded-full bg-accent" />}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => pick('any')} className={cx(row(levelFilter === 'any'), 'w-full justify-between')}>
            <span><UiText source={'All levels'} /></span>
            {levelFilter === 'any' && <Check size={13} className="stroke-[3]" aria-hidden />}
          </button>
        </div>
      )}
    </div>
  );
}
