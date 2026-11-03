// Projects (6-21 G7, F0885 and F1222 to F1244): small chains across rooms. Each step opens the room that does it; the learner ticks it when it is done. Pure.
export type StepKind = 'read' | 'listen' | 'watch' | 'talk' | 'write' | 'translate' | 'compare' | 'type' | 'make' | 'deck' | 'review' | 'practice' | 'games';

/** Where each step is done, and whether it needs Max. */
export const STEPS: Record<StepKind, { label: string; to: string; max?: true }> = {
  read: { label: 'Read a text', to: '/codex' },
  listen: { label: 'Listen to a recording', to: '/sonus' },
  watch: { label: 'Watch a video', to: '/visio' },
  talk: { label: 'Talk about it', to: '/mentis/sermo' },
  write: { label: 'Write about it', to: '/mentis/diarium' },
  translate: { label: 'Translate it', to: '/thesaurus/translate' },
  compare: { label: 'Compare your translation with the model', to: '/thesaurus/translate' },
  type: { label: 'Type what you hear', to: '/sonus/words' },
  make: { label: 'Make it with Max', to: '/thesaurus/make', max: true },
  deck: { label: 'Make a deck of the words', to: '/thesaurus' },
  review: { label: 'Review the cards', to: '/thesaurus/study/all' },
  practice: { label: 'Practise it', to: '/thesaurus/practice' },
  games: { label: 'Play a game on the words', to: '/thesaurus/games' },
};

export interface ProjectTemplate {
  id: string;
  title: string;
  detail: string;
  steps: StepKind[];
  /** The project is about a topic the learner names. */
  topic?: true;
}

export const TEMPLATES: ProjectTemplate[] = [
  { id: 'read-talk-write', title: 'Read, talk, write', detail: 'Read a story, talk about it, write what you think of it.', steps: ['read', 'talk', 'write'] },
  { id: 'listen-sum', title: 'Listen and sum up', detail: 'Listen to something and sum it up aloud.', steps: ['listen', 'talk'] },
  { id: 'article-opinion', title: 'Article and opinion', detail: 'Read an article, then write your opinion of it.', steps: ['read', 'write'] },
  { id: 'video-argument', title: 'Watch and explain', detail: 'Watch a video and explain its main argument.', steps: ['watch', 'talk', 'write'] },
  { id: 'dialogue-recreate', title: 'Recreate a dialogue', detail: 'Listen to a dialogue, write it out, then say it again.', steps: ['listen', 'type', 'talk'] },
  { id: 'dialogue-roles', title: 'Play both parts', detail: 'Read a dialogue and perform both roles.', steps: ['read', 'talk'] },
  { id: 'idioms-story', title: 'Idioms in a story', detail: 'Learn some idioms, then use them in a story.', steps: ['make', 'deck', 'write'] },
  { id: 'translate-compare', title: 'Translate and compare', detail: 'Translate a passage, then compare it with the model.', steps: ['translate', 'compare'] },
  { id: 'transcript', title: 'Record and transcribe', detail: 'Listen to a recording and write a transcript of it.', steps: ['listen', 'type', 'write'] },
  { id: 'write-aloud', title: 'Write, then read aloud', detail: 'Write a paragraph, then read it aloud.', steps: ['write', 'talk'] },
  { id: 'spoken-transcribe', title: 'Say it, then write it', detail: 'Record a spoken answer, then write it out.', steps: ['talk', 'write'] },
  { id: 'debate', title: 'Debate after reading', detail: 'Read about an issue, then debate it.', steps: ['read', 'talk'] },
  { id: 'presentation', title: 'A presentation from a text', detail: 'Read a text, make a presentation of it, give it aloud.', steps: ['read', 'make', 'talk'] },
  { id: 'conversation-lesson', title: 'A conversation into a lesson', detail: 'Turn a conversation into a lesson of your own.', steps: ['talk', 'make', 'deck', 'review'] },
  { id: 'corrections-review', title: 'Corrections into practice', detail: 'Turn what was corrected in your writing into review exercises.', steps: ['write', 'practice', 'review'] },
  { id: 'story-new-words', title: 'A story with new words', detail: 'Write a short story with the words you learned lately.', steps: ['deck', 'write', 'review'] },
  { id: 'podcast-deck', title: 'A podcast into a deck', detail: 'Listen to a podcast, write what you heard, turn its words into a deck and review it.', steps: ['listen', 'type', 'deck', 'review'] },
  { id: 'podcast', title: 'Your own podcast', detail: 'Make a short podcast in the language.', steps: ['make', 'talk', 'listen'] },
  { id: 'week-topic', title: 'A week on one topic', detail: 'Read, listen, watch, write and talk about one topic for a week.', steps: ['read', 'listen', 'watch', 'write', 'talk', 'games'], topic: true },
];

export interface Project {
  id: string;
  template: string;
  topic?: string;
  startedAt: number;
  /** Positions of the steps that are done. */
  done: number[];
  /** What the chain is about: the text, the recording or the video the learner chose, which the steps after it open. */
  material?: { textId?: string; mediaId?: string; mediaKind?: 'audio' | 'video' };
  /** What the learner wrote or made at a step, by its position, which the steps after it show. */
  notes?: Record<number, string>;
}

/** The kinds of step that are done with a chosen text, recording or video. */
export const CHOOSES: Partial<Record<StepKind, 'text' | 'audio' | 'video'>> = { read: 'text', listen: 'audio', watch: 'video' };
/** The kinds of step that make something the next steps can use. */
export const MAKES: StepKind[] = ['write', 'talk', 'translate', 'compare', 'type', 'make'];

/** Where a step opens: the room, or the very text, recording or video the learner chose. */
export function stepTarget(p: Project, kind: StepKind): string {
  const m = p.material;
  if (kind === 'read' && m?.textId) return `/codex/read/${m.textId}`;
  if (kind === 'listen' && m?.mediaId && m.mediaKind === 'audio') return `/sonus/play/${m.mediaId}`;
  if (kind === 'watch' && m?.mediaId && m.mediaKind === 'video') return `/visio/watch/${m.mediaId}`;
  return STEPS[kind].to;
}

export const setNote = (p: Project, step: number, text: string): Project => ({ ...p, notes: { ...p.notes, [step]: text } });

/** What was made at the nearest step before this one, for the step to show. */
export function carried(p: Project, step: number): string | undefined {
  for (let i = step - 1; i >= 0; i--) if (p.notes?.[i]?.trim()) return p.notes[i];
  return undefined;
}

export const templateOf = (id: string): ProjectTemplate | undefined => TEMPLATES.find((t) => t.id === id);

export function startProject(template: ProjectTemplate, topic: string | undefined, now: number): Project {
  return { id: `${template.id}-${now.toString(36)}`, template: template.id, topic: template.topic ? topic?.trim() || undefined : undefined, startedAt: now, done: [] };
}

export const toggleStep = (p: Project, step: number): Project => ({ ...p, done: p.done.includes(step) ? p.done.filter((d) => d !== step) : [...p.done, step].sort((a, b) => a - b) });

/** Done steps of all, and whether the whole chain is finished. */
export function progress(p: Project): { done: number; of: number; finished: boolean } {
  const of = templateOf(p.template)?.steps.length ?? 0;
  const done = p.done.filter((d) => d < of).length;
  return { done, of, finished: of > 0 && done === of };
}
