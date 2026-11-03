// Memory matching (6-21, F0186 and F1199): cards face down; find each word and its meaning, or its picture.
import { useEffect, useState } from 'react';
import type { Best } from '@/core/games/bests';
import type { GameDef } from '@/core/games/defs';
import { close, done, flip, makeMemory, memoryStars } from '@/core/games/memory';
import type { MemoryMode, MemoryState } from '@/core/games/memory';
import type { GameItem } from '@/core/games/source';
import { isRtl } from '@/core/lang/languages';
import { ToggleRow } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { RoundRunner, useSettleOnce } from './RoundRunner';
import type { BoardProps } from './RoundRunner';

interface Entry {
  state: MemoryState;
  terms: string[];
}

function Board({ entry, lang, settle }: BoardProps<Entry>) {
  const t = useUi();
  const rtl = isRtl(lang);
  const [s, setS] = useState(entry.state);
  const pairs = s.cards.length / 2;
  const over = done(s);
  useEffect(() => {
    if (s.open.length !== 2) return;
    const timer = window.setTimeout(() => setS(close), 900);
    return () => window.clearTimeout(timer);
  }, [s.open]);
  useSettleOnce(over, () => settle({ won: true, stars: memoryStars(s.moves, pairs), hints: 0, message: t('Done in {0} moves.', [s.moves]) }));
  return (
    <div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(4, minmax(0, 9.5rem))` }}>
        {s.cards.map((c) => {
          const up = s.open.includes(c.id) || s.matched.includes(c.pair);
          return (
            <button key={c.id} type="button" onClick={() => setS((x) => flip(x, c.id))} disabled={over || s.matched.includes(c.pair)} aria-label={up ? undefined : t('Card')} className={cx('grid h-24 place-items-center rounded-2xl border p-2 text-center transition-colors', s.matched.includes(c.pair) ? 'border-sage-text/30 bg-sage-soft' : up ? 'border-line-strong bg-surface' : 'border-line bg-sunken hover:bg-surface')}>
              {up ? (
                c.face.image ? <img src={c.face.image} alt="" className="max-h-20 rounded-lg" /> : <span className={cx(c.side === 'word' ? 'font-serif text-xl font-semibold' : 'text-[14px] leading-snug')} lang={c.side === 'word' ? lang : undefined} dir={c.side === 'word' && rtl ? 'rtl' : undefined}>{c.face.text}</span>
              ) : (
                <span className="font-serif text-2xl text-ink-faint" aria-hidden>?</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-[14px] text-ink-soft"><UiText source={'Moves: {0}'} values={[s.moves]} /> · <UiText source={'Pairs found: {0} of {1}'} values={[s.matched.length, pairs]} /></p>
    </div>
  );
}

export function Memory({ lang, def, items, best }: { lang: string; def: GameDef; items: GameItem[]; best?: Best }) {
  const t = useUi();
  const [pictures, setPictures] = useState(false);
  const withPictures = items.filter((i) => i.image).length;
  return (
    <RoundRunner<Entry>
      lang={lang}
      def={def}
      best={best}
      unit={t('Puzzle')}
      rtl={isRtl(lang)}
      intro={<UiText source={'Cards face down. Find each word and its meaning.'} />}
      options={withPictures >= 6 && <ToggleRow title={t('Match words with pictures')} description={t('Only words that have a picture are used.')} checked={pictures} onChange={setPictures} />}
      make={(random) => {
        const mode: MemoryMode = pictures ? 'picture' : 'meaning';
        const state = makeMemory(items, 8, random, mode);
        return state ? [{ state, terms: state.cards.filter((c) => c.side === 'word').map((c) => c.face.text ?? '') }] : [];
      }}
      empty={t('The words would not make pairs. Try again.')}
      terms={(e) => e.terms}
      label={(e) => ({ title: t('Memory'), detail: e.terms.join(', ') })}
      Board={Board}
      rules={<UiText source={'Turn two cards over. A pair stays up; cards that do not match turn back. Three stars for a few moves more than pairs, two for up to twice as many.'} />}
    />
  );
}
