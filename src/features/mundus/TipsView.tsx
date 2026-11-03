import { UiLocale, UiText, useUi } from '@/design/i18n/UiText';
import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AppWindow,
  ArrowRight,
  AudioLines,
  BookOpenText,
  Check,
  Clock,
  Coffee,
  CookingPot,
  Dices,
  ExternalLink,
  Footprints,
  Gamepad2,
  Hand,
  Hash,
  Keyboard,
  ListMusic,
  LockKeyhole,
  MapPinned,
  Mic,
  PenLine,
  Popcorn,
  Radio,
  Repeat1,
  ShoppingBasket,
  Smartphone,
  StickyNote,
  Sunrise,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { tipLevel, tipsByReach } from '@/core/mundus/guide';
import { streakOf } from '@/core/mundus/streak';
import type { Tip, TipIcon } from '@/core/mundus/tips';
import { tipOfTheDay, tipsFor } from '@/core/mundus/tips';
import { dealOne, doneThisWeek, MINUTES, tipMinutes, tipWhere, visibleTips, WHERES } from '@/core/mundus/try';
import type { DoneDates, TryFilter, Where } from '@/core/mundus/try';
import { toggleChallenge, useChallenges } from '@/data/challenges';
import { Drawer, Segmented } from '@/design/primitives';
import { spring } from '@/design/motion';
import { useApp } from '@/app/context';
import { cx } from '@/lib/cx';
import { localDateKey } from '@/lib/format';
import { toast } from '@/state/ui';
import { Art } from '@/design/drawings';

export const TIP_ICONS: Record<TipIcon, LucideIcon> = {
  phone: Smartphone,
  apps: AppWindow,
  game: Gamepad2,
  keyboard: Keyboard,
  voice: AudioLines,
  labels: StickyNote,
  cook: CookingPot,
  walk: Footprints,
  song: Repeat1,
  spotify: ListMusic,
  list: ShoppingBasket,
  sun: Sunrise,
  film: Popcorn,
  wiki: BookOpenText,
  trip: MapPinned,
  radio: Radio,
  cafe: Coffee,
  meal: Utensils,
  count: Hash,
  mic: Mic,
  people: Users,
  lock: LockKeyhole,
  pen: PenLine,
  smile: Hand,
};

const label = 'text-[11.5px] font-bold tracking-[0.14em] text-ink-faint uppercase';
const chip = 'no-callout inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-colors';
const weekday = (date: string, locale: string) => new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(`${date}T12:00:00`));

/**
 * Things to try (5.2-7, redrawn for Lemora): small challenges that take the language off the page. On the left,
 * today's challenge as a card to hold (Deal another turns it over) and the week it belongs to; on the right, every
 * challenge in calm rows, grouped by where you'd do it, with the time and place to find one for the moment.
 */
