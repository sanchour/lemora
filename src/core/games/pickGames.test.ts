import { describe, expect, it } from 'vitest';
import { seededRandom } from '@/core/srs/ludus';
import { bingoStars, hasLine, makeBingo } from './bingo';
import { choiceStars, makeChoice } from './choice';
import { GAMES } from './defs';
import { close, done, flip, makeMemory, memoryStars } from './memory';
import * as parts from './parts';
import { canPlay } from './source';
import type { GameItem } from './source';

const item = (term: string, extra: Partial<GameItem> = {}): GameItem => ({ term, meaning: `m-${term}`, synonyms: [], antonyms: [], ...extra });
const WORDS = ['gato', 'perro', 'casa', 'libro', 'mesa', 'silla', 'cama', 'sol', 'luna', 'mar', 'rio', 'pan', 'vino', 'agua', 'leche', 'queso', 'fruta', 'carne', 'sopa', 'arroz', 'sal', 'miel', 'te', 'cafe', 'jugo'].map((t) => item(t));

describe('choice', () => {
  it('has the right answer and three different others, preferring the same kind of word', () => {
    const noun = (t: string) => item(t, { cats: [{ kind: 'pos', name: 'noun' }] });
    const verb = (t: string) => item(t, { cats: [{ kind: 'pos', name: 'verb' }] });
    const pool = [noun('a'), noun('b'), noun('c'), noun('d'), verb('e'), verb('f')];
    for (let seed = 1; seed < 20; seed++) {
      const c = makeChoice(pool[0], pool, 'definition', seededRandom(seed))!;
      expect(c.options).toHaveLength(4);
      expect(new Set(c.options).size).toBe(4);
      expect(c.options[c.answer]).toBe('m-a');
      expect(c.options.filter((o) => ['m-b', 'm-c', 'm-d'].includes(o))).toHaveLength(3);
      expect(makeChoice(pool[0], pool, 'picture', seededRandom(seed))!.options[makeChoice(pool[0], pool, 'picture', seededRandom(seed))!.answer]).toBe('a');
    }
    expect(makeChoice(pool[0], pool.slice(0, 3), 'definition', seededRandom(1))).toBeNull();
    expect([choiceStars(0, true), choiceStars(1, true), choiceStars(2, true), choiceStars(2, false)]).toEqual([3, 2, 1, 0]);
  });
});

describe('memory', () => {
  it('makes two cards a pair, mixed, from words with what the mode needs', () => {
    const s = makeMemory(WORDS, 8, seededRandom(1), 'meaning')!;
    expect(s.cards).toHaveLength(16);
    for (let p = 0; p < 8; p++) expect(s.cards.filter((c) => c.pair === p).map((c) => c.side).sort()).toEqual(['other', 'word']);
    expect(makeMemory(WORDS, 8, seededRandom(1), 'picture')).toBeNull();
    const sound = makeMemory(WORDS, 8, seededRandom(1), 'sound')!;
    expect(sound.cards.filter((c) => c.side === 'other').every((c) => c.face.sound)).toBe(true);
    expect(sound.cards.filter((c) => c.side === 'other').map((c) => c.face.sound).sort()).toEqual(sound.cards.filter((c) => c.side === 'word').map((c) => c.face.text).sort());
    expect(makeMemory(WORDS.slice(0, 3).map((w) => ({ ...w, image: 'blob:x' })), 8, seededRandom(1), 'picture')!.cards).toHaveLength(6);
  });
  it('keeps a match, counts a move for each second card, and holds a miss until closed', () => {
    let s = makeMemory(WORDS, 4, seededRandom(2), 'meaning')!;
    const [a, b] = s.cards.filter((c) => c.pair === 0);
    const other = s.cards.find((c) => c.pair === 1)!;
    s = flip(s, a.id);
    expect(flip(s, a.id)).toBe(s);
    s = flip(s, other.id);
    expect(s).toMatchObject({ moves: 1, open: [a.id, other.id], matched: [] });
    expect(flip(s, b.id)).toBe(s);
    s = close(s);
    s = flip(flip(s, a.id), b.id);
    expect(s).toMatchObject({ moves: 2, open: [], matched: [0] });
    expect(flip(s, a.id)).toBe(s);
    for (const p of [1, 2, 3]) for (const c of s.cards.filter((x) => x.pair === p)) s = flip(s, c.id);
    expect(done(s)).toBe(true);
    expect([memoryStars(8, 8), memoryStars(11, 8), memoryStars(16, 8), memoryStars(17, 8)]).toEqual([3, 3, 2, 1]);
  });
});

