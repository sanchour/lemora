import { describe, expect, it } from 'vitest';
import { dailyList, dailyPuzzle, shareText, weeklyTheme, weeklyWords } from './daily';
import type { ListWord } from './daily';
import { GAMES } from './defs';
import { progress, startProject, STEPS, TEMPLATES, templateOf, toggleStep } from './projects';
import { canPlay } from './source';
import { checkStory, choose, fromAdventure, startStory, storyStars, visible } from './story';
import type { StoryGame } from './story';
import { readyStories } from './storyData';
import { dictationLines, judgeDictation, judgeTranslation, timedStars, translationPool } from './timed';
import { afterTournament, drawTournament, TOURNAMENT_GAMES } from './tournament';

const LIST: ListWord[] = Array.from({ length: 400 }, (_, i) => ({ word: `${'abcdefgh'[i % 8]}${'xyzw'[i % 4]}${String(i).padStart(3, '0')}`.slice(0, 4 + (i % 4)), gloss: i % 5 ? `g${i}` : undefined }));

describe('daily and weekly', () => {
  it('the same day gives the same puzzle for the same language, another day another', () => {
    const a = dailyPuzzle(LIST, 'es', '2026-11-04')!;
    expect(dailyPuzzle(LIST, 'es', '2026-11-04')).toEqual(a);
    expect(a.word.gloss).toBeTruthy();
    expect(['hangman', 'anagram', 'missing']).toContain(a.kind);
    const seen = new Set(['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'].map((d) => dailyPuzzle(LIST, 'es', d)!.word.word));
    expect(seen.size).toBeGreaterThan(1);
    expect(dailyPuzzle(LIST.slice(0, 20), 'es', '2026-11-04')).toBeNull();
  });
  it('the weekly theme is the same all week, and its words fit it', () => {
    const t1 = weeklyTheme(LIST, 'de', '2026-11-02')!;
    expect(weeklyTheme(LIST, 'de', '2026-11-08')).toEqual(t1);
    const words = weeklyWords(LIST, t1, 'de', '2026-11-04');
    expect(words.length).toBeGreaterThan(0);
    expect(weeklyWords(LIST, t1, 'de', '2026-11-06')).toEqual(words);
    for (const w of words) expect(t1.kind === 'length' ? w.word.length === t1.value : w.word[0] === t1.value).toBe(true);
    expect(dailyList(LIST).every((w) => w.gloss && w.word.length >= 4)).toBe(true);
  });
  it('shares only how it went', () => {
    expect(shareText('Daily puzzle', '2026-11-04', 2, 3)).toBe('Lingua · Daily puzzle · 2026-11-04\n★★☆');
  });
});

describe('timed games', () => {
  it('pools hand-made sentences with the dictionary’s, and judges with the engine’s leniency', () => {
    const own = { term: 'gato', synonyms: [], antonyms: [], pairs: [['El gato duerme en la casa.', 'The cat sleeps in the house.'], ['Sí.', 'Yes.']] as Array<[string, string]> };
    const pool = translationPool('es', [own]);
    expect(pool.length).toBeGreaterThanOrEqual(6);
    expect(pool.some((s) => s.expected === 'El gato duerme en la casa.')).toBe(true);
    expect(pool.some((s) => s.expected === 'Sí.')).toBe(false);
    const s = pool.find((x) => x.expected === 'El gato duerme en la casa.')!;
    expect(judgeTranslation(s, 'el gato duerme en la casa', 'es')).toBe('right');
    expect(judgeTranslation(s, 'xyz qrs', 'es')).toBe('wrong');
    expect(translationPool('ja', [])).toEqual([]);
  });
  it('judges a dictation by words, not punctuation or case', () => {
    expect(judgeDictation('Me gusta el café.', 'me gusta el cafe', 'es')).toBe('close');
    expect(judgeDictation('Me gusta el café.', 'me gusta el café', 'es')).toBe('right');
    expect(judgeDictation('Me gusta el café.', 'me gusta el té', 'es')).toBe('wrong');
    const lines = dictationLines('es', [{ term: 'x', synonyms: [], antonyms: [], example: 'Una frase de ejemplo que sirve.' }, { term: 'y', synonyms: [], antonyms: [], example: 'No.' }]);
    expect(lines).toContain('Una frase de ejemplo que sirve.');
    expect(lines).not.toContain('No.');
    expect([timedStars(0), timedStars(1), timedStars(3), timedStars(5)]).toEqual([0, 1, 2, 3]);
  });
});

describe('tournament', () => {
  it('draws three of the games that can be played, in an order made by the seed', () => {
    const playable = ['hangman', 'anagram', 'clues', 'wordsearch'];
    const draw = drawTournament(playable, 7);
    expect(draw).toHaveLength(3);
    expect(draw.every((g) => playable.includes(g) && TOURNAMENT_GAMES.includes(g))).toBe(true);
    expect(drawTournament(playable, 7)).toEqual(draw);
    expect(drawTournament(['hangman'], 7)).toEqual(['hangman']);
  });
  it('keeps the last and the best, and says what was beaten', () => {
    const first = afterTournament(undefined, 20);
    expect(first).toMatchObject({ beatLast: false, beatBest: false, record: { best: 20, last: 20, plays: 1 } });
    const second = afterTournament(first.record, 25);
    expect(second).toMatchObject({ beatLast: true, beatBest: true, record: { best: 25, last: 25, plays: 2 } });
    expect(afterTournament(second.record, 22)).toMatchObject({ beatLast: false, beatBest: false, record: { best: 25, last: 22 } });
  });
});

