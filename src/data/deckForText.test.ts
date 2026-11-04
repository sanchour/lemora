import { afterEach, describe, expect, it } from 'vitest';
import { createDb } from './db';
import type { LinguaDB } from './db';
import { completeOnboarding } from './languages';
import { deckForText } from './deckTools';
import { setWordState } from './words';

const open: LinguaDB[] = [];
afterEach(async () => {
  await Promise.all(open.splice(0).map((d) => d.delete()));
});

describe('a book’s words as a deck (Lemora U8)', () => {
  it('takes the words not known yet, most used first, with meanings, and is made once', async () => {
    const db = createDb(`deckfirst-${Math.random().toString(36).slice(2)}`);
    open.push(db);
    await completeOnboarding({ target: 'es', native: 'en', level: 'A1', theme: 'paper', seedKnown: false }, db);
    await setWordState('es', 'gato', 1, {}, db);
    await db.textVocab.put({ textId: 't1', lang: 'es', norms: ['gato', 'luna', 'noche', 'mira'], counts: [5, 4, 2, 3], tokens: 14 });
    const meanings: Record<string, string> = { luna: 'moon', mira: 'looks' };
    const made = await deckForText('es', 't1', 'El gato y la luna', async (t) => meanings[t], 30, db);
    expect(made?.words).toBe(3);
    const notes = await db.notes.where('deckId').equals(made!.deckId).toArray();
    expect(notes.map((n) => n.term).sort()).toEqual(['luna', 'mira', 'noche']);
    expect(notes.find((n) => n.term === 'luna')?.meaning).toBe('moon');
    const again = await deckForText('es', 't1', 'El gato y la luna', async () => undefined, 30, db);
    expect(again?.deckId).toBe(made!.deckId);
  });
});