describe('bingo', () => {
  it('sizes the card by the words there are and calls every word on it once, with others', () => {
    expect(makeBingo(WORDS, seededRandom(1))!.size).toBe(5);
    expect(makeBingo(WORDS.slice(0, 16), seededRandom(1))!.size).toBe(4);
    expect(makeBingo(WORDS.slice(0, 10), seededRandom(1))!.size).toBe(3);
    expect(makeBingo(WORDS.slice(0, 8), seededRandom(1))).toBeNull();
    const b = makeBingo(WORDS.slice(0, 12), seededRandom(3))!;
    expect(b.calls.filter((c) => c.onCard).map((c) => c.item).sort((x, y) => x.term.localeCompare(y.term))).toEqual([...b.card].sort((x, y) => x.term.localeCompare(y.term)));
    expect(b.calls.some((c) => !c.onCard)).toBe(true);
  });
  it('finds a line across, down or on a diagonal', () => {
    expect(hasLine(new Set([0, 1, 2]), 3)).toBe(true);
    expect(hasLine(new Set([1, 4, 7]), 3)).toBe(true);
    expect(hasLine(new Set([2, 4, 6]), 3)).toBe(true);
    expect(hasLine(new Set([0, 4, 8]), 3)).toBe(true);
    expect(hasLine(new Set([0, 1, 3, 5, 7]), 3)).toBe(false);
    expect([bingoStars(0), bingoStars(1), bingoStars(3), bingoStars(4)]).toEqual([3, 3, 2, 1]);
  });
});

describe('parts', () => {
  it('takes parts only when they spell the word', () => {
    expect(parts.partsOf('deshacer', ['des-', 'hacer'], 'es')).toEqual(['des-', 'hacer']);
    expect(parts.partsOf('felizmente', ['feliz', '-mente'], 'es')).toEqual(['feliz', '-mente']);
    expect(parts.partsOf('gato', ['ga', 'tos'], 'es')).toBeNull();
    expect(parts.partsOf('gato', ['gato'], 'es')).toBeNull();
    expect(parts.partsOf('gato', undefined, 'es')).toBeNull();
  });
  it('mixes the parts, judges a full try, loses on the third wrong, and a hint places the next part', () => {
    const p = ['in-', 'cre', 'ible'];
    const s0 = parts.startParts(p, seededRandom(4));
    expect(s0.tiles.join()).not.toBe(p.join());
    const order = (s: parts.PartsState, want: string[]) => want.map((w) => s.tiles.findIndex((t, i) => t === w && !s.placed.includes(i)));
    let s = s0;
    for (const t of order(s, p)) s = parts.place(s, t);
    expect(s.status).toBe('won');
    expect(parts.starsOf(s)).toBe(3);
    let w = s0;
    for (let k = 0; k < 3; k++) { const bad = [p[2], p[1], p[0]]; for (const t of bad.map((x) => w.tiles.findIndex((tt, i) => tt === x && !w.placed.includes(i)))) w = parts.place(w, t); }
    expect(w.status).toBe('lost');
    let h = parts.place(s0, s0.tiles.indexOf(p[2]));
    h = parts.hint(h);
    expect(h.placed.map((t) => h.tiles[t])).toEqual(['in-']);
    expect(h.hints).toBe(1);
    expect(parts.unplace(h).placed).toEqual([]);
  });
});

describe('the shelf', () => {
  const by = (id: string) => GAMES.find((g) => g.id === id)!;
  const src = (items: GameItem[]) => ({ items, texts: 0, listWords: 0 });
  it('says what the new games need', () => {
    expect(canPlay(by('definition'), src(WORDS), 'es')).toEqual({ ok: true });
    const pic = canPlay(by('picture'), src(WORDS), 'es');
    expect(pic.ok === false && pic.reason).toMatch(/Needs 5 of your words that have a picture; you have 0/);
    const split = canPlay(by('parts'), src(WORDS), 'es');
    expect(split.ok === false && split.reason).toMatch(/splits into parts; you have 0/);
    expect(canPlay(by('parts'), src(WORDS.slice(0, 4).map((w) => ({ ...w, parts: ['a', 'b'] }))), 'es')).toEqual({ ok: true });
    expect(canPlay(by('memory'), src(WORDS), 'es')).toEqual({ ok: true });
    expect(canPlay(by('bingo'), src(WORDS.slice(0, 8)), 'es').ok).toBe(false);
  });
});