describe('stories', () => {
  it('the ready-made stories can all be won, and have no trap', () => {
    for (const lang of ['es', 'fr', 'de', 'ru', 'zh', 'ar']) {
      const [story] = readyStories(lang);
      const check = checkStory(story);
      expect(check.problems, lang).toEqual([]);
      expect(check.shortest).toBe(5);
    }
    expect(readyStories('ja')).toEqual([]);
  });
  it('hides a choice until its item is held, and finds items on arriving', () => {
    const story = readyStories('es')[0];
    let s = startStory(story);
    expect(visible(story, s).map((c) => c.to)).toEqual(['note', 'window', 'locked']);
    s = choose(story, s, 0);
    expect(s.items).toEqual(['note']);
    s = choose(story, s, 0);
    expect(visible(story, s).map((c) => c.to)).toEqual(['note', 'rug', 'window', 'locked']);
    s = choose(story, choose(story, s, 1), 0);
    expect(s.items).toEqual(['note', 'key']);
    s = choose(story, s, 4);
    expect(s.status).toBe('won');
    expect(s.moves).toBe(5);
    expect(storyStars(s, 5)).toBe(3);
    expect(storyStars({ ...s, moves: 20 }, 5)).toBe(1);
    expect(storyStars({ ...s, status: 'stuck' }, 5)).toBe(0);
  });
  it('finds a story with no way to win, a trap, a missing scene and an unreachable scene', () => {
    const base: StoryGame = { id: 'x', title: 'x', start: 'a', scenes: { a: { text: 't', choices: [{ label: 'go', to: 'b' }] }, b: { text: 't', choices: [{ label: 'key', to: 'a', needs: 'k' }] } } };
    const trap = checkStory(base);
    expect(trap.ok).toBe(false);
    expect(trap.problems.join(' ')).toMatch(/nothing to choose/);
    expect(trap.problems.join(' ')).toMatch(/no way to win/);
    expect(checkStory({ ...base, scenes: { ...base.scenes, a: { text: 't', choices: [{ label: 'go', to: 'zzz' }] } } }).problems[0]).toMatch(/does not exist/);
    const orphan = checkStory({ id: 'y', title: 'y', start: 'a', scenes: { a: { text: 't', choices: [], end: 'win' }, o: { text: 't', choices: [] } } });
    expect(orphan.problems.join(' ')).toMatch(/o: no way to get here/);
  });
  it('plays a story Max made: its endings win', () => {
    const body = { title: 'T', start: 'a', scenes: { a: { text: 'x', choices: [{ label: 'l', to: 'b' }] }, b: { text: 'y', choices: [] } } };
    const story = fromAdventure('m', body);
    expect(checkStory(story).ok).toBe(true);
    expect(choose(story, startStory(story), 0).status).toBe('won');
  });
});

describe('projects', () => {
  it('every template has steps that exist, and ids are unique', () => {
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length);
    for (const t of TEMPLATES) for (const s of t.steps) expect(STEPS[s], `${t.id} ${s}`).toBeTruthy();
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(16);
  });
  it('ticks steps in and out, and knows when the chain is finished', () => {
    const t = templateOf('read-talk-write')!;
    let p = startProject(t, 'ignored', 1000);
    expect(p.topic).toBeUndefined();
    p = toggleStep(toggleStep(p, 2), 0);
    expect(p.done).toEqual([0, 2]);
    expect(progress(p)).toEqual({ done: 2, of: 3, finished: false });
    p = toggleStep(p, 1);
    expect(progress(p).finished).toBe(true);
    expect(toggleStep(p, 1).done).toEqual([0, 2]);
    expect(startProject(templateOf('week-topic')!, '  the sea ', 5).topic).toBe('the sea');
  });
});

describe('the shelf', () => {
  const by = (id: string) => GAMES.find((g) => g.id === id)!;
  const src = (extra: object) => ({ items: [], texts: 0, listWords: 0, ...extra });
  it('says what the new games need', () => {
    expect(canPlay(by('translate'), src({ tasks: 30 }), 'es')).toEqual({ ok: true });
    expect(canPlay(by('translate'), src({ tasks: 0 }), 'ja').ok).toBe(false);
    expect(canPlay(by('dictation'), src({ sentences: 8 }), 'es')).toEqual({ ok: true });
    expect(canPlay(by('daily'), src({ listWords: 5000 }), 'es')).toEqual({ ok: true });
    expect(canPlay(by('daily'), src({ listWords: 10 }), 'es').ok).toBe(false);
  });
});
