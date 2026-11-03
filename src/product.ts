// What differs between Lemora and Lingua. Every other shared file stays the same in both apps, so a
// change can move between them with git (docs/LINGUA-REINTEGRATION.md). In Lingua this file says 'lingua'.
export const PRODUCT = {
  id: 'lemora',
  name: 'Lemora',
  /** The IndexedDB database. Both apps can be served from one origin (sanchour.github.io), so each needs its own. */
  db: 'lemora',
  /** Starts every localStorage key and Cache Storage name, so neither app reads or erases the other's. */
  prefix: 'lemora',
} as const;

/** Every room and tab a build can have. Lingua's rooms are Cursus, Sonus, Cantus, Visio, Mentis…; diarium, try and alphabet are rooms only in Lemora. */
export type Feature =
  | 'home' | 'explora' | 'bibliotheca' | 'codex' | 'thesaurus' | 'ludus' | 'ratio' | 'ordo'
  | 'cursus' | 'course' | 'grammatica' | 'sounds' | 'typing' | 'alphabet'
  | 'sonus' | 'visio' | 'cantus'
  | 'mentis' | 'mundus' | 'culture' | 'sermo' | 'notebook' | 'diarium' | 'try'
  | 'tabula'
  | 'desk';

/** The sidebar's rooms, in order (src/app/sections.ts draws them). */
export const ROOMS: readonly Feature[] = ['home', 'explora', 'bibliotheca', 'codex', 'thesaurus', 'ludus', 'diarium', 'alphabet', 'ratio', 'ordo'];

/** Lemora: reading, words, writing and a new script, each a room of its own, and Things to try inside Explora. In Lingua the list is the whole app. */
const FEATURES: ReadonlySet<Feature> = new Set<Feature>([...ROOMS, 'try', 'desk']);

/** Whether this build has a room or tab: shared code asks before it shows or links to one. */
export const shows = (feature: Feature): boolean => FEATURES.has(feature);

/** The room behind an in-app address, where it is one a build may not have. */
function roomAt(to: string): Feature | undefined {
  const path = to.split(/[?#]/)[0];
  const top = /^\/(sonus|cantus|visio)\b/.exec(path)?.[1];
  if (top) return top as Feature;
  if (/^\/(colloquium|mentis\/sermo)\b/.test(path)) return 'sermo';
  if (/^\/mentis\/notebook\b/.test(path)) return 'notebook';
  if (/^\/mentis\/(diarium|try)\b/.test(path)) return undefined;
  if (/^\/mentis\b/.test(path)) return 'mundus';
  if (/^\/cursus\/(alphabets|characters)\b/.test(path)) return undefined;
  if (/^\/cursus\/grammatica\b/.test(path)) return 'grammatica';
  if (/^\/cursus\b/.test(path)) return 'cursus';
  return undefined;
}

/** Whether an in-app address leads somewhere this build has: shared code checks a link before it offers it. */
export const reaches = (to: string): boolean => {
  const room = roomAt(to);
  return !room || shows(room);
};
