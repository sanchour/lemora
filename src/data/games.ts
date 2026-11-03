// Games (6-21): what they are dealt, what is kept of them. A game never moves a card's schedule; it only leaves a mark in the learner's
// record (6-5) and a best, both private and on the device.
import { useLiveQuery } from 'dexie-react-hooks';
import { afterRound } from '@/core/games/bests';
import type { Best, Bests, RoundResult } from '@/core/games/bests';
import { letterWord } from '@/core/games/letters';
import { partsOf } from '@/core/games/parts';
import { dictationLines, translationPool } from '@/core/games/timed';
import { parseStory } from '@/core/games/customStory';
import { checkStory, fromAdventure } from '@/core/games/story';
import type { StoryGame } from '@/core/games/story';
import { readyStories } from '@/core/games/storyData';
import { readAdventure } from '@/core/generate/generate';
import type { ListWord, DailyStamp } from '@/core/games/daily';
import type { Project } from '@/core/games/projects';
import type { TournamentRecord } from '@/core/games/tournament';
import { itemsOfFacts } from '@/core/games/source';
import type { GameItem, GameSource } from '@/core/games/source';
import { db } from './db';
import type { LinguaDB } from './db';
import { normalizeWord } from '@/core/text/normalize';
import { lookUpFull } from '@/services/dictionary/fullDict';
import { recordEvidence } from './learner';
import { wordId } from './words';
import type { Skill } from '@/core/contracts/learner';
import type { WordV6 } from '@/core/contracts/word';
import { practiceNotes, wordFacts } from './practice';

/** The learner's words with what the dictionary says of them: the same source Practice draws on. */
export async function gameItems(lang: string, database: LinguaDB = db): Promise<GameItem[]> {
  const notes = await practiceNotes(lang, database);
  const decks = new Map((await database.decks.where('lang').equals(lang).toArray()).map((d) => [d.id, d.name]));
  return Promise.all(itemsOfFacts(await wordFacts(lang, notes, database)).map(async (item, i) => {
    const n = notes[i];
    const cats: NonNullable<GameItem['cats']> = [
      ...(decks.has(n.deckId) ? [{ kind: 'deck' as const, name: decks.get(n.deckId)! }] : []),
      ...n.tags.map((name) => ({ kind: 'tag' as const, name })),
      ...(n.pos ? [{ kind: 'pos' as const, name: n.pos }] : []),
    ];
    const row = await lookUpFull(lang, n.lemma ?? n.term).catch(() => undefined);
    const pairs = (row?.tatoeba ?? []).slice(0, 3).map((t): [string, string] => [t[0], t[1]]);
    const credit = n.imageCredit ? `${n.imageCredit.source} · ${n.imageCredit.licence}` : undefined;
    return { ...item, lemma: n.lemma, cats, pairs, credit, parts: partsOf(n.term, row?.entries.find((e) => e.parts)?.parts, lang) ?? undefined };
  }));
}

/** Whether the dictionary, read from the typed word's side, also relates it to the prompt: a synonym is often listed under only one of the two. */
export async function relatedBack(lang: string, typed: string, prompt: string, relation: 'synonym' | 'antonym' | 'any'): Promise<boolean> {
  // The learner's own links between words (they said "these go together") count for association, which asks for anything related.
  if (relation === 'any') {
    const [a, b] = [wordId(lang, normalizeWord(prompt, lang)), wordId(lang, normalizeWord(typed, lang))];
    const [pw, tw] = await Promise.all([db.words.get(a), db.words.get(b)]);
    const links = (w: unknown) => (w as Partial<WordV6> | undefined)?.relatedWordIds ?? [];
    if (links(pw).includes(b) || links(tw).includes(a)) return true;
  }
  const row = await lookUpFull(lang, typed).catch(() => undefined);
  const entries = row?.entries ?? [];
  const syn = entries.flatMap((e) => [...(e.syn ?? []), ...e.senses.flatMap((x) => x.syn ?? [])]);
  const ant = entries.flatMap((e) => [...(e.ant ?? []), ...e.senses.flatMap((x) => x.ant ?? [])]);
  const forms = relation === 'synonym' ? syn : relation === 'antonym' ? ant : [...syn, ...ant];
  return forms.some((f) => normalizeWord(f, lang) === normalizeWord(prompt, lang));
}

/** A mark of a game in the learner's record where it is not a word of theirs: a translation, a line heard, a story read. */
export function recordGameSkill(lang: string, game: string, skill: Skill, patternId: string, won: boolean, assisted = false, database: LinguaDB = db): Promise<void> {
  return recordEvidence({ lang, at: Date.now(), skill, room: 'ludus', item: { type: 'pattern', patternId }, outcome: won ? 'right' : 'wrong', assisted, kind: game, contextId: 'games' }, database).then(() => undefined);
}

