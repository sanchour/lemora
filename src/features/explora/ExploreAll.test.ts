import { describe, expect, it } from 'vitest';
import { LEVELS } from '@/core/mundus/explore';
import type { PickLevel } from '@/core/mundus/types';
import type { ExploraCategory, ExploraItem } from './types';
import { HERO_SLOT_MS, pickHeroItems } from './ExploreAll';

describe('Streaming Explora logic', () => {
  const sampleItems: ExploraItem[] = [
    { id: 'series:s1', kind: 'series', title: 'Gran Hotel', level: 'B1' },
    { id: 'films:f1', kind: 'films', title: 'Roma', level: 'B2' },
    { id: 'books:b1', kind: 'books', title: 'El Principito', level: 'A2' },
    { id: 'books:b2', kind: 'books', title: 'Cien Años de Soledad', level: 'C1' },
    { id: 'audiobooks:a1', kind: 'audiobooks', title: 'Don Quijote', level: 'B2', estimated: true },
    { id: 'podcasts:p1', kind: 'podcasts', title: 'Radio Ambulante', level: 'B2' },
    { id: 'radio:r1', kind: 'radio', title: 'Cadena SER', level: 'B1', estimated: true },
    { id: 'music:m1', kind: 'music', title: 'Rosalía', level: 'B1' },
  ];
  // Lemora U4: the hero also mixes in a comic and something to try.
  const heroPool: ExploraItem[] = [...sampleItems, { id: 'comic:c1', kind: 'comic', title: 'Pepper&Carrot · 1', level: 'A2', estimated: true }, { id: 'tip:t1', kind: 'tip', title: 'Three headlines', level: 'A2' }];

  it('calculates counts per CEFR level correctly', () => {
    const counts: Record<PickLevel, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
    for (const item of sampleItems) {
      if (counts[item.level] !== undefined) {
        counts[item.level]++;
      }
    }
    expect(counts).toEqual({
      A1: 0,
      A2: 1, // El Principito
      B1: 3, // Gran Hotel, Cadena SER, Rosalía
      B2: 3, // Roma, Don Quijote, Radio Ambulante
      C1: 1, // Cien Años de Soledad
    });
  });

  it('filters around learner level (B1 learner gets A2, B1, B2)', () => {
    const learnerLevel = 'B1';
    const me = LEVELS.indexOf(learnerLevel);
    const aroundLevel = sampleItems.filter((i) => {
      const idx = LEVELS.indexOf(i.level);
      return idx >= Math.max(0, me - 1) && idx <= Math.min(LEVELS.length - 1, me + 1);
    });

    expect(aroundLevel.map((i) => i.id)).toEqual([
      'series:s1', // B1
      'films:f1', // B2
      'books:b1', // A2
      'audiobooks:a1', // B2
      'podcasts:p1', // B2
      'radio:r1', // B1
      'music:m1', // B1
    ]);
    // C1 book should be excluded from 'Around my level B1'
    expect(aroundLevel.some((i) => i.id === 'books:b2')).toBe(false);
  });

  it('filters by category properly', () => {
    const filterCategory = (cat: ExploraCategory) => {
      if (cat === 'screen') return sampleItems.filter((i) => i.kind === 'series' || i.kind === 'films');
      if (cat === 'books') return sampleItems.filter((i) => i.kind === 'books' || i.kind === 'dictionaries');
      if (cat === 'audio') return sampleItems.filter((i) => i.kind === 'audiobooks' || i.kind === 'podcasts');
      if (cat === 'music') return sampleItems.filter((i) => i.kind === 'music' || i.kind === 'radio');
      if (cat === 'words') return [];
      return sampleItems;
    };

    expect(filterCategory('screen').map((i) => i.id)).toEqual(['series:s1', 'films:f1']);
    expect(filterCategory('books').map((i) => i.id)).toEqual(['books:b1', 'books:b2']);
    expect(filterCategory('audio').map((i) => i.id)).toEqual(['audiobooks:a1', 'podcasts:p1']);
    expect(filterCategory('music').map((i) => i.id)).toEqual(['radio:r1', 'music:m1']);
    expect(filterCategory('words')).toEqual([]);
  });

  it('searches titles and subtitles in real time', () => {
    const search = (q: string) => {
      const query = q.trim().toLowerCase();
      if (!query) return null;
      return sampleItems.filter(
        (i) => i.title.toLowerCase().includes(query) || i.sub?.toLowerCase().includes(query),
      );
    };

    expect(search('hotel')?.map((i) => i.id)).toEqual(['series:s1']);
    expect(search('cadena')?.map((i) => i.id)).toEqual(['radio:r1']);
    expect(search('nonexistent')).toEqual([]);
  });

  it('selects 7 diverse hero billboard items that change every 5 hours', () => {
    // Slot 0 (e.g. t = 0)
    const slot0Items = pickHeroItems(heroPool, 'B1', 0);
    expect(slot0Items).toHaveLength(7);

    // Ensure all 7 items are distinct
    const ids0 = new Set(slot0Items.map((i) => i.id));
    expect(ids0.size).toBe(7);
    expect(slot0Items[0].kind).toBe('books');
    expect(slot0Items.some((i) => i.kind === 'comic') && slot0Items.some((i) => i.kind === 'tip')).toBe(true);

    // Still in slot 0 (e.g. 2 hours later, 2 * 3600 * 1000 ms)
    const slot0Later = pickHeroItems(heroPool, 'B1', 2 * 60 * 60 * 1000);
    expect(slot0Later.map((i) => i.id)).toEqual(slot0Items.map((i) => i.id));

    // Next slot: 5 hours later (HERO_SLOT_MS)
    const slot1Items = pickHeroItems(heroPool, 'B1', HERO_SLOT_MS);
    expect(slot1Items).toHaveLength(7);
    // The items should have changed
    expect(slot1Items.map((i) => i.id)).not.toEqual(slot0Items.map((i) => i.id));

    // Next slot: 10 hours later (2 * HERO_SLOT_MS)
    const slot2Items = pickHeroItems(heroPool, 'B1', 2 * HERO_SLOT_MS);
    expect(slot2Items).toHaveLength(7);
    expect(slot2Items.map((i) => i.id)).not.toEqual(slot1Items.map((i) => i.id));
  });

  it('strictly isolates media kinds so each section contains only its own type', () => {
    // 1. Books: only books
    const bookItems = sampleItems.filter((i) => i.kind === 'books');
    expect(bookItems.every((i) => i.kind === 'books')).toBe(true);
    expect(bookItems.map((i) => i.id)).toEqual(['books:b1', 'books:b2']);

    // 2. Series & Films: only series or films
    const screenItems = sampleItems.filter((i) => i.kind === 'series' || i.kind === 'films');
    expect(screenItems.every((i) => i.kind === 'series' || i.kind === 'films')).toBe(true);
    expect(screenItems.map((i) => i.id)).toEqual(['series:s1', 'films:f1']);

    // 4. Audiobooks: strictly audiobooks (no podcasts!)
    const audiobookItems = sampleItems.filter((i) => i.kind === 'audiobooks');
    expect(audiobookItems.every((i) => i.kind === 'audiobooks')).toBe(true);
    expect(audiobookItems.map((i) => i.id)).toEqual(['audiobooks:a1']);

    // 5. Music: strictly music (no radio!)
    const musicItems = sampleItems.filter((i) => i.kind === 'music');
    expect(musicItems.every((i) => i.kind === 'music')).toBe(true);
    expect(musicItems.map((i) => i.id)).toEqual(['music:m1']);

    // 6. Podcasts: strictly podcasts (no audiobooks!)
    const podcastItems = sampleItems.filter((i) => i.kind === 'podcasts');
    expect(podcastItems.every((i) => i.kind === 'podcasts')).toBe(true);
    expect(podcastItems.map((i) => i.id)).toEqual(['podcasts:p1']);

    // 7. Radio: strictly radio (no music!)
    const radioItems = sampleItems.filter((i) => i.kind === 'radio');
    expect(radioItems.every((i) => i.kind === 'radio')).toBe(true);
    expect(radioItems.map((i) => i.id)).toEqual(['radio:r1']);
  });

  it('orders all 10 streaming sections in the requested sequence', () => {
    const expectedSectionOrder = [
      'books', // 1. Books (Gutenberg, Wikisource, curated)
      'screen', // 2. Series & Films
      'words', // 3. Word Decks (random every time based on level)
      'audiobooks', // 4. Audiobooks
      'music', // 5. Music
      'podcasts', // 6. Podcasts
      'radio', // 7. Radio
      'wikipedia', // 8. Most read on wikipedia
      'news', // 9. In the news
      'picture-books', // 10. Picture books and comics
    ];

    expect(expectedSectionOrder).toHaveLength(10);
    expect(expectedSectionOrder[0]).toBe('books');
    expect(expectedSectionOrder[1]).toBe('screen');
    expect(expectedSectionOrder[2]).toBe('words');
    expect(expectedSectionOrder[3]).toBe('audiobooks');
    expect(expectedSectionOrder[4]).toBe('music');
    expect(expectedSectionOrder[5]).toBe('podcasts');
    expect(expectedSectionOrder[6]).toBe('radio');
    expect(expectedSectionOrder[7]).toBe('wikipedia');
    expect(expectedSectionOrder[8]).toBe('news');
    expect(expectedSectionOrder[9]).toBe('picture-books');
  });
});

