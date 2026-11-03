import { describe, expect, it } from 'vitest';
import { seededRandom } from '@/core/srs/ludus';
import { TOPICS, topicOfWeek } from './topics';
import { dailyList, dailyPuzzle, shareText, weeklyTheme, weeklyWords } from './daily';
import type { ListWord } from './daily';
import { GAMES } from './defs';
import { carried, progress, setNote, startProject, stepTarget, STEPS, TEMPLATES, templateOf, toggleStep } from './projects';
import { canPlay } from './source';
import { checkStory, choose, fromAdventure, startStory, storyStars, visible, wordsUsed } from './story';
import { completeItems, makeComplete } from './complete';
import { parseStory, SAMPLE } from './customStory';
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
    for (const w of words) if (t1.kind !== 'topic') expect(t1.kind === 'length' ? w.word.length === t1.value : w.word[0] === t1.value).toBe(true);
    expect(dailyList(LIST).every((w) => w.gloss && w.word.length >= 4)).toBe(true);
    expect(weeklyTheme(LIST, 'de', '2026-11-04')?.kind).toMatch(/length|start/);
  });
  it('shares only how it went', () => {
    expect(shareText('Daily puzzle', '2026-11-04', 2, 3)).toBe('Lingua · Daily puzzle · 2026-11-04\n★★☆');
  });
});

