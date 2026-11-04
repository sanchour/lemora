import { describe, expect, it } from 'vitest';
import { comicCover, comicEpisode, comicEpisodes, comicPage } from './peppercarrot';

describe('Pepper&Carrot', () => {
  it('lists the episodes in a language, with the site’s own codes', () => {
    const es = comicEpisodes('es');
    expect(es[0]).toMatchObject({ id: 'ep01_Potion-of-Flight', number: 1, title: 'Potion of Flight', pages: 5 });
    expect(comicEpisodes('zh').length).toBeGreaterThan(0);
    expect(comicEpisodes('xx')).toEqual([]);
  });

  it('builds the page and cover addresses the site uses', () => {
    const ep = comicEpisode('ep01_Potion-of-Flight')!;
    expect(comicPage('ru', ep, 0)).toBe('https://www.peppercarrot.com/0_sources/ep01_Potion-of-Flight/low-res/ru_Pepper-and-Carrot_by-David-Revoy_E01P00.jpg');
    expect(comicCover('zh', ep)).toContain('/cn_Pepper-and-Carrot_by-David-Revoy_E01.jpg');
  });
});
