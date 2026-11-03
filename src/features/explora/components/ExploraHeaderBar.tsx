import { UiText, useUi } from '@/design/i18n/UiText';
import { useRef, useState, useEffect } from 'react';
import {
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  Film,
  Headphones,
  Layers,
  Music,
  Sparkles,
  Star,
} from 'lucide-react';
import type { Level } from '@/core/lang/levels';
import type { LevelFilter } from '@/core/mundus/explore';
import { LEVELS, LEVEL_HUE } from '@/core/mundus/explore';
import type { PickLevel } from '@/core/mundus/types';
import { cx } from '@/lib/cx';
import type { ExploraCategory } from '../types';
import { shows } from '@/product';

interface ExploraHeaderBarProps {
  category: ExploraCategory;
  onSelectCategory: (cat: ExploraCategory) => void;
  savedCount: number;
  learnerLevel: Level;
  levelFilter: LevelFilter;
  onSelectLevelFilter: (filter: LevelFilter) => void;
}

export function ExploraHeaderBar({
  category,
  onSelectCategory,
  savedCount,
  learnerLevel,
  levelFilter,
  onSelectLevelFilter,
}: ExploraHeaderBarProps) {
  const translateUi = useUi();
  const [levelMenuOpen, setLevelMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!levelMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setLevelMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [levelMenuOpen]);

  const categories = ([
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'screen', label: 'Series & Films', icon: Film },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'audio', label: 'Audio & Podcasts', icon: Headphones },
    { id: 'music', label: 'Music & Radio', icon: Music },
    { id: 'words', label: 'Word decks', icon: Layers },
  ] satisfies Array<{ id: ExploraCategory; label: string; icon: typeof Sparkles }>).filter((c) => (c.id === 'screen' ? shows('visio') : c.id === 'audio' ? shows('sonus') : c.id === 'music' ? shows('cantus') || shows('sonus') : true));

  const levelFilterLabel = (() => {
    if (levelFilter === 'mine') return translateUi('Around {0}', [learnerLevel]);
    if (levelFilter === 'any') return translateUi('All levels');
    return `Level ${levelFilter}`;
  })();

  const activeHue =
    levelFilter === 'mine'
      ? (LEVEL_HUE[learnerLevel as PickLevel] ?? '#cf9640')
      : levelFilter === 'any'
        ? '#888'
        : (LEVEL_HUE[levelFilter as PickLevel] ?? '#cf9640');

  return (
    <div className="mb-3.5 sm:mb-4 flex flex-wrap items-center justify-between gap-2.5">
      {/* Category Pills (Pure Round & Smooth) */}
      <nav
        aria-label={translateUi('Explore categories')}
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
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
              className={cx(
                'group flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-bold transition-all duration-150 active:scale-95',
                active
                  ? 'bg-inverse text-on-inverse shadow-elev-1'
                  : 'bg-surface/70 text-ink-soft hover:bg-surface hover:text-ink',
              )}
            >
              <Icon
                size={13.5}
                className={cx(
                  'transition-transform duration-150',
                  active ? 'text-on-inverse' : 'text-ink-faint group-hover:text-ink',
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
            className={cx(
              'group flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-bold transition-all duration-150 active:scale-95',
              category === 'saved'
                ? 'bg-inverse text-on-inverse shadow-elev-1'
                : 'bg-surface/70 text-ink-soft hover:bg-surface hover:text-ink',
            )}
          >
            <Bookmark
              size={13.5}
              className={category === 'saved' ? 'text-on-inverse fill-current' : 'text-ink-faint'}
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

      {/* Smooth, Round, Minimal Level Filter */}
      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          aria-expanded={levelMenuOpen}
          aria-haspopup="true"
          aria-label={translateUi('Filter by level: currently {0}', [levelFilterLabel])}
          onClick={() => setLevelMenuOpen((prev) => !prev)}
          className={cx(
            'flex h-8 items-center gap-2 rounded-full px-2.5 text-[11.5px] font-bold transition-all duration-150 active:scale-95 shadow-xs',
            levelFilter !== 'any'
              ? 'bg-surface text-ink border border-line-strong hover:bg-raised'
              : 'border border-line/70 bg-surface/50 text-ink-soft hover:bg-surface hover:text-ink',
          )}
        >
          {/* Minimal round dot */}
          <span
            className="size-2 rounded-full shadow-xs shrink-0"
            style={{ background: activeHue }}
          />

          <span>{levelFilterLabel}</span>

          <ChevronDown
            size={12}
            className={cx('text-ink-faint transition-transform duration-150', levelMenuOpen && 'rotate-180')}
          />
        </button>

        {/* Minimal Round Popover Menu */}
        {levelMenuOpen && (
          <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-line/80 bg-raised/98 p-2.5 shadow-elev-3 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
            {/* Around my level pill */}
            <button
              type="button"
              onClick={() => {
                onSelectLevelFilter('mine');
                setLevelMenuOpen(false);
              }}
              className={cx(
                'flex w-full items-center justify-between rounded-full px-3 py-1.5 text-left text-[12px] font-semibold transition-colors',
                levelFilter === 'mine'
                  ? 'bg-accent/15 text-accent-text font-bold'
                  : 'hover:bg-sunken text-ink',
              )}
            >
              <div className="flex items-center gap-1.5">
                <Star size={12} className="text-accent fill-accent" />
                <span><UiText source={'Around {0}'} values={[learnerLevel]} /></span>
              </div>
              {levelFilter === 'mine' && <Check size={13} className="text-accent stroke-[3]" />}
            </button>

            <div className="my-2 border-t border-line/60" />

            {/* Row of pure round level circles: just the level! (A1, A2, B1, B2, C1) */}
            <div className="grid grid-cols-5 gap-1.5 px-0.5 my-1">
              {LEVELS.map((lvl) => {
                const isSelected = levelFilter === lvl;
                const isLearner = lvl === learnerLevel;

                return (
                  <button
                    key={lvl}
                    type="button"
                    title={isLearner ? `${lvl} (Your Level)` : lvl}
                    onClick={() => {
                      onSelectLevelFilter(lvl);
                      setLevelMenuOpen(false);
                    }}
                    className={cx(
                      'relative flex size-8.5 items-center justify-center rounded-full text-[11.5px] font-bold text-white shadow-xs transition-all duration-150 hover:scale-110 active:scale-90',
                      isSelected && 'ring-2 ring-accent ring-offset-2 ring-offset-raised',
                    )}
                    style={{ background: LEVEL_HUE[lvl] }}
                  >
                    {lvl}
                    {isLearner && (
                      <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-amber-400 ring-1 ring-raised" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="my-2 border-t border-line/60" />

            {/* Option: All levels */}
            <button
              type="button"
              onClick={() => {
                onSelectLevelFilter('any');
                setLevelMenuOpen(false);
              }}
              className={cx(
                'flex w-full items-center justify-between rounded-full px-3 py-1.5 text-left text-[12px] font-semibold transition-colors',
                levelFilter === 'any'
                  ? 'bg-accent/15 text-accent-text font-bold'
                  : 'hover:bg-sunken text-ink-soft hover:text-ink',
              )}
            >
              <span><UiText source={'All levels'} /></span>
              {levelFilter === 'any' && <Check size={13} className="text-accent stroke-[3]" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
