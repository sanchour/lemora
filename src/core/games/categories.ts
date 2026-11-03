// Sorting and odd one out (6-21): the learner's words grouped by their decks, their tags and what kind of word they are. Pure.
import type { GameItem } from './source';

export interface Group {
  kind: 'deck' | 'tag' | 'pos';
  name: string;
  items: GameItem[];
}

/** Groups of at least three words, from decks, tags and parts of speech. */
export function groupsOf(items: GameItem[]): Group[] {
  const by = new Map<string, Group>();
  for (const item of items)
    for (const c of item.cats ?? []) {
      const key = `${c.kind}:${c.name}`;
      by.set(key, { kind: c.kind, name: c.name, items: [...(by.get(key)?.items ?? []), item] });
    }
  return [...by.values()].filter((g) => g.items.length >= 3);
}

const pick = <T,>(list: T[], random: () => number): T => list[Math.floor(random() * list.length)];
const shuffled = <T,>(list: T[], random: () => number): T[] => [...list].sort(() => random() - 0.5);
/** Two or more groups of one kind, so the categories compare like with like. Words in two of them are left out. */
function family(groups: Group[], random: () => number, count: number): Group[] | null {
  const kinds = [...new Set(groups.map((g) => g.kind))].filter((k) => groups.filter((g) => g.kind === k).length >= 2);
  if (!kinds.length) return null;
  const chosen = shuffled(groups.filter((g) => g.kind === pick(kinds, random)), random).slice(0, count);
  const twice = new Set(chosen.flatMap((g) => g.items).filter((it, _, all) => all.filter((x) => x === it).length > 1));
  const clean = chosen.map((g) => ({ ...g, items: g.items.filter((it) => !twice.has(it)) })).filter((g) => g.items.length >= 3);
  return clean.length >= 2 ? clean : null;
}

export const canSort = (items: GameItem[]): boolean => family(groupsOf(items), () => 0, 3) !== null;

export interface SortRound {
  names: string[];
  words: Array<{ item: GameItem; category: number }>;
}

/** Two or three categories with three words each, mixed. */
export function sortRound(items: GameItem[], random: () => number): SortRound | null {
  const chosen = family(groupsOf(items), random, 3);
  if (!chosen) return null;
  const words = chosen.flatMap((g, category) => shuffled(g.items, random).slice(0, 3).map((item) => ({ item, category })));
  return { names: chosen.map((g) => g.name), words: shuffled(words, random) };
}

export interface OddRound {
  words: GameItem[];
  odd: number;
  /** What the other three have in common, and what the odd one is. */
  category: string;
  oddCategory: string;
}

/** Three words of one group and one of another, mixed. */
export function oddRound(items: GameItem[], random: () => number): OddRound | null {
  const chosen = family(groupsOf(items), random, 2);
  if (!chosen) return null;
  const [main, other] = shuffled(chosen, random);
  const three = shuffled(main.items, random).slice(0, 3);
  const odd = pick(other.items, random);
  const words = shuffled([...three, odd], random);
  return { words, odd: words.indexOf(odd), category: main.name, oddCategory: other.name };
}

/** Three stars for no wrong place, two for up to two, one for more. */
export const sortStars = (wrong: number): number => (wrong === 0 ? 3 : wrong <= 2 ? 2 : 1);
