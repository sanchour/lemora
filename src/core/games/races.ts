// Races on words that go together (6-21): name synonyms, opposites or anything related to a word before time runs out. Pure.
import { normalizeWord } from '@/core/text/normalize';
import type { GameItem } from './source';

export type Relation = 'synonym' | 'antonym' | 'any';

/** The forms the dictionary gives for a word's relation, as they would be typed. */
export function relatedOf(item: GameItem, relation: Relation): string[] {
  return relation === 'synonym' ? item.synonyms : relation === 'antonym' ? item.antonyms : [...item.synonyms, ...item.antonyms];
}

export type Verdict = 'new' | 'again' | 'no';

/** A typed word against the forms the word is known to have: counted, already counted, or not related as far as the dictionary knows. Case, marks and accents the language ignores do not matter. */
export function judgeWord(typed: string, forms: string[], counted: string[], lang: string): Verdict {
  const norm = normalizeWord(typed.trim(), lang);
  if (!norm) return 'no';
  if (counted.includes(norm)) return 'again';
  return forms.some((f) => normalizeWord(f, lang) === norm) ? 'new' : 'no';
}

/** Three stars for naming as many as could be asked (at most three), two for half of that, one for any. */
export function raceStars(found: number, available: number): number {
  const target = Math.min(3, available);
  return found >= target && target > 0 ? 3 : found >= Math.ceil(target / 2) && found > 0 ? 2 : found > 0 ? 1 : 0;
}
