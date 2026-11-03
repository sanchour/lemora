// Story games (6-21 G6, F0313, F0314, F1205 to F1214): scenes the learner moves through by choices, with things to find and use.
// The format is the 6-6b adventure (scenes, choices, endings) with state: a scene can give an item and a choice can need one, so a mystery, an
// escape room or a quest is the same game. Pure; `checkStory` says whether a story can be played to a win.
import type { AdventureBody } from '@/core/generate/generate';

export interface StoryChoice {
  label: string;
  to: string;
  /** The item that must be held to see this choice. */
  needs?: string;
  /** Strength it takes (a cold walk, a long way): see `StoryGame.health`. */
  cost?: number;
}

export interface StoryScene {
  text: string;
  choices: StoryChoice[];
  /** An item found on arriving here. */
  gives?: string;
  end?: 'win' | 'lose';
}

export interface StoryGame {
  id: string;
  title: string;
  level?: string;
  start: string;
  /** For a survival story: the strength the learner starts with. At none the story is lost. */
  health?: number;
  /** What each item is called, for the line that says what the learner holds. */
  items?: Record<string, string>;
  scenes: Record<string, StoryScene>;
}

/** An adventure Max made has no items: its scenes without choices are its endings, all of them a way to finish. */
export function fromAdventure(id: string, body: AdventureBody, level?: string): StoryGame {
  return {
    id,
    title: body.title,
    level,
    start: body.start,
    scenes: Object.fromEntries(Object.entries(body.scenes).map(([k, s]) => [k, { text: s.text, choices: s.choices, ...(s.choices.length ? {} : { end: 'win' as const }) }])),
  };
}

export interface StoryState {
  at: string;
  items: string[];
  /** Strength left, in a story that has it. */
  health?: number;
  moves: number;
  status: 'playing' | 'won' | 'lost' | 'stuck';
}

const arrive = (story: StoryGame, at: string, items: string[], health?: number): Pick<StoryState, 'at' | 'items' | 'health' | 'status'> => {
  const scene = story.scenes[at];
  const held = scene.gives && !items.includes(scene.gives) ? [...items, scene.gives] : items;
  const open = scene.choices.some((c) => !c.needs || held.includes(c.needs));
  const spent = health !== undefined && health <= 0;
  return { at, items: held, health, status: scene.end === 'win' ? 'won' : scene.end === 'lose' || spent ? 'lost' : open ? 'playing' : scene.choices.length ? 'stuck' : 'won' };
};

export const startStory = (story: StoryGame): StoryState => ({ ...arrive(story, story.start, [], story.health), moves: 0 });

/** The choices the learner can see here: the ones whose item they hold. */
export const visible = (story: StoryGame, s: StoryState): StoryChoice[] => story.scenes[s.at].choices.filter((c) => !c.needs || s.items.includes(c.needs));

export function choose(story: StoryGame, s: StoryState, n: number): StoryState {
  const choice = visible(story, s)[n];
  if (s.status !== 'playing' || !choice) return s;
  return { ...arrive(story, choice.to, s.items, s.health === undefined ? undefined : s.health - (choice.cost ?? 0)), moves: s.moves + 1 };
}

export interface StoryCheck {
  ok: boolean;
  problems: string[];
  /** The fewest choices that win. */
  shortest: number;
}

/** Can it be played: every choice leads somewhere, no scene is a trap, every scene can be reached, and there is a way to win. */
export function checkStory(story: StoryGame): StoryCheck {
  const problems: string[] = [];
  const ids = Object.keys(story.scenes);
  if (!(story.start in story.scenes)) return { ok: false, problems: ['The start scene does not exist.'], shortest: Infinity };
  for (const id of ids) for (const c of story.scenes[id].choices) if (!(c.to in story.scenes)) problems.push(`${id}: a choice leads to ${c.to}, which does not exist.`);
  if (problems.length) return { ok: false, problems, shortest: Infinity };
  const key = (st: Pick<StoryState, 'at' | 'items' | 'health'>) => `${st.at}|${[...st.items].sort().join(',')}|${st.health ?? ''}`;
  const first = startStory(story);
  const seen = new Map([[key(first), 0]]);
  const queue: StoryState[] = [first];
  const reached = new Set([first.at]);
  let shortest = Infinity;
  for (let i = 0; i < queue.length; i++) {
    const st = queue[i];
    if (st.status === 'won') shortest = Math.min(shortest, st.moves);
    if (st.status === 'stuck') problems.push(`${st.at}: nothing to choose here with ${st.items.join(', ') || 'nothing in hand'}.`);
    if (st.status !== 'playing') continue;
    visible(story, st).forEach((_, n) => {
      const next = choose(story, st, n);
      reached.add(next.at);
      if (!seen.has(key(next))) (seen.set(key(next), next.moves), queue.push(next));
    });
  }
  for (const id of ids) if (!reached.has(id)) problems.push(`${id}: no way to get here.`);
  if (shortest === Infinity) problems.push('There is no way to win.');
  return { ok: problems.length === 0, problems, shortest };
}

/** Three stars for a win in a few more choices than the shortest, two for up to six more, one beyond. A story that was not won earns none. */
export const storyStars = (s: StoryState, shortest: number): number => (s.status !== 'won' ? 0 : s.moves <= shortest + 2 ? 3 : s.moves <= shortest + 6 ? 2 : 1);
