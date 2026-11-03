// Timed translation and dictation races (6-21, F1185 and F1190): the exercise engine's own judging, under a clock. Pure.
import { judge } from '@/core/exercise';
import { getTranslationTasks } from '@/core/exercise';
import type { GameItem } from './source';

export interface TimedSentence {
  id: string;
  /** English, to be put into the language. */
  source: string;
  expected: string;
  accepted?: string[];
}

const words = (s: string) => s.trim().split(/\s+/).length;

/** Sentences to translate from English into the language: the hand-made tasks of the six core languages, and the dictionary's sentences for the learner's own words. */
export function translationPool(lang: string, items: GameItem[]): TimedSentence[] {
  const hand = getTranslationTasks(lang)
    .filter((t) => t.toLang === lang && t.fromLang === 'en' && !t.dialogue && t.category !== 'paragraph' && t.category !== 'passage')
    .map((t): TimedSentence => ({ id: t.id, source: t.source, expected: t.expected, accepted: t.accepted }));
  const fromWords = items.flatMap((i) => (i.pairs ?? []).map(([text, source], n): TimedSentence => ({ id: `${i.term}:${n}`, source, expected: text })));
  const seen = new Set<string>();
  return [...hand, ...fromWords].filter((s) => s.source && words(s.expected) >= 3 && words(s.expected) <= 14 && !seen.has(s.expected) && !!seen.add(s.expected));
}

export type Verdict = 'right' | 'close' | 'wrong';

/** Right, close (an accent or a slip) or wrong, by the exercise engine's rule for a typed answer with several accepted forms. */
export function judgeTranslation(s: TimedSentence, typed: string, lang: string): Verdict {
  const v = judge({ rule: 'accepted', accepted: [s.expected, ...(s.accepted ?? [])] }, typed, lang).verdict;
  return v === 'exact' ? 'right' : v === 'close' ? 'close' : 'wrong';
}

/** Dictation: the words matter, case and punctuation do not; a missing accent is close. */
export function judgeDictation(expected: string, typed: string, lang: string): Verdict {
  const v = judge({ rule: 'dictation', expected }, typed, lang).verdict;
  return v === 'exact' ? 'right' : v === 'close' ? 'close' : 'wrong';
}

/** Lines to dictate: 4 to 12 words, from the hand-made sentences, the dictionary's sentences for the learner's words and their own examples. */
export function dictationLines(lang: string, items: GameItem[]): string[] {
  const lines = [...translationPool(lang, items).map((t) => t.expected), ...items.flatMap((i) => (i.example ? [i.example] : []))];
  return [...new Set(lines.map((l) => l.trim()))].filter((l) => words(l) >= 4 && words(l) <= 12);
}

/** Three stars for five or more right in the time, two for three, one for any. */
export const timedStars = (right: number): number => (right >= 5 ? 3 : right >= 3 ? 2 : right >= 1 ? 1 : 0);
