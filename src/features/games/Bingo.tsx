// Vocabulary bingo (6-21, F0187): meanings are called; mark the word on your card, or say it is not there, until you have a line.
import { useState } from 'react';
import type { Best } from '@/core/games/bests';
import { bingoStars, hasLine, makeBingo } from '@/core/games/bingo';
import type { Bingo as BingoData } from '@/core/games/bingo';
import type { GameDef } from '@/core/games/defs';
import type { GameItem } from '@/core/games/source';
import { isRtl } from '@/core/lang/languages';
import { buttonClasses } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { RoundRunner, useSettleOnce } from './RoundRunner';
import type { BoardProps } from './RoundRunner';

function Board({ entry, lang, settle }: BoardProps<BingoData>) {
  const t = useUi();
  const rtl = isRtl(lang);
  const [marked, setMarked] = useState<ReadonlySet<number>>(new Set());
  const [at, setAt] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [note, setNote] = useState('');
  const won = hasLine(marked, entry.size);
  const call = entry.calls[at];
  useSettleOnce(won, () => settle({ won: true, stars: bingoStars(mistakes), hints: 0, message: t('Bingo!') }));
  const miss = (message: string) => (setMistakes((n) => n + 1), setNote(message));
  const answer = (square: number | null) => {
    if (won || !call) return;
    const target = entry.card.indexOf(call.item);
    if (square === target || (square === null && !call.onCard)) {
      if (square !== null) setMarked((m) => new Set([...m, square]));
      setAt((n) => n + 1);
      setNote('');
    } else miss(square === null ? t('It is on your card.') : call.onCard ? t('Not that square.') : t('The called word is not on your card.'));
  };
  return (
    <div>
      <div className="rounded-3xl border border-line/70 bg-surface p-5">
        <p className="text-[12px] font-bold tracking-[0.12em] text-ink-faint uppercase">{won ? <UiText source={'Bingo!'} /> : <UiText source={'Call {0} of {1}'} values={[Math.min(at + 1, entry.calls.length), entry.calls.length]} />}</p>
        <p className="mt-1 font-serif text-2xl leading-snug">{won ? '' : call?.item.meaning}</p>
      </div>
      <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${entry.size}, minmax(0, 7.5rem))` }}>
        {entry.card.map((item, i) => (
          <button key={i} type="button" disabled={won || marked.has(i)} onClick={() => answer(i)} className={cx('grid h-16 place-items-center rounded-xl border px-2 text-center font-serif text-lg font-semibold transition-colors', marked.has(i) ? 'border-sage-text/30 bg-sage-soft text-sage-text' : 'border-line bg-raised hover:border-line-strong hover:bg-surface')} lang={lang} dir={rtl ? 'rtl' : undefined}>
            {item.term}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!won && (
          <button type="button" onClick={() => answer(null)} className={buttonClasses('secondary', 'md')}>
            <UiText source={'Not on my card'} />
          </button>
        )}
        <p className="min-h-6 text-[14px] text-accent-text" role="status">{note}</p>
      </div>
    </div>
  );
}

export function Bingo({ lang, def, items, best }: { lang: string; def: GameDef; items: GameItem[]; best?: Best }) {
  const t = useUi();
  return (
    <RoundRunner<BingoData>
      lang={lang}
      def={def}
      best={best}
      unit={t('Puzzle')}
      rtl={isRtl(lang)}
      intro={<UiText source={'A card of your words. Meanings are called one at a time: mark the word, or say it is not on your card.'} />}
      make={(random) => {
        const bingo = makeBingo(items, random);
        return bingo ? [bingo] : [];
      }}
      empty={t('This could not be made from what you have yet.')}
      terms={(e) => e.card.map((c) => c.term)}
      label={(e) => ({ title: t('Vocabulary bingo'), detail: `${e.size}×${e.size}` })}
      Board={Board}
      rules={<UiText source={'Click the word that matches the meaning called, or press Not on my card when it is not there. A full row, column or diagonal wins. One mistake is still three stars, up to three is two, more is one.'} />}
    />
  );
}
