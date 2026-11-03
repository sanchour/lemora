// Mini tournaments (6-21, F0190): three of the quick word games in a row with one score, against your own last one. Local only, nobody else plays. Pure.
import { seededRandom } from '@/core/srs/ludus';

/** The games a tournament draws from: quick, on the learner's own words. */
export const TOURNAMENT_GAMES = ['hangman', 'anagram', 'missing', 'clues', 'definition', 'odd', 'memory'];

/** Three of the games that can be played, in a random order. */
export function drawTournament(playable: string[], seed: number, count = 3): string[] {
  const pool = TOURNAMENT_GAMES.filter((g) => playable.includes(g));
  const random = seededRandom(seed);
  return [...pool].sort(() => random() - 0.5).slice(0, count);
}

export interface TournamentRecord {
  best: number;
  last: number;
  plays: number;
}

/** The record after a tournament, and whether it beat the last one (the ghost) and the best. */
export function afterTournament(old: TournamentRecord | undefined, total: number): { record: TournamentRecord; beatLast: boolean; beatBest: boolean } {
  return { record: { best: Math.max(old?.best ?? 0, total), last: total, plays: (old?.plays ?? 0) + 1 }, beatLast: !!old && total > old.last, beatBest: !!old && total > old.best };
}
