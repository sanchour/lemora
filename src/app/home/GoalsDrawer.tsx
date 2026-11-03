import { useApp } from '@/app/context';
import type { Section } from '@/app/sections';
import type { ToolId } from '@/core/goals/tools';
import { updateLanguage } from '@/data/languages';
import { setToolGoal, toolGoal } from '@/data/toolGoals';
import { useUi } from '@/design/i18n/UiText';
import { Drawer, Select } from '@/design/primitives';

const DAY = [10, 15, 20, 30, 45, 60, 90, 120];
const TOOL = [0, 5, 10, 15, 20, 30, 45, 60];

/** The day's goal and each tool's own (Lemora 3.8): any tool can have one, or none. Changes apply at once. */
export function GoalsDrawer({ open, onClose, tools }: { open: boolean; onClose: () => void; tools: Section[] }) {
  const translateUi = useUi();
  const { language } = useApp();
  const minutesLabel = (m: number) => (m ? translateUi('{0} min', [m]) : translateUi('Off'));
  const options = (list: number[], current: number) => [...new Set([...list, current])].sort((a, b) => a - b).map((m) => ({ value: String(m), label: minutesLabel(m) }));
  return (
    <Drawer open={open} onClose={onClose} title={translateUi('Daily goals')} description={translateUi('Every tool counts toward the day.')}>
      <div className="space-y-5">
        <Select
          label={translateUi('Daily goal')}
          value={String(language.dailyGoal.readMinutes)}
          onChange={(v) => void updateLanguage(language.id, { dailyGoal: { ...language.dailyGoal, readMinutes: Number(v) } })}
          options={options(DAY, language.dailyGoal.readMinutes)}
        />
        <div className="space-y-4 border-t border-line/70 pt-5">
          {tools.map((t) => {
            const goal = toolGoal(language, t.id as ToolId);
            return <Select key={t.id} label={translateUi(t.name)} value={String(goal)} onChange={(v) => void setToolGoal(language.id, t.id as ToolId, Number(v))} options={options(TOOL, goal)} />;
          })}
        </div>
      </div>
    </Drawer>
  );
}