/** The commonest words of a language's list: a ladder is made of these, not of the learner's words. */
const LIST_RANKS = 12_000;

const listRows = (database: LinguaDB, lang: string) => database.frequency.where('[lang+rank]').between([lang, 0], [lang, LIST_RANKS], true, true);

/** What the shelf needs to know, cheaply: the words, how many texts, how long the language's word list is. */
export async function gameSource(lang: string, database: LinguaDB = db): Promise<GameSource> {
  const [items, texts, listWords, stories] = await Promise.all([gameItems(lang, database), database.texts.where('lang').equals(lang).filter((t) => !t.deletedAt).count(), listRows(database, lang).count(), storiesOf(lang, database)]);
  return { items, texts, listWords, tasks: translationPool(lang, items).length, sentences: dictationLines(lang, items).length, stories: stories.length };
}

/** Words of 3 to 6 letters from the commonest of the language's list (a ladder's rungs), with their glosses where the list has them. */
export async function ladderWords(lang: string, database: LinguaDB = db): Promise<Array<{ word: string; gloss?: string }>> {
  const rows = await listRows(database, lang).toArray();
  return rows.flatMap((r) => {
    const w = letterWord(r.norm, { lang, exact: true });
    const n = w?.keys.filter((k) => k !== null).length ?? 0;
    return w && w.marks.length === n && n >= 3 && n <= 6 ? [{ word: r.norm, gloss: r.gloss }] : [];
  });
}

/** Passages of the learner's texts: runs of paragraphs of 40 to 200 words, from the first chapters of the ones opened lately. */
export async function passagesOf(lang: string, database: LinguaDB = db): Promise<string[]> {
  const texts = (await database.texts.where('lang').equals(lang).filter((t) => !t.deletedAt).toArray()).sort((a, b) => (b.lastOpenedAt ?? b.updatedAt ?? 0) - (a.lastOpenedAt ?? a.updatedAt ?? 0)).slice(0, 8);
  const out: string[] = [];
  for (const text of texts) {
    const chapters = (await database.chapters.where('[textId+index]').between([text.id, 0], [text.id, 6], true, false).toArray()).filter((c) => !c.deletedAt);
    for (const chapter of chapters) {
      let run = '';
      for (const b of chapter.blocks) {
        if (b.t !== 'p') continue;
        run = run ? `${run}\n\n${b.text}` : b.text;
        if (run.length > 280) (out.push(run), (run = ''));
      }
      if (run.length > 120) out.push(run);
    }
  }
  return out.slice(0, 300);
}

const BESTS_KEY = (lang: string) => `games.bests:${lang}`;

export async function loadBests(lang: string, database: LinguaDB = db): Promise<Bests> {
  return ((await database.settings.get(BESTS_KEY(lang)))?.value as Bests | undefined) ?? {};
}

export const useBests = (lang: string): Bests | undefined => useLiveQuery(() => loadBests(lang), [lang]);

/** Keeps a finished round; says whether it beat the best before it. */
export async function saveRound(lang: string, game: string, round: RoundResult, database: LinguaDB = db): Promise<{ best: Best; beat: boolean }> {
  return database.transaction('rw', database.settings, async () => {
    const bests = await loadBests(lang, database);
    const result = afterRound(bests[game], round);
    await database.settings.put({ key: BESTS_KEY(lang), value: { ...bests, [game]: result.best }, updatedAt: Date.now() });
    return result;
  });
}

/** One word of a game, as the learner's record sees it: spelling it from its meaning is recall of the word. */
export function recordGameWord(lang: string, term: string, game: string, won: boolean, assisted: boolean, database: LinguaDB = db): Promise<void> {
  return recordEvidence(
    { lang, at: Date.now(), skill: 'vocabulary', room: 'ludus', item: { type: 'word', wordId: `${lang}:${term.toLocaleLowerCase(lang)}` }, outcome: won ? 'right' : 'wrong', assisted, category: won ? undefined : 'spelling', kind: game, contextId: 'games' },
    database,
  ).then(() => undefined);
}

/** The language's list, as the daily and the weekly read it: 4 to 8 letters, with a meaning where the list has one. */
export async function dailyWords(lang: string, database: LinguaDB = db): Promise<ListWord[]> {
  return (await ladderWords(lang, database)).map((w) => ({ word: w.word, gloss: w.gloss })).filter((w) => w.word.length >= 4 && w.word.length <= 8);
}

