import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { dexieVersionOfStep, LATER_STEPS_RESERVED, STEP_29_SCHEMA, type GraphLayoutRow, type GraphViewRow } from '@/core/contracts/db';
import { BACKUP_POLICIES, exportBackup, readBackup, restoreBackup } from './backup';
import * as schemas from './db';
import { createDb, type LinguaDB } from './db';
import { completeOnboarding } from './languages';
import { removeLanguage } from './removeLanguage';
import { resetLanguageProgress } from './reset';

// 6-29 G3: the word graph's two tables, Dexie 46 (docs/WORD-GRAPH-PLAN.md section 10.6).
const open: LinguaDB[] = [];
const names: string[] = [];
const fresh = (name = `graph-${Math.random().toString(36).slice(2)}`) => {
  const db = createDb(name);
  open.push(db);
  return db;
};
afterEach(async () => {
  await Promise.all(open.splice(0).map((db) => db.delete()));
  await Promise.all(names.splice(0).map((n) => Dexie.delete(n)));
});
const start = (db: LinguaDB, target: string) => completeOnboarding({ target, native: 'en', level: 'A1', theme: 'paper', seedKnown: false }, db);
const layout = (lang: string): GraphLayoutRow => ({ lang, lens: 'atlas', stamp: 's1', builtAt: 1, nodes: [{ id: 'w:mar', kind: 'word', label: 'mar' }], x: new Float32Array([1]), y: new Float32Array([2]), threads: new Uint32Array(), families: new Uint8Array(), regions: [] });
const view = (lang: string, id = `${lang}:map`): GraphViewRow => ({ id, lang, name: 'My map', kind: 'map', pins: { mar: [10, 20] }, createdAt: 1, updatedAt: 1 });

describe('the word graph’s tables', () => {
  it('are what the contract says, at version 46', () => {
    expect(schemas.SCHEMA_V46).toEqual(STEP_29_SCHEMA.stores);
    expect(dexieVersionOfStep(29)).toBe(46);
    expect(LATER_STEPS_RESERVED['6-29']).toBe(46);
    for (const [table, policy] of Object.entries(STEP_29_SCHEMA.policy)) expect(BACKUP_POLICIES[table as keyof typeof BACKUP_POLICIES].policy).toBe(policy);
  });

  it('open a device that was at version 23, keeping its words', async () => {
    const name = `graph-old-${Math.random().toString(36).slice(2)}`;
    names.push(name);
    const stores = Object.assign({}, ...Object.entries(schemas).filter(([k]) => /^SCHEMA_V\d+$/.test(k) && Number(k.slice(8)) <= 23).map(([, v]) => v));
    const old = new Dexie(name);
    old.version(23).stores(stores);
    await old.table('words').put({ id: 'es:mar', lang: 'es', norm: 'mar', state: 1, stateChangedAt: 1, createdAt: 1, updatedAt: 1 });
    old.close();
    const db = fresh(name);
    await db.open();
    expect(db.verno).toBe(46);
    expect((await db.words.get('es:mar'))?.state).toBe(1);
    await db.graphLayouts.put(layout('es'));
    expect((await db.graphLayouts.get(['es', 'atlas']))?.x[0]).toBe(1);
  });

  it('are emptied for a language that is removed or reset, and kept for the others', async () => {
    const db = fresh();
    await start(db, 'es');
    await start(db, 'ru');
    await db.graphLayouts.bulkPut([layout('es'), layout('ru')]);
    await db.graphViews.bulkPut([view('es'), view('ru')]);
    await removeLanguage('ru', db);
    expect((await db.graphLayouts.toArray()).map((r) => r.lang)).toEqual(['es']);
    expect((await db.graphViews.toArray()).map((r) => r.lang)).toEqual(['es']);
    await resetLanguageProgress('es', db);
    expect(await db.graphLayouts.count()).toBe(0);
    expect(await db.graphViews.count()).toBe(0);
  });

  it('back up the learner’s views and pins, never the cached scene', async () => {
    const from = fresh();
    await start(from, 'es');
    await from.graphLayouts.put(layout('es'));
    await from.graphViews.put(view('es'));
    const parsed = await readBackup(await exportBackup({ includeMedia: false, includeApiKeys: false }, from));
    const to = fresh();
    await restoreBackup(parsed, 'merge', to, false);
    expect((await to.graphViews.get('es:map'))?.pins).toEqual({ mar: [10, 20] });
    expect(await to.graphLayouts.count()).toBe(0);
  });
});
