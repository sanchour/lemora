import { afterAll, beforeEach, expect, it } from 'vitest';
import { createDb } from './db';
import { captureRemoval } from './removalUndo';
const database = createDb('removal-undo-' + Math.random());
afterAll(() => database.delete());
beforeEach(async () => { await database.settings.clear(); await database.blobs.clear(); });
it('restores deleted binary files and nested updates atomically, including compound keys', async () => {
  await database.settings.put({ key: 'saved', value: { title: 'Keep me' }, updatedAt: 1 });
  await database.blobs.put({ id: 'attachment', kind: 'audio', blob: new Blob(['sound']), size: 5, mime: 'audio/wav', createdAt: 1 });
  await database.fullDict.put({ lang: 'es', key: 'hola', fold: 'hola', word: 'hola', entries: [] });
  const change = await captureRemoval(database, ['settings', 'blobs', 'fullDict'], async () => {
    await database.transaction('rw', database.settings, () => database.settings.update('saved', { value: null, updatedAt: 2 }));
    await database.blobs.clear(); await database.fullDict.where('lang').equals('es').delete(); return 7;
  });
  expect(change.value).toBe(7); expect(change.count).toBe(3);
  await change.undo(); await change.undo();
  expect((await database.settings.get('saved'))?.value).toEqual({ title: 'Keep me' });
  expect(await (await database.blobs.get('attachment'))?.blob.text()).toBe('sound');
  expect((await database.fullDict.get(['es', 'hola']))?.word).toBe('hola');
});
it('refuses the entire undo if any removed key has newer data', async () => {
  await database.settings.bulkPut([{ key: 'a', value: 'original', updatedAt: 1 }, { key: 'b', value: 'keep', updatedAt: 1 }]);
  const change = await captureRemoval(database, ['settings'], () => database.settings.clear());
  await database.settings.put({ key: 'a', value: 'newer', updatedAt: 3 });
  await expect(change.undo()).rejects.toThrow('changed again');
  expect(await database.settings.get('b')).toBeUndefined();
  expect((await database.settings.get('a'))?.value).toBe('newer');
});
it('rolls back a failed cascade and removes its temporary hooks', async () => {
  await database.settings.put({ key: 'saved', value: 'original', updatedAt: 1 });
  await expect(captureRemoval(database, ['settings'], async () => { await database.settings.clear(); throw new Error('disk failed'); })).rejects.toThrow('disk failed');
  expect((await database.settings.get('saved'))?.value).toBe('original');
  const next = await captureRemoval(database, ['settings'], () => database.settings.clear());
  expect(next.count).toBe(1); await next.undo();
});
