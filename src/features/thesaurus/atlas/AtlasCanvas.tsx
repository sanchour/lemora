// Draws a compass or a tree (6-29 G2, docs/WORD-GRAPH-PLAN.md sections 3, 4 and 6) on one canvas. Frames are drawn only
// while something moves (a draw-in, a hover fade, a zoom); at rest nothing runs. React renders it once per scene.
import { useEffect, useRef } from 'react';
import type { Ref } from 'react';
import { bendOf, cutQuad, easeOut, elbowPoints, nibOutline, type Point } from '@/core/graph/curves';
import { QUARTER_ANGLE, RING_1, RING_2, type Scene, type SceneNode } from '@/core/graph/scene';
import { motionIsReduced } from '@/design/motionPref';

const DRAW_IN = 280;
const RING_DELAY = 60;
const FADE = 150;
const ZOOM_EASE = 120;
const K_MIN = 0.35;
const K_MAX = 4;
const FIT_MAX = 1.25;

type Tokens = Record<'bg' | 'ink' | 'soft' | 'faint' | 'line' | 'strong' | 'sage' | 'accent' | 'serif' | 'sans', string>;
function readTokens(): Tokens {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return { bg: v('--bg'), ink: v('--ink'), soft: v('--ink-soft'), faint: v('--ink-faint'), line: v('--line'), strong: v('--line-strong'), sage: v('--sage'), accent: v('--accent'), serif: v('--font-serif') || 'serif', sans: v('--font-sans') || 'sans-serif' };
}

export interface AtlasCanvasHandle {
  zoom: (factor: number) => void;
  fit: () => void;
}

export interface AtlasCanvasProps {
  scene: Scene;
  selected: string;
  onSelect: (node: SceneNode) => void;
  onOpen: (node: SceneNode) => void;
  quarterLabels: Record<'meaning' | 'form' | 'origin' | 'use', string>;
  /** A language code's name, for foreign words' notes. */
  nameOf: (code: string) => string;
  label: string;
  handle?: Ref<AtlasCanvasHandle>;
}

