import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Compass, Library, Lightbulb, SlidersHorizontal } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useApp } from '@/app/context';
import { SECTIONS, shownFor } from '@/app/sections';
import type { Section } from '@/app/sections';
import { progressOf } from '@/core/goals/tools';
import type { ToolId } from '@/core/goals/tools';
import { getLanguage } from '@/core/lang/languages';
import { tipsByReach } from '@/core/mundus/guide';
import { tipOfTheDay, tipsFor } from '@/core/mundus/tips';
import { useChallenges } from '@/data/challenges';
import { db } from '@/data/db';
import { useDecks } from '@/data/decks';
import { useJournal } from '@/data/journal';
import { useAllProgress, useLibrary } from '@/data/library';
import { useScriptItems } from '@/data/script';
import { useDueSummary } from '@/data/study';
import { toolGoal, useToolDays } from '@/data/toolGoals';
import { Ring } from '@/design/charts/Ring';
import { Hand } from '@/design/drawings';
import type { HandName } from '@/design/drawings';
import { UiText, useUi } from '@/design/i18n/UiText';
import { spring } from '@/design/motion';
import { buttonClasses } from '@/design/primitives';
import { useCan } from '@/features/plans/usePlan';
import { TIP_ICONS } from '@/features/mundus/TipsView';
import { cx } from '@/lib/cx';
import { localDateKey } from '@/lib/format';
import { GoalsDrawer } from './GoalsDrawer';
import { ToolDuotoneIcon } from '@/features/home/homeComponents';
import type { HomeToolItem } from '@/features/home/homeData';

const label = 'text-[11.5px] font-bold tracking-[0.14em] text-ink-faint uppercase';
const rise = (i: number) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { ...spring.soft, delay: 0.04 * i } });
const minutes = (ms: number) => Math.round(ms / 60_000);
/** Each tool's tint (the handbook's "rooms get tints, not hues"), for its icon and its share of the day. */
const TINT: Partial<Record<ToolId, string>> = { codex: 'var(--sage)', thesaurus: 'var(--accent)', ludus: '#c9a650', diarium: '#9d8fcb', alphabet: '#6f9cc0' };
const wash = (tint: string, amount = 16): CSSProperties => ({ background: `color-mix(in oklab, ${tint} ${amount}%, var(--color-surface))`, color: `color-mix(in oklab, ${tint} 70%, var(--color-ink))` });

/** A bookish line for the hour; the name follows it. */
function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Burning the midnight oil';
}

/**
 * Lemora's Home (3.1): a reading desk. The main column says hello, opens the book you're in and lays the tools out two
 * by two, each with its own goal; the rail beside it keeps today: the time against the day's goal, each tool's share,
 * the week, a challenge and what you did last. Every minute comes from the recorded sessions (core/goals/tools).
 */
