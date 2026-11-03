// Crossword (6-21, F0170 and F1193): the learner's words crossed on a grid, clued by their meanings. Click a cell and type; click again to turn the other way.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Flag, SquareCheckBig } from 'lucide-react';
import type { Best } from '@/core/games/bests';
import { answers, cellKey, crosswordStars, makeCrossword, solved, wrongIn } from '@/core/games/crossword';
import type { Crossword as Grid } from '@/core/games/crossword';
import type { GameDef } from '@/core/games/defs';
import { hideIn } from '@/core/games/hangman';
import { graphemes, letterKey, letterWord } from '@/core/games/letters';
import { usable } from '@/core/games/source';
import type { GameItem } from '@/core/games/source';
import { isRtl } from '@/core/lang/languages';
import { shuffle } from '@/core/srs/ludus';
import { isEditable } from '@/design/hooks/useHotkeys';
import { buttonClasses } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { RoundRunner, useSettleOnce } from './RoundRunner';
import type { BoardProps } from './RoundRunner';

interface Entry {
  cw: Grid;
  items: Map<string, GameItem>;
}

const big = (m: string, lang: string) => {
  const up = m.toLocaleUpperCase(lang);
  return up.length === m.length ? up : m;
};

function Board({ entry, lang, settle }: BoardProps<Entry>) {
  const { cw, items } = entry;
  const t = useUi();
  const rtl = isRtl(lang);
  const key = useMemo(() => answers(cw), [cw]);
  const [filled, setFilled] = useState<ReadonlyMap<string, string>>(new Map());
  const [at, setAt] = useState({ w: 0, i: 0 });
  const [shown, setShown] = useState(0);
  const [checked, setChecked] = useState<string[]>([]);
  const [gaveUp, setGaveUp] = useState(false);
  const won = solved(cw, filled);
  const over = won || gaveUp;
  useSettleOnce(over, () => settle({ won, stars: crosswordStars(won, shown), hints: shown, message: won ? t('Solved') : t('Not finished: the answers are shown'), wrong: won ? [] : cw.words.filter((_, w) => wrongIn(cw, filled, w).length || cw.words[w].cells.some((c) => !filled.has(cellKey(c)))).map((w) => w.term) }));

  const word = cw.words[at.w];
  const cell = word.cells[at.i];
  const lenient = (m: string) => letterKey(m, { lang, exact: false });
  const put = (k: string, value: string | null) => setFilled((f) => { const n = new Map(f); value === null ? n.delete(k) : n.set(k, value); return n; });
  const select = (w: number, i: number) => (setAt({ w, i }), setChecked([]));
  const here = (r: number, c: number) => cw.words.flatMap((x, w) => (x.cells.findIndex((y) => y[0] === r && y[1] === c) >= 0 ? [[w, x.cells.findIndex((y) => y[0] === r && y[1] === c)] as const] : []));
  const click = (r: number, c: number) => {
    const hits = here(r, c);
    if (!hits.length || over) return;
    const same = hits.find(([w]) => w === at.w);
    const other = hits.find(([w]) => w !== at.w);
    const [w, i] = same && other && cell[0] === r && cell[1] === c ? other : same ?? hits[0];
    select(w, i);
  };
  const type = (letter: string) => {
    const typed = letterKey(letter, { lang, exact: false });
    if (!typed) return;
    const answer = key.get(cellKey(cell))!;
    put(cellKey(cell), lenient(answer) === typed ? answer : typed);
    select(at.w, Math.min(at.i + 1, word.cells.length - 1));
  };
  const latest = useRef({ type, over });
  useEffect(() => {
    latest.current = { type, over };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (latest.current.over || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || isEditable(e.target)) return;
      const marks = graphemes(e.key, lang);
      if (e.key === 'Backspace') {
        e.preventDefault();
        const k = cellKey(cell);
        if (filled.has(k)) put(k, null);
        else if (at.i > 0) (put(cellKey(word.cells[at.i - 1]), null), select(at.w, at.i - 1));
      } else if (e.key === 'Tab') {
        e.preventDefault();
        select((at.w + (e.shiftKey ? cw.words.length - 1 : 1)) % cw.words.length, 0);
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const [dr, dc] = e.key === 'ArrowUp' ? [-1, 0] : e.key === 'ArrowDown' ? [1, 0] : e.key === 'ArrowLeft' ? [0, -1] : [0, 1];
        const hits = here(cell[0] + dr, cell[1] + dc);
        const next = hits.find(([w]) => w === at.w) ?? hits.find(([w]) => cw.words[w].dir === word.dir) ?? hits[0];
        if (next) select(next[0], next[1]);
      } else if (marks.length === 1) latest.current.type(marks[0]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const inWord = new Set(word.cells.map(cellKey));
  const wrong = new Set(checked);
  const numbered = new Map(cw.words.map((w) => [cellKey(w.cells[0]), w.number]));
  const clue = (w: number) => {
    const x = cw.words[w];
    const item = items.get(x.term);
    const eg = item?.example ? hideIn(item.example, x.term, lang) : null;
    return { text: item?.meaning ?? '', eg };
  };
  const list = (dir: 'across' | 'down', title: string) => (
    <div>
      <p className="text-[12px] font-bold tracking-[0.12em] text-ink-faint uppercase">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {cw.words.flatMap((x, w) =>
          x.dir !== dir ? [] : [
            <li key={w}>
              <button type="button" onClick={() => !over && select(w, 0)} className={cx('w-full rounded-lg px-2 py-1 text-start text-[14px] leading-snug', w === at.w ? 'bg-sage-soft text-sage-text' : 'hover:bg-sunken')}>
                <span className="font-semibold tabular-nums">{x.number}.</span> {clue(w).text}
                {w === at.w && clue(w).eg && <span className="mt-1 block text-ink-soft" lang={lang} dir={rtl ? 'rtl' : undefined}>{clue(w).eg}</span>}
                {over && <bdi lang={lang} className="mx-2 font-serif font-semibold">{x.term}</bdi>}
              </button>
            </li>,
          ],
        )}
      </ul>
    </div>
  );
  return (
    <div className="flex flex-wrap items-start gap-8">
      <div>
        <div className="grid gap-0.5 select-none" style={{ gridTemplateColumns: `repeat(${cw.cols}, 2.25rem)`, direction: 'ltr' }} role="grid" aria-label={t('Crossword')} lang={lang}>
          {Array.from({ length: cw.rows * cw.cols }, (_, n) => {
            const [r, c] = [Math.floor(n / cw.cols), n % cw.cols];
            const k = cellKey([r, c]);
            if (!key.has(k)) return <div key={k} className="size-9" />;
            const value = filled.get(k);
            const correct = value === key.get(k);
            return (
              <div key={k} role="gridcell" onClick={() => click(r, c)} className={cx('relative grid size-9 cursor-pointer place-items-center rounded-md border font-serif text-lg font-semibold uppercase', cell[0] === r && cell[1] === c ? 'border-accent-text bg-accent-soft' : inWord.has(k) ? 'border-line-strong bg-sage-soft' : 'border-line bg-raised', wrong.has(k) && 'text-accent-text', over && (correct ? 'text-sage-text' : 'text-accent-text'))}>
                {numbered.has(k) && <span className="absolute start-0.5 top-0 font-sans text-[9px] font-semibold text-ink-soft">{numbered.get(k)}</span>}
                {over && !value ? big(key.get(k)!, lang) : value && big(value, lang)}
              </div>
            );
          })}
        </div>
        {!over && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setChecked(wrongIn(cw, filled, at.w))} className={buttonClasses('secondary', 'sm')}>
              <UiText source={'{0} Check this word'} values={[<SquareCheckBig size={14} aria-hidden />]} />
            </button>
            <button type="button" onClick={() => { put(cellKey(cell), key.get(cellKey(cell))!); setShown((n) => n + 1); select(at.w, Math.min(at.i + 1, word.cells.length - 1)); }} className={buttonClasses('secondary', 'sm')}>
              <UiText source={'{0} Show a letter'} values={[<Eye size={14} aria-hidden />]} />
            </button>
            <button type="button" onClick={() => setGaveUp(true)} className={buttonClasses('ghost', 'sm')}>
              <UiText source={'{0} Give up'} values={[<Flag size={14} aria-hidden />]} />
            </button>
            <p className="self-center text-[13px] text-ink-soft"><UiText source={'Letters shown: {0}'} values={[shown]} /></p>
          </div>
        )}
      </div>
      <div className="min-w-60 flex-1 space-y-5">
        {list('across', t('Across'))}
        {list('down', t('Down'))}
      </div>
    </div>
  );
}

export function Crossword({ lang, def, items, best }: { lang: string; def: GameDef; items: GameItem[]; best?: Best }) {
  const t = useUi();
  const rtl = isRtl(lang);
  return (
    <RoundRunner<Entry>
      lang={lang}
      def={def}
      best={best}
      unit={t('Puzzle')}
      rtl={rtl}
      intro={<UiText source={'Your words crossed on a grid. Each clue is a meaning: type the word.'} />}
      make={(random) => {
        const entries = shuffle(usable(def, items, lang), random).slice(0, 10).flatMap((item) => {
          const w = letterWord(item.term, { lang });
          const marks = w ? w.marks.filter((_, i) => w.keys[i] !== null).map((m) => letterKey(m, { lang, exact: true })!) : [];
          return marks.length ? [{ term: item.term, marks }] : [];
        });
        const cw = makeCrossword(entries, random, { rtl });
        return cw.words.length >= def.needs.count - 1 ? [{ cw, items: new Map(items.map((i) => [i.term, i])) }] : [];
      }}
      empty={t('The words would not cross on a grid. Try again.')}
      terms={(e) => e.cw.words.map((w) => w.term)}
      label={(e) => ({ title: t('Crossword'), detail: e.cw.words.map((w) => w.term).join(', ') })}
      Board={Board}
      rules={<UiText source={'Click a cell and type; click it again to turn the other way. Arrow keys move, Tab goes to the next word, Backspace clears. Showing a letter costs a star for every three; giving up earns none.'} />}
    />
  );
}
