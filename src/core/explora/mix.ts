// "At your level": a mixed row, one of each kind in turn, the closest to the learner's level first within a kind.
import { LEVELS } from '@/core/mundus/explore';
import type { Level } from '@/core/lang/levels';

export interface Mixable {
  kind: string;
  level: string;
  id: string;
}

/** Round-robins over the kinds (books, then a comic, then a series ...) so the row shows the range, not one kind. */
export function mixByKind<T extends Mixable>(items: T[], learner: Level, count = 14, skip: (item: T) => boolean = () => false): T[] {
  const me = LEVELS.indexOf(learner as (typeof LEVELS)[number]);
  const groups = new Map<string, T[]>();
  for (const item of items) {
    if (skip(item)) continue;
    const list = groups.get(item.kind) ?? [];
    list.push(item);
    groups.set(item.kind, list);
  }
  const rows = [...groups.values()].map((list) => [...list].sort((a, b) => Math.abs(LEVELS.indexOf(a.level as (typeof LEVELS)[number]) - me) - Math.abs(LEVELS.indexOf(b.level as (typeof LEVELS)[number]) - me)));
  const out: T[] = [];
  for (let i = 0; out.length < count && rows.some((r) => i < r.length); i++) for (const row of rows) if (i < row.length && out.length < count) out.push(row[i]);
  return out;
}