export default function LemoraHome() {
  const translateUi = useUi();
  const { language, settings } = useApp();
  const lang = language.id;
  const target = getLanguage(lang);
  const name = settings.learner.name?.trim();
  const [goalsOpen, setGoalsOpen] = useState(false);

  const days = useToolDays(lang, 7);
  const today = days?.[days.length - 1];
  const texts = useLibrary(lang);
  const progress = useAllProgress();
  const due = useDueSummary(lang);
  const journal = useJournal(lang);
  const letters = useScriptItems(lang);
  const ludusOpen = useCan('ludus');

  const book = useMemo(() => {
    const open = (texts ?? []).filter((t) => t.kind !== 'shelfItem' && !t.finishedAt && (t.lastOpenedAt || (progress?.get(t.id)?.percent ?? 0) > 0));
    const last = open.sort((a, b) => (b.lastOpenedAt ?? b.createdAt) - (a.lastOpenedAt ?? a.createdAt))[0];
    return last ? { text: last, percent: Math.round((progress?.get(last.id)?.percent ?? 0) * 100) } : undefined;
  }, [texts, progress]);

  const tools = SECTIONS.filter((s) => s.group === 'tool').filter(shownFor(lang));
  const wroteToday = (journal ?? []).some((e) => !e.deletedAt && e.date === localDateKey());
  const dueLetters = (letters ?? []).filter((l) => l.due <= Date.now()).length;

  const line = (id: string): string | undefined => {
    if (id === 'codex') return book ? `${book.text.title} · ${book.percent}%` : translateUi('Start reading');
    if (id === 'thesaurus') return due && due.due > 0 ? translateUi('{0} cards due today', [due.due]) : translateUi('All caught up');
    if (id === 'ludus') return ludusOpen ? translateUi('Games') : undefined;
    if (id === 'diarium') return wroteToday ? translateUi('Done today') : translateUi('Write today’s entry');
    if (id === 'alphabet') return dueLetters ? translateUi('Review {0} {1}', [dueLetters, dueLetters === 1 ? 'letter' : 'letters']) : undefined;
    return undefined;
  };

  // What to do next, from what is really waiting: never more than three.
  const next = [
    due && due.due > 0 && { key: 'review', icon: 'cards' as HandName, text: translateUi('{0} cards due today', [due.due]), to: '/thesaurus/study/all?mode=recall' },
    !wroteToday && { key: 'write', icon: 'quill' as HandName, text: translateUi('Write today’s entry'), to: '/mentis/diarium' },
    dueLetters > 0 && tools.some((t) => t.id === 'alphabet') && { key: 'letters', icon: 'letter' as HandName, text: translateUi('Review {0} {1}', [dueLetters, dueLetters === 1 ? 'letter' : 'letters']), to: '/cursus/alphabets/review' },
  ].filter((n): n is { key: string; icon: HandName; text: string; to: string } => Boolean(n)).slice(0, 3);

  return (
    <div className="grid items-start gap-x-10 gap-y-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <motion.header {...rise(0)}>
          <p className={label}>
            {new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())} · {target?.endonym ?? lang}
          </p>
          <h1 className="mt-2 font-serif text-[40px] leading-[1.08] font-semibold tracking-tight text-balance">
            {translateUi(greetingFor(new Date().getHours()))}
            {name && (
              <>
                ,{' '}
                <span className="relative inline-block">
                  {name}
                  {/* A pen stroke under the name, drawn once. */}
                  <svg viewBox="0 0 120 8" preserveAspectRatio="none" aria-hidden className="pointer-events-none absolute -bottom-1 left-0 h-2 w-full overflow-visible text-accent">
                    <motion.path d="M2 5.5C35 2.5 85 2.5 118 5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
                  </svg>
                </span>
              </>
            )}
            .
          </h1>
        </motion.header>

        <motion.div {...rise(1)} className="mt-8">
          <ContinueCard book={book?.text.title} author={book?.text.author} percent={book?.percent} to={book ? `/codex/read/${book.text.id}` : '/explora?kind=books'} />
        </motion.div>

        <motion.section {...rise(2)} className="mt-12" aria-labelledby="home-tools">
          <div className="flex items-end justify-between gap-4">
            <h2 id="home-tools" className="font-serif text-[30px] leading-tight font-semibold tracking-tight"><UiText source={'Tools'} /></h2>
            <button type="button" onClick={() => setGoalsOpen(true)} className="hit inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-soft hover:text-ink">
              <SlidersHorizontal size={15} aria-hidden /> <UiText source={'Daily goals'} />
            </button>
          </div>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {tools.map((section, i) => (
              <motion.li key={section.id} {...rise(3 + i)}>
                <ToolCard section={section} line={line(section.id)} locked={section.id === 'ludus' && !ludusOpen} ms={today?.byTool[section.id as ToolId] ?? 0} goal={toolGoal(language, section.id as ToolId)} />
              </motion.li>
            ))}
            <motion.li {...rise(3 + tools.length)} className="md:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <Shortcut to="/bibliotheca" icon={Library} title={translateUi('Bibliotheca')} sub={translateUi('Your library')} />
                <Shortcut to="/explora" icon={Compass} title={translateUi('Explora')} sub={translateUi('Books, articles and word decks')} />
              </div>
            </motion.li>
          </ul>
        </motion.section>

        {next.length > 0 && (
          <motion.section {...rise(9)} className="mt-12" aria-labelledby="home-next">
            <h2 id="home-next" className={label}><UiText source={'Next for you'} /></h2>
            <ul className="mt-3 divide-y divide-line/70 border-y border-line/70">
              {next.map((n) => (
                <li key={n.key}>
                  <Link to={n.to} className="group flex items-center gap-3 py-3.5 text-[15px] font-semibold">
                    <Hand name={n.icon} size={24} className="text-ink-faint group-hover:text-ink-soft" />
                    <span className="min-w-0 flex-1 truncate">{n.text}</span>
                    <ArrowRight size={16} className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.section>
        )}
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6">
        <TodayPanel days={days} goal={language.dailyGoal.readMinutes} tools={tools} onGoals={() => setGoalsOpen(true)} />
        <ChallengeCard lang={lang} level={language.level} />
        <RecentPanel lang={lang} tools={tools} />
      </aside>

      <GoalsDrawer open={goalsOpen} onClose={() => setGoalsOpen(false)} tools={tools} />
    </div>
  );
}

/** The book you're in, large: the one thing on Home in the accent. */
function ContinueCard({ book, author, percent, to }: { book?: string; author?: string; percent?: number; to: string }) {
  const translateUi = useUi();
  return (
    <Link to={to} className="group relative flex items-center gap-6 overflow-hidden rounded-3xl border border-line bg-surface p-5 transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-elev-1 sm:p-6">
      {/* A spine, not a cover: the shelf look, in the reading room's tint. */}
      <span className="relative grid h-28 w-20 shrink-0 place-items-center rounded-r-xl rounded-l-md border border-line bg-raised shadow-elev-1" style={wash('var(--sage)', 22)}>
        <Hand name="book" size={36} className="text-current" />
        <span className="absolute inset-y-2 left-1.5 w-px bg-current opacity-25" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={label}>{book ? <UiText source={'Continue reading'} /> : <UiText source={'Start reading'} />}</span>
        <span className="mt-1 block truncate font-serif text-[26px] leading-tight font-semibold">{book ?? translateUi('Find something to read')}</span>
        {author && <span className="mt-0.5 block truncate text-[14px] text-ink-soft">{author}</span>}
        {percent !== undefined && (
          <span className="mt-4 flex items-center gap-3">
            <span className="h-1.5 max-w-80 flex-1 overflow-hidden rounded-full bg-sunken">
              <span className="block h-full rounded-full bg-sage" style={{ width: `${Math.max(2, percent)}%` }} />
            </span>
            <span className="text-[12.5px] font-semibold text-ink-soft tabular-nums"><UiText source={'{0}% read'} values={[percent]} /></span>
          </span>
        )}
      </span>
      <span className={cx(buttonClasses('accent', 'md'), 'hidden shrink-0 sm:inline-flex')}>
        {book ? <UiText source={'Continue'} /> : <UiText source={'Explora'} />} <ArrowRight size={16} aria-hidden />
      </span>
    </Link>
  );
}

/** A tool, laid on its side: icon, name, what's waiting there, and below it today's time against its goal. */
function ToolCard({ section, line, locked, ms, goal }: { section: Section; line?: string; locked: boolean; ms: number; goal: number }) {
  const translateUi = useUi();
  const share = progressOf(ms, goal);
  const done = share !== undefined && share >= 1;
  return (
    <Link to={section.path} className="group flex h-full flex-col rounded-3xl border border-line/80 bg-surface p-4 transition-[border-color,background-color] hover:border-line-strong hover:bg-raised">
      <span className="flex items-center gap-3.5">
        {/* The tool's drawn emblem in its circle, as on Lingua's Home. */}
        <span className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-line-strong/80 transition-transform group-hover:-translate-y-0.5">
          <ToolDuotoneIcon id={section.id as HomeToolItem['id']} className="size-7" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="font-serif text-[20px] leading-tight font-semibold">{translateUi(section.name)}</span>
            <span className="truncate text-[12.5px] text-ink-faint">{translateUi(section.role)}</span>
          </span>
          <span className="mt-0.5 block truncate text-[13.5px] text-ink-soft">{locked ? 'Lemora+' : (line ?? ' ')}</span>
        </span>
        <ArrowRight size={16} className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
      {/* The tool's own goal: a hairline that fills, sage once it's met. Without a goal, just the time; locked, nothing. */}
      {!locked && <span className="mt-4 flex items-center gap-3">
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-sunken" aria-hidden>
          {share !== undefined && <span className={cx('block h-full rounded-full transition-[width] duration-700', done ? 'bg-sage' : 'bg-ink-soft/60')} style={{ width: `${Math.max(share > 0 ? 3 : 0, share * 100)}%` }} />}
        </span>
        <span className={cx('shrink-0 text-[12px] font-semibold tabular-nums', done ? 'text-sage-text' : 'text-ink-faint')}>
          {goal > 0 ? translateUi('{0} of {1}', [minutes(ms), translateUi('{0} min', [goal])]) : translateUi('{0} today', [translateUi('{0} min', [minutes(ms)])])}
        </span>
      </span>}
    </Link>
  );
}

function Shortcut({ to, icon: Icon, title, sub }: { to: string; icon: typeof Library; title: string; sub: string }) {
  return (
    <Link to={to} className="group flex items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-3 transition-colors hover:border-line-strong hover:bg-raised">
      <Icon size={18} className="shrink-0 text-ink-faint group-hover:text-ink" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold">{title}</span>
        <span className="block truncate text-[12.5px] text-ink-soft">{sub}</span>
      </span>
      <ArrowRight size={15} className="shrink-0 text-ink-faint" aria-hidden />
    </Link>
  );
}

/** Today against the day's goal, each tool's share of it, and the week: the same minutes as the tool cards. */
function TodayPanel({ days, goal, tools, onGoals }: { days?: ReturnType<typeof useToolDays>; goal: number; tools: Section[]; onGoals: () => void }) {
  const translateUi = useUi();
  const today = days?.[days.length - 1];
  const total = minutes(today?.total ?? 0);
  const parts = tools.map((t) => ({ id: t.id as ToolId, name: t.name, ms: today?.byTool[t.id as ToolId] ?? 0 })).filter((p) => p.ms >= 30_000);
  const top = Math.max(goal, ...(days ?? []).map((d) => minutes(d.total)), 1);
  return (
    <section className="rounded-3xl border border-line/80 bg-surface p-5" aria-labelledby="home-today">
      <div className="flex items-center justify-between">
        <h2 id="home-today" className={label}><UiText source={'Time today'} /></h2>
        <button type="button" onClick={onGoals} className="hit text-[12.5px] font-semibold text-ink-soft hover:text-ink"><UiText source={'Goal'} /> · <UiText source={'{0} min'} values={[goal]} /></button>
      </div>
      <div className="mt-4 flex items-center gap-5">
        <Ring value={total / Math.max(1, goal)} size={104} stroke={9} color={total >= goal ? 'var(--sage)' : 'var(--accent)'} label={translateUi('{0} of {1}', [total, translateUi('{0} min', [goal])])}>
          <span className="text-center leading-none">
            <span className="block font-serif text-[30px] font-semibold tabular-nums">{total}</span>
            <span className="text-[11px] font-semibold text-ink-faint"><UiText source={'{0} min'} values={[`/ ${goal}`]} /></span>
          </span>
        </Ring>
        <ul className="min-w-0 flex-1 space-y-1.5 text-[13px]">
          {parts.length ? (
            parts.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: TINT[p.id] ?? 'var(--ink-faint)' }} aria-hidden />
                <span className="min-w-0 flex-1 truncate text-ink-soft">{translateUi(p.name)}</span>
                <span className="font-semibold tabular-nums"><UiText source={'{0} min'} values={[minutes(p.ms)]} /></span>
              </li>
            ))
          ) : (
            <li className="flex items-start gap-2 text-ink-soft"><Hand name="clock" size={22} className="text-ink-faint" /><UiText source={'Nothing yet today: time shows here as you read, review and write.'} /></li>
          )}
        </ul>
      </div>
      {/* The week: one bar a day, today outlined; the goal is the thin line. */}
      <div className="mt-5 border-t border-line/60 pt-4">
        <p className={label}><UiText source={'This week'} /></p>
        <div className="relative mt-3 flex h-20 items-end gap-2">
          <span className="absolute inset-x-0 border-t border-dashed border-line-strong/70" style={{ bottom: `${(goal / top) * 100}%` }} aria-hidden />
          {(days ?? []).map((d, i) => {
            const m = minutes(d.total);
            const isToday = i === (days?.length ?? 0) - 1;
            return (
              <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${d.date}: ${m} min`}>
                <span className={cx('w-full max-w-7 rounded-t-md', m >= goal ? 'bg-sage' : m > 0 ? 'bg-ink-soft/35' : 'bg-sunken', isToday && 'ring-2 ring-accent/50 ring-offset-1 ring-offset-surface')} style={{ height: `${Math.max(4, (m / top) * 100)}%` }} />
                <span className="text-[10.5px] font-semibold text-ink-faint uppercase">{new Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(new Date(`${d.date}T12:00:00`))}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Today's challenge from Things to try, which lives in Explora. */
function ChallengeCard({ lang, level }: { lang: string; level: string }) {
  const rows = useChallenges(lang);
  const tip = useMemo(() => {
    const done = new Set((rows ?? []).map((r) => r.tipId));
    return tipOfTheDay(tipsByReach(tipsFor(lang), level as Parameters<typeof tipsByReach>[1]).now, done);
  }, [lang, level, rows]);
  if (!tip) return null;
  const Icon = TIP_ICONS[tip.icon] ?? Lightbulb;
  return (
    <Link to="/explora?kind=try" className="group flex gap-3.5 rounded-3xl border border-line/80 bg-surface p-4 transition-colors hover:border-line-strong hover:bg-raised">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sunken text-ink-soft"><Icon size={18} aria-hidden /></span>
      <span className="min-w-0 flex-1">
        <span className={label}><UiText source={'Today’s challenge'} /></span>
        <span className="mt-0.5 block font-serif text-[17px] leading-snug font-semibold">{tip.title}</span>
        <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-ink-soft">{tip.teaser}</span>
      </span>
    </Link>
  );
}

/** The last few sittings: which tool, what with, how long. */
function RecentPanel({ lang, tools }: { lang: string; tools: Section[] }) {
  const translateUi = useUi();
  const texts = useLibrary(lang);
  const decks = useDecks(lang);
  const journal = useJournal(lang);
  const sessions = useLiveQuery(() => db.sessions.where('[lang+startedAt]').between([lang, Date.now() - 14 * 86_400_000], [lang, Infinity]).reverse().limit(5).toArray(), [lang]);
  if (!sessions?.length) return null;
  const titleOf = (type: string, refId?: string) =>
    !refId ? undefined : type === 'read' ? texts?.find((t) => t.id === refId)?.title : type === 'write' ? journal?.find((e) => e.id === refId)?.title : decks?.find((d) => d.id === refId)?.name;
  const toolFor = (type: string) => tools.find((t) => t.id === ({ read: 'codex', review: 'thesaurus', ludus: 'ludus', write: 'diarium', grammar: 'alphabet' } as Record<string, string>)[type]);
  return (
    <section className="rounded-3xl border border-line/80 bg-surface p-5" aria-labelledby="home-recent">
      <h2 id="home-recent" className={label}><UiText source={'Recent'} /></h2>
      <ul className="mt-3 space-y-2.5">
        {sessions.map((s) => {
          const tool = toolFor(s.type);
          const Icon = tool?.icon ?? BookOpen;
          return (
            <li key={s.id} className="flex items-center gap-3 text-[13.5px]">
              <Icon size={16} className="shrink-0 text-ink-faint" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                <span className="font-semibold">{tool ? translateUi(tool.name) : s.type}</span>
                {titleOf(s.type, s.refId) && <span className="text-ink-soft"> · {titleOf(s.type, s.refId)}</span>}
              </span>
              <span className="shrink-0 text-[12px] text-ink-faint tabular-nums"><UiText source={'{0} min'} values={[Math.max(1, minutes(s.activeMs))]} /></span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
