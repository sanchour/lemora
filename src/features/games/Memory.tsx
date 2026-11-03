// Memory matching (6-21, F0186 and F1199): cards face down; find each word and its meaning, or its picture.
import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import type { Best } from '@/core/games/bests';
import type { GameDef } from '@/core/games/defs';
import { close, done, flip, makeMemory, memoryStars } from '@/core/games/memory';
import type { MemoryMode, MemoryState } from '@/core/games/memory';
import type { GameItem } from '@/core/games/source';
import { isRtl } from '@/core/lang/languages';
import { Segmented } from '@/design/primitives';
import { speak } from '@/services/speech/voice';
import { UiText, useUi } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { RoundRunner, useSettleOnce } from './RoundRunner';
import type { BoardProps } from './RoundRunner';

interface Entry {
  state: MemoryState;
  terms: string[];
  /** Where the pictures came from, in picture mode. */
  credits: string[];
}

function Board({ entry, lang, settle }: BoardProps<Entry>) {
  const t = useUi();
  const rtl = isRtl(lang);
  const [s, setS] = useState(entry.state);
  const pairs = s.cards.length / 2;
  const turn = (id: number) => {
    const c = s.cards[id];
    if (c.face.sound && !s.open.includes(id) && !s.matched.includes(c.pair)) void speak(lang, c.face.sound).catch(() => undefined);
    setS((x) => flip(x, id));
  };
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
            <button key={c.id} type="button" onClick={() => turn(c.id)} disabled={over || s.matched.includes(c.pair)} aria-label={up ? undefined : t('Card')} className={cx('grid h-24 place-items-center rounded-2xl border p-2 text-center transition-colors', s.matched.includes(c.pair) ? 'border-sage-text/30 bg-sage-soft' : up ? 'border-line-strong bg-surface' : 'border-line bg-sunken hover:bg-surface')}>
              {up ? (
                c.face.image ? <img src={c.face.image} alt="" className="max-h-20 rounded-lg" /> : c.face.sound ? <Volume2 size={26} aria-label={t('The word, read aloud')} /> : <span className={cx(c.side === 'word' ? 'font-serif text-xl font-semibold' : 'text-[14px] leading-snug')} lang={c.side === 'word' ? lang : undefined} dir={c.side === 'word' && rtl ? 'rtl' : undefined}>{c.face.text}</span>
              ) : (
                <span className="font-serif text-2xl text-ink-faint" aria-hidden>?</span>
              )}
            </button>
          );
        })}
      </div>
      {entry.credits.length > 0 && <p className="mt-2 text-[12px] text-ink-faint"><UiText source={'Pictures: {0}'} values={[entry.credits.join('; ')]} /></p>}
      <p className="mt-4 text-[14px] text-ink-soft"><UiText source={'Moves: {0}'} values={[s.moves]} /> · <UiText source={'Pairs found: {0} of {1}'} values={[s.matched.length, pairs]} /></p>
    </div>
  );
}

export function Memory({ lang, def, items, best }: { lang: string; def: GameDef; items: GameItem[]; best?: Best }) {
  const t = useUi();
  const [mode, setMode] = useState<MemoryMode>('meaning');
  const withPictures = items.filter((i) => i.image).length;
  return (
    <RoundRunner<Entry>
      lang={lang}
      def={def}
      best={best}
      unit={t('Puzzle')}
      rtl={isRtl(lang)}
      intro={<UiText source={'Cards face down. Find each word and its meaning.'} />}
      options={
        <div className="space-y-2">
          <p className="text-[14px] font-semibold"><UiText source={'What goes with each word'} /></p>
          <Segmented<MemoryMode> label={t('What goes with each word')} value={mode} onChange={setMode} options={[{ value: 'meaning', label: t('Its meaning') }, ...(withPictures >= 6 ? [{ value: 'picture' as const, label: t('Its picture') }] : []), { value: 'sound', label: t('Its sound') }]} />
          {mode === 'picture' && <p className="text-[13px] text-ink-soft"><UiText source={'Only words that have a picture are used.'} /></p>}
          {mode === 'sound' && <p className="text-[13px] text-ink-soft"><UiText source={'The word is read aloud by your device’s voice, and you find it on your card.'} /></p>}
        </div>
      }
      make={(random) => {
        const state = makeMemory(items, 8, random, mode);
        return state ? [{ state, terms: state.cards.filter((c) => c.side === 'word').map((c) => c.face.text ?? ''), credits: mode === 'picture' ? [...new Set(items.filter((i) => i.credit && state.cards.some((c) => c.face.image === i.image)).map((i) => i.credit!))] : [] }] : [];
      }}
      empty={t('The words would not make pairs. Try again.')}
      terms={(e) => e.terms}
      label={(e) => ({ title: t('Memory'), detail: e.terms.join(', ') })}
      Board={Board}
      rules={<UiText source={'Turn two cards over. A pair stays up; cards that do not match turn back. Three stars for a few moves more than pairs, two for up to twice as many.'} />}
    />
  );
}
