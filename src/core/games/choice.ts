// Guess the definition and picture vocabulary (6-21, F0176, F0177 and F1198): one word, four answers, found in two tries or fewer. Pure.
import type { GameItem } from './source';

export type ChoiceKind = 'definition' | 'picture';

export interface Choice {
  item: GameItem;
  kind: ChoiceKind;
  /** Meanings for a word shown; words for a picture shown. */
  options: string[];
  answer: number;
}

export const MAX_WRONG_PICKS = 2;

const shuffled = <T,>(list: T[], random: () => number): T[] => [...list].sort(() => random() - 0.5);
const textOf = (item: GameItem, kind: ChoiceKind) => (kind === 'definition' ? item.meaning : item.term) ?? '';
const posOf = (item: GameItem) => item.cats?.find((c) => c.kind === 'pos')?.name;

/** The right answer and three others from the learner's words, of the same kind of word where there are enough, all different. Null when there are not three others. */
export function makeChoice(item: GameItem, pool: GameItem[], kind: ChoiceKind, random: () => number): Choice | null {
  const right = textOf(item, kind);
  const others = shuffled(pool.filter((p) => p !== item && textOf(p, kind) && textOf(p, kind) !== right), random);
  const alike = others.filter((p) => posOf(p) && posOf(p) === posOf(item));
  const chosen: string[] = [];
  for (const p of [...alike, ...others]) if (chosen.length < 3 && !chosen.includes(textOf(p, kind))) chosen.push(textOf(p, kind));
  if (chosen.length < 3) return null;
  const options = shuffled([right, ...chosen], random);
  return { item, kind, options, answer: options.indexOf(right) };
}

/** Three stars for the first pick, two for the second, one for the third; the third wrong pick ends it with none. */
export const choiceStars = (wrongPicks: number, won: boolean): number => (won ? 3 - wrongPicks : 0);
