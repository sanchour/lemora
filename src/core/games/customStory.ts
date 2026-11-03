// Custom games (6-21, F1220): a story written by the learner in a plain text format, read into the same `StoryGame` the ready-made and Max-made ones are. Pure.
import type { StoryChoice, StoryGame, StoryScene } from './story';

export const SAMPLE = `title: The locked room
start: room
items: key = the key; note = the note

[room]
You are in a small room. There is a desk and a door.
> Look at the desk -> desk
> Open the door with the key -> win | needs: key

[desk] gives: key
On the desk there is a small key.
> Go back -> room

[win] end: win
The door opens. You are free!
`;

/** An error is a message with the words to put in it, so the screen can say it in the learner's language. */
export type ParseError = [message: string, ...values: string[]];

export function parseStory(source: string, id: string): { story?: StoryGame; errors: ParseError[] } {
  const errors: ParseError[] = [];
  const head: Record<string, string> = {};
  const scenes: Record<string, StoryScene> = {};
  let current: { id: string; text: string[]; scene: StoryScene } | null = null;
  const close = () => {
    if (!current) return;
    current.scene.text = current.text.join(' ').trim();
    if (!current.scene.text) errors.push(['A scene needs some text: {0}', current.id]);
    scenes[current.id] = current.scene;
    current = null;
  };
  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const sceneHead = /^\[([\w-]+)\](.*)$/.exec(line);
    if (sceneHead) {
      close();
      const scene: StoryScene = { text: '', choices: [] };
      const gives = /gives:\s*([\w-]+)/.exec(sceneHead[2]);
      const end = /end:\s*(win|lose)/.exec(sceneHead[2]);
      if (gives) scene.gives = gives[1];
      if (end) scene.end = end[1] as 'win' | 'lose';
      current = { id: sceneHead[1], text: [], scene };
    } else if (line.startsWith('>')) {
      const m = /^>\s*(.+?)\s*->\s*([\w-]+)\s*(.*)$/.exec(line);
      if (!current) errors.push(['A choice must come after a scene: {0}', line]);
      else if (!m) errors.push(['This choice is not written as > words -> scene: {0}', line]);
      else {
        const choice: StoryChoice = { label: m[1], to: m[2] };
        const needs = /needs:\s*([\w-]+)/.exec(m[3]);
        const cost = /cost:\s*(\d+)/.exec(m[3]);
        if (needs) choice.needs = needs[1];
        if (cost) choice.cost = Number(cost[1]);
        current.scene.choices.push(choice);
      }
    } else if (!current) {
      const kv = /^(\w+):\s*(.*)$/.exec(line);
      if (kv) head[kv[1]] = kv[2];
      else errors.push(['This line is not a scene, a choice or text: {0}', line]);
    } else current.text.push(line);
  }
  close();
  if (!head.title) errors.push(['The story needs a title: title: …']);
  if (!Object.keys(scenes).length) errors.push(['Add at least one scene, written [name].']);
  const start = head.start ?? Object.keys(scenes)[0];
  if (start && !(start in scenes)) errors.push(['The start scene does not exist: {0}', start]);
  if (errors.length) return { errors };
  const items = Object.fromEntries((head.items ?? '').split(';').flatMap((p) => { const [k, v] = p.split('='); return k?.trim() && v?.trim() ? [[k.trim(), v.trim()]] : []; }));
  return { errors, story: { id, title: head.title, level: head.level, start, ...(head.health ? { health: Number(head.health) } : {}), items, scenes } };
}
