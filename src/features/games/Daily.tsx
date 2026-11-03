// The daily puzzle and the weekly challenge (6-21, F1215, F1216, F0188): made from the language's own word list and the date, so everyone learning the language gets the same.
import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { Link } from 'react-router';
import type { Best } from '@/core/games/bests';
import { dailyPuzzle, shareText, weeklyTheme, weeklyWords } from '@/core/games/daily';
import type { DailyKind, ListWord, WeeklyTheme } from '@/core/games/daily';
import type { GameDef } from '@/core/games/defs';
import { startHangman } from '@/core/games/hangman';
import { startAnagram } from '@/core/games/anagram';
import { startMissing } from '@/core/games/missing';
import { seedOf, dailySeed } from '@/core/games/seeds';
import type { GameItem } from '@/core/games/source';
import { isRtl } from '@/core/lang/languages';
import { seededRandom } from '@/core/srs/ludus';
import { dailyWords, saveDaily, useDaily } from '@/data/games';
import { buttonClasses } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { localDateKey } from '@/lib/format';
import { toast } from '@/state/ui';
import { Board as AnagramBoard } from './Anagram';
import type { Entry as AnagramEntry } from './Anagram';
import { Board as HangmanBoard } from './Hangman';
import type { Entry as HangmanEntry } from './Hangman';
import { Board as MissingBoard } from './MissingLetters';
import type { Entry as MissingEntry } from './MissingLetters';
import { RoundRunner } from './RoundRunner';
import type { BoardProps } from './RoundRunner';

type Entry = ({ kind: 'hangman' } & HangmanEntry) | ({ kind: 'anagram' } & AnagramEntry) | ({ kind: 'missing' } & MissingEntry);

const itemOf = (w: ListWord): GameItem => ({ term: w.word, meaning: w.gloss, synonyms: [], antonyms: [] });

function DailyBoard(props: BoardProps<Entry>) {
  const { entry } = props;
  if (entry.kind === 'anagram') return <AnagramBoard {...props} entry={entry} />;
  if (entry.kind === 'missing') return <MissingBoard {...props} entry={entry} />;
  return <HangmanBoard {...props} entry={entry} />;
}

function entryOf(kind: DailyKind, w: ListWord, lang: string, random: () => number): Entry | null {
  const item = itemOf(w);
  if (kind === 'anagram') {
    const state = startAnagram(w.word, { lang, exact: true }, random);
    return state ? { kind, item, state, exact: true } : null;
  }
  if (kind === 'missing') {
    const state = startMissing(w.word, { lang, exact: true }, random);
    return state ? { kind, item, state, exact: true } : null;
  }
  const state = startHangman(w.word, { lang, exact: false });
  return state ? { kind: 'hangman', item, state, exact: false } : null;
}

const KIND_TITLE: Record<DailyKind, string> = { hangman: 'Hangman', anagram: 'Anagrams', missing: 'Missing letters' };

/** One puzzle a day, the same for everyone; it can be played once, and the result can be copied to share. */
export function Daily({ lang, def, best }: { lang: string; def: GameDef; items: GameItem[]; best?: Best }) {
  const t = useUi();
  const day = localDateKey();
  const stamp = useDaily(lang);
  const [list, setList] = useState<ListWord[] | null>(null);
  useEffect(() => {
    let alive = true;
    void dailyWords(lang).then((l) => alive && setList(l));
    return () => {
      alive = false;
    };
  }, [lang]);
  const puzzle = list ? dailyPuzzle(list, lang, day) : null;
  if (!list) return <p className="p-10 text-ink-soft"><UiText source={'Looking at your words…'} /></p>;
  if (!puzzle) return <p className="p-10 text-ink-soft"><UiText source={'This could not be made from what you have yet.'} /></p>;
  if (stamp?.day === day)
    return (
      <div className="mx-auto w-full max-w-xl px-6 py-10">
        <h1 className="font-display text-3xl font-semibold"><UiText source={'Daily puzzle'} /></h1>
        <p className="mt-4 font-serif text-2xl"><UiText source={'Done for today: {0} of 3 stars.'} values={[stamp.stars]} /></p>
        <p className="mt-2 text-ink-soft"><UiText source={'A new puzzle comes tomorrow, the same for everyone learning this language.'} /></p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => void navigator.clipboard?.writeText(shareText(t('Daily puzzle'), day, stamp.stars, 3)).then(() => toast(t('Copied.')))} className={buttonClasses('primary', 'md')}>
            <UiText source={'{0} Copy the result'} values={[<Copy size={16} aria-hidden />]} />
          </button>
          <Link to="/thesaurus/games" className={buttonClasses('secondary', 'md')}><UiText source={'All games'} /></Link>
        </div>
      </div>
    );
  return (
    <RoundRunner<Entry>
      lang={lang}
      def={def}
      best={best}
      unit={t('Puzzle')}
      rtl={isRtl(lang)}
      intro={<UiText source={'Today’s puzzle is {0}. It is the same for everyone learning this language, and it can be played once.'} values={[t(KIND_TITLE[puzzle.kind])]} />}
      make={() => {
        const entry = entryOf(puzzle.kind, puzzle.word, lang, seededRandom(dailySeed(lang, day)));
        return entry ? [entry] : [];
      }}
      onRound={(r) => void saveDaily(lang, { day, stars: r.stars })}
      terms={() => []}
      label={(e) => ({ title: e.item.term, detail: e.item.meaning })}
      Board={DailyBoard}
      rules={<UiText source={'The word comes from the language’s own list, with its meaning. Three stars at most; hints cost one each.'} />}
    />
  );
}

function themeLine(t: ReturnType<typeof useUi>, theme: WeeklyTheme): string {
  return theme.kind === 'length' ? t('Words of {0} letters', [theme.value]) : t('Words that start with “{0}”', [theme.value]);
}

/** Five words on this week's theme, the same all week. */
export function Weekly({ lang, def, best }: { lang: string; def: GameDef; items: GameItem[]; best?: Best }) {
  const t = useUi();
  const day = localDateKey();
  const [list, setList] = useState<ListWord[] | null>(null);
  useEffect(() => {
    let alive = true;
    void dailyWords(lang).then((l) => alive && setList(l));
    return () => {
      alive = false;
    };
  }, [lang]);
  if (!list) return <p className="p-10 text-ink-soft"><UiText source={'Looking at your words…'} /></p>;
  const theme = weeklyTheme(list, lang, day);
  if (!theme) return <p className="p-10 text-ink-soft"><UiText source={'This could not be made from what you have yet.'} /></p>;
  return (
    <RoundRunner<Entry>
      lang={lang}
      def={def}
      best={best}
      unit={t('Word')}
      rtl={isRtl(lang)}
      intro={<UiText source={'This week: {0}. Five words, the same all week, played as hangman.'} values={[themeLine(t, theme)]} />}
      make={() => weeklyWords(list, theme, lang, day).flatMap((w) => entryOf('hangman', w, lang, seededRandom(seedOf(w.word))) ?? [])}
      terms={() => []}
      label={(e) => ({ title: e.item.term, detail: e.item.meaning })}
      Board={DailyBoard}
      rules={<UiText source={'Type a letter or click it. Six wrong letters and the word is lost. Up to three stars a word.'} />}
    />
  );
}
