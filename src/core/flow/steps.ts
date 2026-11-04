// What comes first, by level (Lemora U1): one rule for Home's What next and Explora's picks, so a complete beginner
// is handed the alphabet (when the letters are new), a tiny first book and a small starter deck, and a reader at B2
// is handed their book, their reviews and something new to read. Nothing is hidden; the order changes.
import { FREQUENCY_MILESTONES } from '@/core/lang/starter';
import type { Level } from '@/core/lang/levels';
import type { ScriptKnowledge } from '@/data/types';

export type FlowStep = 'alphabet' | 'first-book' | 'starter-deck' | 'continue' | 'review' | 'ludus' | 'write' | 'read' | 'import' | 'try';

export interface FlowInput {
  level: Level;
  /** Whether the language is written in something other than Latin letters, and whether the learner can read it. */
  nonLatin: boolean;
  script?: ScriptKnowledge;
  /** Cards due now (and new ones waiting). */
  due: number;
  hasDecks: boolean;
  /** A book or text already started and not finished. */
  reading: boolean;
  /** What was already done today: it moves down, it doesn't disappear. */
  did: Partial<Record<'read' | 'review' | 'write' | 'ludus' | 'alphabet', boolean>>;
}

const STAGE: Record<Level, number> = { A0: 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
const DONE: Array<[FlowStep, keyof FlowInput['did']]> = [['continue', 'read'], ['first-book', 'read'], ['read', 'read'], ['review', 'review'], ['write', 'write'], ['ludus', 'ludus'], ['alphabet', 'alphabet']];

/** Every step that fits, best first. */
export function flowSteps(input: FlowInput): FlowStep[] {
  const stage = STAGE[input.level];
  const score = new Map<FlowStep, number>();
  const add = (step: FlowStep, n: number) => score.set(step, (score.get(step) ?? 0) + n);

  // Letters before words, when they're new.
  if (input.nonLatin) add('alphabet', input.script === 'new' ? 100 : input.script === 'some' ? 62 : stage <= 1 && !input.script ? 30 : 8);
  // A started book first; a beginner without one gets the tiniest book; others something new to read.
  if (input.reading) add('continue', 82);
  else if (stage <= 1) add('first-book', 76);
  else add('read', 58);
  // A small deck to begin with, when there is none yet.
  if (!input.hasDecks) add('starter-deck', stage <= 1 ? 84 : 42);
  if (input.due > 0) add('review', 50 + Math.min(40, input.due));
  if (input.hasDecks) add('ludus', stage <= 1 ? 36 : 26);
  add('write', stage === 0 ? 6 : stage === 1 ? 30 : 44);
  if (stage >= 3) add('import', 46);
  else if (input.reading || stage >= 2) add('read', 20);
  add('try', stage === 0 ? 12 : 24);
  for (const [step, done] of DONE) if (input.did[done] && score.has(step)) add(step, -48);
  return [...score].sort((a, b) => b[1] - a[1]).map(([step]) => step);
}

/** The starter deck that fits: everyday basics for a beginner, else the next frequency band above what is already known. */
export function starterFor(level: Level, knownTopN: number): { kind: 'theme'; id: 'basics' } | { kind: 'frequency'; milestone: number } {
  if (STAGE[level] <= 1) return { kind: 'theme', id: 'basics' };
  const next = FREQUENCY_MILESTONES.find((m) => m > knownTopN) ?? FREQUENCY_MILESTONES.at(-1)!;
  return { kind: 'frequency', milestone: next };
}
