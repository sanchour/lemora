import { UiText, useUi } from '@/design/i18n/UiText';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, AudioLines, Check, Gamepad2, GraduationCap, Infinity as Forever, KeyRound, Languages, Lightbulb, MessagesSquare, Mic, Music, PenLine, ShieldCheck, Tv } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PRICES } from '@/data/plan';
import type { PlanKind } from '@/data/plan';
import { spring } from '@/design/motion';
import { Button, Segmented } from '@/design/primitives';
import { TEST_MODE } from '@/services/licence/config';
import { LevelIcon } from '@/app/onboarding/LevelStep';
import { toast } from '@/state/ui';
import { useBuy } from './PlanCards';

type Perk = { icon: LucideIcon; name: string; text: string };

const PLUS: Perk[] = [
  { icon: Gamepad2, name: 'Ludus', text: 'Games that drill your own decks' },
  { icon: Music, name: 'Cantus', text: 'Sing along, podcasts, song games' },
  { icon: Tv, name: 'Streaming', text: 'Your shows with study subtitles' },
  { icon: GraduationCap, name: 'Cursus', text: 'The course, Grammatica and typing' },
  { icon: MessagesSquare, name: 'Sermo', text: 'Scenes to talk through in your AI app' },
  { icon: Forever, name: 'Every update', text: 'For life, no subscription' },
];
const MAX: Perk[] = [
  { icon: Languages, name: 'AI translation', text: 'Any sentence, in its context' },
  { icon: Lightbulb, name: 'Explain', text: 'Why it’s said that way' },
  { icon: PenLine, name: 'Diary feedback', text: 'Corrections on your own writing' },
  { icon: Mic, name: 'Dictation', text: 'Text for any audio and video' },
  { icon: AudioLines, name: 'Natural voices', text: 'Hear it as it’s really spoken' },
  { icon: KeyRound, name: 'Your own key', text: 'Free Groq or Gemini, kept on your device' },
];

/** Max a year against twelve months of it, and what a year comes to each month. */
const [YEAR, MONTH] = [parseFloat(PRICES.maxYear.slice(1)), parseFloat(PRICES.maxMonth.slice(1))];
const SAVING = Math.round((1 - YEAR / (MONTH * 12)) * 100);
const PER_MONTH = `€${(YEAR / 12).toFixed(2)}`;

type Plan = 'free' | 'plus' | 'max';

/** The three books on the shelf: a sprout, a flower and a tree, each a little taller and richer than the one before. */
const SHELF: Array<{ id: Plan; level: 'A1' | 'B2' | 'C2'; fill: string; ink: string; height: number }> = [
  { id: 'free', level: 'A1', fill: '#bcd6c2', ink: '#2b2a28', height: 168 },
  { id: 'plus', level: 'B2', fill: '#f2a266', ink: '#2b2a28', height: 192 },
  { id: 'max', level: 'C2', fill: '#2f2b29', ink: '#f7efe3', height: 216 },
];
const SPINE = 'M8 10C8 5 12 3 17 3H103C108 3 112 5 112 10V{h}C112 {h2} 108 {h3} 103 {h3}H17C12 {h3} 8 {h2} 8 {h}Z';

