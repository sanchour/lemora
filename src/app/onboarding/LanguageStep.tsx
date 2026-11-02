import { UiText, useUi } from '@/design/i18n/UiText';
import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, Check, ChevronDown, MousePointerClick, X } from 'lucide-react';
import { getLanguage, LANGUAGES } from '@/core/lang/languages';
import type { LanguageInfo } from '@/core/lang/languages';
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

/**
 * How the languages are grouped for choosing: the core six, then beta (reading, word packs, podcasts and music, but no course,
 * grammar or alphabet), then the ones that are still to come. Display only: the tiers underneath stay as they are.
 */
type GroupKey = 'core' | 'beta' | 'soon';
const GROUPS: { key: GroupKey; name: string; blurb: string; has: (l: LanguageInfo) => boolean }[] = [
  { key: 'core', name: 'Core', blurb: 'Everything: grammar, the alphabet, a full dictionary, natural voices.', has: (l) => l.tier === 1 },
  { key: 'beta', name: 'Beta', blurb: 'Reading, word packs, podcasts and music. No course, grammar or alphabet.', has: (l) => l.tier !== 1 && !l.soon },
  { key: 'soon', name: 'Coming soon', blurb: 'On their way. Not ready to learn yet.', has: (l) => l.tier !== 1 && !!l.soon },
];
const groupOf = (l: LanguageInfo) => GROUPS.find((g) => g.has(l))!;
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
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const q = searchKey(query.trim());
  const matches = (l: LanguageInfo) => !q || searchKey(`${l.name} ${l.endonym}`).includes(q);
  const core = LANGUAGES.filter((l) => l.tier === 1);
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
  const row = (l: LanguageInfo, status?: PlaceStatus, compact = false) => (
    <button
      key={l.code}
      type="button"
      role="radio"
      aria-checked={target === l.code}
      aria-disabled={l.soon || undefined}
      title={l.soon ? translateUi('{0} is coming. Pick another language for now.', [l.name]) : translateUi(groupOf(l).blurb)}
      onClick={() => !l.soon && onTarget(l.code)}
      {...hoverProps(l)}
      className={cx(
        'no-callout flex w-full items-center border text-left transition-[background-color,border-color,transform] duration-150',
        compact ? 'gap-2 rounded-xl px-2 py-1' : 'gap-3 rounded-2xl px-3 py-2',
        target === l.code ? 'border-accent bg-accent-soft' : 'border-transparent hover:border-line hover:bg-surface',
        l.soon ? 'cursor-default opacity-50' : 'active:scale-[0.98]',
      )}
    >
      <LanguageFlag lang={l.code} width={compact ? 20 : 28} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span lang={l.code} dir={l.rtl ? 'rtl' : undefined} className={cx('truncate font-serif font-semibold', compact ? 'text-[14px]' : 'text-[16.5px]')}>
            {l.endonym}
          </span>
          <span className={cx('truncate text-ink-faint', compact ? 'text-[11px]' : 'text-[12px]')}><UiText source={l.name} /></span>
        </span>
        <span className={cx('block truncate text-[11.5px] text-ink-soft', compact && 'hidden')}>
          {status ? `${translateUi(STATUS_NAME[status])} · ` : ''}
          {l.soon ? translateUi('Coming') : translateUi(groupOf(l).name)}
        </span>
      </span>
      {target === l.code ? (
        <span className={cx('grid shrink-0 place-items-center rounded-full bg-accent-fill text-on-accent', compact ? 'size-5' : 'size-6')}>
          <Check size={compact ? 12 : 14} strokeWidth={3.2} aria-hidden />
        </span>
      ) : (
        l.tier === 1 && !compact && <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-accent-text uppercase"><UiText source={'Core'} /></span>
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
          'no-callout inline-flex items-center rounded-full border',
          big ? 'h-9 gap-2 pr-3.5 pl-2' : 'h-8 gap-1.5 pr-3 pl-1.5 text-[13px]',
          on ? 'border-accent-fill bg-accent-fill font-semibold text-on-accent shadow-elev-1' : 'border-line bg-raised',
          l.soon && 'cursor-default opacity-45',
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
          <h1 className="font-serif text-[38px] leading-tight font-semibold tracking-tight"><UiText source={'What language will it be?'} /></h1>
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
                  GROUPS.map((g) => {
                    const langs = LANGUAGES.filter((l) => g.has(l) && matches(l));
                    if (!langs.length) return null;
                    return (
                      <section key={g.key} className="mb-2">
                        <h2 className="px-2 pt-1.5 text-[11px] font-bold tracking-[0.08em] text-ink-faint uppercase"><UiText source={g.name} /></h2>
                        <p className="px-2 pb-1 text-[11px] leading-snug text-ink-soft"><UiText source={g.blurb} /></p>
                        <div className="grid grid-cols-1">{langs.map((l) => row(l, undefined, true))}</div>
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
      <div className="mt-5 flex items-center gap-4">
        <h2 className="shrink-0 font-serif text-[28px] leading-none font-semibold tracking-tight whitespace-nowrap"><UiText source={'Our core languages'} /></h2>
        <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft" title={translateUi(GROUPS[0].blurb)}><UiText source={'Six languages with the full course: grammar, alphabet, dictionary and natural voices.'} /></span>
        <button
          type="button"
          onClick={() => {
            setLibraryOpen(true);
            setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
          }}
          className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-line bg-raised py-1.5 pr-1.5 pl-4 text-[13.5px] font-semibold whitespace-nowrap shadow-elev-1 transition-[border-color,background-color] hover:border-accent hover:bg-accent-soft"
        >
          <span className="tabular-nums"><UiText source={'All {0} languages'} values={[LANGUAGES.length]} /></span>
          <span className="grid size-7 place-items-center rounded-full bg-accent-fill text-on-accent transition-transform duration-200 group-hover:translate-y-0.5"><ArrowDown size={15} aria-hidden /></span>
        </button>
      </div>
      <div role="radiogroup" aria-label={translateUi('Core languages')} className="mt-4 grid grid-cols-6 gap-3">
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
              transition={{ ...spring.soft, delay: 0.05 * i }}
              className={cx(
                'no-callout group relative flex min-h-[140px] min-w-0 flex-col items-start overflow-hidden rounded-[20px] border p-4 text-left outline-none',
                on ? 'border-accent bg-accent-soft' : 'border-line bg-raised',
              )}
            >
              <span className="flex h-8 items-center"><LanguageFlag lang={l.code} width={34} /></span>
              {/* Its name in itself, and in yours. */}
              <span lang={l.code} dir={l.rtl ? 'rtl' : undefined} className="mt-auto w-full pt-5 font-serif text-[24px] leading-tight font-semibold break-words">{l.endonym}</span>
              <span className="mt-0.5 w-full text-[13px] leading-snug text-ink-soft"><UiText source={l.name} /></span>
              <span className={cx('absolute right-3 bottom-3 grid size-6 place-items-center rounded-full bg-accent-fill text-on-accent transition-all duration-300', on ? 'scale-100' : 'scale-50 opacity-0')}>
                <Check size={14} strokeWidth={3.2} aria-hidden />
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* The library: every other language on two shelves, the ones you can read in today and the ones still to come. */}
      <div ref={listRef} className="mt-9 scroll-mt-6 pb-6">
        <button type="button" onClick={() => setLibraryOpen((o) => !o)} aria-expanded={libraryOpen} className="group grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-1 rounded-2xl py-1 text-left">
          <span className="row-span-2 grid size-9 place-items-center rounded-full border border-line bg-raised text-ink-soft">
            <ChevronDown size={18} aria-hidden className={cx('transition-transform duration-300', libraryOpen && 'rotate-180')} />
          </span>
          <h2 className="self-end font-serif text-[24px] leading-none font-semibold tracking-tight whitespace-nowrap"><UiText source={'The library'} /></h2>
          <span className="self-start text-[13px] text-ink-soft"><UiText source={'Every other language, shelved by how much Lingua has for it.'} /></span>
        </button>
        <AnimatePresence initial={false}>
          {libraryOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
              <div className="mt-3 grid gap-4">
              {GROUPS.slice(1).map((g) => {
                const langs = LANGUAGES.filter((l) => g.has(l));
                return (
                  <section key={g.key} role="radiogroup" aria-label={translateUi('{0} languages', [translateUi(g.name)])} className="rounded-3xl border border-line bg-raised px-5 pt-4 pb-3 shadow-elev-1">
                    <header className="flex items-center gap-3">
                      <span className={cx('rounded-full px-3 py-1 text-[11.5px] font-bold tracking-[0.08em] uppercase', g.key === 'beta' ? 'bg-accent-soft text-accent-text' : 'bg-sunken text-ink-soft')}><UiText source={g.name} /></span>
                      <span className="text-[12.5px] text-ink-soft"><UiText source={g.blurb} /></span>
                      <span className="ml-auto text-[12px] text-ink-faint tabular-nums">{langs.length}</span>
                    </header>
                    <div className="mt-3 flex flex-wrap content-start gap-1.5">{langs.map((l) => chip(l))}</div>
                    {/* The shelf: one uneven pen line under the row. */}
                    <svg viewBox="0 0 400 8" preserveAspectRatio="none" className="mt-3 h-2 w-full text-line-strong" aria-hidden>
                      <path d="M2 4C60 2 120 6 200 4C270 2 340 6 398 3" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </section>
                );
              })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
