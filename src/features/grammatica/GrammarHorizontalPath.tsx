import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crown,
  Flag,
  Layers,
  Mountain,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { LadderRung } from '@/core/grammar/path';
import { STEPS } from '@/core/grammar/progress';
import type { TopicState } from '@/core/grammar/progress';
import type { Grammar, GrammarLevel, Topic } from '@/core/grammar/types';
import { Badge, buttonClasses } from '@/design/primitives';
import { spring } from '@/design/motion';
import { cx } from '@/lib/cx';

interface UnitLook {
  hue: string;
  icon: LucideIcon;
}

const UNIT_LOOKS: UnitLook[] = [
  { hue: '#c86d51', icon: Flag },
  { hue: '#4e8264', icon: Compass },
  { hue: '#5f87a8', icon: BookOpen },
  { hue: '#6b6899', icon: Mountain },
  { hue: '#c98a4b', icon: Sparkles },
  { hue: '#9a7b56', icon: Layers },
];

const LEVEL_HUES: Record<GrammarLevel, { hue: string; badgeBg: string; badgeText: string }> = {
  A1: { hue: '#b86142', badgeBg: 'rgba(184, 97, 66, 0.16)', badgeText: '#934027' },
  A2: { hue: '#4e8264', badgeBg: 'rgba(78, 130, 100, 0.16)', badgeText: '#2e5a40' },
  B1: { hue: '#5b6a9c', badgeBg: 'rgba(91, 106, 156, 0.16)', badgeText: '#37436b' },
  B2: { hue: '#8a5b82', badgeBg: 'rgba(138, 91, 130, 0.16)', badgeText: '#5e3958' },
  C1: { hue: '#c98a4b', badgeBg: 'rgba(201, 138, 75, 0.16)', badgeText: '#7a4f21' },
};

/** Vertical wave offsets as the horizontal trail winds left-to-right. */
const SWING_Y = [0, -34, -52, -34, 0, 34, 52, 34];
const STEP_X = 152;
const GATE_WIDTH = 196;
const GATE_GAP = 84;
const TRAIL_HEIGHT = 290;
const CENTER_Y = 126;
const NODE_SIZE = 70;

const edge = (hue: string, amount = 28) => `color-mix(in oklab, ${hue} ${100 - amount}%, black)`;

type StopStatus = 'done' | 'current' | 'open';

interface TrailStop {
  topic: Topic;
  unitIndex: number;
  unitTitle: string;
  hue: string;
  status: StopStatus;
  state?: TopicState;
  x: number;
  y: number;
  at: number;
}

interface UnitGate {
  unitIndex: number;
  title: string;
  levelLabel: string;
  hue: string;
  icon: LucideIcon;
  learnedCount: number;
  totalCount: number;
  x: number;
}

export interface GrammarHorizontalPathProps {
  grammar: Grammar;
  states: Map<string, TopicState>;
  learnedIds: ReadonlySet<string>;
  nextTopic?: Topic;
  whyNextText: string;
  rungs: LadderRung[];
  learnerLevel: GrammarLevel;
}

