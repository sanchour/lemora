import { UiText, useUi } from '@/design/i18n/UiText';
import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, Check, MousePointerClick, X } from 'lucide-react';
import { getLanguage, LANGUAGES, TIERS } from '@/core/lang/languages';
import type { LanguageInfo, Tier } from '@/core/lang/languages';
import { languagesIn, STATUS_NAME } from '@/data/territories';
import type { PlaceStatus } from '@/data/territories';
import { Flag, LanguageFlag } from '@/design/flags';
import { spring } from '@/design/motion';
import { SearchInput, searchKey } from '@/design/primitives';
import { cx } from '@/lib/cx';
import { LanguageMap, placeName } from './LanguageMap';

interface LanguageStepProps {
  target: string | null;
  onTarget: (code: string) => void;
}

/** What each tier includes, short enough for a line; the full sentence is the hover title. */
const SHORT: Record<Tier, string> = {
  1: 'Everything: grammar, the alphabet, a full dictionary, natural voices.',
  2: 'Every room, grammar and the alphabet. No course.',
  3: 'Reading, word packs, podcasts and music. No grammar yet.',
  4: 'Reading, your own words, radio and podcasts.',
  x: 'Machine translation where it exists.',
};
const TIER_ORDER: Tier[] = [1, 2, 3, 4, 'x'];
/** How each core language says hello: the first thing its card says to you. */
const HELLO: Record<string, string> = { es: 'Hola', fr: 'Bonjour', de: 'Hallo', ru: 'Привет', ar: 'مرحبا', zh: '你好' };
/** The order the postcards come in: the most-asked-for first, and the scripts alternate so the row never looks the same twice. */
const CORE_ORDER = ['es', 'fr', 'zh', 'de', 'ru', 'ar'];
/** A tiny pen drawing for each postcard's corner (32 x 32). */
const DOODLE: Record<string, string> = {
  es: 'M10 16a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M16 3V6.5M16 25.5V29M3 16H6.5M25.5 16H29M7 7L9.5 9.5M22.5 22.5L25 25M25 7L22.5 9.5M9.5 22.5L7 25',
  fr: 'M16 3V8M13 29L15 8H17L19 29M14 20H18M12 29H20M14.5 14H17.5',
  zh: 'M16 3V7M10 11C10 8 22 8 22 11V21C22 24 10 24 10 21ZM13 9C12 14 12 18 13 23M19 9C20 14 20 18 19 23M16 24V29M14 29H18',
  de: 'M16 24C8 24 5 16 10 12C14 9 18 12 16 16C14 12 18 9 22 12C27 16 24 24 16 24ZM12 25L10 28M20 25L22 28',
  ru: 'M16 3V7M16 7C10 12 9 15 12 17H20C23 15 22 12 16 7ZM11 17H21V28H11ZM14 28V22H18V28',
  ar: 'M22 6C14 6 8 11 8 17C8 23 13 28 20 27C14 25 12 18 15 13C17 10 19 8 22 6ZM24 11L25 13.5L27.5 14L25.5 15.5L26 18L24 16.5L22 18L22.5 15.5L20.5 14L23 13.5Z',
};
/** A hand-drawn, slightly uneven rounded rectangle for the postcards' outline (100 x 100, stretched to fit). */
const CARD_PATH = 'M7 3C30 1 70 4 93 2C97.5 2 98 5 98 9C99 35 97 65 98 91C98 96 95 98 91 98C65 99 35 96 9 98C4 98 2 95 2 91C1 65 3 35 2 9C2 5 3 3.5 7 3Z';
/** The panel's width, and how much of the map it covers with its margin. */
const PANEL = 340;
const COVER = PANEL + 12;

/**
 * Which language to learn (Lingua 5.1-2b): the world first, big and wide. Clicking a country centres it
 * and opens a panel with its languages, best supported first; the panel's other tab has every language,
 * and a search opens it too. Under the map the six core languages are one click away, and below them,
 * peeking in at the bottom of the screen, every language by tier. The language chosen stays named on
 * the map, and choosing one flies the map to where it is spoken.
 */
