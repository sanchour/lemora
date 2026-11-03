import { describe, expect, it } from 'vitest';
import { shows } from '@/product';
import { tipsFor } from './tips';

describe('Things to try', () => {
  it('offers no challenge about a room this build lacks, and no link into one', () => {
    for (const lang of ['es', 'ru', 'fr', 'zh', 'it']) {
      for (const tip of tipsFor(lang)) {
        const to = tip.action?.to ?? '';
        if (!shows('cantus')) expect(['song', 'spotify']).not.toContain(tip.icon);
        if (!shows('visio')) expect(tip.icon).not.toBe('film');
        if (!shows('sonus')) expect(tip.icon).not.toBe('radio');
        for (const room of ['sonus', 'cantus', 'visio'] as const) if (!shows(room)) expect(to).not.toMatch(new RegExp(`^/${room}\\b`));
        if (!shows('mundus')) expect(to).not.toMatch(/^\/mentis(?:$|\?)/);
      }
    }
  });

  it('keeps a challenge whose link it drops, and the links into rooms it has', () => {
    const tips = tipsFor('es');
    expect(tips.find((t) => t.id === 'game')).toBeDefined();
    expect(tips.find((t) => t.id === 'one-line')?.action?.to).toBe('/mentis/diarium');
    expect(tips.find((t) => t.id === 'headlines')?.action?.to).toBe('/codex/new?way=news');
  });
});
