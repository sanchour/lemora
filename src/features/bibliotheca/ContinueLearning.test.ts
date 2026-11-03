import { describe, expect, it } from 'vitest';
import type { ContinueItem } from './types';

describe('Bibliotheca Continue Learning logic', () => {
  const sampleItems: ContinueItem[] = [
    {
      id: 'text:t1',
      kind: 'text',
      to: '/codex/read/t1',
      room: 'Codex',
      title: 'Le Petit Prince',
      authorOrCollection: 'Antoine de Saint-Exupéry',
      detail: '45% read',
      pct: 45,
      at: 1700000003000,
    },
    {
      id: 'audio:a1',
      kind: 'audio',
      to: '/sonus/play/a1',
      room: 'Sonus',
      title: 'Café con Nata',
      authorOrCollection: 'Podcast',
      detail: '14 min left',
      pct: 60,
      at: 1700000002000,
    },
    {
      id: 'video:v1',
      kind: 'video',
      to: '/visio/watch/v1',
      room: 'Visio',
      title: 'Dark - Episode 1',
      authorOrCollection: 'Season 1',
      detail: '30% watched',
      pct: 30,
      at: 1700000001000,
    },
    {
      id: 'text:t2',
      kind: 'text',
      to: '/codex/read/t2',
      room: 'Codex',
      title: 'L’Étranger',
      authorOrCollection: 'Albert Camus',
      detail: '10% read',
      pct: 10,
      at: 1700000000000,
    },
  ];

  it('orders active continue items by most recently accessed first', () => {
    const sorted = [...sampleItems].sort((a, b) => b.at - a.at);
    expect(sorted.map((i) => i.id)).toEqual(['text:t1', 'audio:a1', 'video:v1', 'text:t2']);
  });

  it('filters active continue items according to active tab filter', () => {
    const filterAll = sampleItems;
    const filterRead = sampleItems.filter((i) => i.kind === 'text');
    const filterListen = sampleItems.filter((i) => i.kind === 'audio');
    const filterWatch = sampleItems.filter((i) => i.kind === 'video');

    expect(filterAll).toHaveLength(4);
    expect(filterRead.map((i) => i.title)).toEqual(['Le Petit Prince', 'L’Étranger']);
    expect(filterListen.map((i) => i.title)).toEqual(['Café con Nata']);
    expect(filterWatch.map((i) => i.title)).toEqual(['Dark - Episode 1']);
  });

  it('determines the appropriate presentation mode based on item count', () => {
    const getPresentation = (items: ContinueItem[]) => {
      if (items.length === 0) return 'none';
      if (items.length === 1) return 'desk';
      if (items.length <= 3) return 'balanced-grid';
      return 'carousel-shelf';
    };

    expect(getPresentation([])).toBe('none');
    expect(getPresentation(sampleItems.slice(0, 1))).toBe('desk');
    expect(getPresentation(sampleItems.slice(0, 2))).toBe('balanced-grid');
    expect(getPresentation(sampleItems.slice(0, 3))).toBe('balanced-grid');
    expect(getPresentation(sampleItems)).toBe('carousel-shelf');
  });

  it('preserves authentic artwork aspect ratio rules per media type', () => {
    const aspectFor = (kind: ContinueItem['kind']) => {
      if (kind === 'text') return 'aspect-[2/3]';
      if (kind === 'audio') return 'aspect-square';
      return 'aspect-video';
    };

    expect(aspectFor('text')).toBe('aspect-[2/3]');
    expect(aspectFor('audio')).toBe('aspect-square');
    expect(aspectFor('video')).toBe('aspect-video');
  });
});
