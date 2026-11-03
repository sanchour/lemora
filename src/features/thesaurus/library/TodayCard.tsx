import { UiText, useUi } from '@/design/i18n/UiText';
import { useState } from 'react';
import { Link } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowRight, Compass, Gamepad2, Layers, Puzzle, Shapes, TextCursorInput, Zap } from 'lucide-react';
import type { DeckCounts } from '@/data/decks';
import { useToday } from '@/data/stats';
import { useStudyMinutes } from '@/data/memoryViews';
import { catchUp, overdueCards } from '@/data/study';
import { useVocabularyCounts } from '@/data/words';
import { Button, buttonClasses, Popover } from '@/design/primitives';
import { toast } from '@/state/ui';
import { useGate } from '@/features/plans/PlanRoute';
import { cx } from '@/lib/cx';
import { DueCalendar } from './DueCalendar';
import { CARD_STATES, REVIEW } from './states';

/** Ludus's ways to play, from every deck. */
const LUDUS_PLAYS = [
  { to: '/thesaurus/study/all?mode=ludus', icon: Puzzle, title: 'A lesson', detail: 'Games with your cards: choose, match, build, listen, type' },
  { to: '/thesaurus/study/all?mode=ludus&lightning=1', icon: Zap, title: 'Lightning round', detail: 'As many as you can in a minute' },
  { to: '/thesaurus/practice', icon: Shapes, title: 'Practice sets', detail: 'Matching games, correct the mistake, rewrite, what comes next, drag the words' },
  { to: '/thesaurus/games', icon: Gamepad2, title: 'Word games', detail: 'Hangman, anagrams, missing letters and guessing from clues, on your own words' },
  { to: '/thesaurus/study/all?mode=ludus&kind=sentences', icon: TextCursorInput, title: 'Sentences with a gap', detail: 'Real sentences with one word missing, your words first' },
];

const DAY = 86_400_000;
const EMPTY_COUNTS: DeckCounts = { total: 0, new: 0, learning: 0, due: 0 };

interface TodayCardProps {
  lang: string;
  /** Today's work summed over every deck. */
  totals: DeckCounts | undefined;
  forecast?: number[];
  /** In the sticky rail beside My decks (wide windows): stacked; otherwise one row. */
  rail?: boolean;
  onDiscover?: () => void;
}

/**
 * The Scholar's Lexicon Desk (matching Codex's LecternCard):
 * Left: Bound cloth lexicon volume with swallowtail bookmark ribbon & three-state progress ring
 * Center: Eyebrow, serif heading, three-state breakdown pills, and Study + Ludus actions
 * Right: Minimalist vertical statistics (Today's reviews, Known vocabulary, 7-day outlook)
 */
