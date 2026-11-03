// Vocabulary bingo (6-21, F0187): a card of the learner's words; meanings are called, mark the word, or say it is not on the card. Pure.
import type { GameItem } from './source';

export interface Call {
  item: GameItem;
  onCard: boolean;
}

export interface Bingo {
  size: number;
  card: GameItem[];
  calls: Call[];
}

/** 5×5 from 24 words, 4×4 from 16, otherwise 3×3. Every word on the card is called once, mixed with others that are not on it. */
export function makeBingo(items: GameItem[], random: () => number): Bingo | null {
  const pool = items.filter((i) => i.meaning).sort(() => random() - 0.5);
  const size = pool.length >= 24 ? 5 : pool.length >= 16 ? 4 : 3;
  if (pool.length < size * size) return null;
  const card = pool.slice(0, size * size);
  const off = pool.slice(size * size, size * size + Math.ceil((size * size) / 2));
  const calls = [...card.map((item) => ({ item, onCard: true })), ...off.map((item) => ({ item, onCard: false }))].sort(() => random() - 0.5);
  return { size, card, calls };
}

/** A full row, column or diagonal. */
export function hasLine(marked: ReadonlySet<number>, size: number): boolean {
  const at = (r: number, c: number) => marked.has(r * size + c);
  const rows = Array.from({ length: size }, (_, i) => i);
  return rows.some((i) => rows.every((j) => at(i, j))) || rows.some((i) => rows.every((j) => at(j, i))) || rows.every((i) => at(i, i)) || rows.every((i) => at(i, size - 1 - i));
}

/** Three stars for one mistake or none, two for up to three, one beyond. */
export const bingoStars = (mistakes: number): number => (mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1);
