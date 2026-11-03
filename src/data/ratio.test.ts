import { afterEach, describe, expect, it, vi } from 'vitest';
import { localDateKey } from '@/lib/format';
import { bumpDaily, recordSession } from './activity';
import { createDb } from './db';
import type { LinguaDB } from './db';
import { completeOnboarding } from './languages';
import { languageSummaries, loadOverview, streaks, weekKey } from './ratio';
import { setWordState } from './words';

const DAY = 86_400_000;
const open: LinguaDB[] = [];
function freshDb(): LinguaDB {
  const db = createDb(`ratio-${Math.random().toString(36).slice(2)}`);
  open.push(db);
  return db;
}
afterEach(async () => {
  vi.useRealTimers();
  await Promise.all(open.splice(0).map((db) => db.delete()));
});

describe('streaks', () => {
  it('counts the run ending today or yesterday, and the longest run', () => {
    const now = new Date('2026-10-17T15:00:00').getTime();
    const day = (n: number) => localDateKey(now - n * DAY);
    expect(streaks(new Set([day(0), day(1), day(2), day(5), day(6), day(7), day(8)]), now)).toEqual({ current: 3, longest: 4 });
    expect(streaks(new Set([day(1), day(2)]), now)).toEqual({ current: 2, longest: 2 });
    expect(streaks(new Set([day(3)]), now)).toEqual({ current: 0, longest: 1 });
  });

  it('weeks start on Monday', () => {
    expect(weekKey(new Date('2026-10-17T12:00:00').getTime())).toBe('2026-10-12');
    expect(weekKey(new Date('2026-10-12T08:00:00').getTime())).toBe('2026-10-12');
  });
});

describe('loadOverview', () => {
  it('counts this calendar month alone for the monthly report', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 18, 12, 0));
    const db = freshDb();
    await completeOnboarding({ target: 'es', native: 'en', level: 'A2', theme: 'paper', seedKnown: false }, db);
    await setWordState('es', 'perro', 1, {}, db);
    await setWordState('es', 'gato', 2, { surface: 'gato', gloss: 'cat' }, db);
    const now = Date.now();
    await recordSession({ lang: 'es', type: 'read', startedAt: now - 30 * 60_000, endedAt: now - 10 * 60_000, activeMs: 20 * 60_000, wordsRead: 600 }, db);
    // Logged last month: in the year's totals, not in this month's.
    await db.studyLogs.add({ id: 'old', lang: 'es', at: now - 40 * DAY, minutes: 45, activity: 'class', createdAt: now, updatedAt: now });
    await db.texts.bulkAdd([
      { id: 't1', lang: 'es', title: 'Hoy', kind: 'text', content: '', createdAt: now, updatedAt: now, finishedAt: now - DAY } as never,
      { id: 't2', lang: 'es', title: 'Antes', kind: 'text', content: '', createdAt: now, updatedAt: now, finishedAt: now - 60 * DAY } as never,
    ]);
    const o = await loadOverview(['es'], db);
    expect(o.month.newWords).toBe(2);
    expect(o.month.minutes).toBeCloseTo(20);
    expect(o.month.finished).toBe(1);
    expect(o.habit.totals.logged).toBe(45);
    expect(o.reading.finishedThisYear).toBe(2);
  });

  it('adds up reading, words, sessions and logged study', async () => {
    const db = freshDb();
    await completeOnboarding({ target: 'es', native: 'en', level: 'A2', theme: 'paper', seedKnown: false }, db);
    await setWordState('es', 'perro', 1, {}, db);
    await setWordState('es', 'gato', 2, { surface: 'gato', gloss: 'cat' }, db);
    const start = Date.now() - 20 * 60_000;
    await recordSession({ lang: 'es', type: 'read', startedAt: start, endedAt: Date.now(), activeMs: 20 * 60_000, wordsRead: 2400 }, db);
    await recordSession({ lang: 'es', type: 'write', startedAt: start, endedAt: Date.now(), activeMs: 10 * 60_000 }, db);
    await bumpDaily('es', { reviews: 12 }, db);
    await db.studyLogs.add({ id: 'l1', lang: 'es', at: Date.now(), minutes: 45, activity: 'class', createdAt: Date.now(), updatedAt: Date.now() });

    const o = await loadOverview(['es'], db);
    expect(o.vocabulary.known).toBe(1);
    expect(o.vocabulary.learning).toBe(1);
    expect(o.vocabulary.knownSeries.at(-1)?.y).toBe(1);
    expect(o.reading.words).toBe(2400);
    expect(o.reading.wpm).toBe(120);
    expect(o.habit.totals.read).toBeCloseTo(20);
    expect(o.habit.totals.write).toBeCloseTo(10);
    expect(o.habit.totals.logged).toBe(45);
    expect(o.habit.current).toBe(1); // 20 reading minutes meet the 15-minute goal
    expect(o.flashcards.reviewsPerDay.at(-1)?.reviews).toBe(12);
    expect(o.flashcards.maturity.new).toBe(1);

    const [summary] = await languageSummaries(['es'], db);
    expect(summary.hours).toBeCloseTo((20 + 10 + 45) / 60);
    expect(summary.known).toBe(1);
  });
});
