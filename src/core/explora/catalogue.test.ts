import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CATALOGUE_LANGS, COLLECTIONS, byLevelCloseness, itemOfTheDay } from './catalogue';
import type { Catalogue, CatalogueItem } from './catalogue';
import { PROVERBS } from './proverbs';

const load = (lang: string) => JSON.parse(readFileSync(new URL(`./data/${lang}.json`, import.meta.url), 'utf8')) as Catalogue;

describe.each(CATALOGUE_LANGS)('the %s catalogue', (lang) => {
  const { items } = load(lang);
  const count = (kind: CatalogueItem['kind']) => items.filter((i) => i.kind === kind).length;
  it('has enough of every kind for Explora’s shelves', () => {
    expect(count('classic')).toBeGreaterThanOrEqual(8);
    expect(count('short')).toBeGreaterThanOrEqual(10);
    expect(count('picture')).toBeGreaterThanOrEqual(8);
  });
  it('lists each item once, with a source, a title and a level', () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    for (const i of items) {
      expect(i.title.length).toBeGreaterThan(0);
      expect(['A1', 'A2', 'B1', 'B2', 'C1']).toContain(i.level);
      expect(i.from.type).toBeTruthy();
    }
  });
  it('keeps picture books to StoryWeaver (credited) and short reads to Wikisource', () => {
    for (const i of items) {
      if (i.kind === 'picture') expect(i.from.type).toBe('storyweaver');
      if (i.kind === 'short') expect(i.from.type).toBe('wikisource');
      if (i.kind === 'short') expect(i.minutes).toBeGreaterThan(0);
    }
  });
  it('fills most collections', () => {
    expect(COLLECTIONS.filter((c) => items.filter(c.pick).length >= 3).length).toBeGreaterThanOrEqual(3);
  });
  it('has a poem and a saying for the daily cards', () => {
    expect(items.some((i) => i.genre === 'poem')).toBe(true);
    expect((PROVERBS[lang] ?? []).length).toBeGreaterThanOrEqual(5);
  });
});

describe('picking', () => {
  it('gives the same item all day and a different one on another day', () => {
    const list = Array.from({ length: 50 }, (_, i) => i);
    const noon = Date.UTC(2026, 10, 5, 12);
    expect(itemOfTheDay(list, 'x', noon)).toBe(itemOfTheDay(list, 'x', noon + 3_600_000));
    expect(new Set([0, 1, 2, 3, 4, 5].map((d) => itemOfTheDay(list, 'x', noon + d * 86_400_000))).size).toBeGreaterThan(1);
  });
  it('orders by closeness to the learner', () => {
    const item = (id: string, level: CatalogueItem['level']): CatalogueItem => ({ id, kind: 'short', title: id, level, from: { type: 'wikisource', title: id } });
    expect(byLevelCloseness([item('c', 'C1'), item('a', 'A1'), item('b', 'B1')], 'B1').map((i) => i.id)[0]).toBe('b');
  });
});