export function AtlasCanvas({ scene, selected, onSelect, onOpen, quarterLabels, nameOf, label, handle }: AtlasCanvasProps) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // Everything the frames read lives here, so a frame never waits on React.
  const live = useRef({ scene, selected, onSelect, onOpen, quarterLabels, nameOf });
  live.current = { scene, selected, onSelect, onOpen, quarterLabels, nameOf };
  const api = useRef<{ redraw: () => void; restart: () => void; zoom: (f: number) => void; fit: () => void } | null>(null);

  useEffect(() => {
    const el = canvas.current!, wrap = box.current!;
    const ctx = el.getContext('2d')!;
    let tokens = readTokens();
    let w = 0, h = 0, dpr = 1;
    const cam = { x: 0, y: 0, k: 1 };
    let zoomTo: { k: number; at: Point; from: number; start: number } | null = null;
    let shownAt = performance.now();
    let hover = -1, hoverFrom = -1, hoverAt = 0;
    let frame = 0;
    const widths = new Map<string, number>();

    const toScreen = (x: number, y: number): Point => [(x - cam.x) * cam.k + w / 2, (y - cam.y) * cam.k + h / 2];
    const toWorld = (sx: number, sy: number): Point => [(sx - w / 2) / cam.k + cam.x, (sy - h / 2) / cam.k + cam.y];
    const fit = () => {
      const b = live.current.scene.box;
      // A small tree is not blown up: at most a little larger than life.
      cam.k = Math.min(FIT_MAX, Math.max(K_MIN, Math.min(w / (b.x1 - b.x0), h / (b.y1 - b.y0)) * 0.96));
      cam.x = (b.x0 + b.x1) / 2;
      cam.y = (b.y0 + b.y1) / 2;
    };
    const zoomAt = (factor: number, at: Point, eased: boolean) => {
      const k = Math.min(K_MAX, Math.max(K_MIN, (zoomTo?.k ?? cam.k) * factor));
      if (!eased || motionIsReduced()) setZoom(k, at);
      else zoomTo = { k, at, from: cam.k, start: performance.now() };
      kick();
    };
    // Zooming keeps the point under the pointer where it is.
    const setZoom = (k: number, at: Point) => {
      const before = toWorld(at[0], at[1]);
      cam.k = k;
      const after = toWorld(at[0], at[1]);
      cam.x += before[0] - after[0];
      cam.y += before[1] - after[1];
    };

    const fontOf = (n: SceneNode, size: number) => {
      if (n.kind === 'hub' || n.kind === 'more') return `700 ${size * 0.66}px ${tokens.sans}`;
      if (n.kind === 'place') return `${size * 0.76}px ${tokens.sans}`;
      const italic = n.ghost || n.kind === 'foreign' || n.kind === 'phrase' ? 'italic ' : '';
      return `${italic}${n.kind === 'centre' ? 600 : 400} ${size}px ${tokens.serif}`;
    };
    const baseSize = (n: SceneNode) => (n.kind === 'centre' ? 30 : n.ring === 2 ? 14 : 17);
    const textOf = (n: SceneNode) => {
      const t = n.kind === 'hub' ? n.label.toUpperCase() : n.kind === 'place' && n.label.length > 44 ? `${n.label.slice(0, 43)}…` : n.label;
      return n.weak ? `${t} †` : t;
    };
    const labelBox = (n: SceneNode, [x, y]: Point, size: number) => {
      const text = textOf(n), font = fontOf(n, size), id = `${font}|${text}`;
      if (!widths.has(id)) {
        ctx.font = font;
        widths.set(id, ctx.measureText(text).width);
      }
      const tw = widths.get(id)!, gap = n.kind === 'centre' ? 22 : 10;
      const lx = n.anchor === 'start' ? x + gap : n.anchor === 'end' ? x - gap - tw : x - tw / 2;
      const ly = n.anchor === 'above' ? y - gap - size * 0.3 : n.anchor === 'below' ? y + gap + size * 0.9 : y + size * 0.35;
      return { text, font, lx, ly, tw };
    };

    const draw = () => {
      frame = 0;
      const now = performance.now();
      const { scene: s, selected: sel } = live.current;
      const reduced = motionIsReduced();
      if (zoomTo) {
        const t = easeOut((now - zoomTo.start) / ZOOM_EASE);
        setZoom(zoomTo.from + (zoomTo.k - zoomTo.from) * t, zoomTo.at);
        if (t >= 1) zoomTo = null;
      }
      const age = now - shownAt;
      const fade = easeOut((now - hoverAt) / FADE);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = tokens.bg;
      ctx.fillRect(0, 0, w, h);
      const P = s.nodes.map((n) => toScreen(n.x, n.y));
      const near = (i: number, e: { a: number; b: number }) => e.a === i || e.b === i;

      // The rose: two dotted rings, four hairlines, the quarters named at their ends.
      if (s.kind === 'compass') {
        const [cx, cy] = toScreen(0, 0);
        ctx.lineWidth = 0.8;
        ctx.lineCap = 'round';
        for (const [r, colour, dash] of [[RING_1, tokens.strong, [1, 5]], [RING_2, tokens.line, [1, 6]]] as const) {
          ctx.strokeStyle = colour;
          ctx.setLineDash(dash as unknown as number[]);
          ctx.beginPath();
          ctx.arc(cx, cy, r * cam.k, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.font = `700 11.5px ${tokens.sans}`;
        ctx.textAlign = 'center';
        for (const [q, deg] of Object.entries(QUARTER_ANGLE)) {
          const r = (deg * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
          ctx.strokeStyle = tokens.line;
          ctx.beginPath();
          ctx.moveTo(cx + c * 40 * cam.k, cy + sn * 40 * cam.k);
          ctx.lineTo(cx + c * (RING_2 + 18) * cam.k, cy + sn * (RING_2 + 18) * cam.k);
          ctx.stroke();
          ctx.fillStyle = tokens.faint;
          ctx.fillText(live.current.quarterLabels[q as keyof typeof QUARTER_ANGLE].toUpperCase(), cx + c * (RING_2 + 36) * cam.k, cy + sn * (RING_2 + 36) * cam.k + 4);
        }
      }

      // Threads: they draw themselves out from the word when it opens, and the hovered word's darken while the rest fade.
      for (const e of s.edges) {
        const t = reduced ? 1 : easeOut((age - (e.ring === 2 ? RING_DELAY : 0)) / DRAW_IN);
        if (t <= 0) continue;
        const was = hoverFrom >= 0 && near(hoverFrom, e), is = hover >= 0 && near(hover, e);
        const emphasis = (is ? fade : 0) + (was ? 1 - fade : 0);
        const dim = hover >= 0 ? fade : hoverFrom >= 0 ? 1 - fade : 0;
        const base = e.style === 'member' ? 0.35 : e.style === 'elbow' ? 0.6 : 0.55;
        ctx.globalAlpha = (reduced ? t : 1) * (base + (0.95 - base) * emphasis) * (1 - 0.75 * dim * (1 - emphasis));
        ctx.strokeStyle = ctx.fillStyle = emphasis > 0.5 ? tokens.ink : tokens.soft;
        const a = P[e.a], b = P[e.b];
        if (e.style === 'elbow') {
          const pts = elbowPoints(a, b);
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          // A sharp T under the parent, a rounded bend down to each child.
          ctx.lineTo(pts[1][0], pts[1][1]);
          ctx.arcTo(pts[2][0], pts[2][1], pts[3][0], pts[3][1], Math.min(10, Math.abs(pts[2][0] - pts[1][0]) / 2) || 0.01);
          const end = reduced ? 1 : t;
          ctx.lineTo(pts[3][0], pts[2][1] + (pts[3][1] - pts[2][1]) * end);
          ctx.stroke();
          continue;
        }
        const c = bendOf(a, b);
        const [c2, b2] = cutQuad(a, c, b, reduced ? 1 : t);
        // The first ring's meaning and form threads are nib strokes: fuller at the word, a point at the far end.
        if (s.kind === 'compass' && e.ring === 1 && (e.style === 'meaning' || e.style === 'form' || e.style === 'yours')) {
          const outline = nibOutline(a, c2, b2, e.style === 'form' ? 3.2 : 2.4);
          ctx.beginPath();
          ctx.moveTo(outline[0][0], outline[0][1]);
          for (const p of outline) ctx.lineTo(p[0], p[1]);
          ctx.fill();
          continue;
        }
        ctx.lineWidth = e.style === 'form' ? 1.4 : e.style === 'member' ? 0.6 : e.style === 'origin' ? 1.3 : 0.9;
        ctx.lineCap = 'round';
        ctx.setLineDash(e.style === 'origin' ? [0.1, 4] : e.style === 'use' ? [5, 4] : []);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.quadraticCurveTo(c2[0], c2[1], b2[0], b2[1]);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Words: the dot by state (never colour alone: filled, a ring, a dotted ring), the label with a paper halo.
      const labels: number[] = [];
      s.nodes.forEach((n, i) => {
        const appear = reduced ? 1 : easeOut((age - (n.ring === 2 ? RING_DELAY : 0) - DRAW_IN * 0.5) / FADE);
        const dimmed = hover >= 0 && hover !== i && !s.edges.some((e) => near(hover, e) && near(i, e));
        ctx.globalAlpha = appear * (dimmed ? 1 - 0.6 * fade : 1);
        const [x, y] = P[i];
        const r = (n.kind === 'centre' ? 10 : n.ring === 2 ? 4 : 5) * Math.min(1.4, Math.max(0.8, cam.k));
        if (n.kind === 'hub') {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = tokens.bg;
          ctx.strokeStyle = tokens.soft;
          ctx.lineWidth = 1;
          ctx.fillRect(-r, -r, 2 * r, 2 * r);
          ctx.strokeRect(-r, -r, 2 * r, 2 * r);
          ctx.restore();
        } else if (n.kind === 'foreign') {
          ctx.fillStyle = tokens.soft;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (n.kind === 'word' || n.kind === 'centre') {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          if (n.state === 1) {
            ctx.fillStyle = tokens.sage;
            ctx.fill();
          } else if (n.state === 2) {
            ctx.fillStyle = tokens.bg;
            ctx.fill();
            ctx.strokeStyle = tokens.ink;
            ctx.lineWidth = 1.4;
            ctx.stroke();
          } else {
            ctx.strokeStyle = tokens.faint;
            ctx.lineWidth = 1.1;
            ctx.setLineDash([1.4, 2.4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        // The bookmark: the one terracotta thing on the page, a ring on the word you are on.
        if (n.id === sel) {
          ctx.strokeStyle = tokens.accent;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(x, y, r + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
        labels.push(i);
      });
      // Labels in order of importance (the word, the chosen one, the hovered one, the first ring, the second); one that would
      // touch a label already drawn waits until it is hovered or zoomed into room.
      const placed: Array<[number, number, number, number]> = [];
      const rank = (i: number) => (i === hover ? -2 : s.nodes[i].id === sel ? -1 : s.nodes[i].kind === 'centre' ? -3 : s.nodes[i].ring);
      for (const i of labels.sort((a, b) => rank(a) - rank(b) || a - b)) {
        const n = s.nodes[i];
        const [x, y] = P[i];
        const appear = reduced ? 1 : easeOut((age - (n.ring === 2 ? RING_DELAY : 0) - DRAW_IN * 0.5) / FADE);
        const dimmed = hover >= 0 && hover !== i && !s.edges.some((e) => near(hover, e) && near(i, e));
        ctx.globalAlpha = appear * (dimmed ? 1 - 0.6 * fade : 1);
        const size = Math.max(12.5, baseSize(n) * Math.min(1.5, Math.max(0.8, cam.k)));
        const boxOf = labelBox(n, [x, y], size);
        const rect: [number, number, number, number] = [boxOf.lx - 3, boxOf.ly - size, boxOf.lx + boxOf.tw + 3, boxOf.ly + (n.note && n.kind === 'foreign' ? 16 : 4)];
        if (rank(i) >= 0 && placed.some((o) => rect[0] < o[2] && rect[2] > o[0] && rect[1] < o[3] && rect[3] > o[1])) continue;
        placed.push(rect);
        const { text, font, lx, ly } = labelBox(n, [x, y], size);
        ctx.font = font;
        ctx.textAlign = 'left';
        ctx.direction = n.lang === 'ar' || /[؀-ۿ]/.test(text) ? 'rtl' : 'ltr';
        if (ctx.direction === 'rtl') ctx.textAlign = 'right';
        const tx = ctx.direction === 'rtl' ? lx + labelBox(n, [x, y], size).tw : lx;
        ctx.lineJoin = 'round';
        ctx.lineWidth = 4;
        ctx.strokeStyle = tokens.bg;
        ctx.strokeText(text, tx, ly);
        ctx.fillStyle = n.ghost || n.kind === 'hub' || n.kind === 'place' || n.kind === 'more' ? tokens.soft : tokens.ink;
        ctx.fillText(text, tx, ly);
        if (n.kind === 'phrase') {
          ctx.fillStyle = tokens.strong;
          ctx.fillRect(lx, ly + 3, labelBox(n, [x, y], size).tw, 1);
        }
        if (n.note && n.kind === 'foreign') {
          ctx.direction = 'ltr';
          ctx.font = `700 ${10 * Math.min(1.3, Math.max(0.9, cam.k))}px ${tokens.sans}`;
          ctx.textAlign = n.anchor === 'start' ? 'left' : n.anchor === 'end' ? 'right' : 'center';
          ctx.fillStyle = tokens.faint;
          const nx = n.anchor === 'start' ? lx : n.anchor === 'end' ? x - 10 : x;
          ctx.fillText(live.current.nameOf(n.note).toUpperCase(), nx, n.anchor === 'above' ? ly - size - 2 : ly + 14);
        }
        ctx.direction = 'ltr';
      }
      ctx.globalAlpha = 1;
      const moving = zoomTo || (!reduced && age < DRAW_IN + RING_DELAY + FADE * 2) || now - hoverAt < FADE;
      if (moving) frame = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    // What is under the pointer: a dot within 16 px, or a label.
    const hit = (sx: number, sy: number) => {
      const s = live.current.scene;
      let best = -1, bestD = 16;
      s.nodes.forEach((n, i) => {
        const p = toScreen(n.x, n.y);
        const d = Math.hypot(p[0] - sx, p[1] - sy);
        if (d < bestD) (best = i), (bestD = d);
        if (best >= 0) return;
        const size = Math.max(12.5, baseSize(n) * Math.min(1.5, Math.max(0.8, cam.k)));
        const b = labelBox(n, p, size);
        if (sx >= b.lx - 4 && sx <= b.lx + b.tw + 4 && sy >= b.ly - size && sy <= b.ly + 4) best = i;
      });
      return best;
    };
    const setHover = (i: number) => {
      if (i === hover) return;
      hoverFrom = hover;
      hover = i;
      hoverAt = performance.now();
      el.style.cursor = i >= 0 && (live.current.scene.nodes[i].key || live.current.scene.nodes[i].kind === 'centre') ? 'pointer' : 'grab';
      kick();
    };

    let drag: { x: number; y: number; cx: number; cy: number; moved: boolean } | null = null;
    const local = (e: PointerEvent | WheelEvent | MouseEvent): Point => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const down = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) > 3) drag.moved = true;
        if (drag.moved) {
          cam.x = drag.cx - dx / cam.k;
          cam.y = drag.cy - dy / cam.k;
          el.style.cursor = 'grabbing';
          kick();
          return;
        }
      }
      setHover(hit(...local(e)));
    };
    const up = (e: PointerEvent) => {
      const wasDrag = drag?.moved;
      drag = null;
      if (wasDrag) return setHover(hit(...local(e)));
      const i = hit(...local(e));
      if (i >= 0) live.current.onSelect(live.current.scene.nodes[i]);
    };
    const dbl = (e: MouseEvent) => {
      const i = hit(...local(e));
      if (i >= 0) live.current.onOpen(live.current.scene.nodes[i]);
    };
    // A pinch arrives as a wheel with ctrlKey; a mouse wheel moves in lines or big steps with nothing sideways; the rest is
    // a trackpad's two fingers, which move the page.
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const at = local(e);
      if (e.ctrlKey) return zoomAt(Math.exp(-e.deltaY * 0.01), at, false);
      const mouse = e.deltaMode === 1 || (e.deltaX === 0 && Math.abs(e.deltaY) >= 50 && Number.isInteger(e.deltaY));
      if (mouse) return zoomAt(e.deltaY < 0 ? 1.25 : 0.8, at, true);
      cam.x += e.deltaX / cam.k;
      cam.y += e.deltaY / cam.k;
      kick();
    };
    const leave = () => setHover(-1);

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const first = !w;
      w = r.width;
      h = r.height;
      dpr = window.devicePixelRatio || 1;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      if (first) fit();
      kick();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    // A palette or the light changing swaps the tokens; the canvas reads them again.
    const theme = new MutationObserver(() => {
      tokens = readTokens();
      widths.clear();
      kick();
    });
    theme.observe(document.documentElement, { attributes: true });
    void document.fonts.ready.then(() => {
      widths.clear();
      kick();
    });
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('dblclick', dbl);
    el.addEventListener('wheel', wheel, { passive: false });
    api.current = {
      redraw: kick,
      restart: () => {
        shownAt = performance.now();
        hover = hoverFrom = -1;
        fit();
        kick();
      },
      zoom: (f) => zoomAt(f, [w / 2, h / 2], true),
      fit: () => {
        fit();
        kick();
      },
    };
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      theme.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('dblclick', dbl);
      el.removeEventListener('wheel', wheel);
    };
  }, []);

  // A new scene draws itself out again; a new selection only moves the bookmark.
  useEffect(() => api.current?.restart(), [scene]);
  useEffect(() => api.current?.redraw(), [selected, quarterLabels]);
  useEffect(() => {
    if (!handle) return;
    const value: AtlasCanvasHandle = { zoom: (f) => api.current?.zoom(f), fit: () => api.current?.fit() };
    if (typeof handle === 'function') handle(value);
    else (handle as { current: AtlasCanvasHandle | null }).current = value;
  }, [handle]);

  return (
    <div ref={box} className="absolute inset-0">
      <canvas ref={canvas} role="img" aria-label={label} className="block touch-none" />
    </div>
  );
}

/** The neighbour in the direction of an arrow key: the nearest node within 60° of it. */
export function nodeTowards(scene: Scene, from: string, dx: number, dy: number): SceneNode | undefined {
  const a = scene.nodes.find((n) => n.id === from) ?? scene.nodes[0];
  let best: SceneNode | undefined, bestScore = Infinity;
  for (const n of scene.nodes) {
    if (n === a || n.kind === 'more') continue;
    const vx = n.x - a.x, vy = n.y - a.y, d = Math.hypot(vx, vy);
    const cos = (vx * dx + vy * dy) / d;
    if (cos < 0.5) continue;
    const score = d * (2 - cos);
    if (score < bestScore) (bestScore = score), (best = n);
  }
  return best;
}
