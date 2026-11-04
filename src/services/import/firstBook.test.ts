import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { db } from '@/data/db';
import { importFirstBook } from './importers';

describe('the first book', () => {
  it('is shelved once, however often it is opened', async () => {
    const [a, b] = await Promise.all([importFirstBook('es'), importFirstBook('es')]);
    const c = await importFirstBook('es');
    expect(a).toBe(b);
    expect(c).toBe(a);
    expect(await db.texts.where('lang').equals('es').filter((t) => t.title === 'El gato y la luna').count()).toBe(1);
  });
});