export function TodayCard({ lang, totals, forecast, onDiscover }: TodayCardProps) {
  const translateUi = useUi();
  const activity = useToday(lang);
  const vocab = useVocabularyCounts(lang);
  const ludusGate = useGate('ludus');
  const [calendar, setCalendar] = useState(false);
  const counts = totals ?? EMPTY_COUNTS;
  const waiting = counts.new + counts.learning + counts.due;
  const minutes = useStudyMinutes(lang, waiting);

  const done = activity?.reviews ?? 0;
  const knownCount = vocab?.known ?? 0;
  const learningCount = vocab?.learning ?? counts.learning;
  const ahead = forecast?.some(Boolean) ? forecast : undefined;
  const ludusClass = buttonClasses(waiting > 0 ? 'secondary' : 'primary', 'sm');

  return (
    <div>
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-start lg:gap-10 xl:gap-14">
        {/* Left + Center: Bound Lexicon Volume and Study Desk Information */}
        <div className="flex min-w-0 max-w-xl shrink-0 items-start gap-5 sm:gap-6 lg:gap-7">
          {/* Tactile Cloth Lexicon Volume with Swallowtail Bookmark Ribbon */}
          <div className="group relative block shrink-0 self-start select-none">
            <div className="relative flex aspect-[2/3] w-28 flex-col items-center justify-between overflow-hidden rounded-r-[5px] rounded-l-[3px] border border-black/20 bg-[#273c33] px-3 py-4 text-center text-[#f4ede2] shadow-elev-2 sm:w-32 lg:w-36">
              {/* Woven linen texture overlay */}
              <span
                className="pointer-events-none absolute inset-0 opacity-35 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.12) 2px, rgba(255,255,255,0.12) 4px)',
                }}
                aria-hidden
              />
              {/* Inner gold-leaf frame */}
              <div className="pointer-events-none absolute inset-[7%] rounded-[3px] border border-[#d4af37]/50" aria-hidden />
              {/* Spine crease */}
              <span className="pointer-events-none absolute inset-y-0 left-0 w-[6.5%] bg-gradient-to-r from-black/30 to-transparent" aria-hidden />
              <span className="pointer-events-none absolute inset-y-0 left-[7%] w-px bg-black/35 shadow-[1px_0_0_rgba(255,255,255,0.14)]" aria-hidden />

              <span className="relative z-10 text-[8.5px] font-bold tracking-[0.22em] uppercase opacity-75">
                {lang}
              </span>
              <div className="relative z-10 my-auto">
                <Ring totals={counts} waiting={waiting} compact />
              </div>
              <span className="relative z-10 font-serif text-[10px] font-semibold tracking-[0.14em] uppercase opacity-80">
                <UiText source={'Thesaurus'} />
              </span>
            </div>

            {/* Swallowtail woven bookmark ribbon draped from top */}
            <div
              className="pointer-events-none absolute -top-2.5 right-3.5 z-10 h-9 w-3.5 bg-accent shadow-xs"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
              aria-hidden
            />
          </div>

          {/* Center: Eyebrow, Heading, State Pills, and Actions */}
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className={cx('size-2 rounded-full', waiting > 0 ? 'bg-accent' : 'bg-sage')} aria-hidden />
                <span className="text-[11px] font-bold tracking-[0.14em] text-accent-text uppercase">
                  <UiText source={'Today'} />
                </span>
                {waiting > 0 && minutes ? (
                  <span className="text-[12px] font-medium text-ink-faint tabular-nums">
                    · <UiText source={'About {0} min'} values={[minutes]} />
                  </span>
                ) : null}
              </div>

              <h2 className="font-serif text-xl font-semibold leading-tight text-ink sm:text-2xl lg:text-[26px]">
                {waiting > 0 ? (
                  <UiText source={'{0} {1}'} values={[waiting.toLocaleString(), waiting === 1 ? translateUi('card') : translateUi('cards')]} />
                ) : (
                  <UiText source={'All caught up'} />
                )}
              </h2>

              {waiting === 0 && (
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
                  <UiText source={'Nothing is due. Practise freely with Ludus.'} />
                </p>
              )}
            </div>

            {/* State Breakdown Pills */}
            <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
              {CARD_STATES.map((s) => (
                <li key={s.key} className={cx('inline-flex items-center gap-1.5', !counts[s.key] && 'opacity-50')}>
                  <span
                    className="flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-2xs"
                    style={{ background: s.color }}
                    aria-hidden
                  >
                    {s.glyph}
                  </span>
                  <span className="font-serif text-[15.5px] font-semibold text-ink tabular-nums">
                    {counts[s.key].toLocaleString()}
                  </span>
                  <span className="text-[12px] text-ink-soft">
                    <UiText source={s.label} />
                  </span>
                </li>
              ))}
            </ul>

            {/* Action buttons: Study + Ludus + Discover */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {waiting > 0 && (
                <Link to="/thesaurus/study/all?mode=recall" className={buttonClasses('primary', 'sm')}>
                  <UiText source={'{0}Study'} values={[<Layers size={15} aria-hidden />]} />
                  <ArrowRight size={14} aria-hidden />
                </Link>
              )}
              {ludusGate ? (
                <button type="button" onClick={ludusGate} className={ludusClass}>
                  <UiText source={'{0}Ludus{1}'} values={[<Puzzle size={15} aria-hidden />, <span aria-hidden>+</span>]} />
                </button>
              ) : (
                <Popover
                  label={translateUi('Ludus')}
                  placement="bottom-start"
                  trigger={(props) => (
                    <button type="button" {...props} className={ludusClass}>
                      <UiText source={'{0}Ludus'} values={[<Puzzle size={15} aria-hidden />]} />
                    </button>
                  )}
                >
                  {(close) => (
                    <div className="w-72 p-1.5">
                      {LUDUS_PLAYS.map((play) => (
                        <Link
                          key={play.to}
                          to={play.to}
                          onClick={close}
                          className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface"
                        >
                          <play.icon size={16} aria-hidden className="mt-0.5 shrink-0 text-accent-text" />
                          <span>
                            <span className="block font-serif text-[14.5px] font-semibold">{play.title}</span>
                            <span className="block text-[12px] leading-snug text-ink-soft">
                              <UiText source={play.detail} />
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </Popover>
              )}
              {counts.total === 0 && onDiscover && (
                <button type="button" onClick={onDiscover} className={buttonClasses('secondary', 'sm')}>
                  <Compass size={14} aria-hidden />
                  <UiText source={'Browse ready-made decks'} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Minimalist & aesthetic lexicon statistics (matching Codex LecternCard right rail) */}
        <div className="grid grid-cols-2 gap-4 border-t border-line/60 pt-4 sm:grid-cols-3 sm:gap-6 lg:mt-0 lg:flex lg:w-64 xl:w-72 lg:shrink-0 lg:flex-col lg:justify-between lg:self-stretch lg:border-t-0 lg:border-l lg:pl-8 xl:pl-10 lg:pt-0 lg:py-0.5">
          {/* Metric 1: Reviewed today */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">
              <UiText source={'Today'} />
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-serif text-xl lg:text-2xl font-semibold leading-none text-ink tabular-nums">
                {done.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-ink-faint">
                {done === 1 ? translateUi('review') : translateUi('reviews')}
              </span>
            </div>
          </div>

          <div className="hidden h-px w-full bg-line/60 lg:block" aria-hidden />

          {/* Metric 2: Known vocabulary */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">
              <UiText source={'Known vocabulary'} />
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
              <span className="font-serif text-xl lg:text-2xl font-semibold leading-none text-ink tabular-nums">
                {knownCount.toLocaleString()}
              </span>
              {learningCount > 0 && (
                <span className="text-xs font-semibold text-sage-text tabular-nums">
                  <span aria-hidden>· </span>
                  <UiText source={'{0} to learn'} values={[learningCount.toLocaleString()]} />
                </span>
              )}
            </div>
          </div>

          <div className="hidden h-px w-full bg-line/60 lg:block" aria-hidden />

          {/* Metric 3: Week ahead & calendar toggle */}
          <div className="col-span-2 sm:col-span-1">
            {ahead ? (
              <WeekAhead forecast={ahead} />
            ) : (
              <div>
                <p className="text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">
                  <UiText source={'Decks'} />
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-serif text-xl lg:text-2xl font-semibold leading-none text-ink tabular-nums">
                    {counts.total.toLocaleString()}
                  </span>
                  <span className="text-xs text-ink-faint">
                    {counts.total === 1 ? translateUi('card') : translateUi('cards')}
                  </span>
                </div>
              </div>
            )}
            <button
              type="button"
              aria-expanded={calendar}
              onClick={() => setCalendar((v) => !v)}
              className="mt-1.5 block text-[11.5px] font-semibold text-ink-soft underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
            >
              {calendar ? translateUi('Hide the calendar') : translateUi('Show the next five weeks')}
            </button>
          </div>
        </div>
      </div>

      <CatchUpOffer lang={lang} />
      {calendar && (
        <div className="mt-5 rounded-2xl border border-line/70 bg-surface p-4 sm:p-5">
          <DueCalendar lang={lang} />
        </div>
      )}
    </div>
  );
}

/** Overdue cards pile up after time away. From this many, offer to spread them over some days instead of one wall (6-3). */
const CATCH_UP_FROM = 40;

function CatchUpOffer({ lang }: { lang: string }) {
  const translateUi = useUi();
  const overdue = useLiveQuery(async () => (await overdueCards(lang)).length, [lang]);
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  if (!overdue || overdue < CATCH_UP_FROM) return null;
  const spread = async () => {
    setBusy(true);
    try {
      const moved = await catchUp(lang, days);
      toast({ source: '{0} cards spread over {1}', values: [String(moved.toLocaleString()), days === 1 ? { source: 'a day' } : days === 7 ? { source: 'a week' } : { source: '{0} days', values: [String(days)] }] }, { tone: 'success' });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-xl bg-sunken px-3.5 py-3 text-[13.5px]">
      <p className="min-w-0 flex-1 basis-56 leading-snug text-ink-soft"><UiText source={'{0} Spread the oldest first over some days instead of facing them at once.'} values={[<span className="font-semibold text-ink"><UiText source={'{0} cards have been waiting.'} values={[overdue.toLocaleString()]} /></span>]} /></p>
      <select aria-label={translateUi('Spread the overdue cards over')} value={days} onChange={(e) => setDays(Number(e.target.value))} className="h-9 rounded-full border border-line bg-raised px-3 text-[13px] font-semibold outline-none focus:border-ink">
        <option value={3}>{translateUi('3 days')}</option>
        <option value={7}>{translateUi('A week')}</option>
        <option value={14}>{translateUi('Two weeks')}</option>
      </select>
      <Button variant="secondary" size="sm" loading={busy} onClick={() => void spread()}><UiText source={'Catch up'} /></Button>
    </div>
  );
}

/** Today's work as a ring in three colours, the count in the middle; a full sage ring once it's all done. */
function Ring({ totals, waiting, compact = false }: { totals: DeckCounts; waiting: number; compact?: boolean }) {
  const translateUi = useUi();
  const r = compact ? 30 : 42;
  const box = compact ? 76 : 104;
  const center = box / 2;
  const stroke = compact ? 6 : 9;
  const c = 2 * Math.PI * r;
  const parts = CARD_STATES.map((s) => ({ ...s, n: totals[s.key] })).filter((p) => p.n > 0);
  const gap = parts.length > 1 ? 3 : 0;
  let start = 0;
  return (
    <span className={cx('relative grid shrink-0 place-items-center', compact ? 'size-[76px]' : 'size-[104px]')}>
      <svg viewBox={`0 0 ${box} ${box}`} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={center} cy={center} r={r} fill="none" stroke={waiting ? 'rgba(255,255,255,0.22)' : '#6b8e78'} strokeWidth={stroke} />
        {parts.map((p) => {
          const len = (c * p.n) / waiting;
          const arc = <circle key={p.key} cx={center} cy={center} r={r} fill="none" stroke={p.color} strokeWidth={stroke} strokeDasharray={`${Math.max(0.5, len - gap)} ${c}`} strokeDashoffset={-start} className="transition-[stroke-dasharray,stroke-dashoffset] duration-700 ease-out" />;
          start += len;
          return arc;
        })}
      </svg>
      <span className="text-center">
        <span className={cx('block font-serif leading-none font-semibold tabular-nums', compact ? 'text-[19px]' : 'text-[26px]')}>{waiting === 0 ? '✓' : waiting.toLocaleString()}</span>
        <span className="mt-0.5 block text-[8.5px] font-bold tracking-[0.12em] uppercase opacity-75">{waiting === 0 ? translateUi('done') : translateUi('to do')}</span>
      </span>
    </span>
  );
}

/** Seven slim bars: reviews coming due on each of the next days. */
function WeekAhead({ forecast }: { forecast: number[] }) {
  const translateUi = useUi();
  const peak = Math.max(1, ...forecast);
  const total = forecast.reduce((a, b) => a + b, 0);
  const day = (i: number) => (i === 0 ? 'Tmrw' : new Date(Date.now() + (i + 1) * DAY).toLocaleDateString('en', { weekday: 'short' }));
  return (
    <div>
      <p className="mb-2 flex items-baseline justify-between text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase"><UiText source={'Week ahead{0}'} values={[<span className="font-semibold tracking-normal normal-case tabular-nums">
          {total.toLocaleString()} {total === 1 ? translateUi('review') : translateUi('reviews')}
        </span>]} /></p>
      <div className="flex h-12 items-end gap-1.5" role="img" aria-label={forecast.map((n, i) => `${day(i)} ${n}`).join(', ')}>
        {forecast.map((n, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${day(i)}: ${n} ${n === 1 ? 'review' : 'reviews'}`}>
            <span className="w-full max-w-7 rounded-[4px]" style={{ height: `${Math.max(n ? 4 : 2, (n / peak) * 30)}px`, opacity: n ? 0.75 : 0.3, background: REVIEW }} />
            <span className="text-[10.5px] font-semibold text-ink-faint">{day(i)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
