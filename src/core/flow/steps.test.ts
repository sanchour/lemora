import { describe, expect, it } from 'vitest';
import { flowSteps, starterFor } from './steps';

const base = { nonLatin: false, due: 0, hasDecks: false, reading: false, did: {} };

describe('what comes first, by level', () => {
  it('gives a complete beginner the tiniest book and a small deck, and no importing', () => {
    const steps = flowSteps({ ...base, level: 'A0' });
    expect(steps.slice(0, 2)).toEqual(['starter-deck', 'first-book']);
    expect(steps).not.toContain('import');
    expect(steps.indexOf('write')).toBeGreaterThan(steps.indexOf('try'));
  });

  it('puts the alphabet first when the letters are new, and lower once they can be read', () => {
    expect(flowSteps({ ...base, level: 'A0', nonLatin: true, script: 'new' })[0]).toBe('alphabet');
    const reads = flowSteps({ ...base, level: 'A0', nonLatin: true, script: 'reads' });
    expect(reads.indexOf('alphabet')).toBeGreaterThan(2);
    expect(flowSteps({ ...base, level: 'A1' })).not.toContain('alphabet');
  });

  it('gives a reader their book, their reviews and something new', () => {
    const steps = flowSteps({ ...base, level: 'B2', hasDecks: true, reading: true, due: 30 });
    expect(steps.slice(0, 2)).toEqual(['continue', 'review']);
    expect(steps).toContain('import');
    expect(steps).not.toContain('first-book');
  });

  it('moves what was done today down without dropping it', () => {
    const fresh = flowSteps({ ...base, level: 'A2', hasDecks: true, due: 20 });
    const done = flowSteps({ ...base, level: 'A2', hasDecks: true, due: 20, did: { review: true } });
    expect(done.indexOf('review')).toBeGreaterThan(fresh.indexOf('review'));
    expect(done).toContain('review');
  });

  it('starts a beginner on everyday basics, others on the next band above what they know', () => {
    expect(starterFor('A0', 0)).toEqual({ kind: 'theme', id: 'basics' });
    expect(starterFor('B1', 1000)).toEqual({ kind: 'frequency', milestone: 2000 });
  });
});
