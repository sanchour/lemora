// The daily puzzle and the weekly challenge (6-21, F1215, F1216, F0188): made from the language's own word list and the date, so they are
// the same for everyone learning the language that day or week. Nothing here knows who is playing.
import { seededRandom } from '@/core/srs/ludus';
import { dailySeed, isoWeek, weekKey, weekSeed } from './seeds';
import { topicOfWeek, topicWords } from './topics';
import type { Topic } from './topics';

export interface ListWord {
  word: string;
  gloss?: string;
}

export type DailyKind = 'hangman' | 'anagram' | 'missing';
const KINDS: DailyKind[] = ['hangman', 'anagram', 'missing'];

/** The words a daily can be made of: with a meaning, in a fixed order, so every device reads the same list. */
export const dailyList = (list: ListWord[]): ListWord[] => list.filter((w) => w.gloss && w.word.length >= 4 && w.word.length <= 8).sort((a, b) => (a.word < b.word ? -1 : a.word > b.word ? 1 : 0));

export function dailyPuzzle(list: ListWord[], lang: string, day: string): { kind: DailyKind; word: ListWord } | null {
  const pool = dailyList(list);
  if (pool.length < 50) return null;
  const seed = dailySeed(lang, day);
  return { kind: KINDS[seed % KINDS.length], word: pool[Math.floor(seededRandom(seed)() * pool.length)] };
}

export type WeeklyTheme = { kind: 'topic'; topic: Topic } | { kind: 'length'; value: number } | { kind: 'start'; value: string };

/** This week's theme: words of one length, or words that start with one letter, from what the list has plenty of. */
export function weeklyTheme(list: ListWord[], lang: string, day: string): WeeklyTheme | null {
  const pool = dailyList(list);
  // The week's topic, one of 52; where the list has too few words for any, a word length or a first letter.
  const found = topicOfWeek(pool, isoWeek(day).week);
  if (found) return { kind: 'topic', topic: found.topic };
  const random = seededRandom(weekSeed(lang, day));
  const lengths = [4, 5, 6, 7].filter((n) => pool.filter((w) => w.word.length === n).length >= 20);
  const letters = [...new Set(pool.map((w) => w.word[0]))].filter((l) => pool.filter((w) => w.word[0] === l).length >= 20).sort();
  const useLength = random() < 0.5;
  if (useLength && lengths.length) return { kind: 'length', value: lengths[Math.floor(random() * lengths.length)] };
  return letters.length ? { kind: 'start', value: letters[Math.floor(random() * letters.length)] } : lengths.length ? { kind: 'length', value: lengths[0] } : null;
}

/** Five words of the theme, the same all week. */
export function weeklyWords(list: ListWord[], theme: WeeklyTheme, lang: string, day: string, count = 5): ListWord[] {
  const all = dailyList(list);
  const pool = theme.kind === 'topic' ? topicWords(all, theme.topic) : all.filter((w) => (theme.kind === 'length' ? w.word.length === theme.value : w.word[0] === theme.value));
  const random = seededRandom(weekSeed(lang, day) + 1);
  return [...pool].sort(() => random() - 0.5).slice(0, count);
}

export { weekKey };

/** A line to paste anywhere: no word, only how it went. */
export function shareText(title: string, day: string, stars: number, of: number): string {
  return `Lingua · ${title} · ${day}\n${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, of - stars))}`;
}

export interface DailyStamp {
  day: string;
  stars: number;
}
