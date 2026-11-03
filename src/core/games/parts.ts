// Build a word from its parts (6-21, F0184): the dictionary's morphemes, mixed, to put in order. Pure.
import { MAX_HINTS, MAX_STARS } from './hangman';

export const MAX_TRIES = 3;

export interface PartsState {
  /** The parts in order, as the dictionary gives them (des-, hacer; feliz, -mente). */
  parts: string[];
  tiles: string[];
  placed: number[];
  wrong: number;
  hints: number;
  status: 'playing' | 'won' | 'lost';
}

/** The word's parts, when there are at least two and they put together spell the word (hyphens aside). Otherwise null. */
export function partsOf(term: string, parts: string[] | undefined, lang: string): string[] | null {
  const clean = (s: string) => s.replace(/^-|-$/g, '').toLocaleLowerCase(lang);
  return parts && parts.length >= 2 && parts.map(clean).join('') === term.toLocaleLowerCase(lang) ? parts : null;
}

export function startParts(parts: string[], random: () => number): PartsState {
  let order = parts.map((_, i) => i);
  for (let attempt = 0; attempt < 20; attempt++) {
    order = [...order].sort(() => random() - 0.5);
    if (order.some((o, i) => parts[o] !== parts[i])) break;
  }
  return { parts, tiles: order.map((o) => parts[o]), placed: [], wrong: 0, hints: 0, status: 'playing' };
}

/** Puts a tile next; the last one judges the try: right wins, wrong clears the tiles, the third wrong loses. */
export function place(s: PartsState, tile: number): PartsState {
  if (s.status !== 'playing' || s.placed.includes(tile) || tile < 0 || tile >= s.tiles.length) return s;
  const placed = [...s.placed, tile];
  if (placed.length < s.tiles.length) return { ...s, placed };
  if (placed.every((t, i) => s.tiles[t] === s.parts[i])) return { ...s, placed, status: 'won' };
  const wrong = s.wrong + 1;
  return { ...s, placed: [], wrong, status: wrong >= MAX_TRIES ? 'lost' : 'playing' };
}

export const unplace = (s: PartsState): PartsState => (s.status === 'playing' && s.placed.length ? { ...s, placed: s.placed.slice(0, -1) } : s);

/** Puts right what is wrong so far and places the next part. */
export function hint(s: PartsState): PartsState {
  if (s.status !== 'playing' || s.hints >= MAX_HINTS) return s;
  let good = 0;
  while (good < s.placed.length && s.tiles[s.placed[good]] === s.parts[good]) good++;
  const base = { ...s, placed: s.placed.slice(0, good), hints: s.hints + 1 };
  const tile = s.tiles.findIndex((t, i) => t === s.parts[good] && !base.placed.includes(i));
  return tile < 0 ? s : place(base, tile);
}

export const starsOf = (s: PartsState): number => (s.status !== 'won' ? 0 : Math.max(1, MAX_STARS - s.hints - (s.wrong >= 2 ? 1 : 0)));
