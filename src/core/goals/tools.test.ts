import { describe, expect, it } from 'vitest';
import { progressOf, toolOf, toolTime } from './tools';
import type { TimedSession } from './tools';

const MIN = 60_000;
const at = (h: number, m = 0) => new Date(2026, 10, 3, h, m).getTime();
const s = (type: TimedSession['type'], from: number, to: number, activeMin: number, refId?: string): TimedSession => ({ type, refId, startedAt: from, endedAt: to, activeMs: activeMin * MIN });

describe('time per tool', () => {
  it('gives each session to one tool', () => {
    expect(toolOf({ type: 'read' })).toBe('codex');
    expect(toolOf({ type: 'review' })).toBe('thesaurus');
    expect(toolOf({ type: 'ludus', refId: 'text-1' })).toBe('ludus'); // a reading check after a chapter
    expect(toolOf({ type: 'write' })).toBe('diarium');
    expect(toolOf({ type: 'grammar', refId: 'letters:cyrillic-1' })).toBe('alphabet');
    expect(toolOf({ type: 'grammar', refId: 'es-ser-estar' })).toBe('grammatica');
  });

  it('adds up a day, and the overall time is the tools together', () => {
    const day = toolTime([s('read', at(8), at(8, 20), 15), s('review', at(12), at(12, 10), 8), s('grammar', at(18), at(18, 6), 5, 'letters:a')]);
    expect(day.byTool.codex).toBe(15 * MIN);
    expect(day.byTool.thesaurus).toBe(8 * MIN);
    expect(day.byTool.alphabet).toBe(5 * MIN);
    expect(day.total).toBe(28 * MIN);
  });

  it('never counts the same minutes twice when two windows overlap', () => {
    // The same book open in two tabs for the same ten minutes, both counting.
    const twoTabs = toolTime([s('read', at(9), at(9, 10), 10), s('read', at(9), at(9, 10), 10)]);
    expect(twoTabs.byTool.codex).toBe(10 * MIN);
    // Reading and Ludus over the same quarter of an hour: each keeps its own, the day keeps the clock.
    const shared = toolTime([s('read', at(9), at(9, 15), 15), s('ludus', at(9), at(9, 15), 15)]);
    expect(shared.byTool.codex).toBe(15 * MIN);
    expect(shared.byTool.ludus).toBe(15 * MIN);
    expect(shared.total).toBe(15 * MIN);
  });

  it('keeps idle time out: active time counts, not the time a window was open', () => {
    expect(toolTime([s('read', at(9), at(10), 12)]).total).toBe(12 * MIN);
  });

  it('counts a session across midnight whole, on the day it ended', () => {
    const late = toolTime([s('write', at(23, 50), at(24, 10), 18)]);
    expect(late.byTool.diarium).toBe(18 * MIN);
  });

  it('shows progress only for a goal that is on', () => {
    expect(progressOf(5 * MIN, 10)).toBe(0.5);
    expect(progressOf(25 * MIN, 10)).toBe(1);
    expect(progressOf(5 * MIN, 0)).toBeUndefined();
    expect(progressOf(5 * MIN, undefined)).toBeUndefined();
  });
});
