import { describe, expect, it } from 'vitest';
import { pickWeighted } from './pick';

const items = [
  { id: 'a', room: 'X', weight: 5 },
  { id: 'b', room: 'X', weight: 5 },
  { id: 'c', room: 'Y', weight: 1 },
  { id: 'd', room: 'Z', weight: 1 },
];

describe('pickWeighted', () => {
  it('is the same for the same seed and draws each item once', () => {
    const one = pickWeighted(items, 4, 7).map((i) => i.id);
    expect(pickWeighted(items, 4, 7).map((i) => i.id)).toEqual(one);
    expect([...one].sort()).toEqual(['a', 'b', 'c', 'd']);
  });
  it('draws every room once before repeating one', () => {
    for (let seed = 1; seed < 20; seed++) expect(new Set(pickWeighted(items, 3, seed).map((i) => i.room)).size).toBe(3);
  });
  it('gives back fewer when there are fewer', () => {
    expect(pickWeighted(items.slice(0, 2), 5, 1)).toHaveLength(2);
  });
});
