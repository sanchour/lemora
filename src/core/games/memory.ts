// Memory matching (6-21, F0186 and F1199): cards face down, a word on one and its meaning (or picture) on another. Pure.
import type { GameItem } from './source';

export type MemoryMode = 'meaning' | 'picture' | 'sound';

export interface MemoryCard {
  id: number;
  pair: number;
  /** `sound`: the word is said when the card is turned. */
  face: { text?: string; image?: string; sound?: string };
  /** The word's own card, or what goes with it. */
  side: 'word' | 'other';
}

export interface MemoryState {
  cards: MemoryCard[];
  /** The one or two cards turned up now. */
  open: number[];
  matched: number[];
  moves: number;
}

/** Up to `pairs` of the words, as two cards each, mixed. In picture mode only words with a picture. */
export function makeMemory(items: GameItem[], pairs: number, random: () => number, mode: MemoryMode): MemoryState | null {
  const usable = items.filter((i) => (mode === 'picture' ? i.image : mode === 'sound' ? i.term : i.meaning));
  const picked = [...usable].sort(() => random() - 0.5).slice(0, pairs);
  if (picked.length < 2) return null;
  const cards = picked.flatMap((item, pair): Array<Omit<MemoryCard, 'id'>> => [
    { pair, side: 'word', face: { text: item.term } },
    { pair, side: 'other', face: mode === 'picture' ? { image: item.image } : mode === 'sound' ? { sound: item.term } : { text: item.meaning } },
  ]);
  return { cards: cards.sort(() => random() - 0.5).map((c, id) => ({ ...c, id })), open: [], matched: [], moves: 0 };
}

/** Turns a card up. The second counts a move and, when it matches the first, keeps both. Two that do not match stay up until `close`. */
export function flip(s: MemoryState, id: number): MemoryState {
  const card = s.cards[id];
  if (!card || s.open.includes(id) || s.open.length === 2 || s.matched.includes(card.pair)) return s;
  if (!s.open.length) return { ...s, open: [id] };
  const first = s.cards[s.open[0]];
  const hit = first.pair === card.pair;
  return { ...s, moves: s.moves + 1, open: hit ? [] : [s.open[0], id], matched: hit ? [...s.matched, card.pair] : s.matched };
}

export const close = (s: MemoryState): MemoryState => (s.open.length === 2 ? { ...s, open: [] } : s);

export const done = (s: MemoryState): boolean => s.matched.length * 2 === s.cards.length;

/** Three stars for a few more moves than pairs, two for up to twice as many, one beyond. */
export const memoryStars = (moves: number, pairs: number): number => (moves <= pairs + 3 ? 3 : moves <= pairs * 2 ? 2 : 1);
