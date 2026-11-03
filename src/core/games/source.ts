import { interpolate } from '@/core/i18n/messages';
// What a game is dealt (6-21): the learner's own words first, as items carrying only what exists of them. A game says what it
// needs, and a set that has too few is told why, never an empty board.
import type { WordFacts } from '@/core/exercise';
import { hasLetters, letterWord, NO_LETTERS } from './letters';
import { canSort } from './categories';
import type { GameDef } from './defs';

export interface GameItem {
  term: string;
  lemma?: string;
  /** The deck, the tags and the kind of word it is: what sorting games group by. */
  cats?: Array<{ kind: 'deck' | 'tag' | 'pos'; name: string }>;
  meaning?: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
  image?: string;
}

export const itemsOfFacts = (facts: WordFacts[]): GameItem[] =>
  facts.map((f) => ({ term: f.word, meaning: f.gloss, example: f.sentence, synonyms: f.synonyms ?? [], antonyms: f.antonyms ?? [], image: f.image }));

/** The items a game can really use. */
export function usable(def: GameDef, items: GameItem[], lang: string): GameItem[] {
  const { meaning, letters, maxLetters = 14, synonyms = 0, antonyms = 0, related = 0 } = def.needs;
  return items.filter((i) => {
    if (meaning && !i.meaning) return false;
    if (i.synonyms.length < synonyms || i.antonyms.length < antonyms || i.synonyms.length + i.antonyms.length < related) return false;
    if (!letters) return true;
    const w = letterWord(i.term, { lang });
    return !!w && w.keys.filter((k) => k !== null).length <= maxLetters;
  });
}

/** What the learner has to play with: their words, the texts they could hunt in, and how many words of the language's own list there are. */
export interface GameSource {
  items: GameItem[];
  texts: number;
  listWords: number;
}

export type CanPlay = { ok: true } | { ok: false; reason: string };

export function canPlay(def: GameDef, src: GameSource, lang: string, translate: (source: string, values?: readonly unknown[]) => string = interpolate): CanPlay {
  const { needs } = def;
  if (needs.letters && !hasLetters(lang)) return { ok: false, reason: translate(NO_LETTERS) };
  if (needs.list && src.listWords < needs.list) return { ok: false, reason: translate('Needs the language’s word list, which comes with its dictionary pack. Wait for the pack to finish installing, or install it.') };
  if (needs.texts && src.texts < 1) return { ok: false, reason: translate('Needs a text in Codex to hunt in. Add or open one first.') };
  if (needs.categories) return canSort(src.items) ? { ok: true } : { ok: false, reason: translate('Needs at least two decks, tags or kinds of word with three of your words each.') };
  if (!needs.count) return { ok: true };
  const have = usable(def, src.items, lang).length;
  if (have >= needs.count) return { ok: true };
  if (needs.synonyms || needs.antonyms || needs.related) {
    const kind = needs.synonyms ? 'synonyms' : needs.antonyms ? 'opposites' : 'related words';
    return { ok: false, reason: translate('Needs {0} of your words that the dictionary gives {1} for; you have {2}.', [needs.count, translate(kind), have]) };
  }
  const what = needs.letters ? translate('words with 3 to {0} letters', [needs.maxLetters ?? 14]) : translate('words');
  return { ok: false, reason: translate('Needs {0} of your {1}{2}; you have {3}. Add words to a deck, or look for more in Codex.', [needs.count, what, needs.meaning ? translate(' that have a meaning') : '', have]) };
}
