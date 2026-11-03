// Time per tool (Lemora 3.8): which tool a recorded session belongs to, and how a day's time adds up
// without counting the same minutes twice. Home's tool cards, its overall meter and the daily goal
// all read this one function, so they can never disagree.

/** Every tool that records time. Each app shows its own (src/product.ts); the rest stay at zero. */
export const TOOLS = ['codex', 'thesaurus', 'ludus', 'diarium', 'alphabet', 'grammatica', 'sonus', 'cantus', 'visio'] as const;
export type ToolId = (typeof TOOLS)[number];

export interface TimedSession {
  type: 'read' | 'listen' | 'watch' | 'review' | 'ludus' | 'write' | 'sing' | 'grammar';
  refId?: string;
  startedAt: number;
  endedAt: number;
  activeMs: number;
}

/**
 * The one attribution rule: a session belongs to the tool its type names. Reading is Codex, a deck's
 * classic review Thesaurus, every exercise and game Ludus (a reading check included), writing Diarium
 * (the end-of-book "own words" too), and a grammar session Grammatica, unless it is a letters lesson
 * (refId "letters:…"), which is Alphabet's.
 */
export function toolOf(session: Pick<TimedSession, 'type' | 'refId'>): ToolId {
  switch (session.type) {
    case 'read':
      return 'codex';
    case 'review':
      return 'thesaurus';
    case 'ludus':
      return 'ludus';
    case 'write':
      return 'diarium';
    case 'grammar':
      return session.refId?.startsWith('letters:') ? 'alphabet' : 'grammatica';
    case 'listen':
      return 'sonus';
    case 'sing':
      return 'cantus';
    case 'watch':
      return 'visio';
  }
}

/** Milliseconds covered by a set of [start, end] spans, overlaps counted once. */
function covered(spans: Array<[number, number]>): number {
  const sorted = spans.filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
  let total = 0;
  let end = -Infinity;
  for (const [a, b] of sorted) {
    if (b <= end) continue;
    total += b - Math.max(a, end);
    end = b;
  }
  return total;
}

export interface ToolTime {
  /** Active milliseconds per tool. */
  byTool: Record<ToolId, number>;
  /** All of it, the minutes two tools shared (two tabs at once) counted once. */
  total: number;
}

/**
 * A day's time: per tool, the active time of its sessions, never more than the clock time they cover
 * (two windows of the same tool don't double it); in all, the tools' sum, never more than the clock
 * time every session covers. Pass the sessions that ended on the day (as dailyStats dates them).
 */
export function toolTime(sessions: readonly TimedSession[]): ToolTime {
  const byTool = Object.fromEntries(TOOLS.map((t) => [t, 0])) as Record<ToolId, number>;
  const spans = new Map<ToolId, Array<[number, number]>>();
  for (const s of sessions) {
    const tool = toolOf(s);
    byTool[tool] += Math.max(0, s.activeMs);
    spans.set(tool, [...(spans.get(tool) ?? []), [s.startedAt, s.endedAt]]);
  }
  for (const [tool, list] of spans) byTool[tool] = Math.min(byTool[tool], covered(list));
  const sum = TOOLS.reduce((n, t) => n + byTool[t], 0);
  return { byTool, total: Math.min(sum, covered(sessions.map((s) => [s.startedAt, s.endedAt]))) };
}

/** A goal's progress, 0 to 1, or undefined when the tool has no goal (0 or unset turns it off). */
export function progressOf(ms: number, goalMinutes: number | undefined): number | undefined {
  if (!goalMinutes || goalMinutes <= 0) return undefined;
  return Math.min(1, ms / (goalMinutes * 60_000));
}
