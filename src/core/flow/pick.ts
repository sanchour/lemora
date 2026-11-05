import { seeded } from '@/core/cantus/games';

export interface Pickable {
  id: string;
  room: string;
  weight: number;
}

/** A weighted draw without replacement: a room is drawn once before any room is drawn twice. The same seed gives the same draw. */
export function pickWeighted<T extends Pickable>(items: T[], count: number, seed: number): T[] {
  const random = seeded(seed);
  const pool = [...items];
  const rooms = new Set<string>();
  const out: T[] = [];
  while (out.length < count && pool.length) {
    const fresh = pool.filter((p) => !rooms.has(p.room));
    const from = fresh.length ? fresh : pool;
    const w = (p: T) => Math.max(0.01, p.weight);
    let r = random() * from.reduce((sum, p) => sum + w(p), 0);
    let pick = from[from.length - 1];
    for (const p of from) {
      r -= w(p);
      if (r <= 0) {
        pick = p;
        break;
      }
    }
    out.push(pick);
    rooms.add(pick.room);
    pool.splice(pool.indexOf(pick), 1);
  }
  return out;
}