describe('the weekly topics', () => {
  const words = (gloss: string, n: number): ListWord[] => Array.from({ length: n }, (_, i) => ({ word: `w${i}xx`.padEnd(5, 'z'), gloss: `${gloss} number ${i}` }));
  it('are 52, each with words to match', () => {
    expect(TOPICS).toHaveLength(52);
    expect(new Set(TOPICS.map((t) => t.id)).size).toBe(52);
    expect(TOPICS.every((t) => t.words.length >= 8)).toBe(true);
  });
  it('take the week’s place in the list, or the next topic the list has words for', () => {
    const list: ListWord[] = [...words('a big dog', 15), ...words('red wine', 15)];
    expect(topicOfWeek(list, 1)?.topic.label).toBe('Animals');
    expect(topicOfWeek(list, 3)?.topic.label).toBe('Drinks');
    expect(topicOfWeek(list, 3)?.words.length).toBeGreaterThanOrEqual(12);
    expect(topicOfWeek([{ word: 'abcd', gloss: 'zzz' }], 5)).toBeNull();
    expect(topicOfWeek(list, 53)?.topic.label).toBeTruthy();
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
    const shortest: Record<string, number> = { room: 5, mystery: 6, detective: 5, travel: 5, city: 4, survival: 2, roleplay: 4, conversation: 5 };
    for (const lang of ['es', 'fr', 'de', 'ru', 'zh', 'ar']) {
      const stories = readyStories(lang);
      expect(stories.map((s) => s.id.split(':')[2]).sort()).toEqual(Object.keys(shortest).sort());
      for (const story of stories) {
        const check = checkStory(story);
        expect(check.problems, `${lang} ${story.id}`).toEqual([]);
        expect(check.shortest, `${lang} ${story.id}`).toBe(shortest[story.id.split(':')[2]]);
      }
    }
    const [first] = readyStories('es');
    expect(first.id).toBe('ready:es:room');
    expect(readyStories('ja')).toEqual([]);
  });
  it('a survival story is lost when the strength runs out, and won with some left', () => {
    const story = readyStories('es').find((x) => x.id.endsWith('survival'))!;
    let s = startStory(story);
    expect(s.health).toBe(2);
    s = choose(story, choose(story, s, 0), 0);
    expect([s.status, s.health]).toEqual(['lost', 0]);
    expect(choose(story, s, 0)).toBe(s);
    s = choose(story, choose(story, startStory(story), 1), 0);
    expect([s.status, s.health, s.items]).toEqual(['won', 1, ['map']]);
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

describe('projects carry what was chosen and made', () => {
  it('opens the chosen text, recording or video, and the room when none is chosen', () => {
    let p = startProject(templateOf('week-topic')!, 'sea', 1);
    expect(stepTarget(p, 'read')).toBe('/codex');
    p = { ...p, material: { textId: 't1' } };
    expect(stepTarget(p, 'read')).toBe('/codex/read/t1');
    p = { ...p, material: { mediaId: 'm1', mediaKind: 'audio' } };
    expect(stepTarget(p, 'listen')).toBe('/sonus/play/m1');
    expect(stepTarget(p, 'watch')).toBe('/visio');
    p = { ...p, material: { mediaId: 'm2', mediaKind: 'video' } };
    expect(stepTarget(p, 'watch')).toBe('/visio/watch/m2');
  });
  it('shows a step what the nearest step before it made', () => {
    let p = startProject(templateOf('write-aloud')!, undefined, 1);
    expect(carried(p, 1)).toBeUndefined();
    p = setNote(p, 0, 'Mi gato duerme.');
    expect(carried(p, 1)).toBe('Mi gato duerme.');
    expect(carried(p, 0)).toBeUndefined();
    p = setNote(setNote(p, 1, '  '), 0, 'Hola');
    expect(carried(p, 2)).toBe('Hola');
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

describe('custom stories', () => {
  it('reads the sample into a story that can be won', () => {
    const { story, errors } = parseStory(SAMPLE, 'custom:1');
    expect(errors).toEqual([]);
    expect(story!.title).toBe('The locked room');
    expect(story!.items).toEqual({ key: 'the key', note: 'the note' });
    expect(story!.scenes.desk).toMatchObject({ gives: 'key', text: 'On the desk there is a small key.' });
    expect(story!.scenes.room.choices[1]).toEqual({ label: 'Open the door with the key', to: 'win', needs: 'key' });
    expect(checkStory(story!).shortest).toBe(3);
  });
  it('reads strength, cost and a lost ending, and says what is wrong', () => {
    const s = parseStory('title: T\nhealth: 2\n[a]\nText\n> go -> b | cost: 1\n[b] end: lose\nBad', 'x').story!;
    expect([s.health, s.scenes.a.choices[0].cost, s.scenes.b.end]).toEqual([2, 1, 'lose']);
    expect(parseStory('[a]\nText', 'x').errors).toEqual([['The story needs a title: title: …']]);
    expect(parseStory('title: T\n[a]\n> go -> b', 'x').errors).toEqual([['A scene needs some text: {0}', 'a']]);
    expect(parseStory('title: T\n> go -> b', 'x').errors.map((e) => e[0])).toContain('A choice must come after a scene: {0}');
    expect(parseStory('title: T\nstart: zz\n[a]\nText', 'x').errors).toEqual([['The start scene does not exist: {0}', 'zz']]);
    expect(parseStory('title: T\n[a]\nText\n> go b', 'x').errors[0][0]).toMatch(/not written as/);
    expect(parseStory('', 'x').errors.length).toBe(2);
  });
  it('counts how many of the learner’s words a story uses', () => {
    const story = readyStories('es')[0];
    expect(wordsUsed(story, ['llave', 'mesa', 'luna', 'pingüino'])).toBe(3);
  });
});

describe('finish it', () => {
  it('has three dialogues and three stories for each core language, the fitting line first', () => {
    for (const lang of ['es', 'fr', 'de', 'ru', 'zh', 'ar']) {
      const items = completeItems(lang);
      expect(items.map((i) => i.kind), lang).toEqual(['dialogue', 'dialogue', 'dialogue', 'story', 'story', 'story']);
      for (const i of items) {
        expect(new Set(i.options).size).toBe(3);
        expect(i.before.length).toBeGreaterThan(5);
      }
    }
    expect(completeItems('ja')).toEqual([]);
  });
  it('mixes the lines and knows which one fits', () => {
    const [item] = completeItems('es');
    for (let seed = 1; seed < 10; seed++) {
      const r = makeComplete(item, seededRandom(seed));
      expect(r.options[r.answer]).toBe(item.options[0]);
      expect([...r.options].sort()).toEqual([...item.options].sort());
    }
  });
});
