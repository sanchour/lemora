import { afterEach, describe, expect, it, vi } from 'vitest';
import { localDateKey } from '@/lib/format';
import { recordSession, sessionsEndedOn } from './activity';
import { createDb } from './db';
import type { LinguaDB } from './db';
import { updateLanguage } from './languages';
import { setToolGoal, toolGoal } from './toolGoals';

const open: LinguaDB[] = [];
afterEach(async () => {
  vi.useRealTimers();
  await Promise.all(open.splice(0).map((db) => db.delete()));
});

async function withLanguage() {
  const db = createDb(`goals-${Math.random().toString(36).slice(2)}`);
  open.push(db);
  const now = Date.now();
  await db.languages.put({ id: 'ru', native: 'en', level: 'A2', isActive: 1, dailyGoal: { reviews: 50, readMinutes: 15, listenMinutes: 10 }, seededKnownTopN: 0, createdAt: now, updatedAt: now });
  return db;
}

describe('each tool’s own goal', () => {
  it('sets, turns off and keeps every other goal', async () => {
    const db = await withLanguage();
    await setToolGoal('ru', 'thesaurus', 10, db);
    await setToolGoal('ru', 'alphabet', 5, db);
    await setToolGoal('ru', 'codex', 20, db);
    await setToolGoal('ru', 'alphabet', 0, db);
    // The day's goal edited elsewhere (Settings, Home) spreads the old value, so the tools' goals survive it.
    const before = (await db.languages.get('ru'))!;
    await updateLanguage('ru', { dailyGoal: { ...before.dailyGoal, readMinutes: 30 } }, db);
    const ru = (await db.languages.get('ru'))!;
    expect(toolGoal(ru, 'thesaurus')).toBe(10);
    expect(toolGoal(ru, 'alphabet')).toBe(0);
    expect(toolGoal(ru, 'codex')).toBe(20);
    expect(toolGoal(ru, 'ludus')).toBe(0);
    expect(ru.dailyGoal.readMinutes).toBe(30);
  });

  it('counts a review session toward the day’s goal, as Home shows it', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 3, 12, 0));
    const db = await withLanguage();
    const now = Date.now();
    await recordSession({ lang: 'ru', type: 'review', startedAt: now - 40 * 60_000, endedAt: now - 31 * 60_000, activeMs: 8 * 60_000 }, db);
    expect((await db.dailyStats.get(`ru:${localDateKey(now)}`))?.goalMet).toBe(0);
    // Two sittings of eight minutes, against 15 a day, with no card counted: met, by time.
    await recordSession({ lang: 'ru', type: 'review', startedAt: now - 10 * 60_000, endedAt: now - 60_000, activeMs: 8 * 60_000 }, db);
    expect((await db.dailyStats.get(`ru:${localDateKey(now)}`))?.goalMet).toBe(1);
  });

  it('dates a session by when it ended', async () => {
    const db = await withLanguage();
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    await recordSession({ lang: 'ru', type: 'write', startedAt: midnight.getTime() - 10 * 60_000, endedAt: midnight.getTime() + 8 * 60_000, activeMs: 15 * 60_000 }, db);
    expect(await sessionsEndedOn('ru', localDateKey(midnight.getTime()), db)).toHaveLength(1);
    expect(await sessionsEndedOn('ru', localDateKey(midnight.getTime() - 60_000), db)).toHaveLength(0);
  });
});
