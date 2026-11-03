// The threads' geometry (6-29, docs/WORD-GRAPH-PLAN.md section 4): curves with one hand's bend, cut short for the draw-in,
// and the compass's nib strokes. Pure, so the canvas only strokes what this works out.

export type Point = readonly [number, number];

/** How far a thread's middle leaves the straight line, as a share of its length: always the same side, as one hand draws. */
export const BEND = 0.1;

/** The control point of a thread from a to b: short threads stay nearly straight, long ones arch. */
export function bendOf(a: Point, b: Point, bend = BEND): Point {
  return [(a[0] + b[0]) / 2 - (b[1] - a[1]) * bend, (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend];
}

/** The first part of the quadratic a → c → b, up to t (de Casteljau): a thread drawing itself out from its word. */
export function cutQuad(a: Point, c: Point, b: Point, t: number): [Point, Point] {
  const ac: Point = [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t];
  const cb: Point = [c[0] + (b[0] - c[0]) * t, c[1] + (b[1] - c[1]) * t];
  return [ac, [ac[0] + (cb[0] - ac[0]) * t, ac[1] + (cb[1] - ac[1]) * t]];
}

/** A nib stroke along a → c → b: `wide` across at a, a point at b, as a pen leaves the paper. Returned as a closed outline. */
export function nibOutline(a: Point, c: Point, b: Point, wide: number, steps = 16): Point[] {
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    const x = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], y = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1];
    const dx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]), dy = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
    const len = Math.hypot(dx, dy) || 1, half = (wide / 2) * (1 - t);
    left.push([x - (dy / len) * half, y + (dx / len) * half]);
    right.push([x + (dy / len) * half, y - (dx / len) * half]);
  }
  return [...left, ...right.reverse()];
}

/** A family-tree line from a parent down to a child: down, across with a rounded bend, down. */
export function elbowPoints(a: Point, b: Point): Point[] {
  const mid = (a[1] + b[1]) / 2;
  return [a, [a[0], mid], [b[0], mid], b];
}

/** Ease out, for things that arrive (the handbook's 150 ms hover, 280 ms draw-in). */
export const easeOut = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
