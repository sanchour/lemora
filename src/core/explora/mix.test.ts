import { describe, expect, it } from 'vitest';
import { mixByKind } from './mix';

const item = (id: string, kind: string, level: string) => ({ id, kind, level });

describe('mixByKind', () => {
  it('takes one of each kind in turn, the closest level first', () => {
    const out = mixByKind([item('b1', 'books', 'A1'), item('b2', 'books', 'B2'), item('c1', 'comic', 'B2'), item('t1', 'tip', 'C1')], 'B2', 4);
    expect(out.map((i) => i.id)).toEqual(['b2', 'c1', 't1', 'b1']);
  });
  it('stops at the count and skips what it is told to', () => {
    const out = mixByKind([item('a', 'books', 'B2'), item('b', 'books', 'B2'), item('c', 'comic', 'B2')], 'B2', 2, (i) => i.id === 'a');
    expect(out.map((i) => i.id)).toEqual(['b', 'c']);
  });
});
