// Everything the alternative Home styles show, gathered once: the same facts as the usual Home, in a shape each style can lay out its own way.
import { useMemo } from 'react';
import { useApp } from '@/app/context';
import { useAllProgress, useLibrary } from '@/data/library';
import { useDueSummary, useDueWords } from '@/data/study';
import { useToolDays } from '@/data/toolGoals';
import { useHomeCursus, useHomeDiscover, useHomeHeader, useHomeLeftOff, useHomeTools, useHomeWhatNext } from '../homeData';

export function useHomeFacts() {
  const { language } = useApp();
  const header = useHomeHeader();
  const leftOff = useHomeLeftOff();
  const whatNext = useHomeWhatNext();
  const discover = useHomeDiscover();
  const cursus = useHomeCursus();
  const tools = useHomeTools();
  const words = useDueWords(language.id, 8);
  const due = useDueSummary(language.id);
  const days = useToolDays(language.id, 7);
  const texts = useLibrary(language.id);
  const progress = useAllProgress();

  const goal = language.dailyGoal?.readMinutes ?? 15;
  const week = useMemo(() => (days ?? []).map((d) => ({ date: d.date, minutes: Math.round(d.total / 60_000) })), [days]);
  const minutesToday = week.at(-1)?.minutes ?? 0;
  // Days in a row with some study, ending today (or yesterday while today is still empty).
  const streak = useMemo(() => {
    let n = 0;
    for (let i = week.length - (minutesToday > 0 ? 1 : 2); i >= 0 && week[i].minutes > 0; i--) n++;
    return n;
  }, [week, minutesToday]);
  const recent = useMemo(
    () => (texts ?? []).filter((t) => t.kind !== 'shelfItem' && !t.deletedAt).sort((a, b) => (b.lastOpenedAt ?? b.createdAt) - (a.lastOpenedAt ?? a.createdAt)).slice(0, 14),
    [texts],
  );
  return { language, header, leftOff, whatNext, discover, cursus, tools, words: words ?? [], due, goal, week, minutesToday, streak, recent, progress };
}
export type HomeFacts = ReturnType<typeof useHomeFacts>;