const DAILY_KEY = (lang: string) => `games.daily:${lang}`;
export const loadDaily = async (lang: string, database: LinguaDB = db): Promise<DailyStamp | undefined> => (await database.settings.get(DAILY_KEY(lang)))?.value as DailyStamp | undefined;
export const useDaily = (lang: string): DailyStamp | undefined => useLiveQuery(() => loadDaily(lang), [lang]);
export const saveDaily = (lang: string, stamp: DailyStamp, database: LinguaDB = db): Promise<unknown> => database.settings.put({ key: DAILY_KEY(lang), value: stamp, updatedAt: Date.now() });

const TOURNAMENT_KEY = (lang: string) => `games.tournament:${lang}`;
export const loadTournament = async (lang: string, database: LinguaDB = db): Promise<TournamentRecord | undefined> => (await database.settings.get(TOURNAMENT_KEY(lang)))?.value as TournamentRecord | undefined;
export const saveTournament = (lang: string, record: TournamentRecord, database: LinguaDB = db): Promise<unknown> => database.settings.put({ key: TOURNAMENT_KEY(lang), value: record, updatedAt: Date.now() });

/** The stories there are to play: the hand-made ones, and the adventures Max made for the language (6-6b). */
export async function storiesOf(lang: string, database: LinguaDB = db): Promise<StoryGame[]> {
  const made = (await database.generated.where('[lang+kind]').equals([lang, 'adventure']).toArray()).filter((r) => !r.reported).sort((a, b) => b.createdAt - a.createdAt).flatMap((r) => {
    const body = readAdventure(r.content);
    return body ? [fromAdventure(r.id, body, r.level)] : [];
  });
  const own = (await loadCustom(lang, database)).flatMap((c) => {
    const { story } = parseStory(c.source, c.id);
    return story && checkStory(story).ok ? [story] : [];
  });
  return [...readyStories(lang), ...own, ...made];
}

/** The stories the learner wrote (6-21, F1220): their text, kept as written, read again when played. */
export interface CustomStory {
  id: string;
  source: string;
}
const CUSTOM_KEY = (lang: string) => `games.custom:${lang}`;
export const loadCustom = async (lang: string, database: LinguaDB = db): Promise<CustomStory[]> => ((await database.settings.get(CUSTOM_KEY(lang)))?.value as CustomStory[] | undefined) ?? [];
export const useCustom = (lang: string): CustomStory[] | undefined => useLiveQuery(() => loadCustom(lang), [lang]);
export const saveCustom = (lang: string, stories: CustomStory[], database: LinguaDB = db): Promise<unknown> => database.settings.put({ key: CUSTOM_KEY(lang), value: stories, updatedAt: Date.now() });

const PROJECTS_KEY = (lang: string) => `games.projects:${lang}`;
export const loadProjects = async (lang: string, database: LinguaDB = db): Promise<Project[]> => ((await database.settings.get(PROJECTS_KEY(lang)))?.value as Project[] | undefined) ?? [];
export const useProjects = (lang: string): Project[] | undefined => useLiveQuery(() => loadProjects(lang), [lang]);
export const saveProjects = (lang: string, projects: Project[], database: LinguaDB = db): Promise<unknown> => database.settings.put({ key: PROJECTS_KEY(lang), value: projects, updatedAt: Date.now() });

/** The texts, recordings and videos a project can be about (6-21 G7). */
export interface ProjectMaterial {
  texts: Array<{ id: string; title: string }>;
  audio: Array<{ id: string; title: string }>;
  video: Array<{ id: string; title: string }>;
}
export function useProjectMaterial(lang: string): ProjectMaterial | undefined {
  return useLiveQuery(async () => {
    const texts = (await db.texts.where('lang').equals(lang).filter((t) => !t.deletedAt).toArray()).sort((a, b) => (b.lastOpenedAt ?? b.updatedAt ?? 0) - (a.lastOpenedAt ?? a.updatedAt ?? 0));
    const media = (await db.media.where('lang').equals(lang).filter((m) => !m.deletedAt && (m.kind === 'audio' || m.kind === 'video')).toArray()).sort((a, b) => (b.lastPlayedAt ?? b.updatedAt ?? 0) - (a.lastPlayedAt ?? a.updatedAt ?? 0));
    const pick = (list: Array<{ id: string; title: string }>) => list.slice(0, 40).map((x) => ({ id: x.id, title: x.title }));
    return { texts: pick(texts), audio: pick(media.filter((m) => m.kind === 'audio')), video: pick(media.filter((m) => m.kind === 'video')) };
  }, [lang]);
}
