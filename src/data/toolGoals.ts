// Each tool's own daily goal and its time (Lemora 3.8). The time comes from the recorded sessions
// through core/goals/tools, the same function behind Home's overall meter and the day's goal.
import { useLiveQuery } from 'dexie-react-hooks';
import { toolTime } from '@/core/goals/tools';
import type { ToolId, ToolTime } from '@/core/goals/tools';
import { localDateKey } from '@/lib/format';
import { dayBounds } from './activity';
import { db } from './db';
import type { LinguaDB } from './db';
import type { LanguageProfile } from './types';

/** A tool's goal in minutes, 0 for none. Codex's is the reading goal it always had (15 unless changed). */
export function toolGoal(language: Pick<LanguageProfile, 'dailyGoal'>, tool: ToolId): number {
  return tool === 'codex' ? (language.dailyGoal.codexMinutes ?? 15) : (language.dailyGoal.tools?.[tool] ?? 0);
}

/** Sets (or, with 0, turns off) a tool's goal, keeping every other goal as it was. */
export async function setToolGoal(lang: string, tool: ToolId, minutes: number, database: LinguaDB = db): Promise<void> {
  await database.transaction('rw', database.languages, async () => {
    const language = await database.languages.get(lang);
    if (!language) return;
    const minutesOrOff = Math.max(0, Math.round(minutes));
    const dailyGoal = tool === 'codex' ? { ...language.dailyGoal, codexMinutes: minutesOrOff } : { ...language.dailyGoal, tools: { ...language.dailyGoal.tools, [tool]: minutesOrOff } };
    await database.languages.update(lang, { dailyGoal, updatedAt: Date.now() });
  });
}

export interface ToolDay extends ToolTime {
  date: string;
}

/** The last `days` local days, oldest first, each with its time per tool; today is the last. Live. */
export function useToolDays(lang: string, days = 7): ToolDay[] | undefined {
  return useLiveQuery(async () => {
    const dates = Array.from({ length: days }, (_, i) => localDateKey(Date.now() - (days - 1 - i) * 86_400_000));
    const [from] = dayBounds(dates[0]);
    const rows = await db.sessions.where('[lang+startedAt]').between([lang, from - 2 * 86_400_000], [lang, Infinity]).toArray();
    return dates.map((date) => {
      const [start, end] = dayBounds(date);
      return { date, ...toolTime(rows.filter((s) => s.endedAt >= start && s.endedAt < end)) };
    });
  }, [lang, days]);
}
