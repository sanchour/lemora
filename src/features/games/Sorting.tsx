// Category sorting and odd one out (6-21, F0182, F0183, F1200 and F1201): the learner's words by the decks, tags and kinds of word they belong to.
import { useEffect, useState } from 'react';
import type { Best } from '@/core/games/bests';
import { oddRound, sortRound, sortStars } from '@/core/games/categories';
import type { OddRound, SortRound } from '@/core/games/categories';
import type { GameDef } from '@/core/games/defs';
import type { GameItem } from '@/core/games/source';
import { isRtl } from '@/core/lang/languages';
import { Kbd } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { RoundRunner, useSettleOnce } from './RoundRunner';
import type { BoardProps } from './RoundRunner';

/** Learner words go into messages between bidi isolates, so right-to-left words do not scramble the sentence around them. */
const iso = (s: string) => `\u2068${s}\u2069`;

function Chip({ item, lang, state, onClick, hot, n }: { item: GameItem; lang: string; state?: 'right' | 'wrong' | 'picked'; onClick?: () => void; hot?: boolean; n?: number }) {
  return (
    <button type="button" disabled={!onClick} onClick={onClick} className={cx('rounded-xl border px-4 py-2 text-start transition-colors', state === 'right' ? 'border-sage-text/30 bg-sage-soft' : state === 'wrong' ? 'border-transparent bg-accent-soft' : hot ? 'border-accent-text bg-accent-soft' : 'border-line bg-raised hover:border-line-strong hover:bg-surface')}>
      <span className="block font-serif text-xl font-semibold" lang={lang} dir={isRtl(lang) ? 'rtl' : undefined}>{n ? <Kbd>{n}</Kbd> : null} {item.term}</span>
      {item.meaning && <span className="block text-[13px] text-ink-soft">{item.meaning}</span>}
    </button>
  );
}

function SortBoard({ entry, lang, settle }: BoardProps<SortRound>) {
  const t = useUi();
  const [placed, setPlaced] = useState<ReadonlyMap<number, number>>(new Map());
  const [pick, setPick] = useState<number | null>(null);
  const [wrong, setWrong] = useState(0);
  const over = placed.size === entry.words.length;
  useSettleOnce(over, () => settle({ won: true, stars: sortStars(wrong), hints: 0, message: wrong ? t('All sorted; {0} in the wrong place.', [wrong]) : t('All sorted.') }));
  const drop = (category: number) => {
    if (pick === null) return;
    if (entry.words[pick].category === category) setPlaced((p) => new Map([...p, [pick, category]]));
    else setWrong((n) => n + 1);
    setPick(null);
  };
  return (
    <div>
      <p className="text-[14px] text-ink-soft"><UiText source={'Pick a word, then the category it belongs to.'} /></p>
      <div className="mt-3 flex min-h-16 flex-wrap gap-2">
        {entry.words.map((w, i) => (placed.has(i) ? null : <Chip key={i} item={w.item} lang={lang} hot={pick === i} onClick={() => setPick(i)} />))}
      </div>
      <div className="mt-6 grid gap-3" style={{ gridTemplateColumns: `repeat(${entry.names.length}, minmax(0, 1fr))` }}>
        {entry.names.map((name, c) => (
          <button key={c} type="button" disabled={pick === null || over} onClick={() => drop(c)} className={cx('rounded-2xl border p-4 text-start transition-colors', pick !== null ? 'border-line-strong bg-surface hover:bg-sage-soft' : 'border-line/70 bg-surface')}>
            <span className="block text-[12px] font-bold tracking-[0.12em] text-ink-faint uppercase">{name}</span>
            <span className="mt-2 flex flex-col gap-1.5">
              {entry.words.map((w, i) => (placed.get(i) === c ? <span key={i} className="font-serif text-lg font-semibold" lang={lang}>{w.item.term}</span> : null))}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-ink-soft"><UiText source={'Wrong places: {0}'} values={[wrong]} /></p>
    </div>
  );
}

function OddBoard({ entry, lang, settle }: BoardProps<OddRound>) {
  const t = useUi();
  const [picked, setPicked] = useState<number | null>(null);
  const over = picked !== null;
  const won = picked === entry.odd;
  const term = entry.words[entry.odd].term;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!over && n >= 1 && n <= entry.words.length && !e.ctrlKey && !e.metaKey && !e.altKey) setPicked(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [over, entry.words.length]);
  useSettleOnce(over, () =>
    settle({ won, stars: won ? 3 : 0, hints: 0, message: won ? t('Right: {0} is the odd one out. The others are all {1}.', [iso(term), iso(entry.category)]) : t('It was {0}: the others are all {1}, and {0} is {2}.', [iso(term), iso(entry.category), iso(entry.oddCategory)]), wrong: won ? [] : [term, entry.words[picked!].term] }),
  );
  return (
    <div>
      <p className="font-serif text-xl"><UiText source={'Which one does not belong?'} /></p>
      <div className="mt-4 flex flex-wrap gap-3">
        {entry.words.map((w, i) => (
          <Chip key={i} item={w} lang={lang} n={i + 1} onClick={over ? undefined : () => setPicked(i)} state={over ? (i === entry.odd ? 'right' : i === picked ? 'wrong' : undefined) : undefined} />
        ))}
      </div>
    </div>
  );
}

export function Sorting({ lang, def, items, best }: { lang: string; def: GameDef; items: GameItem[]; best?: Best }) {
  const t = useUi();
  return (
    <RoundRunner<SortRound>
      lang={lang}
      def={def}
      best={best}
      unit={t('Round')}
      rtl={isRtl(lang)}
      intro={<UiText source={'Words of yours, mixed. Sort each into the category it belongs to.'} />}
      make={(random) => Array.from({ length: def.round }, () => sortRound(items, random)).filter((r): r is SortRound => r !== null)}
      terms={(e) => e.words.map((w) => w.item.term)}
      label={(e) => ({ title: e.names.join(' · ') })}
      Board={SortBoard}
      rules={<UiText source={'Pick a word, then click its category. A wrong place costs nothing but counts: no mistakes is three stars, up to two is two, more is one.'} />}
    />
  );
}

export function OddOneOut({ lang, def, items, best }: { lang: string; def: GameDef; items: GameItem[]; best?: Best }) {
  const t = useUi();
  return (
    <RoundRunner<OddRound>
      lang={lang}
      def={def}
      best={best}
      unit={t('Question')}
      rtl={isRtl(lang)}
      intro={<UiText source={'Four of your words: three belong together and one does not. Find it.'} />}
      make={(random) => Array.from({ length: def.round }, () => oddRound(items, random)).filter((r): r is OddRound => r !== null)}
      terms={(e) => e.words.map((w) => w.term)}
      label={(e) => ({ title: e.words[e.odd].term, detail: e.category })}
      Board={OddBoard}
      rules={<UiText source={'Click the word that does not belong, or press its number. Right is three stars, wrong none.'} />}
    />
  );
}