export function GrammarHorizontalPath({
  grammar,
  states,
  learnedIds,
  nextTopic,
  whyNextText,
  rungs,
  learnerLevel,
}: GrammarHorizontalPathProps) {
  const translateUi = useUi();
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentStopRef = useRef<HTMLDivElement>(null);

  const [levelFilter, setLevelFilter] = useState<'all' | GrammarLevel>('all');
  const [selectedId, setSelectedId] = useState<string | undefined>(nextTopic?.id);

  // Sync selected topic when nextTopic loads or changes
  useEffect(() => {
    if (!selectedId && nextTopic) {
      setSelectedId(nextTopic.id);
    }
  }, [nextTopic, selectedId]);

  // Filter units & topics according to chosen level (or all)
  const filteredUnits = useMemo(() => {
    return grammar.units
      .map((u, idx) => ({
        unitIndex: idx,
        title: u.title,
        topics: levelFilter === 'all' ? u.topics : u.topics.filter((t) => t.level === levelFilter),
      }))
      .filter((u) => u.topics.length > 0);
  }, [grammar.units, levelFilter]);

  // Compute horizontal layout coordinates for Unit Gates and Topic Stops
  const { stops, gates, totalWidth } = useMemo(() => {
    const outStops: TrailStop[] = [];
    const outGates: UnitGate[] = [];
    let cursorX = 44;
    let globalAt = 0;

    for (const unit of filteredUnits) {
      const look = UNIT_LOOKS[unit.unitIndex % UNIT_LOOKS.length];
      const levels = [...new Set(unit.topics.map((t) => t.level))];
      const levelLabel = levels.length > 1 ? `${levels[0]}–${levels[levels.length - 1]}` : (levels[0] ?? 'A1');
      const learnedCount = unit.topics.filter((t) => learnedIds.has(t.id)).length;

      outGates.push({
        unitIndex: unit.unitIndex,
        title: unit.title,
        levelLabel,
        hue: look.hue,
        icon: look.icon,
        learnedCount,
        totalCount: unit.topics.length,
        x: cursorX,
      });

      cursorX += GATE_WIDTH + GATE_GAP;

      unit.topics.forEach((topic, idx) => {
        const st = states.get(topic.id);
        const isDone = learnedIds.has(topic.id);
        const isCurrent = topic.id === nextTopic?.id;
        const status: StopStatus = isDone ? 'done' : isCurrent ? 'current' : 'open';
        const y = CENTER_Y + SWING_Y[globalAt % SWING_Y.length];

        outStops.push({
          topic,
          unitIndex: unit.unitIndex,
          unitTitle: unit.title,
          hue: look.hue,
          status,
          state: st,
          x: cursorX,
          y,
          at: globalAt++,
        });

        cursorX += idx === unit.topics.length - 1 ? 116 : STEP_X;
      });
    }

    return {
      stops: outStops,
      gates: outGates,
      totalWidth: Math.max(760, cursorX + 64),
    };
  }, [filteredUnits, learnedIds, nextTopic?.id, states]);

  // Center the horizontal scroll container on the current stop when levelFilter changes
  useEffect(() => {
    const container = scrollRef.current;
    const target = currentStopRef.current;
    if (!container || !target) return;
    const targetLeft = target.offsetLeft - container.clientWidth / 2 + target.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  }, [levelFilter, stops.length]);

  const scrollByAmount = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * 420, behavior: 'smooth' });
  };

  const scrollToUnit = (x: number) => {
    scrollRef.current?.scrollTo({ left: Math.max(0, x - 24), behavior: 'smooth' });
  };

  const activeStop = useMemo(
    () => stops.find((s) => s.topic.id === selectedId) ?? stops.find((s) => s.status === 'current') ?? stops[0],
    [stops, selectedId],
  );

  // Build SVG path strings per unit so each unit stretch has its own color
  const unitPaths = useMemo(() => {
    return filteredUnits.map((u) => {
      const unitStops = stops.filter((s) => s.unitIndex === u.unitIndex);
      if (unitStops.length === 0) return null;
      const hue = unitStops[0].hue;
      const fullPath = unitStops
        .map((p, i) =>
          i === 0
            ? `M ${p.x} ${p.y}`
            : `C ${unitStops[i - 1].x + STEP_X / 2} ${unitStops[i - 1].y}, ${p.x - STEP_X / 2} ${p.y}, ${p.x} ${p.y}`,
        )
        .join(' ');

      const reachedIdx = unitStops.reduce(
        (acc, s, i) => (s.status === 'done' || s.status === 'current' || s.state?.started ? i : acc),
        -1,
      );
      const walkedPath =
        reachedIdx > 0
          ? unitStops
              .slice(0, reachedIdx + 1)
              .map((p, i, arr) =>
                i === 0
                  ? `M ${p.x} ${p.y}`
                  : `C ${arr[i - 1].x + STEP_X / 2} ${arr[i - 1].y}, ${p.x - STEP_X / 2} ${p.y}, ${p.x} ${p.y}`,
              )
              .join(' ')
          : '';

      return { unitIndex: u.unitIndex, hue, fullPath, walkedPath };
    });
  }, [filteredUnits, stops]);

  return (
    <div className="space-y-6">
      {/* Level Filter Rungs & Unit Quick-Jump Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={translateUi('Levels')}>
          <button
            type="button"
            aria-pressed={levelFilter === 'all'}
            onClick={() => setLevelFilter('all')}
            className={cx(
              'no-callout flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-[13.5px] font-semibold transition-all',
              levelFilter === 'all'
                ? 'border-ink bg-inverse text-on-inverse shadow-xs'
                : 'border-line/70 bg-surface text-ink-soft hover:border-line-strong hover:text-ink',
            )}
          >
            <UiText source={'All'} />
          </button>

          {rungs.map((r) => {
            const look = LEVEL_HUES[r.level];
            const active = levelFilter === r.level;
            return (
              <button
                key={r.level}
                type="button"
                aria-pressed={active}
                onClick={() => setLevelFilter(r.level)}
                className={cx(
                  'no-callout flex items-center gap-2.5 rounded-2xl border px-3.5 py-2 text-left transition-all',
                  active ? 'bg-surface shadow-xs' : 'border-line/60 bg-surface/70 hover:border-line-strong',
                )}
                style={
                  active
                    ? {
                        borderColor: look.hue,
                        boxShadow: `0 3px 0 ${edge(look.hue, 25)}`,
                      }
                    : undefined
                }
              >
                <span
                  className="inline-flex items-center rounded-lg px-2 py-0.5 font-serif text-[14px] font-bold"
                  style={{ backgroundColor: look.badgeBg, color: look.badgeText }}
                >
                  {r.level}
                </span>
                <span className="text-[12.5px] font-semibold text-ink-faint tabular-nums">
                  <UiText source={'{0} of {1}'} values={[r.learned, r.total]} />
                </span>
                {r.level === learnerLevel && (
                  <span className="text-[10.5px] font-bold tracking-wider text-accent-text uppercase">
                    <UiText source={'You'} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Horizontal Scroll Navigation Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label={translateUi('Previous')}
            className="grid size-9 place-items-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:bg-raised hover:text-ink active:scale-95"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label={translateUi('Next')}
            className="grid size-9 place-items-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:bg-raised hover:text-ink active:scale-95"
          >
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </div>

      {/* Unit Chapter Jump Pills */}
      {gates.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {gates.map((g, idx) => (
            <button
              key={g.unitIndex}
              type="button"
              onClick={() => scrollToUnit(g.x)}
              className="group flex shrink-0 items-center gap-2 rounded-full border border-line/70 bg-surface/80 px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft transition-all hover:border-line-strong hover:bg-raised hover:text-ink"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: g.hue }}
                aria-hidden
              />
              <span className="font-bold text-ink">{idx + 1}.</span>
              <span>{g.title}</span>
              <span className="text-[11px] text-ink-faint tabular-nums">
                {g.learnedCount}/{g.totalCount}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Horizontal Winding Gamified Adventure Trail */}
      <div className="relative overflow-hidden rounded-3xl border border-line/80 bg-surface/75 shadow-xs">
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden scroll-smooth px-2 py-4"
        >
          <div className="relative" style={{ width: totalWidth, height: TRAIL_HEIGHT }}>
            {/* Continuous Horizontal SVG Trail Curves */}
            <svg
              className="pointer-events-none absolute inset-0"
              width={totalWidth}
              height={TRAIL_HEIGHT}
              aria-hidden
            >
              {unitPaths.map(
                (up) =>
                  up && (
                    <g key={up.unitIndex}>
                      <path
                        d={up.fullPath}
                        fill="none"
                        stroke="var(--line-strong)"
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeDasharray="1 14"
                      />
                      {up.walkedPath && (
                        <path
                          d={up.walkedPath}
                          fill="none"
                          stroke={up.hue}
                          strokeOpacity={0.6}
                          strokeWidth={8}
                          strokeLinecap="round"
                        />
                      )}
                    </g>
                  ),
              )}
            </svg>

            {/* Unit Milestone Gates along the Horizontal Trail */}
            {gates.map((gate, idx) => {
              const GateIcon = gate.icon;
              const allDone = gate.learnedCount === gate.totalCount && gate.totalCount > 0;
              return (
                <div
                  key={`gate-${gate.unitIndex}`}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: gate.x, width: GATE_WIDTH }}
                >
                  <div
                    className="relative flex flex-col justify-between overflow-hidden rounded-3xl p-4 text-[#fffaf2] transition-transform duration-200"
                    style={{
                      background: edge(gate.hue, 12),
                      boxShadow: `0 6px 0 ${edge(gate.hue, 40)}`,
                      minHeight: 176,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-[0.12em] uppercase">
                        {gate.levelLabel}
                      </span>
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/18" aria-hidden>
                        {allDone ? <Trophy size={20} strokeWidth={2.5} /> : <GateIcon size={20} strokeWidth={2.2} />}
                      </span>
                    </div>

                    <div className="my-2">
                      <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase opacity-80">
                        <UiText source={'Unit {0} · {1}'} values={[idx + 1, gate.levelLabel]} />
                      </p>
                      <h3 className="mt-0.5 font-serif text-[18px] leading-snug font-bold">
                        {gate.title}
                      </h3>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold opacity-90 tabular-nums">
                        <span>
                          <UiText source={'{0} of {1}'} values={[gate.learnedCount, gate.totalCount]} />
                        </span>
                        {allDone && <Check size={14} strokeWidth={3} aria-hidden />}
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/20">
                        <div
                          className="h-full origin-left rounded-full bg-white/85 transition-transform duration-300"
                          style={{
                            transform: `scaleX(${gate.totalCount ? Math.max(0.04, gate.learnedCount / gate.totalCount) : 0})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Horizontal Topic Stop Nodes */}
            {stops.map((stop) => {
              const isSelected = activeStop?.topic.id === stop.topic.id;
              const isCurrent = stop.status === 'current';
              const isDone = stop.status === 'done';
              const isMastered = Boolean(stop.state?.mastered);
              const started = Boolean(stop.state?.started);
              const stepNum = Math.min(5, Math.max(1, stop.state?.step ?? 1));
              const passedSteps = isDone ? 5 : Math.max(0, stepNum - 1);

              const size = isCurrent ? NODE_SIZE + 8 : NODE_SIZE;
              const nodeHue = isMastered ? '#d4a33c' : stop.hue;
              const lit = isDone || isCurrent || started;

              const face: CSSProperties = lit
                ? {
                    background: nodeHue,
                    color: '#fffaf2',
                    ['--edge' as string]: edge(nodeHue, 30),
                  }
                : {
                    background: `color-mix(in oklab, ${stop.hue} 18%, var(--raised))`,
                    color: edge(stop.hue, 20),
                    ['--edge' as string]: `color-mix(in oklab, ${stop.hue} 38%, var(--line-strong))`,
                  };

              const Icon = isMastered
                ? Crown
                : isDone
                  ? Check
                  : isCurrent
                    ? Zap
                    : BookOpen;

              return (
                <div
                  key={stop.topic.id}
                  ref={isCurrent ? currentStopRef : undefined}
                  className="absolute"
                  style={{
                    left: stop.x - size / 2,
                    top: stop.y - size / 2,
                    width: size,
                    height: size,
                    zIndex: isSelected || isCurrent ? 15 : 5,
                  }}
                >
                  {/* Floating Bouncing Badge on Current Topic */}
                  {isCurrent && (
                    <motion.span
                      className="pointer-events-none absolute left-1/2 z-20 rounded-xl border-2 bg-raised px-2.5 py-0.5 text-[11px] font-extrabold tracking-[0.08em] whitespace-nowrap uppercase shadow-elev-1"
                      style={{
                        top: -38,
                        x: '-50%',
                        borderColor: stop.hue,
                        color: edge(stop.hue, 20),
                      }}
                      animate={reduce ? undefined : { y: [0, -5, 0] }}
                      transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {started ? <UiText source={'Continue'} /> : <UiText source={'Start'} />}
                    </motion.span>
                  )}

                  {/* Pulsing Halo or Selected Ring */}
                  {(isCurrent || isSelected) && (
                    <span
                      className="pointer-events-none absolute -inset-2.5 rounded-full border-4 transition-all"
                      style={{
                        borderColor: isSelected
                          ? stop.hue
                          : `color-mix(in oklab, ${stop.hue} 35%, transparent)`,
                      }}
                      aria-hidden
                    />
                  )}

                  {/* Tactile 3D Node Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedId(stop.topic.id)}
                    aria-pressed={isSelected}
                    title={stop.topic.title}
                    className={cx(
                      'relative grid size-full place-items-center rounded-full transition-[transform,box-shadow,filter] duration-100 ease-out outline-none',
                      '[box-shadow:0_6px_0_var(--edge)] hover:brightness-105 active:translate-y-[4px] active:[box-shadow:0_2px_0_var(--edge)]',
                    )}
                    style={face}
                  >
                    <Icon
                      size={isCurrent ? 30 : 26}
                      strokeWidth={isDone && !isMastered ? 3.2 : 2.2}
                      aria-hidden
                    />

                    {/* Step badge in corner when in progress */}
                    {!isDone && started && (
                      <span
                        className="absolute -right-1 -bottom-1 rounded-full border-2 border-surface bg-raised px-1.5 py-0.2 text-[10px] font-extrabold tabular-nums"
                        style={{ color: edge(stop.hue, 20) }}
                      >
                        {stepNum}/5
                      </span>
                    )}
                  </button>

                  {/* Node Title & 5-Step Mini Bar Below */}
                  <div
                    onClick={() => setSelectedId(stop.topic.id)}
                    className="mt-3 w-32 -translate-x-[calc(50%-35px)] cursor-pointer text-center"
                  >
                    <p
                      className={cx(
                        'line-clamp-2 text-[12.5px] leading-tight font-semibold transition-colors',
                        isSelected ? 'text-ink font-bold' : 'text-ink-soft hover:text-ink',
                      )}
                    >
                      {stop.topic.title}
                    </p>

                    {/* 5-step mini dots */}
                    <div className="mt-1.5 flex items-center justify-center gap-1" aria-hidden>
                      {STEPS.map((s) => {
                        const dotDone = s.n <= passedSteps;
                        const dotActive = !isDone && s.n === stepNum && (started || isCurrent);
                        return (
                          <span
                            key={s.n}
                            className={cx(
                              'h-1.5 rounded-full transition-all',
                              dotActive ? 'w-3.5' : 'w-1.5',
                            )}
                            style={{
                              backgroundColor: dotDone
                                ? stop.hue
                                : dotActive
                                  ? stop.hue
                                  : 'var(--line-strong)',
                              opacity: dotDone ? 1 : dotActive ? 0.65 : 0.45,
                            }}
                          />
                        );
                      })}
                    </div>

                    {stop.state && stop.state.due > 0 && (
                      <span className="mt-1 inline-block rounded-full bg-accent-soft px-2 py-0.2 text-[10px] font-bold text-accent-text">
                        <UiText source={'{0} due'} values={[stop.state.due]} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Topic: Horizontal Gamified 5-Step Lesson Stage */}
      {activeStop && (
        <HorizontalTopicStepStage
          stop={activeStop}
          isNextTopic={activeStop.topic.id === nextTopic?.id}
          why={activeStop.topic.id === nextTopic?.id ? whyNextText : ''}
        />
      )}
    </div>
  );
}

/**
 * The Horizontal 5-Step Gamified Stage for the selected topic:
 * Displays Steps 1 → 2 → 3 → 4 → 5 horizontally as tactile step nodes with direct lesson launch.
 */
function HorizontalTopicStepStage({
  stop,
  isNextTopic,
  why,
}: {
  stop: TrailStop;
  isNextTopic: boolean;
  why: string;
}) {
  const translateUi = useUi();
  const { topic, state, hue, unitTitle } = stop;
  const step = state?.step ?? 1;
  const learned = Boolean(state?.learned);
  const started = Boolean(state?.started);
  const levelLook = LEVEL_HUES[topic.level] ?? LEVEL_HUES.A1;

  return (
    <motion.div
      key={topic.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.soft}
      className="overflow-hidden rounded-3xl border border-line/80 bg-surface p-5 sm:p-6 shadow-xs"
      style={{
        borderColor: `color-mix(in oklab, ${hue} 35%, var(--line))`,
      }}
    >
      {/* Top Info & Primary Action Row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[11px] font-bold tracking-[0.12em] uppercase"
              style={{ backgroundColor: levelLook.badgeBg, color: levelLook.badgeText }}
            >
              {topic.level}
            </span>
            <span className="text-[12px] font-bold tracking-[0.1em] text-ink-faint uppercase">
              {unitTitle}
            </span>
            {learned && (
              <Badge tone="sage">
                <Check size={12} strokeWidth={2.8} aria-hidden />
                <UiText source={'Learned'} />
              </Badge>
            )}
            {!learned && isNextTopic && (
              <span className="text-[11.5px] font-bold tracking-[0.1em] text-sage-text uppercase">
                · {started ? translateUi('Carry on') : translateUi('Your next step')}
              </span>
            )}
          </div>

          <h2 className="mt-1.5 font-serif text-[clamp(1.35rem,2.2vw,1.7rem)] leading-tight font-semibold text-ink">
            {topic.title}
          </h2>
          <p className="mt-1 text-[15px] leading-snug text-ink-soft">{topic.summary}</p>
          {why && <p className="mt-2 text-[13.5px] leading-snug text-ink-faint">{why}</p>}
        </div>

        {/* Tactile Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/cursus/grammatica/${topic.id}/lesson`}
            className="inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-[14.5px] font-extrabold tracking-[0.03em] text-[#fffaf2] transition-transform active:translate-y-[3px]"
            style={{
              backgroundColor: hue,
              boxShadow: `0 4px 0 ${edge(hue, 30)}`,
            }}
          >
            {learned
              ? translateUi('Practise again')
              : started
                ? translateUi('Continue: step {0}', [Math.min(step, 5)])
                : translateUi('Start')}
            <ArrowRight size={17} aria-hidden />
          </Link>
          <Link
            to={`/cursus/grammatica/${topic.id}`}
            className={buttonClasses('secondary', 'md')}
          >
            <UiText source={'Read the topic first'} />
          </Link>
        </div>
      </div>

      {/* Horizontal Step-by-Step Gamified Track (Steps 1 → 5) */}
      <div className="mt-6 pt-5 border-t border-line/60">
        <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-5" aria-label={translateUi('The five steps')}>
          {STEPS.map((s, idx) => {
            const isPassed = learned || s.n < step;
            const isCurrent = !learned && s.n === step;
            return (
              <Link
                key={s.n}
                to={`/cursus/grammatica/${topic.id}/lesson`}
                className={cx(
                  'group relative flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 rounded-2xl border p-3.5 transition-all duration-150',
                  isCurrent
                    ? 'bg-raised shadow-elev-1 -translate-y-0.5'
                    : isPassed
                      ? 'border-sage/40 bg-sage-soft/20 hover:bg-sage-soft/35'
                      : 'border-line/60 bg-sunken/35 opacity-80 hover:opacity-100 hover:bg-surface',
                )}
                style={
                  isCurrent
                    ? {
                        borderColor: hue,
                        boxShadow: `0 4px 0 ${edge(hue, 25)}`,
                      }
                    : undefined
                }
              >
                <div className="flex w-full items-center justify-between gap-2">
                  {/* Tactile Step Circle */}
                  <span
                    className={cx(
                      'grid size-9 shrink-0 place-items-center rounded-full font-sans text-[13.5px] font-extrabold transition-transform group-hover:scale-105',
                      isPassed
                        ? 'bg-sage text-[#fffaf2]'
                        : isCurrent
                          ? 'text-[#fffaf2]'
                          : 'bg-sunken text-ink-faint border border-line',
                    )}
                    style={
                      isCurrent
                        ? {
                            backgroundColor: hue,
                            boxShadow: `0 3px 0 ${edge(hue, 30)}`,
                          }
                        : isPassed
                          ? {
                              boxShadow: `0 3px 0 ${edge('#6b8e78', 30)}`,
                            }
                          : undefined
                    }
                  >
                    {isPassed ? <Check size={16} strokeWidth={3} aria-hidden /> : s.n}
                  </span>

                  {/* Step Status Pill */}
                  {isCurrent && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase"
                      style={{ backgroundColor: `color-mix(in oklab, ${hue} 16%, transparent)`, color: edge(hue, 20) }}
                    >
                      <UiText source={'Now'} />
                    </span>
                  )}

                  {/* Connector arrow on desktop between steps */}
                  {idx < STEPS.length - 1 && (
                    <ChevronRight
                      size={15}
                      className={cx(
                        'hidden sm:block ml-auto transition-transform group-hover:translate-x-0.5',
                        isPassed ? 'text-sage-text' : 'text-ink-faint/50',
                      )}
                      aria-hidden
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={cx(
                      'font-sans text-[14px] font-bold leading-snug',
                      isCurrent || isPassed ? 'text-ink' : 'text-ink-soft',
                    )}
                  >
                    {s.name}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-snug text-ink-faint">
                    {s.hint}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
