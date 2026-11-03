import { localDateKey } from '@/lib/format';
import { db } from './db';
import { checkMilestones } from './journey';
import type { LinguaDB } from './db';
import type { ActivitySession, DailyStat } from './types';
import { toolTime } from '@/core/goals/tools';

type Counter = 'readMs' | 'wordsRead' | 'listenMs' | 'watchMs' | 'writeMs' | 'wordsWritten' | 'songMs' | 'reviews' | 'againCount' | 'newCards' | 'newKnown' | 'newLearning';

const emptyDay = (lang: string, date: string): DailyStat => ({
  id: `${lang}:${date}`,
  lang,
  date,
  readMs: 0,
  wordsRead: 0,
  listenMs: 0,
  watchMs: 0,
  reviews: 0,
  againCount: 0,
  newCards: 0,
  knownTotal: 0,
  learningTotal: 0,
  newKnown: 0,
  newLearning: 0,
  goalMet: 0,
  updatedAt: 0,
});

/** Adds to today's counters for a language and re-evaluates the daily goal (keeps the streak). */
export async function bumpDaily(lang: string, delta: Partial<Record<Counter, number>>, database: LinguaDB = db): Promise<void> {
  const date = localDateKey();
  await database.transaction('rw', database.dailyStats, database.languages, database.sessions, async () => {
    const day = (await database.dailyStats.get(`${lang}:${date}`)) ?? emptyDay(lang, date);
    for (const [key, value] of Object.entries(delta) as Array<[Counter, number]>) day[key] = (day[key] ?? 0) + value;
    const goal = (await database.languages.get(lang))?.dailyGoal ?? { reviews: 50, readMinutes: 15, listenMinutes: 10 };
    // The day's goal counts every tool's time, as Home shows it (core/goals/tools: reviews, Ludus and letters too).
    const studyMinutes = toolTime(await sessionsEndedOn(lang, date, database)).total / 60_000;
    day.goalMet = studyMinutes >= goal.readMinutes || day.reviews >= goal.reviews ? 1 : 0;
    day.updatedAt = Date.now();
    await database.dailyStats.put(day);
  });
}

/** Stores today's Known / Learning totals so vocabulary growth can be charted later. */
export async function snapshotVocabulary(lang: string, database: LinguaDB = db): Promise<void> {
  const date = localDateKey();
  const [known, learning] = await Promise.all([
    database.words.where('[lang+state]').equals([lang, 1]).count(),
    database.words.where('[lang+state]').equals([lang, 2]).count(),
  ]);
  await database.transaction('rw', database.dailyStats, async () => {
    const day = (await database.dailyStats.get(`${lang}:${date}`)) ?? emptyDay(lang, date);
    await database.dailyStats.put({ ...day, knownTotal: known, learningTotal: learning, updatedAt: Date.now() });
  });
}

/** A local day's bounds, from its YYYY-MM-DD key (midnight to midnight, whatever the clock change). */
export function dayBounds(date: string): [number, number] {
  const [y, m, d] = date.split('-').map(Number);
  return [new Date(y, m - 1, d).getTime(), new Date(y, m - 1, d + 1).getTime()];
}

/** The sessions that ended on a local day: the day dailyStats gives them, so a sitting across midnight counts once. */
export async function sessionsEndedOn(lang: string, date: string, database: LinguaDB = db): Promise<ActivitySession[]> {
  const [from, to] = dayBounds(date);
  // A session starts at most a sitting before it ends; two days back is plenty.
  const rows = await database.sessions.where('[lang+startedAt]').between([lang, from - 2 * 86_400_000], [lang, to], true, false).toArray();
  return rows.filter((s) => s.endedAt >= from && s.endedAt < to);
}

export async function recordSession(session: Omit<ActivitySession, 'id'>, database: LinguaDB = db): Promise<void> {
  if (session.activeMs < 5_000) return; // ignore accidental opens
  await database.sessions.add({ ...session, id: crypto.randomUUID() });
  if (session.type === 'read') await bumpDaily(session.lang, { readMs: session.activeMs, wordsRead: session.wordsRead ?? 0 }, database);
  else if (session.type === 'listen') await bumpDaily(session.lang, { listenMs: session.activeMs }, database);
  else if (session.type === 'sing') await bumpDaily(session.lang, { listenMs: session.activeMs, songMs: session.activeMs }, database);
  else if (session.type === 'watch') await bumpDaily(session.lang, { watchMs: session.activeMs }, database);
  else if (session.type === 'write') await bumpDaily(session.lang, { writeMs: session.activeMs }, database);
  // Review, Ludus and letters have no counter of their own, but their time can meet the day's goal.
  else await bumpDaily(session.lang, {}, database);
  await snapshotVocabulary(session.lang, database);
  void checkMilestones(session.lang, database).catch(() => {});
}
