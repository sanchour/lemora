import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ChartNoAxesColumn, ChevronRight, PanelLeftClose, PanelLeftOpen, Search, Shapes, SlidersHorizontal } from 'lucide-react';
import { PRIMARY_SECTIONS, SHORTCUT_SECTIONS, sectionKey, TOOL_SECTIONS } from '@/app/sections';
import type { Section } from '@/app/sections';
import { IconButton, Tooltip } from '@/design/primitives';
import { spring } from '@/design/motion';
import { cx } from '@/lib/cx';
import { useUI } from '@/state/ui';
import { LanguageChip } from '../LanguageChip';
import { Monogram, Wordmark } from '../Wordmark';

export const SIDEBAR_WIDTH = { expanded: 216, collapsed: 64 } as const;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const translateUi = useUi();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inTool = TOOL_SECTIONS.some((s) => pathname === s.path || pathname.startsWith(`${s.path}/`));
  const [toolsOpen, setToolsOpen] = useState(false);
  const [flyoutTop, setFlyoutTop] = useState(180);
  const toolsBtnRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToolsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!toolsOpen) return;
    if (toolsBtnRef.current) {
      const rect = toolsBtnRef.current.getBoundingClientRect();
      setFlyoutTop(Math.max(16, Math.min(window.innerHeight - 310, rect.top - 8)));
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        toolsBtnRef.current?.contains(target) ||
        flyoutRef.current?.contains(target)
      ) {
        return;
      }
      setToolsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setToolsOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [toolsOpen]);

  return (
    // Only the (contained, fixed) sidebar reflows while it resizes; the page content moves with a transform.
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded }}
      transition={spring.soft}
      className="no-callout fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r border-line bg-surface px-3 pt-4 pb-3 [contain:layout_paint]"
    >
      <div className={cx('flex items-center', collapsed ? 'flex-col gap-3' : 'gap-2 pr-0.5 pl-1')}>
        {!collapsed ? (
          <div className="flex-1 overflow-hidden">
            <Wordmark size="sm" />
          </div>
        ) : (
          <div className="flex size-7 items-center justify-center">
            <Monogram size="md" />
          </div>
        )}
        <IconButton
          icon={collapsed ? PanelLeftOpen : PanelLeftClose}
          label={collapsed ? translateUi('Expand sidebar') : translateUi('Collapse sidebar')}
          shortcut="["
          size="sm"
          tooltipPlacement="right"
          onClick={onToggle}
          className={collapsed ? '' : 'ml-auto'}
        />
      </div>

      <div className="mt-3.5">
        <LanguageChip compact={collapsed} />
      </div>

      <nav aria-label={translateUi('Sections')} className="mt-3 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain [scrollbar-width:none]">
        {PRIMARY_SECTIONS.map((section) => (
          <SidebarLink key={section.id} section={section} collapsed={collapsed} index={sectionKey(SHORTCUT_SECTIONS.indexOf(section))} />
        ))}

        <div className="mt-1.5 pt-1.5 border-t border-line/60">
          <Tooltip label={toolsOpen ? translateUi('Hide tools') : translateUi('Show tools')} placement="right" disabled={!collapsed || toolsOpen}>
            <button
              ref={toolsBtnRef}
              type="button"
              aria-expanded={toolsOpen}
              aria-haspopup="menu"
              onClick={() => setToolsOpen((o) => !o)}
              className={cx(
                'group relative flex h-10 w-full shrink-0 cursor-pointer items-center gap-3 rounded-xl px-2.5 text-left transition-colors duration-150',
                inTool
                  ? 'text-ink'
                  : toolsOpen
                    ? 'bg-raised/85 text-ink'
                    : 'text-ink-soft hover:bg-raised/70 hover:text-ink',
              )}
            >
              {inTool && (
                <motion.span layoutId="sidebar-active" className="absolute inset-0 rounded-xl bg-raised shadow-elev-1" transition={spring.snappy} />
              )}
              <Shapes
                size={20}
                strokeWidth={inTool || toolsOpen ? 2.2 : 1.9}
                className={cx('relative shrink-0', (inTool || toolsOpen) && 'text-accent-text')}
                aria-hidden
              />
              <motion.span
                className="relative flex min-w-0 flex-1 items-center justify-between text-[15px] font-semibold whitespace-nowrap"
                animate={{ opacity: collapsed ? 0 : 1 }}
                transition={{ duration: 0.12 }}
              >
                <span><UiText source={'Tools'} /></span>
                <ChevronRight
                  size={15}
                  className={cx(
                    'text-ink-faint transition-transform duration-200 group-hover:text-ink',
                    toolsOpen && 'translate-x-0.5 text-accent-text',
                  )}
                  aria-hidden
                />
              </motion.span>
            </button>
          </Tooltip>
        </div>
      </nav>

      {/* Side Flyout Section for Tools */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {toolsOpen && (
              <motion.div
                ref={flyoutRef}
                role="menu"
                aria-label={translateUi('Tools')}
                initial={{ opacity: 0, x: -8, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -6, scale: 0.96 }}
                transition={spring.snappy}
                style={{
                  top: flyoutTop,
                  left: (collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded) + 10,
                }}
                className="no-callout fixed z-40 w-48 rounded-2xl border border-line-strong/80 bg-surface/98 p-2 shadow-elev-3 backdrop-blur-md"
              >
                <p className="px-2.5 pt-1 pb-1.5 font-sans text-[10.5px] font-bold tracking-[0.14em] text-ink-faint uppercase">
                  <UiText source={'Tools'} />
                </p>
                <div className="flex flex-col gap-0.5">
                  {TOOL_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isActive =
                      (pathname === section.path || pathname.startsWith(`${section.path}/`)) &&
                      !(section.id === 'thesaurus' && pathname.startsWith('/thesaurus/games'));
                    return (
                      <NavLink
                        key={section.id}
                        to={section.path}
                        onClick={() => setToolsOpen(false)}
                        className={cx(
                          'flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[14px] font-semibold transition-colors duration-150',
                          isActive
                            ? 'bg-raised text-ink shadow-2xs'
                            : 'text-ink-soft hover:bg-raised/70 hover:text-ink',
                        )}
                      >
                        <Icon
                          size={17}
                          strokeWidth={isActive ? 2.2 : 1.9}
                          className={cx(
                            'shrink-0',
                            isActive && (section.tint ? 'text-[var(--cantus-text)]' : 'text-accent-text'),
                          )}
                          aria-hidden
                        />
                        <span className="truncate">
                          <UiText source={section.name} />
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      <div className={cx('mt-auto flex shrink-0 items-center border-t border-line/60 pt-2 text-ink-faint', collapsed ? 'flex-col gap-2' : 'justify-around')}>
        <IconButton
          icon={SlidersHorizontal}
          label={translateUi('Settings')}
          size="sm"
          tooltipPlacement={collapsed ? 'right' : 'top'}
          onClick={() => navigate('/settings')}
        />
        <IconButton
          icon={ChartNoAxesColumn}
          label={translateUi('Ratio')}
          size="sm"
          tooltipPlacement={collapsed ? 'right' : 'top'}
          onClick={() => navigate('/ratio')}
        />
        <IconButton
          icon={Search}
          label={translateUi('Search')}
          shortcut="⌘K"
          size="sm"
          tooltipPlacement={collapsed ? 'right' : 'top'}
          onClick={() => useUI.getState().setGlobalSearchOpen(true)}
        />
      </div>
    </motion.aside>
  );
}

function SidebarLink({ section, collapsed, index, compact = false }: { section: Section; collapsed: boolean; index: number; compact?: boolean }) {
  const translateUi = useUi();
  const Icon = section.icon;
  const { pathname } = useLocation();
  // Ludus lives under Thesaurus' address, so Thesaurus is not also lit while the games are open.
  const lit = (isActive: boolean) => isActive && !(section.id === 'thesaurus' && pathname.startsWith('/thesaurus/games'));
  return (
    <Tooltip label={translateUi(section.name)} shortcut={index ? `Alt ${index}` : undefined} placement="right" disabled={!collapsed}>
      <NavLink
        to={section.path}
        end={section.path === '/'}
        className={({ isActive }) =>
          cx(
            'group relative flex shrink-0 items-center gap-3 rounded-xl px-2.5 transition-colors duration-150',
            compact ? 'h-9' : 'h-10',
            lit(isActive) ? 'text-ink' : 'text-ink-soft hover:bg-raised/70 hover:text-ink',
          )
        }
      >
        {({ isActive: linked }) => {
          const isActive = lit(linked);
          return (
          <>
            {isActive && (
              <motion.span layoutId="sidebar-active" className="absolute inset-0 rounded-xl bg-raised shadow-elev-1" transition={spring.snappy} />
            )}
            <Icon
              size={compact ? 18 : 20}
              strokeWidth={isActive ? 2.2 : 1.9}
              className={cx('relative shrink-0', isActive && (section.tint ? 'text-[var(--cantus-text)]' : 'text-accent-text'))}
              aria-hidden
            />
            <motion.span
              className={cx('relative min-w-0 flex-1 font-semibold whitespace-nowrap', compact ? 'text-[14px]' : 'text-[15px]')}
              animate={{ opacity: collapsed ? 0 : 1 }}
              transition={{ duration: 0.12 }}
            >
              <UiText source={section.name} />
            </motion.span>
          </>
          );
        }}
      </NavLink>
    </Tooltip>
  );
}