export function LanguageStep({ target, onTarget }: LanguageStepProps) {
  const translateUi = useUi();
  const [place, setPlace] = useState<string | null>(null);
  const [panel, setPanel] = useState<'place' | 'all' | null>(null);
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const q = searchKey(query.trim());
  const matches = (l: LanguageInfo) => !q || searchKey(`${l.name} ${l.endonym}`).includes(q);
  const core = CORE_ORDER.flatMap((code) => LANGUAGES.filter((l) => l.code === code));
  const chosen = target ? getLanguage(target) : undefined;
  const open = panel !== null;

  const hoverProps = (l: LanguageInfo) => ({
    onPointerEnter: () => setHovered(l.code),
    onPointerLeave: () => setHovered((h) => (h === l.code ? null : h)),
    onFocus: () => setHovered(l.code),
    onBlur: () => setHovered((h) => (h === l.code ? null : h)),
  });

  const pickPlace = (code: string | null) => {
    setPlace(code);
    setPanel(code ? 'place' : null);
  };
  const close = () => {
    setPanel(null);
    setPlace(null);
  };

  /** A language as a row in the panel: flag, its own name, where it stands there, and what Lingua has. */
  const row = (l: LanguageInfo, status?: PlaceStatus) => (
    <button
      key={l.code}
      type="button"
      role="radio"
      aria-checked={target === l.code}
      aria-disabled={l.soon || undefined}
      title={l.soon ? translateUi('{0} is coming. Pick another language for now.', [l.name]) : translateUi(TIERS[l.tier].includes)}
      onClick={() => !l.soon && onTarget(l.code)}
      {...hoverProps(l)}
      className={cx(
        'no-callout flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition-[background-color,border-color,transform] duration-150',
        target === l.code ? 'border-accent bg-accent-soft' : 'border-transparent hover:border-line hover:bg-surface',
        l.soon ? 'cursor-default opacity-50' : 'active:scale-[0.98]',
      )}
    >
      <LanguageFlag lang={l.code} width={28} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span lang={l.code} dir={l.rtl ? 'rtl' : undefined} className="truncate font-serif text-[16.5px] font-semibold">
            {l.endonym}
          </span>
          <span className="truncate text-[12px] text-ink-faint"><UiText source={l.name} /></span>
        </span>
        <span className="block truncate text-[11.5px] text-ink-soft">
          {status ? `${translateUi(STATUS_NAME[status])} · ` : ''}
          {l.soon ? translateUi('Coming') : translateUi(TIERS[l.tier].name)}
        </span>
      </span>
      {target === l.code ? (
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-fill text-on-accent">
          <Check size={14} strokeWidth={3.2} aria-hidden />
        </span>
      ) : (
        l.tier === 1 && <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-accent-text uppercase"><UiText source={'Core'} /></span>
      )}
    </button>
  );

  /** A language as a chip, in the core strip and the list below; the one chosen is filled. */
  const chip = (l: LanguageInfo, big = false) => {
    const on = target === l.code;
    return (
      <button
        key={l.code}
        type="button"
        role="radio"
        aria-checked={on}
        aria-disabled={l.soon || undefined}
        title={l.soon ? translateUi('{0} is coming. Pick another language for now.', [l.name]) : `${l.name} · ${l.endonym}`}
        onClick={() => !l.soon && onTarget(l.code)}
        {...hoverProps(l)}
        className={cx(
          'no-callout inline-flex items-center rounded-full border transition-[transform,background-color,border-color,color] duration-150',
          big ? 'h-9 gap-2 pr-3.5 pl-2' : 'h-8 gap-1.5 pr-3 pl-1.5 text-[13px]',
          on ? 'border-accent-fill bg-accent-fill font-semibold text-on-accent shadow-elev-1' : 'border-line bg-raised',
          l.soon ? 'cursor-default opacity-45' : !on && 'hover:-translate-y-0.5 hover:border-line-strong active:scale-[0.97]',
        )}
      >
        <LanguageFlag lang={l.code} width={big ? 22 : 20} />
        <span lang={big ? l.code : undefined} dir={big && l.rtl ? 'rtl' : undefined} className={big ? 'font-serif text-[15px] font-semibold' : undefined}>
          {big ? l.endonym : l.name}
        </span>
        {on && <Check size={14} strokeWidth={3.2} aria-hidden />}
      </button>
    );
  };

  const here = place
    ? languagesIn(place).flatMap(({ lang, status }) => {
        const l = getLanguage(lang);
        return l && matches(l) ? [{ l, status }] : [];
      })
    : [];

  return (
    <div>
      <div className="mb-3 flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-[30px] leading-tight font-semibold tracking-tight"><UiText source={'What language will it be?'} /></h1>
          <p className="mt-1 text-[14.5px] text-ink-soft"><UiText source={'Click a country to see what’s spoken there, or pick one of the six below.'} /></p>
        </div>
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v);
            if (v.trim() && panel !== 'all') setPanel('all');
          }}
          placeholder={translateUi('Search all languages')}
          className="w-72"
        />
      </div>

      <div className="relative overflow-hidden rounded-3xl shadow-elev-2" style={{ height: 'clamp(300px, calc(100dvh - 480px), 600px)' }}>
        <LanguageMap highlight={hovered ?? target} selected={target} place={place} onPlace={pickPlace} inset={open ? COVER : 0} />

        {/* Top of the map: how to begin, then which language was chosen. */}
        <div className="pointer-events-none absolute top-4 z-10 flex justify-center" style={{ left: 0, right: open ? COVER : 0 }}>
          <AnimatePresence mode="popLayout" initial={false}>
            {chosen ? (
              <motion.p
                key={chosen.code}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={spring.snappy}
                className="flex items-center gap-2.5 rounded-full border border-accent/40 bg-raised py-1.5 pr-2 pl-3 shadow-elev-2"
              >
                <span className="text-[12.5px] text-ink-soft"><UiText source={'You’re learning'} /></span>
                <LanguageFlag lang={chosen.code} width={22} />
                <span lang={chosen.code} dir={chosen.rtl ? 'rtl' : undefined} className="font-serif text-[16px] font-semibold">
                  {chosen.endonym}
                </span>
                <span className="grid size-6 place-items-center rounded-full bg-accent-fill text-on-accent">
                  <Check size={14} strokeWidth={3.2} aria-hidden />
                </span>
              </motion.p>
            ) : (
              !open && (
                <motion.p key="hint" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={spring.gentle} className="flex items-center gap-2 rounded-full border border-line bg-raised/95 px-4 py-2 text-[13.5px] font-semibold shadow-elev-1"><UiText source={'{0} Click a country to begin'} values={[<MousePointerClick size={16} className="text-accent-text" aria-hidden />]} /></motion.p>
              )
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {open && (
            <motion.aside
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={spring.snappy}
              aria-label={translateUi('Languages')}
              className="absolute top-3 right-3 bottom-3 z-20 flex flex-col overflow-hidden rounded-[20px] border border-line bg-raised shadow-elev-3"
              style={{ width: PANEL }}
            >
              <div className="flex items-center gap-1 border-b border-line px-2 pt-2">
                {place && (
                  <button type="button" onClick={() => setPanel('place')} className={cx('-mb-px flex items-center gap-2 border-b-2 px-3 pb-2 text-[13.5px] font-semibold', panel === 'place' ? 'border-accent text-ink' : 'border-transparent text-ink-soft hover:text-ink')}>
                    <Flag code={place.toLowerCase()} width={18} /> {placeName(place)}
                  </button>
                )}
                <button type="button" onClick={() => setPanel('all')} className={cx('-mb-px border-b-2 px-3 pb-2 text-[13.5px] font-semibold', panel === 'all' ? 'border-accent text-ink' : 'border-transparent text-ink-soft hover:text-ink')}><UiText source={'All languages'} /></button>
                <button type="button" onClick={close} aria-label={translateUi('Close')} className="mb-1.5 ml-auto grid size-7 place-items-center rounded-lg text-ink-faint hover:bg-surface hover:text-ink">
                  <X size={16} aria-hidden />
                </button>
              </div>

              <div role="radiogroup" aria-label={panel === 'place' && place ? translateUi('Languages in {0}', [placeName(place)]) : translateUi('All languages')} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
                {panel === 'place' && place && (
                  <>
                    <p className="px-2 pt-1 pb-2 text-[12.5px] text-ink-soft">
                      {here.length ? translateUi('{0} you can learn, spoken in {1}.', [here.length === 1 ? 'One language' : `${here.length} languages`, placeName(place)]) : translateUi('None of Lingua’s languages is spoken in {0} yet.', [placeName(place)])}
                    </p>
                    {here.map(({ l, status }) => row(l, status))}
                  </>
                )}
                {panel === 'all' &&
                  TIER_ORDER.map((tier) => {
                    const langs = LANGUAGES.filter((l) => l.tier === tier && matches(l));
                    if (!langs.length) return null;
                    return (
                      <section key={tier} className="mb-2">
                        <h2 className="px-2 pt-2 text-[11.5px] font-bold tracking-[0.08em] text-ink-faint uppercase"><UiText source={TIERS[tier].name} /></h2>
                        <p className="px-2 pb-1 text-[11.5px] text-ink-soft"><UiText source={SHORT[tier]} /></p>
                        {langs.map((l) => row(l))}
                      </section>
                    );
                  })}
                {panel === 'all' && !LANGUAGES.some(matches) && <p className="px-2 py-6 text-center text-[13.5px] text-ink-soft"><UiText source={'No language matches “{0}”.'} values={[query.trim()]} /></p>}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* The six core languages as little postcards: each says hello, tips towards you on hover and shows a sentence from its world. */}
      <div className="mt-4 flex items-center gap-3">
        <h2 className="relative font-serif text-[18px] font-semibold">
          <UiText source={'Start with a postcard'} />
          <svg viewBox="0 0 120 8" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 -bottom-1.5 h-2 w-full text-accent" aria-hidden>
            <motion.path d="M2 5C25 2 50 7 72 4C92 2 108 5 118 3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} />
          </svg>
        </h2>
        <span className="text-[12.5px] text-ink-soft" title={translateUi(TIERS[1].includes)}><UiText source={'Six languages with the full course: grammar, alphabet, dictionary and natural voices.'} /></span>
        <button
          type="button"
          onClick={() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13.5px] font-semibold text-accent-text hover:bg-accent-soft"
        ><UiText source={'All {0} languages {1}'} values={[LANGUAGES.length, <ArrowDown size={15} aria-hidden />]} /></button>
      </div>
      <div role="radiogroup" aria-label={translateUi('Core languages')} className="mt-3 grid grid-cols-6 gap-3">
        {core.map((l, i) => {
          const on = target === l.code;
          return (
            <motion.button
              key={l.code}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onTarget(l.code)}
              {...hoverProps(l)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, rotate: i % 2 ? 1.2 : -1.2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ ...spring.soft, delay: 0.05 * i }}
              className="no-callout group relative flex min-h-[164px] flex-col items-start p-4 text-left outline-none"
            >
              {/* The card itself: a wobbly pen outline over a soft fill, orange when chosen. */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cx('pointer-events-none absolute inset-0 size-full transition-colors duration-300', on ? 'text-accent' : 'text-line-strong group-hover:text-ink-faint')} aria-hidden>
                <path d={CARD_PATH} className={cx('transition-colors duration-300', on ? 'fill-accent-soft' : 'fill-raised')} stroke="currentColor" strokeWidth={on ? 2.2 : 1.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
              {/* A little doodle in the corner draws itself in; the check stamp takes its place when chosen. */}
              <svg viewBox="0 0 32 32" className="absolute top-3 right-3 size-8 text-accent" aria-hidden>
                <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: on ? 0.25 : 0.9, transition: 'opacity 0.3s' }}>
                  <motion.path d={DOODLE[l.code]} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.3 + 0.1 * i, ease: 'easeInOut' }} />
                </g>
              </svg>
              <span className={cx('absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-accent-fill text-on-accent transition-all duration-300', on ? 'scale-100' : 'scale-50 opacity-0')}>
                <Check size={16} strokeWidth={3} aria-hidden />
              </span>
              <span className="relative"><LanguageFlag lang={l.code} width={30} /></span>
              <span lang={l.code} dir={l.rtl ? 'rtl' : undefined} className="relative mt-3 font-serif text-[26px] leading-none font-semibold text-accent-text">{HELLO[l.code]}</span>
              <span className="relative mt-1.5 flex items-baseline gap-1.5">
                <span lang={l.code} dir={l.rtl ? 'rtl' : undefined} className="font-serif text-[15px] font-semibold">{l.endonym}</span>
                <span className="text-[11.5px] text-ink-faint"><UiText source={l.name} /></span>
              </span>
              {/* A line from its world fades in on hover, in its own script. */}
              <span lang={l.code} dir={l.rtl ? 'rtl' : undefined} className="relative mt-2 line-clamp-3 text-[12px] leading-snug text-ink-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">{l.sample}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Every language by tier, peeking in at the bottom of the screen. */}
      <div ref={listRef} className="mt-8 scroll-mt-6 divide-y divide-line/70 border-t border-line/70 pb-6">
        {TIER_ORDER.slice(1).map((tier) => (
          <div key={tier} role="radiogroup" aria-label={translateUi('{0} languages', [translateUi(TIERS[tier].name)])} className="grid grid-cols-[190px_minmax(0,1fr)] gap-5 py-4">
            <div title={translateUi(TIERS[tier].includes)}>
              <h2 className="text-[12px] font-bold tracking-[0.08em] text-ink-faint uppercase"><UiText source={TIERS[tier].name} /></h2>
              <p className="mt-1 text-[12px] leading-snug text-ink-soft"><UiText source={SHORT[tier]} /></p>
            </div>
            <div className="flex flex-wrap content-start gap-1.5">{LANGUAGES.filter((l) => l.tier === tier).map((l) => chip(l))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
