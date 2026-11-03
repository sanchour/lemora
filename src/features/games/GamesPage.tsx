import { UiText, useUi } from '@/design/i18n/UiText';
// Thesaurus › Games (6-21): the shelf of games played on the learner's own words, and each game on its own address. The words are
// the same ones Practice draws on; a game that cannot be made from them says what is missing instead of opening empty.
import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { Link, useParams } from 'react-router';
import {
  ArrowLeftRight,
  ArrowRight,
  Blocks,
  BookOpen,
  Calendar,
  CalendarRange,
  Compass,
  Ear,
  FileSearch,
  FolderKanban,
  Gamepad2,
  Grid3x3,
  Hash,
  HelpCircle,
  Image,
  KeyRound,
  Languages,
  Layers,
  LayoutGrid,
  Lightbulb,
  Link2,
  ListFilter,
  Puzzle,
  Repeat,
  Search,
  Shapes,
  Shuffle,
  Sparkles,
  Star,
  TextCursorInput,
  Trophy,
  Type,
  Waypoints,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { clock } from '@/core/games/bests';
import type { Best, Bests } from '@/core/games/bests';
import { GAME_GROUPS, GAMES as ALL_GAMES, gameById } from '@/core/games/defs';
import type { GameDef, GameGroup } from '@/core/games/defs';
import { canPlay } from '@/core/games/source';
import type { GameItem, GameSource } from '@/core/games/source';
import { getLanguage } from '@/core/lang/languages';
import { gameSource, useBests } from '@/data/games';
import { useApp } from '@/app/context';
import { PageHeader } from '@/app/PageHeader';
import { buttonClasses, EmptyState, Segmented } from '@/design/primitives';
import { Anagram } from './Anagram';
import { Clues } from './Clues';
import { Bingo } from './Bingo';
import { Choice } from './Choice';
import { Crossword } from './Crossword';
import { Daily, Weekly } from './Daily';
import { Hangman } from './Hangman';
import { Hunt } from './Hunt';
import { Ladder } from './Ladder';
import { Memory } from './Memory';
import { MissingLetters } from './MissingLetters';
import { Parts } from './Parts';
import { Race } from './Race';
import { Story } from './Story';
import { Timed } from './Timed';
import { Tournament } from './Tournament';
import { OddOneOut, Sorting } from './Sorting';
import { WordSearch } from './WordSearch';

interface ScreenProps {
  lang: string;
  def: GameDef;
  items: GameItem[];
  best?: Best;
  /** For the tournament, which plays the others. */
  source?: GameSource;
  bests?: Bests;
}

/** The screen of each game that has one; a game without one is not on the shelf yet. */
const SCREENS: Record<string, ComponentType<ScreenProps>> = { hangman: Hangman, anagram: Anagram, missing: MissingLetters, clues: Clues, wordsearch: WordSearch, hunt: Hunt, ladder: Ladder, crossword: Crossword, daily: Daily, weekly: Weekly, story: Story, translate: (p) => <Timed {...p} kind="translate" />, dictation: (p) => <Timed {...p} kind="dictation" />, tournament: (p) => <Tournament {...p} source={p.source!} render={(id) => { const S = SCREENS[id]; return <S {...p} def={gameById(id)!} best={p.bests?.[id]} />; }} />, definition: (p) => <Choice {...p} kind="definition" />, picture: (p) => <Choice {...p} kind="picture" />, memory: Memory, bingo: Bingo, parts: Parts, sorting: Sorting, odd: OddOneOut, synonyms: (p) => <Race {...p} relation="synonym" />, antonyms: (p) => <Race {...p} relation="antonym" />, association: (p) => <Race {...p} relation="any" /> };
const GAMES = ALL_GAMES.filter((g) => g.id in SCREENS || g.id === 'projects');

const QUICK_MODES = [
  { to: '/thesaurus/study/all?mode=ludus', icon: Puzzle, title: 'A lesson', detail: 'Games with your cards: choose, match, build, listen, type' },
  { to: '/thesaurus/study/all?mode=ludus&lightning=1', icon: Zap, title: 'Lightning round', detail: 'As many as you can in a minute' },
  { to: '/thesaurus/practice', icon: Shapes, title: 'Practice sets', detail: 'Matching games, correct the mistake, rewrite, what comes next, drag the words' },
  { to: '/thesaurus/study/all?mode=ludus&kind=sentences', icon: TextCursorInput, title: 'Sentences with a gap', detail: 'Real sentences with one word missing, your words first' },
];

const GAME_ICONS: Record<string, LucideIcon> = {
  daily: Calendar,
  weekly: CalendarRange,
  tournament: Trophy,
  hangman: Type,
  anagram: Shuffle,
  missing: KeyRound,
  clues: Lightbulb,
  wordsearch: Search,
  hunt: FileSearch,
  crossword: Grid3x3,
  synonyms: Repeat,
  antonyms: ArrowLeftRight,
  association: Link2,
  sorting: FolderKanban,
  odd: ListFilter,
  definition: HelpCircle,
  picture: Image,
  memory: LayoutGrid,
  bingo: Hash,
  parts: Blocks,
  translate: Languages,
  dictation: Ear,
  story: Compass,
  projects: Waypoints,
  ladder: BookOpen,
};

type GroupFilter = 'all' | GameGroup;
const GROUP_KEYS = Object.keys(GAME_GROUPS) as GameGroup[];

export default function GamesPage() {
  const translateUi = useUi();
  const { language } = useApp();
  const lang = language.id;
  const name = getLanguage(lang)?.name ?? lang;
  const gameId = useParams().game;
  const def = gameById(gameId);
  const bests = useBests(lang);
  const [source, setSource] = useState<GameSource | null>(null);
  const [filter, setFilter] = useState<GroupFilter>('all');

  useEffect(() => {
    let alive = true;
    setSource(null);
    void gameSource(lang).then((i) => alive && setSource(i));
    return () => {
      alive = false;
    };
  }, [lang]);

  if (gameId && !(def && def.id in SCREENS))
    return (
      <EmptyState icon={Gamepad2} title={translateUi('No such game')} action={<Link to="/thesaurus/games" className={buttonClasses('secondary', 'md')}><UiText source={'All games'} /></Link>}><UiText source={'That game is not on the shelf.'} /></EmptyState>
    );

  if (def) {
    if (!source) return <p className="p-10 text-ink-soft"><UiText source={'Looking at your words…'} /></p>;
    const can = canPlay(def, source, lang, translateUi);
    if (!can.ok)
      return (
        <EmptyState icon={Gamepad2} title={translateUi('{0} can’t be made yet', [def.title])} action={<Link to="/thesaurus/games" className={buttonClasses('secondary', 'md')}><UiText source={'All games'} /></Link>}>
          <UiText source={can.reason} />
        </EmptyState>
      );
    const Screen = SCREENS[def.id];
    return <Screen key={`${lang}:${def.id}`} lang={lang} def={def} items={source.items} best={bests?.[def.id]} source={source} bests={bests} />;
  }

  const played = GAMES.filter((g) => bests?.[g.id]);
  const visibleGroups = GROUP_KEYS.filter((g) => filter === 'all' || filter === g);

  const section = (group: GameGroup) => {
    const games = GAMES.filter((g) => g.group === group);
    if (!games.length) return null;
    return (
      <section key={group} aria-label={translateUi(GAME_GROUPS[group].title)}>
        <header className="mb-4 flex items-baseline gap-2.5 border-b border-line pb-2">
          <h2 className="font-serif text-xl font-semibold">
            <UiText source={GAME_GROUPS[group].title} />
          </h2>
          <span className="text-sm font-bold text-ink-faint tabular-nums">{games.length}</span>
          <span className="ml-auto hidden text-[12.5px] text-ink-faint sm:block">
            <UiText source={GAME_GROUPS[group].detail} />
          </span>
        </header>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => {
            const can = source ? canPlay(g, source, lang, translateUi) : null;
            const best = bests?.[g.id];
            const to = g.id === 'projects' ? '/thesaurus/games/projects' : `/thesaurus/games/${g.id}`;
            const Icon = GAME_ICONS[g.id] ?? Sparkles;

            if (can?.ok) {
              return (
                <Link
                  key={g.id}
                  to={to}
                  className="group flex flex-col justify-between rounded-2xl border border-line/70 bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-elev-2"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line/50 bg-sage-soft/75 text-sage-text transition-colors duration-200 group-hover:bg-accent-soft group-hover:text-accent-text">
                        <Icon size={18} strokeWidth={1.75} aria-hidden />
                      </span>
                      {best ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sage-soft px-2.5 py-0.5 text-[11px] font-bold text-sage-text tabular-nums">
                          <Star size={10} fill="currentColor" aria-hidden />
                          {best.stars} · {clock(best.ms)}
                        </span>
                      ) : (
                        <span className="rounded-md bg-raised px-2 py-0.5 text-[10.5px] font-bold tracking-[0.08em] text-ink-faint uppercase">
                          <UiText source={GAME_GROUPS[g.group].title} />
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3.5 font-serif text-[17.5px] leading-snug font-semibold text-ink transition-colors group-hover:text-accent-text">
                      <UiText source={g.title} />
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                      <UiText source={g.detail} />
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-line/50 pt-3 text-[12.5px] font-semibold text-ink transition-colors group-hover:text-accent-text">
                    <span>{best ? translateUi('Play again') : translateUi('Play')}</span>
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={g.id}
                className="flex flex-col justify-between rounded-2xl border border-line/50 bg-surface/45 p-5 opacity-75"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line/50 bg-sunken text-ink-faint">
                      <Icon size={18} strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="rounded-md bg-raised/60 px-2 py-0.5 text-[10.5px] font-bold tracking-[0.08em] text-ink-faint uppercase">
                      <UiText source={GAME_GROUPS[g.group].title} />
                    </span>
                  </div>
                  <h3 className="mt-3.5 font-serif text-[17.5px] leading-snug font-semibold text-ink">
                    <UiText source={g.title} />
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    <UiText source={g.detail} />
                  </p>
                </div>
                <p className="mt-4 border-t border-line/40 pt-3 text-[12px] leading-snug text-ink-faint">
                  {!can ? <UiText source={'Looking at your words…'} /> : <UiText source={can.reason} />}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <>
      <PageHeader
        englishTitle="Ludus"
        title={translateUi('Ludus')}
        eyebrow={translateUi('{0}, played on your words', [name])}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/thesaurus/practice" className={buttonClasses('secondary', 'md')}>
              <Shapes size={16} aria-hidden />
              <UiText source={'Practice'} />
            </Link>
            <Link to="/thesaurus" className={buttonClasses('secondary', 'md')}>
              <Layers size={16} aria-hidden />
              <UiText source={'Thesaurus'} />
            </Link>
          </div>
        }
      />

      <div className="mt-6 space-y-8">
        {/* Top Scholar's Ludus Desk: Quick Play Modes + Minimalist Record Rail */}
        <section
          aria-label={translateUi('Ludus')}
          className="relative overflow-hidden rounded-3xl border border-line/80 bg-surface p-5 shadow-2xs sm:p-7"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            {/* Left: Quick Play Modes from your cards */}
            <div className="min-w-0 flex-1">
              <p className="mb-3 text-[10.5px] font-bold tracking-[0.14em] text-sage-text uppercase">
                <UiText source={'Practice'} />
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {QUICK_MODES.map((mode) => (
                  <Link
                    key={mode.to}
                    to={mode.to}
                    className="group flex items-start gap-3.5 rounded-2xl border border-line/70 bg-raised/45 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface hover:shadow-elev-1"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line/50 bg-sage-soft text-sage-text transition-colors group-hover:bg-accent-soft group-hover:text-accent-text">
                      <mode.icon size={18} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2 font-serif text-[16px] font-semibold text-ink group-hover:text-accent-text">
                        <span>{mode.title}</span>
                        <ArrowRight size={13} className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent-text" aria-hidden />
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-ink-soft">
                        <UiText source={mode.detail} />
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Minimalist Scholar's Record (Your bests) */}
            <div className="border-t border-line/60 pt-4 lg:mt-0 lg:w-72 lg:shrink-0 lg:self-stretch lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 xl:w-80 xl:pl-10">
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-sage-text" aria-hidden />
                <h2 className="text-[10.5px] font-bold tracking-[0.14em] text-ink-faint uppercase">
                  <UiText source={'Your bests'} />
                </h2>
              </div>
              {played.length ? (
                <ul className="mt-3 divide-y divide-line/60">
                  {played.slice(0, 5).map((g) => (
                    <li key={g.id} className="flex items-baseline justify-between gap-3 py-2 text-[13.5px]">
                      <Link to={`/thesaurus/games/${g.id}`} className="truncate font-serif font-semibold hover:text-accent-text hover:underline">
                        <UiText source={g.title} />
                      </Link>
                      <span className="shrink-0 text-[12px] text-ink-soft tabular-nums">
                        <UiText
                          source={'{0} stars · {1} · {2} {3}'}
                          values={[
                            bests![g.id].stars,
                            clock(bests![g.id].ms),
                            bests![g.id].plays,
                            bests![g.id].plays === 1 ? <UiText source={'round'} /> : <UiText source={'rounds'} />,
                          ]}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                  <UiText source={'Play a round and your best is kept here.'} />
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Bottom Shelves: Filter Bar + Game Groups */}
        <div className="border-t border-line/60 pt-6">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <Segmented<GroupFilter>
              label={translateUi('Games')}
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: translateUi('All') },
                ...GROUP_KEYS.map((g) => ({ value: g, label: translateUi(GAME_GROUPS[g].title) })),
              ]}
            />
          </div>

          <div className="space-y-10">
            {visibleGroups.map(section)}
          </div>
        </div>
      </div>
    </>
  );
}
