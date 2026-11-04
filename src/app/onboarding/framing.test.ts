import { describe, expect, it } from 'vitest';
import { decodeCountries } from '@/features/sonus/radio/sky';
import { WORLD_MAP } from '@/features/sonus/radio/worldMap';
import { framesOf } from './framing';

const countries = new Map(decodeCountries(WORLD_MAP).map((c) => [c.code, c]));

describe('where the map looks for a language (Lemora 3.3)', () => {
  it('splits a language spoken on two continents into a main view and alternatives', () => {
    const es = framesOf('es', countries);
    expect(es.length).toBeGreaterThan(1);
    // Latin America is the main view; Spain, across the Atlantic, is an alternative with its own box.
    expect(es[0].countries).toContain('MX');
    expect(es[0].countries).not.toContain('ES');
    expect(es.slice(1).some((f) => f.countries.includes('ES'))).toBe(true);
    const spain = es.find((f) => f.countries.includes('ES'))!;
    expect(spain.box.x1 - spain.box.x0).toBeLessThan(es[0].box.x1 - es[0].box.x0);
  });

  it('gives a language in one region just that region', () => {
    const ja = framesOf('ja', countries);
    expect(ja).toHaveLength(1);
    expect(ja[0].lead).toBe('JP');
  });

  it('never offers more than three alternatives, heaviest first', () => {
    const en = framesOf('en', countries);
    expect(en.length).toBeLessThanOrEqual(4);
    expect(en.every((f, i) => i === 0 || f.weight <= en[i - 1].weight)).toBe(true);
  });

  it('is empty for a language the map has no places for', () => {
    expect(framesOf('xx', countries)).toEqual([]);
  });
});
