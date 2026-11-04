// Where the onboarding map looks for a language (Lemora 3.3), from the countries' own geometry: the countries where it
// is official, regional or historical are grouped into regions (countries whose mainlands lie near each other), the
// region with the most weight is the main view, and the others are offered as alternatives. A language spoken on two
// sides of an ocean no longer gets one box across the water.
import type { Country } from '@/features/sonus/radio/sky';
import { placesOf } from '@/data/territories';
import type { PlaceStatus } from '@/data/territories';

export interface Box { x0: number; y0: number; x1: number; y1: number }
export interface Frame {
  box: Box;
  /** The country that weighs most in it: it names the region. */
  lead: string;
  countries: string[];
  weight: number;
}

const STATUS_WEIGHT: Partial<Record<PlaceStatus, number>> = { official: 1, regional: 0.4, historical: 0.2 };
/** How far apart two mainlands can lie and still be one region, in world units (about 20° of longitude). */
const GAP = 0.055;

const near = (a: Box, b: Box) => a.x0 - GAP <= b.x1 && b.x0 - GAP <= a.x1 && a.y0 - GAP <= b.y1 && b.y0 - GAP <= a.y1;

/** The main view and up to three alternatives, heaviest first; empty when the map doesn't know where the language is. */
export function framesOf(lang: string, countries: ReadonlyMap<string, Country>, maxAlternatives = 3): Frame[] {
  const seen = new Map<PlaceStatus, number>();
  const ranked = placesOf(lang)
    .filter((p) => STATUS_WEIGHT[p.status] !== undefined && countries.has(p.country))
    .map((p) => {
      // Places come ordered by speakers within a status: the first of each weighs most.
      const i = seen.get(p.status) ?? 0;
      seen.set(p.status, i + 1);
      return { code: p.country, weight: STATUS_WEIGHT[p.status]! / (1 + 0.1 * i) };
    });
  if (!ranked.length) return [];

  // Single linkage: a country joins every region it lies near.
  const group = ranked.map((_, i) => i);
  const root = (i: number): number => (group[i] === i ? i : (group[i] = root(group[i])));
  for (let i = 0; i < ranked.length; i++)
    for (let j = i + 1; j < ranked.length; j++) if (near(countries.get(ranked[i].code)!.main, countries.get(ranked[j].code)!.main)) group[root(j)] = root(i);

  const regions = new Map<number, Frame>();
  ranked.forEach((r, i) => {
    const { main } = countries.get(r.code)!;
    const at = root(i);
    const frame = regions.get(at);
    if (!frame) return void regions.set(at, { box: { ...main }, lead: r.code, countries: [r.code], weight: r.weight });
    frame.box = { x0: Math.min(frame.box.x0, main.x0), y0: Math.min(frame.box.y0, main.y0), x1: Math.max(frame.box.x1, main.x1), y1: Math.max(frame.box.y1, main.y1) };
    frame.countries.push(r.code);
    frame.weight += r.weight;
  });
  return [...regions.values()].sort((a, b) => b.weight - a.weight).slice(0, 1 + maxAlternatives);
}
