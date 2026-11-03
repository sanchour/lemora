import { describe, expect, it } from 'vitest';
import { seededRandom } from '@/core/srs/ludus';
import { canSort, groupsOf, oddRound, sortRound, sortStars } from './categories';
import { GAMES } from './defs';
import { answers, cellKey, crosswordStars, makeCrossword, solved, wrongIn } from './crossword';
import { judgeWord, raceStars, relatedOf } from './races';
import { canPlay } from './source';
import type { GameItem } from './source';

const entry = (t: string) => ({ term: t, marks: [...t] });
const WORDS = ['gato', 'perro', 'casa', 'libro', 'mesa', 'ventana', 'cocina', 'jardin'].map(entry);

describe('crossword', () => {
  it('crosses the words where letters agree and touches nothing else', () => {
    for (let seed = 1; seed < 30; seed++) {
      const cw = makeCrossword(WORDS, seededRandom(seed), {});
      expect(cw.words.length).toBeGreaterThanOrEqual(5);
      const grid = new Map<string, string>();
      const owner = new Map<string, number[]>();
      cw.words.forEach((w, i) =>
        w.cells.forEach((c, j) => {
          const k = cellKey(c);
          expect(grid.get(k) ?? w.marks[j]).toBe(w.marks[j]);
          grid.set(k, w.marks[j]);
          owner.set(k, [...(owner.get(k) ?? []), i]);
          expect(c[0] >= 0 && c[0] < cw.rows && c[1] >= 0 && c[1] < cw.cols).toBe(true);
        }),
      );
      // two neighbouring letters across or down always belong to one word
      for (const [k] of grid) {
        const [r, c] = k.split(',').map(Number);
        for (const [dr, dc] of [[0, 1], [1, 0]]) {
          const n = `${r + dr},${c + dc}`;
          if (grid.has(n)) expect(owner.get(k)!.some((o) => owner.get(n)!.includes(o)), `${k} ${n} seed ${seed}`).toBe(true);
        }
      }
      expect(cw.words.every((w) => w.number >= 1)).toBe(true);
      expect(cw.words.some((a) => cw.words.some((b) => a !== b && a.dir !== b.dir && a.cells.some((c) => b.cells.some((d) => cellKey(c) === cellKey(d)))))).toBe(true);
    }
  });
  it('is the same grid for the same seed, and mirrored in a right-to-left script', () => {
    const a = makeCrossword(WORDS, seededRandom(4), {});
    expect(makeCrossword(WORDS, seededRandom(4), {})).toEqual(a);
    const rtl = makeCrossword(WORDS, seededRandom(4), { rtl: true });
    const across = rtl.words.find((w) => w.dir === 'across')!;
    expect(across.cells[1][1]).toBe(across.cells[0][1] - 1);
  });
  it('knows when it is solved and which letters are wrong', () => {
    const cw = makeCrossword(WORDS, seededRandom(2), {});
    const filled = new Map(answers(cw));
    expect(solved(cw, filled)).toBe(true);
    const k = cellKey(cw.words[0].cells[0]);
    filled.set(k, 'z');
    expect(solved(cw, filled)).toBe(false);
    expect(wrongIn(cw, filled, 0)).toEqual([k]);
    expect(crosswordStars(true, 0)).toBe(3);
    expect(crosswordStars(true, 6)).toBe(1);
    expect(crosswordStars(false, 0)).toBe(0);
  });
});

const item = (term: string, extra: Partial<GameItem> = {}): GameItem => ({ term, meaning: 'x', synonyms: [], antonyms: [], ...extra });

describe('races', () => {
  const big = item('grande', { synonyms: ['enorme', 'gran'], antonyms: ['pequeño'] });
  it('counts a related word once, ignoring case and accents the language folds', () => {
    const forms = relatedOf(big, 'synonym');
    expect(forms).toEqual(['enorme', 'gran']);
    expect(relatedOf(big, 'antonym')).toEqual(['pequeño']);
    expect(relatedOf(big, 'any')).toHaveLength(3);
    expect(judgeWord('Enorme', forms, [], 'es')).toBe('new');
    expect(judgeWord('enorme', forms, ['enorme'], 'es')).toBe('again');
    expect(judgeWord('pequeño', forms, [], 'es')).toBe('no');
    expect(judgeWord('  ', forms, [], 'es')).toBe('no');
  });
  it('scores against what could be asked', () => {
    expect([raceStars(3, 5), raceStars(2, 5), raceStars(1, 5), raceStars(0, 5), raceStars(1, 1), raceStars(2, 2), raceStars(1, 2)]).toEqual([3, 2, 1, 0, 3, 3, 2]);
  });
});

describe('categories', () => {
  const mk = (term: string, deck: string, pos: string): GameItem => item(term, { cats: [{ kind: 'deck', name: deck }, { kind: 'pos', name: pos }] });
  const items = [mk('gato', 'Animals', 'noun'), mk('perro', 'Animals', 'noun'), mk('pez', 'Animals', 'noun'), mk('mesa', 'Home', 'noun'), mk('silla', 'Home', 'noun'), mk('cama', 'Home', 'noun'), mk('correr', 'Verbs', 'verb')];
  it('groups of three or more', () => {
    expect(groupsOf(items).map((g) => `${g.kind}:${g.name}`).sort()).toEqual(['deck:Animals', 'deck:Home', 'pos:noun']);
    expect(canSort(items)).toBe(true);
    expect(canSort(items.slice(0, 3))).toBe(false);
  });
  it('makes a sort with every word in one category only, and an odd one out whose category is different', () => {
    for (let seed = 1; seed < 20; seed++) {
      const round = sortRound(items, seededRandom(seed))!;
      expect(round.words).toHaveLength(round.names.length * 3);
      for (const w of round.words) expect(w.item.cats!.some((c) => c.name === round.names[w.category])).toBe(true);
      const odd = oddRound(items, seededRandom(seed))!;
      expect(odd.words).toHaveLength(4);
      expect(odd.words[odd.odd].cats!.some((c) => c.name === odd.oddCategory)).toBe(true);
      expect(odd.words.filter((_, i) => i !== odd.odd).every((w) => w.cats!.some((c) => c.name === odd.category))).toBe(true);
    }
    expect([sortStars(0), sortStars(2), sortStars(5)]).toEqual([3, 2, 1]);
  });
  it('the shelf says what each new game needs', () => {
    const by = (id: string) => GAMES.find((g) => g.id === id)!;
    const src = (its: GameItem[]) => ({ items: its, texts: 0, listWords: 0 });
    expect(canPlay(by('sorting'), src(items), 'es')).toEqual({ ok: true });
    const none = canPlay(by('odd'), src([]), 'es');
    expect(none.ok === false && none.reason).toMatch(/two decks, tags or kinds/);
    const few = canPlay(by('synonyms'), src([big3(), item('x')]), 'es');
    expect(few.ok === false && few.reason).toMatch(/Needs 3 of your words that the dictionary gives synonyms for; you have 1/);
    expect(canPlay(by('crossword'), src(WORDS.map((w) => item(w.term))), 'es')).toEqual({ ok: true });
  });
});
const big3 = () => item('grande', { synonyms: ['enorme', 'gran'] });
