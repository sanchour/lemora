import { describe, expect, it } from 'vitest';
import { feedOrder } from './ExploraFeed';
import type { ExploraItem } from './types';

const item = (id: string, level: ExploraItem['level']): ExploraItem => ({ id, kind: 'books', title: id, level });

describe('feedOrder', () => {
  it('puts what is nearest the learner’s level first', () => {
    const out = feedOrder([item('d', 'C1'), item('c', 'B2'), item('b', 'B1')], 'B1', () => 0);
    expect(out.map((i) => i.id)).toEqual(['b', 'c', 'd']);
  });
  it('lists each item once and keeps them all', () => {
    const out = feedOrder([item('x', 'A2'), item('x', 'A2'), item('y', 'B2')], 'A2');
    expect(out.map((i) => i.id).sort()).toEqual(['x', 'y']);
  });
});
