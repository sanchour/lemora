// Crossword (6-21, F0170 and F1193): a handful of the learner's words crossed on a grid, clued by their meanings. Pure: the grid comes from a seed.
import type { Cell } from './wordsearch';

export interface CrossWord {
  term: string;
  marks: string[];
  /** In reading order: left to right, or right to left in a right-to-left script. */
  cells: Cell[];
  dir: 'across' | 'down';
  number: number;
}

export interface Crossword {
  rows: number;
  cols: number;
  words: CrossWord[];
}

export const cellKey = ([r, c]: Cell): string => `${r},${c}`;

interface Draft {
  term: string;
  marks: string[];
  start: Cell;
  dir: 'across' | 'down';
}

const step = (dir: Draft['dir']): Cell => (dir === 'across' ? [0, 1] : [1, 0]);

/** Lays the words out left to right, longest first, each crossing what is there where its letters agree and touching nothing else. Gives up on a word that finds no place. */
function layout(entries: Array<{ term: string; marks: string[] }>, random: () => number, size: number): Draft[] {
  const letters = new Map<string, string>();
  const owners = new Map<string, Set<Draft['dir']>>();
  const placed: Draft[] = [];
  const free = (r: number, c: number) => !letters.has(`${r},${c}`);
  for (const e of [...entries].sort((a, b) => b.marks.length - a.marks.length)) {
    let best: { draft: Draft; crossings: number; area: number } | null = null;
    for (const dir of ['across', 'down'] as const) {
      const [dr, dc] = step(dir);
      const [pr, pc] = [dc, dr];
      const spots = placed.length ? placed.flatMap((p) => p.marks.flatMap((_, i) => e.marks.map((__, j): Cell => [p.start[0] + step(p.dir)[0] * i - dr * j, p.start[1] + step(p.dir)[1] * i - dc * j]))) : [[0, 0] as Cell];
      for (const [r0, c0] of spots) {
        let crossings = 0;
        let ok = free(r0 - dr, c0 - dc) && free(r0 + dr * e.marks.length, c0 + dc * e.marks.length);
        for (let i = 0; ok && i < e.marks.length; i++) {
          const [r, c] = [r0 + dr * i, c0 + dc * i];
          const k = `${r},${c}`;
          if (letters.has(k)) ok = letters.get(k) === e.marks[i] && !owners.get(k)!.has(dir) && ++crossings > 0;
          else ok = free(r + pr, c + pc) && free(r - pr, c - pc);
        }
        if (!ok || (placed.length && !crossings)) continue;
        const all = [...placed, { start: [r0, c0] as Cell, marks: e.marks, dir }];
        const rs = all.flatMap((p) => p.marks.map((_, i) => p.start[0] + step(p.dir)[0] * i));
        const cs = all.flatMap((p) => p.marks.map((_, i) => p.start[1] + step(p.dir)[1] * i));
        const [h, w] = [Math.max(...rs) - Math.min(...rs) + 1, Math.max(...cs) - Math.min(...cs) + 1];
        if (h > size || w > size) continue;
        const area = h * w;
        if (!best || crossings > best.crossings || (crossings === best.crossings && (area < best.area || (area === best.area && random() < 0.5)))) best = { draft: { term: e.term, marks: e.marks, start: [r0, c0], dir }, crossings, area };
      }
    }
    if (!best) continue;
    const d = best.draft;
    placed.push(d);
    d.marks.forEach((m, i) => {
      const k = `${d.start[0] + step(d.dir)[0] * i},${d.start[1] + step(d.dir)[1] * i}`;
      letters.set(k, m);
      owners.set(k, (owners.get(k) ?? new Set()).add(d.dir));
    });
  }
  return placed;
}

/**
 * Tries the layout a few times and keeps the one with most words. In a right-to-left script the grid is mirrored, so across words start at the right.
 * Numbers go to the words in reading order of their first cell.
 */
export function makeCrossword(entries: Array<{ term: string; marks: string[] }>, random: () => number, opts: { rtl?: boolean; size?: number; tries?: number } = {}): Crossword {
  const { rtl = false, size = 15, tries = 25 } = opts;
  let best: Draft[] = [];
  for (let t = 0; t < tries && best.length < entries.length; t++) {
    const shuffled = [...entries].sort(() => random() - 0.5);
    const drafts = layout(shuffled, random, size);
    if (drafts.length > best.length) best = drafts;
  }
  const raw = best.map((d) => ({ ...d, cells: d.marks.map((_, i): Cell => [d.start[0] + step(d.dir)[0] * i, d.start[1] + step(d.dir)[1] * i]) }));
  const r0 = Math.min(...raw.flatMap((d) => d.cells.map(([r]) => r)));
  const c0 = Math.min(...raw.flatMap((d) => d.cells.map(([, c]) => c)));
  const rows = Math.max(...raw.flatMap((d) => d.cells.map(([r]) => r))) - r0 + 1;
  const cols = Math.max(...raw.flatMap((d) => d.cells.map(([, c]) => c))) - c0 + 1;
  const words = raw.map((d): Omit<CrossWord, 'number'> => ({ term: d.term, marks: d.marks, dir: d.dir, cells: d.cells.map(([r, c]): Cell => [r - r0, rtl ? cols - 1 - (c - c0) : c - c0]) }));
  const order = (w: Omit<CrossWord, 'number'>) => w.cells[0][0] * 1000 + (rtl ? cols - w.cells[0][1] : w.cells[0][1]);
  const numbers = new Map<string, number>();
  [...words].sort((a, b) => order(a) - order(b)).forEach((w) => numbers.has(cellKey(w.cells[0])) || numbers.set(cellKey(w.cells[0]), numbers.size + 1));
  return { rows, cols, words: words.map((w) => ({ ...w, number: numbers.get(cellKey(w.cells[0]))! })).sort((a, b) => a.number - b.number || (a.dir === 'across' ? -1 : 1)) };
}

/** What each cell of the grid should hold. */
export function answers(cw: Crossword): Map<string, string> {
  return new Map(cw.words.flatMap((w) => w.cells.map((c, i): [string, string] => [cellKey(c), w.marks[i]])));
}

/** The cells of one word that hold something else than the answer. */
export function wrongIn(cw: Crossword, filled: ReadonlyMap<string, string>, word: number): string[] {
  const a = answers(cw);
  return cw.words[word].cells.map(cellKey).filter((k) => filled.has(k) && filled.get(k) !== a.get(k));
}

export function solved(cw: Crossword, filled: ReadonlyMap<string, string>): boolean {
  const a = answers(cw);
  return [...a].every(([k, m]) => filled.get(k) === m);
}

/** Three stars; one off for every three letters shown. Giving up earns none. */
export const crosswordStars = (won: boolean, shown: number): number => (won ? Math.max(1, 3 - Math.floor(shown / 3)) : 0);
