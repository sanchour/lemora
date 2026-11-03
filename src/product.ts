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