/** A book's spine, drawn with an uneven pen line, a gold band at the top and a ribbon band at the foot. */
function Spine({ fill, ink, height, open }: { fill: string; ink: string; height: number; open: boolean }) {
  const h = height - 12;
  const d = SPINE.replace(/\{h\}/g, String(h)).replace(/\{h2\}/g, String(h + 4)).replace(/\{h3\}/g, String(h + 8));
  return (
    <svg viewBox={`0 0 120 ${height}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full overflow-visible" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} fill={fill} stroke={open ? 'var(--accent)' : 'var(--ink)'} strokeWidth={open ? 2.4 : 1.6} vectorEffect="non-scaling-stroke" />
      <path d={`M14 18C40 15 80 20 106 17M14 24C40 22 80 26 106 23`} stroke={ink} strokeWidth={1.2} opacity={0.55} vectorEffect="non-scaling-stroke" />
      <path d={`M14 ${height - 30}C40 ${height - 33} 80 ${height - 28} 106 ${height - 31}`} stroke={ink} strokeWidth={1.2} opacity={0.55} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi'];
const FREE: Array<{ name: string; text?: string }> = [
  { name: 'Every book and article', text: 'Read anything, a tap from every meaning' },
  { name: 'Your decks', text: 'Cards that come back just in time' },
  { name: 'Radio and audiobooks', text: 'Listen while you read along' },
  { name: 'Alphabets', text: 'Learn to read and write new scripts' },
  { name: 'Mundus', text: 'Films and shows worth watching' },
  { name: 'Diarium', text: 'A diary in the language you learn' },
];
/** What each open book says: its plant, a line under the name, and its contents. */
const DETAIL: Record<Plan, { level: 'A1' | 'B2' | 'C2'; line: string; items: Array<{ name: string; text?: string }> }> = {
  free: { level: 'A1', line: 'Free stays free, for good.', items: FREE },
  plus: { level: 'B2', line: 'Pay once, keep it for life.', items: PLUS },
  max: { level: 'C2', line: 'Bring AI along for the reading.', items: MAX },
};

function Yours({ children }: { children: ReactNode }) {
  return (
    <p className="flex h-12 items-center justify-center gap-2 rounded-full bg-sage/15 text-[14.5px] font-semibold text-sage-text">
      <Check size={17} strokeWidth={3} aria-hidden /> {children}
    </p>
  );
}

/**
 * The first start's last page (5.1-2b), as a small bookshelf: Free, Lingua+ and Max stand as three books. Click one and it
 * lifts, and a page opens beneath the shelf with what it offers and its one button. Only true promises: what each plan opens,
 * how it is paid, and that words stay on the device.
 */
export function PlanPitch({ current, onFree, replay = false }: { current: PlanKind; onFree: () => void; replay?: boolean }) {
  const translateUi = useUi();
  const [open, setOpen] = useState<Plan | null>(null);
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const { busy, get: buyNow } = useBuy();
  // The Device lab's replay of the first start (7-0d) buys nothing.
  const get = replay ? async (_: Parameters<typeof buyNow>[0]) => void toast('Buying is off in the replay.') : buyNow;

  // "Unlock all of Lingua": the name is the wordmark, in the sentence at the same size.
  const title = translateUi('Unlock all of Lingua');
  const at = title.indexOf('Lingua');
  const pre = at >= 0 ? title.slice(0, at) : title;
  const post = at >= 0 ? title.slice(at + 'Lingua'.length) : '';
  const price: Record<Plan, string> = { free: translateUi('Free'), plus: PRICES.plus, max: PRICES.maxMonth };
  const names: Record<Plan, ReactNode> = { free: translateUi('Free'), plus: <>{'Lingua'}<span className="text-accent-text">+</span></>, max: 'Max' };

  return (
    <div>
      <h1 className="text-center font-serif text-[38px] leading-tight font-semibold tracking-tight">
        {pre}
        {at >= 0 && (
          <span className="relative inline-block">
            {'lingua'}<span className="text-accent">.</span>
            <svg viewBox="0 0 120 10" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 -bottom-1.5 h-2.5 w-full text-accent" aria-hidden>
              <motion.path d="M3 6C25 2 50 9 70 5C90 2 105 7 117 4" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
            </svg>
          </span>
        )}
        {post}
      </h1>

      {/* The shelf: three books, standing on a pen line. */}
      <div role="group" aria-label={translateUi('Plans')} className="relative mx-auto mt-10 flex max-w-xl items-end justify-center gap-5 pb-3">
        {SHELF.map((b, i) => {
          const on = open === b.id;
          const mine = current === b.id || (current === 'max' && b.id === 'plus');
          return (
            <motion.button
              key={b.id}
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : b.id)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: on ? -10 : 0, height: open ? Math.round(b.height * 0.56) : b.height }}
              whileHover={{ y: on ? -10 : -5 }}
              transition={{ ...spring.soft, delay: on ? 0 : 0.1 + i * 0.1 }}
              className="relative w-[128px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              style={{ color: b.ink }}
            >
              <Spine fill={b.fill} ink={b.ink} height={b.height} open={on} />
              <span className="relative flex h-full flex-col items-center justify-center gap-4 px-3 text-center" style={{ paddingTop: open ? 22 : 32, paddingBottom: open ? 22 : 36 }}>
                {!open && <LevelIcon level={b.level} className="size-11" style={{ color: b.ink }} />}
                <span>
                  <span className="block font-serif text-[22px] leading-none font-semibold">{names[b.id]}</span>
                  <span className="mt-1.5 block text-[12.5px] tabular-nums opacity-75">{price[b.id]}</span>
                </span>
              </span>
              {mine && b.id !== 'free' && (
                <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-sage text-on-accent shadow-elev-1"><Check size={13} strokeWidth={3.2} aria-hidden /></span>
              )}
              {/* A ribbon marker hangs from the book that is open. */}
              <AnimatePresence>
                {on && (
                  <motion.svg initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} viewBox="0 0 16 30" className="absolute -top-[18px] left-1/2 h-7 w-4 -translate-x-1/2" aria-hidden>
                    <path d="M2 2V26L8 21L14 26V2Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth={1.2} strokeLinejoin="round" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
        <svg viewBox="0 0 600 8" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-[-6%] bottom-0 h-2 w-[112%] text-line-strong" aria-hidden>
          <path d="M0 4C80 1 160 7 250 4C340 1 440 7 520 3C550 2 580 4 600 4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      {/* The page that opens under the shelf. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="page" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="mx-auto mt-5 max-w-4xl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={open} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }} className="relative grid grid-cols-2 overflow-hidden rounded-[26px] border border-line bg-raised shadow-elev-2">
                  {/* The gutter of the open book, and a soft shade toward it on both pages. */}
                  <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-line-strong/60" aria-hidden />
                  <span className="pointer-events-none absolute inset-y-0 left-[calc(50%-36px)] w-9 bg-gradient-to-r from-transparent to-ink/[0.045]" aria-hidden />
                  <span className="pointer-events-none absolute inset-y-0 left-1/2 w-9 bg-gradient-to-l from-transparent to-ink/[0.045]" aria-hidden />

                  {/* Left page: whose book this is, its price, and the one button. */}
                  <section className="flex flex-col px-9 py-7">
                    <p className="flex items-center gap-3">
                      <LevelIcon level={DETAIL[open].level} className="size-12" />
                      <span className="font-serif text-[34px] leading-none font-semibold">{names[open]}</span>
                    </p>
                    <p className="mt-3 font-serif text-[16px] text-ink-soft italic">{DETAIL[open].line}</p>
                    <div className="mt-5 flex-1">
                      {open === 'free' && (
                        <p className="font-serif text-[46px] leading-none font-semibold">{translateUi('Free')}</p>
                      )}
                      {open === 'plus' && (
                        <>
                          <p className="font-serif text-[46px] leading-none font-semibold tabular-nums">{PRICES.plus}</p>
                          <p className="mt-1.5 text-[13.5px] text-ink-soft"><UiText source={'once, every update included'} /></p>
                        </>
                      )}
                      {open === 'max' && (
                        <>
                          <p className="font-serif text-[46px] leading-none font-semibold tabular-nums">{period === 'month' ? PRICES.maxMonth : PRICES.maxYear}</p>
                          <p className="mt-1.5 text-[13.5px] text-ink-soft">{period === 'month' ? translateUi('a month, cancel any time') : translateUi('a year: about {0} a month, save {1}%', [PER_MONTH, SAVING])}</p>
                          <div className="mt-3">
                            <Segmented<'month' | 'year'>
                              label={translateUi('Billing')}
                              value={period}
                              onChange={setPeriod}
                              options={[
                                { value: 'month', label: translateUi('Monthly') },
                                { value: 'year', label: translateUi('Yearly') },
                              ]}
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-6">
                      {open === 'free' && <Button size="lg" block className="!rounded-full" onClick={onFree} iconRight={ArrowRight}><UiText source={'Continue free'} /></Button>}
                      {open === 'plus' &&
                        (current === 'free' ? (
                          <Button size="lg" block className="!rounded-full" loading={busy === 'plus'} onClick={() => void get('plus')} iconRight={ArrowRight}><UiText source={'Get Lingua+ for {0}'} values={[PRICES.plus]} /></Button>
                        ) : (
                          <Yours>{current === 'plus' ? translateUi('Lingua+ is yours') : translateUi('Included in your Max')}</Yours>
                        ))}
                      {open === 'max' &&
                        (current === 'max' ? (
                          <Yours><UiText source={'Max is yours'} /></Yours>
                        ) : (
                          <Button size="lg" block className="!rounded-full" loading={busy === 'maxMonth' || busy === 'maxYear'} onClick={() => void get(period === 'month' ? 'maxMonth' : 'maxYear')} iconRight={ArrowRight}><UiText source={'Get Max{0}'} values={[current === 'free' ? <UiText source={', with everything in Lingua+'} /> : '']} /></Button>
                        ))}
                    </div>
                  </section>

                  {/* Right page: the contents, numbered like a book's. */}
                  <section className="px-9 py-7">
                    <p className="font-serif text-[13px] tracking-[0.18em] text-ink-faint uppercase italic"><UiText source={'What’s inside'} /></p>
                    <ol className="mt-3">
                      {DETAIL[open].items.map((p, i) => (
                        <motion.li key={p.name} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.05, duration: 0.3 }} className="flex gap-4 border-b border-dotted border-line-strong/70 py-2.5 last:border-b-0">
                          <span className="w-6 shrink-0 pt-px text-right font-serif text-[15px] text-accent-text italic">{ROMAN[i]}</span>
                          <span className="min-w-0">
                            <span className="block font-serif text-[17px] leading-tight font-semibold">{p.name}</span>
                            {p.text && <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-soft">{p.text}</span>}
                          </span>
                        </motion.li>
                      ))}
                    </ol>
                  </section>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-[12px] text-ink-faint">
        <ShieldCheck size={14} aria-hidden /> {TEST_MODE ? translateUi('Test mode: nothing is charged') : translateUi('Secure payment with Stripe')}
      </p>
    </div>
  );
}