export function TipsView({ lang }: { lang: string }) {
  const translateUi = useUi();
  const { language } = useApp();
  const tips = useMemo(() => tipsFor(lang), [lang]);
  const rows = useChallenges(lang);
  const today = localDateKey();
  const [filter, setFilter] = useState<TryFilter>({ show: 'open', minutes: 'any', where: 'any' });
  const [dealt, setDealt] = useState<string>();
  const [details, setDetails] = useState<string>();

  const byTip: DoneDates = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const row of rows ?? []) map.set(row.tipId, [...(map.get(row.tipId) ?? []), row.date]);
    return map;
  }, [rows]);
  const doneDays = useMemo(() => new Set((rows ?? []).map((r) => r.date)), [rows]);
  const streak = useMemo(() => streakOf((rows ?? []).map((r) => r.date), today), [rows, today]);
  const week = doneThisWeek(byTip, today);
  const tried = tips.filter((t) => byTip.has(t.id)).length;

  // The one suggested today: a tip for the learner's stage, one a day, the same the guide offers.
  const todayId = useMemo(() => {
    const doneBefore = new Set([...byTip].filter(([, dates]) => dates.some((d) => d !== today)).map(([id]) => id));
    return tipOfTheDay(tipsByReach(tips, language.level).now, doneBefore, Math.floor(Date.now() / 86_400_000))?.id;
  }, [tips, byTip, today, language.level]);

  const visible = visibleTips(tips, byTip, today, filter);
  const groups = WHERES.map((w) => ({ ...w, tips: visible.filter((t) => tipWhere(t) === w.id) })).filter((g) => g.tips.length);
  const places = WHERES.filter((w) => tips.some((t) => tipWhere(t) === w.id));
  const featured = tips.find((t) => t.id === (dealt ?? todayId));
  const detailTip = tips.find((t) => t.id === details);
  const filtered = filter.minutes !== 'any' || filter.where !== 'any';

  const deal = () => {
    const next = dealOne(tips, byTip, today, filter, dealt ?? todayId);
    if (!next) toast('Nothing left to deal with these filters. Try another time or place.');
    else setDealt(next.id);
  };

  const mark = async (tip: Tip) => {
    const now = await toggleChallenge(lang, tip.id);
    if (now) toast(tip.habit ? 'Done for today.' : 'Challenge done. Lovely.', { tone: 'success' });
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-6">
        <FeaturedCard tip={featured} dealt={Boolean(dealt)} dates={featured ? (byTip.get(featured.id) ?? []) : []} today={today} onMark={(t) => void mark(t)} onAnother={deal} onOpen={setDetails} onBack={dealt ? () => setDealt(undefined) : undefined} />
        <WeekCard today={today} doneDays={doneDays} streak={streak.days} doneToday={streak.doneToday} week={week} tried={tried} total={tips.length} />
      </aside>

      <section aria-label={translateUi('Beyond the app')} className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line/70 pb-4">
          <Segmented<TryFilter['show']>
            label={translateUi('Show')}
            value={filter.show}
            onChange={(show) => setFilter((f) => ({ ...f, show }))}
            options={[
              { value: 'open', label: translateUi('To try') },
              { value: 'done', label: translateUi('Done') },
              { value: 'all', label: translateUi('All') },
            ]}
          />
          <div role="group" aria-label={translateUi('How long')} className="flex items-center gap-1.5">
            <Clock size={15} className="text-ink-faint" aria-hidden />
            {MINUTES.map((m) => (
              <Chip key={m} on={filter.minutes === m} onClick={() => setFilter((f) => ({ ...f, minutes: f.minutes === m ? 'any' : m }))}><UiText source={'{0} min'} values={[m]} /></Chip>
            ))}
          </div>
          <div role="group" aria-label={translateUi('Where')} className="flex flex-wrap items-center gap-1.5">
            {places.map((w) => (
              <Chip key={w.id} on={filter.where === w.id} onClick={() => setFilter((f) => ({ ...f, where: f.where === w.id ? 'any' : (w.id as Where) }))}>
                {w.label}
              </Chip>
            ))}
          </div>
          {filtered && (
            <button type="button" onClick={() => setFilter((f) => ({ ...f, minutes: 'any', where: 'any' }))} className="hit text-[13px] font-semibold text-ink-soft hover:text-ink"><UiText source={'Clear'} /></button>
          )}
        </div>

        {groups.length ? (
          <div className="space-y-7">
            {groups.map((g) => (
              <section key={g.id} aria-label={g.label}>
                <h3 className={cx(label, 'mb-2.5 flex items-baseline gap-2')}>
                  {g.label}
                  <span className="font-semibold tracking-normal text-ink-faint/80 tabular-nums">{g.tips.length}</span>
                </h3>
                <ul className="grid gap-2 2xl:grid-cols-2">
                  {g.tips.map((tip, i) => (
                    <motion.li key={tip.id} layout="position" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.02 * Math.min(i, 10) }}>
                      <Row tip={tip} dates={byTip.get(tip.id) ?? []} today={today} isToday={tip.id === todayId} onOpen={() => setDetails(tip.id)} onMark={() => void mark(tip)} />
                    </motion.li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-10 text-center text-[15px] text-ink-soft">
            <Art name={filter.show === 'done' ? 'empty' : filtered ? 'search' : 'done'} size={84} className="text-ink-faint" />
            {filter.show === 'done' ? translateUi('Challenges you mark as done gather here.') : filtered ? translateUi('Nothing matches. Try another time or place.') : translateUi('All done. Habits come back tomorrow.')}
          </p>
        )}
      </section>

      <Drawer open={Boolean(detailTip)} onClose={() => setDetails(undefined)} title={detailTip?.title ?? ''}>
        {detailTip && <Detail tip={detailTip} dates={byTip.get(detailTip.id) ?? []} today={today} onMark={() => void mark(detailTip)} />}
      </Drawer>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={cx(chip, on ? 'border-transparent bg-inverse text-on-inverse' : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink')}>
      {children}
    </button>
  );
}

/** Today's challenge, or the one dealt: a card to hold, big enough to read and do. Dealing turns it over. */
function FeaturedCard({ tip, dealt, dates, today, onMark, onAnother, onOpen, onBack }: { tip?: Tip; dealt: boolean; dates: readonly string[]; today: string; onMark: (t: Tip) => void; onAnother: () => void; onOpen: (id: string) => void; onBack?: () => void }) {
  const translateUi = useUi();
  const still = useReducedMotion();
  if (!tip) {
    return (
      <div className="flex items-center gap-4 rounded-3xl border border-dashed border-line p-5 text-ink-soft">
        <Dices size={24} className="shrink-0 text-ink-faint" aria-hidden />
        <p className="text-[14.5px] leading-snug"><UiText source={'Not sure what to try? Deal one: it turns over a challenge you haven’t done, for the time and place you chose below.'} /></p>
      </div>
    );
  }
  const Icon = TIP_ICONS[tip.icon];
  const done = tip.habit ? dates.includes(today) : dates.length > 0;
  const steps = (tip.platforms ? tip.platforms[0]?.steps : tip.steps)?.slice(0, 2) ?? [];
  return (
    <div className="[perspective:1200px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={tip.id}
          initial={still ? { opacity: 0 } : { rotateY: -70, opacity: 0 }}
          animate={still ? { opacity: 1 } : { rotateY: 0, opacity: 1 }}
          exit={still ? { opacity: 0 } : { rotateY: 70, opacity: 0 }}
          transition={spring.gentle}
          className="relative rounded-3xl border border-line bg-raised p-1.5 shadow-elev-1"
        >
          {/* A card with a ruled inner edge, like one kept in a book. */}
          <div className="rounded-[20px] border border-line/70 px-5 pt-5 pb-4">
            <div className="flex items-center justify-between gap-3">
              <p className={label}>{dealt ? <UiText source={'Dealt · {0} min'} values={[tipMinutes(tip)]} /> : <><UiText source={'Today'} /> · <UiText source={'{0} min'} values={[tipMinutes(tip)]} /></>}</p>
              {onBack && (
                <button type="button" onClick={onBack} aria-label={translateUi('Put it back')} className="-mt-1 -mr-1 grid size-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-sunken hover:text-ink">
                  <X size={16} aria-hidden />
                </button>
              )}
            </div>
            <span className={cx('mt-4 grid size-12 place-items-center rounded-2xl', done ? 'bg-sage-soft text-sage-text' : 'bg-accent-soft text-accent-text')}>
              {done ? <Check size={22} strokeWidth={2.4} aria-hidden /> : <Icon size={22} aria-hidden />}
            </span>
            <h3 className="mt-3 font-serif text-[23px] leading-tight font-semibold text-balance">{tip.title}</h3>
            <p className="mt-1.5 text-[14.5px] leading-snug text-ink-soft">{tip.teaser}</p>
            {steps.length > 0 && (
              <ol className="mt-3.5 space-y-1.5 border-t border-line/60 pt-3 text-[13.5px] leading-snug text-ink-soft">
                {steps.map((step, i) => (
                  <li key={step} className="flex gap-2">
                    <span className="w-4 shrink-0 font-serif text-ink-faint tabular-nums">{i + 1}</span>
                    <span className="min-w-0">{step}</span>
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => onMark(tip)} aria-pressed={done} className={cx(chip, 'h-10 px-4 text-[14px]', done ? 'border-transparent bg-sage text-on-accent' : 'border-transparent bg-inverse text-on-inverse')}>
                <Check size={15} strokeWidth={2.6} aria-hidden /> {done ? translateUi('Done') : translateUi('I did it')}
              </button>
              <button type="button" onClick={() => onOpen(tip.id)} className={cx(chip, 'h-10 border-line bg-surface px-3.5 text-ink-soft hover:text-ink')}><UiText source={'How {0}'} values={[<ArrowRight size={14} aria-hidden />]} /></button>
              <button type="button" onClick={onAnother} className="hit ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft hover:text-ink"><UiText source={'{0} Another'} values={[<Dices size={14} aria-hidden />]} /></button>
            </div>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}

/** The week the challenges belong to: a dot per day (sage when one was done), the run, and how many were tried. */
function WeekCard({ today, doneDays, streak, doneToday, week, tried, total }: { today: string; doneDays: ReadonlySet<string>; streak: number; doneToday: boolean; week: number; tried: number; total: number }) {
  const translateUi = useUi();
  const locale = useContext(UiLocale);
  const days = Array.from({ length: 7 }, (_, i) => localDateKey(Date.now() - (6 - i) * 86_400_000));
  return (
    <div className="rounded-3xl border border-line/70 bg-surface px-5 py-4">
      <p className={label}><UiText source={'Beyond the app'} /></p>
      <p className="mt-1 font-serif text-[18px] leading-snug font-semibold">
        {week === 0 ? translateUi('Take the language out for a walk.') : week === 1 ? translateUi('One challenge this week.') : translateUi('{0} challenges this week.', [week])}
      </p>
      <ol className="mt-3.5 grid grid-cols-7 gap-1" aria-label={translateUi('This week')}>
        {days.map((date) => {
          const done = doneDays.has(date);
          return (
            <li key={date} className="flex flex-col items-center gap-1.5">
              <span className={cx('size-3.5 rounded-full border', done ? 'border-sage bg-sage' : 'border-line-strong', date === today && 'ring-2 ring-accent/40 ring-offset-2 ring-offset-surface')} aria-label={`${date}${done ? ' ✓' : ''}`} />
              <span className="text-[11px] font-semibold text-ink-faint uppercase">{weekday(date, locale)}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden>
        <div className="h-full rounded-full bg-sage transition-[width] duration-700" style={{ width: `${total ? Math.round((tried / total) * 100) : 0}%` }} />
      </div>
      <p className="mt-2 text-[13px] text-ink-soft"><UiText source={'{0}{1} of {2} tried.'} values={[streak > 1 ? `${streak} days in a row${doneToday ? '' : ': one more today keeps it alive'}. ` : '', tried, total]} /></p>
    </div>
  );
}

/** A challenge in a row: what it is, how long, and a tick that stamps it. */
function Row({ tip, dates, today, isToday, onOpen, onMark }: { tip: Tip; dates: readonly string[]; today: string; isToday: boolean; onOpen: () => void; onMark: () => void }) {
  const translateUi = useUi();
  const Icon = TIP_ICONS[tip.icon];
  const doneNow = tip.habit ? dates.includes(today) : dates.length > 0;
  return (
    <div className={cx('group flex items-center gap-3 rounded-2xl border bg-surface pr-2.5 transition-colors', doneNow ? 'border-sage/40' : 'border-line/70 hover:border-line-strong hover:bg-raised')}>
      <button type="button" onClick={onOpen} aria-label={translateUi('{0}: show how', [tip.title])} className="no-callout flex min-w-0 flex-1 items-center gap-3 py-3 pl-3 text-left">
        <span className={cx('grid size-10 shrink-0 place-items-center rounded-xl', doneNow ? 'bg-sage-soft text-sage-text' : 'bg-sunken text-ink-soft')}>
          <Icon size={18} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={cx('truncate text-[15px] font-semibold', doneNow && 'text-ink-soft')}>{tip.title}</span>
            {isToday && <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-text"><UiText source={'Today'} /></span>}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-ink-soft">{tip.teaser}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-[12px] font-semibold text-ink-faint tabular-nums"><UiText source={'{0} min'} values={[tipMinutes(tip)]} /></span>
          {tip.habit && dates.length > 0 && <span className="block text-[11.5px] font-bold text-sage-text"><UiText source={'{0}× so far'} values={[dates.length]} /></span>}
        </span>
      </button>
      <button
        type="button"
        onClick={onMark}
        aria-pressed={doneNow}
        aria-label={doneNow ? translateUi('{0}: done, undo', [tip.title]) : translateUi('{0}: mark done', [tip.title])}
        className={cx('grid size-9 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,transform] active:scale-90', doneNow ? 'border-transparent bg-sage text-on-accent' : 'border-line bg-surface text-ink-faint hover:border-sage hover:text-sage-text')}
      >
        <Check size={15} strokeWidth={2.6} aria-hidden />
      </button>
    </div>
  );
}

/** The back of a card: how to do it, in steps, with a mark and where to go. */
function Detail({ tip, dates, today, onMark }: { tip: Tip; dates: readonly string[]; today: string; onMark: () => void }) {
  const translateUi = useUi();
  const [platform, setPlatform] = useState(0);
  const steps = tip.platforms ? tip.platforms[platform]?.steps : tip.steps;
  const done = tip.habit ? dates.includes(today) : dates.length > 0;
  const level = tipLevel(tip);
  return (
    <div>
      <p className="text-[15px] leading-relaxed text-ink-soft">{tip.teaser}</p>
      <p className="mt-2 text-[12.5px] font-semibold text-ink-faint"><UiText source={'About {0} minutes{1}'} values={[tipMinutes(tip), level !== 'A1' ? ` · from ${level}` : '']} /></p>
      {tip.platforms && (
        <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label={translateUi('Where')}>
          {tip.platforms.map((p, i) => (
            <button key={p.name} type="button" role="tab" aria-selected={i === platform} onClick={() => setPlatform(i)} className={cx('h-8 rounded-full px-3 text-[12.5px] font-semibold transition-colors', i === platform ? 'bg-inverse text-on-inverse' : 'bg-sunken text-ink-soft hover:text-ink')}>
              {p.name}
            </button>
          ))}
        </div>
      )}
      <ol className="mt-4 space-y-2.5 text-[15px] leading-snug">
        {steps?.map((s, i) => (
          <li key={s} className="flex gap-2.5">
            <span className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-sunken text-[12px] font-bold text-ink-faint tabular-nums">{i + 1}</span>
            <span className="min-w-0 text-ink-soft">{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onMark} aria-pressed={done} className={cx(chip, 'h-10 px-4 text-[14px]', done ? 'border-transparent bg-sage text-on-accent' : 'border-transparent bg-inverse text-on-inverse')}>
          <Check size={15} strokeWidth={2.6} aria-hidden /> {tip.habit ? (done ? translateUi('Done today') : translateUi('Did it today')) : done ? translateUi('Done') : translateUi('Mark done')}
        </button>
        {tip.action?.to && (
          <Link to={tip.action.to} className={cx(chip, 'h-10 border-line px-4 text-[14px] text-ink-soft hover:text-ink')}>
            {tip.action.label} <ArrowRight size={14} aria-hidden />
          </Link>
        )}
        {tip.action?.href && (
          <a href={tip.action.href} target="_blank" rel="noopener noreferrer" className={cx(chip, 'h-10 border-line px-4 text-[14px] text-ink-soft hover:text-ink')}>
            {tip.action.label} <ExternalLink size={13} aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}
