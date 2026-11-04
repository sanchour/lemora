import { afterEach, describe, expect, it } from 'vitest';
import { createDb } from './db';
import type { LinguaDB } from './db';
import { starterItems } from './starter';
import { applyKnownSeed } from './words';

const open: LinguaDB[] = [];
afterEach(async () => {
  await Promise.all(open.splice(0).map((d) => d.delete()));
});

async function setup(topN: number) {
  const db = createDb(`seed-${Math.random().toString(36).slice(2)}`);
  open.push(db);
  const now = Date.now();
  await db.languages.put({ id: 'es', native: 'en', level: 'A2', isActive: 1, dailyGoal: { reviews: 50, readMinutes: 15, listenMinutes: 10 }, seededKnownTopN: topN, createdAt: now, updatedAt: now });
  return db;
}

describe('known words at the start (Lemora 3.5)', () => {
  it('come from the same list as the frequency decks, so those show them known', async () => {
    const db = await setup(3);
    // Forms by frequency ("es" is a form of "ser"); lemmas by frequency, as the starter decks use them.
    await db.frequency.bulkPut([{ id: 'es:es', lang: 'es', norm: 'es', rank: 1 }, { id: 'es:la', lang: 'es', norm: 'la', rank: 2 }, { id: 'es:que', lang: 'es', norm: 'que', rank: 3 }] as never);
    await db.starterLists.put({ lang: 'es', version: 1, lemmaFreq: ['ser', 'el', 'que', 'de', 'estar'], themes: {} });
    await applyKnownSeed('es', db);
    const top = await starterItems('es', { kind: 'frequency', milestone: 100 }, db);
    expect(top.slice(0, 3).map((i) => i.known)).toEqual([true, true, true]);
    expect(top[3].known).toBe(false);
    // The reader's most frequent forms are known too.
    expect((await db.words.get('es:es'))?.state).toBe(1);
    expect((await db.languages.get('es'))?.seedAppliedAt).toBeTruthy();
  });

  it('waits for the language pack’s list instead of seeding from half the data', async () => {
    const db = await setup(3);
    await db.frequency.bulkPut([{ id: 'es:es', lang: 'es', norm: 'es', rank: 1 }] as never);
    expect(await applyKnownSeed('es', db)).toBe(0);
    expect((await db.languages.get('es'))?.seedAppliedAt).toBeUndefined();
  });
});
