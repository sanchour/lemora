// The button at the top right of Home: five other looks for Home to choose from (and the usual one to come back to).
import { useEffect, useRef, useState } from 'react';
import { LayoutTemplate, Check } from 'lucide-react';
import { patchSetting } from '@/data/settings';
import { useApp } from '@/app/context';
import { UiText, useUi } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';

export type HomeStyle = 'editorial' | 'bento' | 'journey' | 'library' | 'focus' | 'stream' | 'notebook' | 'planner' | 'terminal' | 'poster' | 'analytics' | 'cockpit';

/** Each style's name, what it is, and a little wireframe of it (an svg of boxes on a 40×28 page). */
export const HOME_STYLES: Array<{ id: HomeStyle | 'usual'; name: string; about: string; wire: React.ReactNode }> = [
  { id: 'usual', name: 'Usual', about: 'Home as it is: three studies side by side.', wire: <><rect x={4} y={4} width={32} height={3} /><rect x={4} y={10} width={9} height={10} /><rect x={15} y={10} width={9} height={10} /><rect x={26} y={10} width={10} height={10} /><rect x={4} y={22} width={32} height={3} /></> },
  { id: 'editorial', name: 'Gazette', about: 'A newspaper front page: a lead story, briefs and ruled columns.', wire: <><rect x={4} y={3} width={32} height={2} /><rect x={4} y={7} width={20} height={11} /><rect x={26} y={7} width={10} height={11} /><rect x={4} y={20} width={9} height={6} /><rect x={15} y={20} width={9} height={6} /><rect x={26} y={20} width={10} height={6} /></> },
  { id: 'bento', name: 'Bento', about: 'A dashboard of tiles: a big book, a goal ring, a streak, small tools.', wire: <><rect x={4} y={4} width={16} height={14} rx={2} /><rect x={22} y={4} width={7} height={6} rx={2} /><rect x={31} y={4} width={5} height={6} rx={2} /><rect x={22} y={12} width={14} height={6} rx={2} /><rect x={4} y={20} width={32} height={6} rx={2} /></> },
  { id: 'journey', name: 'Journey', about: 'A game-like trail of today’s steps, with a chest at the end.', wire: <><circle cx={20} cy={5} r={3} /><circle cx={28} cy={11} r={3} /><circle cx={16} cy={17} r={3} /><circle cx={24} cy={23} r={3} /></> },
  { id: 'library', name: 'Reading room', about: 'A cosy shelf of your books, a stopwatch, cards and sticky notes.', wire: <><rect x={4} y={5} width={8} height={12} /><rect x={14} y={8} width={3} height={9} /><rect x={18} y={6} width={3} height={11} /><rect x={22} y={9} width={4} height={8} /><rect x={28} y={7} width={3} height={10} /><rect x={3} y={18} width={34} height={2} /><circle cx={10} cy={24} r={3} /><rect x={20} y={21} width={7} height={5} /><rect x={29} y={21} width={7} height={5} /></> },
  { id: 'stream', name: 'Stream', about: 'A streaming service: a big billboard, then rows of covers to pick from.', wire: <><rect x={4} y={4} width={32} height={10} /><rect x={4} y={16} width={7} height={5} /><rect x={13} y={16} width={7} height={5} /><rect x={22} y={16} width={7} height={5} /><rect x={31} y={16} width={5} height={5} /><rect x={4} y={23} width={5} height={4} /><rect x={11} y={23} width={5} height={4} /><rect x={18} y={23} width={5} height={4} /></> },
  { id: 'notebook', name: 'Notebook', about: 'A bullet journal: dotted paper, a checklist, a habit tracker, taped-in photos.', wire: <><circle cx={8} cy={7} r={3} /><rect x={13} y={5} width={14} height={2} /><rect x={5} y={13} width={3} height={3} /><rect x={10} y={13} width={14} height={2} /><rect x={5} y={19} width={3} height={3} /><rect x={10} y={19} width={12} height={2} /><rect x={27} y={11} width={9} height={13} /></> },
  { id: 'planner', name: 'Planner', about: 'A day planner: hours down the side, today’s steps as blocks, the week as small bars.', wire: <><rect x={4} y={5} width={5} height={1.5} /><rect x={4} y={12} width={5} height={1.5} /><rect x={4} y={19} width={5} height={1.5} /><rect x={11} y={6} width={16} height={5} rx={1} /><rect x={11} y={13} width={16} height={8} rx={1} /><rect x={30} y={5} width={6} height={3} /><rect x={30} y={10} width={6} height={3} /><rect x={30} y={15} width={6} height={3} /></> },
  { id: 'terminal', name: 'Terminal', about: 'A command line: monospace on a dark screen, bars made of blocks, tools as commands.', wire: <><rect x={4} y={4} width={32} height={20} rx={2} /><rect x={7} y={8} width={10} height={1.5} /><rect x={7} y={12} width={18} height={1.5} /><rect x={7} y={16} width={14} height={1.5} /></> },
  { id: 'poster', name: 'Poster', about: 'Bold and flat: thick outlines, hard shadows, huge type, the minutes as the headline.', wire: <><rect x={4} y={4} width={22} height={10} /><rect x={28} y={4} width={8} height={10} /><rect x={4} y={16} width={14} height={9} /><rect x={20} y={16} width={16} height={9} /></> },
  { id: 'analytics', name: 'Analytics', about: 'A product dashboard: KPI cards, a trend chart, a donut and a table of recent texts.', wire: <><rect x={4} y={4} width={7} height={5} rx={1} /><rect x={12} y={4} width={7} height={5} rx={1} /><rect x={20} y={4} width={7} height={5} rx={1} /><rect x={28} y={4} width={8} height={5} rx={1} /><polyline points="4,22 10,17 16,19 22,13 28,15" fill="none" /><circle cx={32} cy={18} r={4} fill="none" /></> },
  { id: 'cockpit', name: 'Cockpit', about: 'A dark monitoring screen: status pills, a gauge, a heat map, bars and a queue.', wire: <><rect x={3} y={3} width={34} height={22} rx={2} /><rect x={6} y={6} width={8} height={6} /><rect x={16} y={6} width={18} height={6} /><rect x={6} y={14} width={12} height={8} /><rect x={20} y={14} width={14} height={8} /></> },
  { id: 'focus', name: 'Focus', about: 'Almost nothing: one sentence, one button, a hairline of numbers.', wire: <><rect x={10} y={8} width={20} height={3} /><rect x={14} y={12} width={12} height={2} /><rect x={15} y={17} width={10} height={4} rx={2} /><rect x={12} y={24} width={16} height={1.5} /></> },
];

