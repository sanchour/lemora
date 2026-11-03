import { UiText, useUi } from '@/design/i18n/UiText';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ChartNoAxesColumn, PanelLeftClose, PanelLeftOpen, Search, SlidersHorizontal } from 'lucide-react';
import { useApp } from '@/app/context';
import { PRIMARY_SECTIONS, SHORTCUT_SECTIONS, sectionKey, shownFor, TOOL_SECTIONS } from '@/app/sections';
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
  const navigate = useNavigate();
  const { language } = useApp();
  const primary = PRIMARY_SECTIONS.filter(shownFor(language.id));
  const tools = TOOL_SECTIONS.filter(shownFor(language.id));
  const shortcuts = SHORTCUT_SECTIONS.filter(shownFor(language.id));

  return (
    // Fixed to the window: it never scrolls with the page. Only the (contained) sidebar reflows while it resizes.
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
        {primary.map((section) => (
          <SidebarLink key={section.id} section={section} collapsed={collapsed} index={sectionKey(shortcuts.indexOf(section))} />
        ))}
        {/* The tools are Lemora's heart, so they are always in view, never folded away. */}
        <div className="mt-2 border-t border-line/60 pt-2.5">
          <motion.p className="px-2.5 pb-1 text-[11px] font-bold tracking-[0.14em] whitespace-nowrap text-ink-faint uppercase" animate={{ opacity: collapsed ? 0 : 1 }} transition={{ duration: 0.12 }} aria-hidden={collapsed}>
            <UiText source={'Tools'} />
          </motion.p>
          <div className="flex flex-col gap-0.5">
            {tools.map((section) => (
              <SidebarLink key={section.id} section={section} collapsed={collapsed} index={sectionKey(shortcuts.indexOf(section))} />
            ))}
          </div>
        </div>
      </nav>

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