export function HomeStyleMenu() {
  const translateUi = useUi();
  const { settings } = useApp();
  const current = settings.ui.homeStyle ?? 'usual';
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    window.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);
  return (
    <div ref={box} className="absolute top-0 right-0 z-30">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} title={translateUi('Try another look for Home')} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong/60 bg-raised/80 px-3.5 text-[12.5px] font-bold text-ink-soft shadow-elev-1 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent-text active:scale-95">
        <LayoutTemplate size={15} aria-hidden /> <UiText source={'Home style'} />
      </button>
      {open && (
        <div role="menu" className="absolute top-11 right-0 w-[330px] rounded-3xl border border-line-strong/70 bg-raised p-2 shadow-elev-3">
          <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase"><UiText source={'Choose a look for Home'} /></p>
          {HOME_STYLES.map((s) => {
            const active = current === s.id;
            return (
              <button key={s.id} type="button" role="menuitemradio" aria-checked={active} onClick={() => { void patchSetting('ui', { homeStyle: s.id === 'usual' ? undefined : s.id }); setOpen(false); }} className={cx('flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors hover:bg-sunken', active && 'bg-accent-soft')}>
                <svg viewBox="0 0 40 28" className="h-11 w-16 shrink-0 rounded-lg border border-line bg-bg fill-ink-faint/40 stroke-ink-faint/70 [&_*]:stroke-[0.6]" aria-hidden>{s.wire}</svg>
                <span className="min-w-0 flex-1"><span className="block font-serif text-[15.5px] font-bold text-ink"><UiText source={s.name} /></span><span className="block text-[12px] leading-snug text-ink-soft"><UiText source={s.about} /></span></span>
                {active && <Check size={16} className="shrink-0 text-accent-text" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
