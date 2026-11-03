// Build from parts (6-21, F0184): the dictionary's parts of a word, mixed; put them back in order from the meaning.
import { useState } from 'react';
import { Lightbulb, Undo2 } from 'lucide-react';
import type { Best } from '@/core/games/bests';
import type { GameDef } from '@/core/games/defs';
import { MAX_HINTS } from '@/core/games/hangman';
import { hint, MAX_TRIES, place, startParts, starsOf, unplace } from '@/core/games/parts';
import type { PartsState } from '@/core/games/parts';
import { usable } from '@/core/games/source';
import type { GameItem } from '@/core/games/source';
import { isRtl } from '@/core/lang/languages';
import { shuffle } from '@/core/srs/ludus';
import { buttonClasses, Kbd } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { RoundRunner, useSettleOnce } from './RoundRunner';
import type { BoardProps } from './RoundRunner';

interface Entry {
  item: GameItem;
  state: PartsState;
}

const iso = (s: string) => `⁨${s}⁩`;

function Board({ entry, lang, settle }: BoardProps<Entry>) {
  const t = useUi();
  const rtl = isRtl(lang);
  const [s, setS] = useState(entry.state);
  const over = s.status !== 'playing';
  useSettleOnce(over, () => settle({ won: s.status === 'won', stars: starsOf(s), hints: s.hints, message: s.status === 'won' ? t('Right: {0}', [iso(entry.item.term)]) : t('It was {0}', [iso(entry.item.term)]) }));
  const built = over && s.status === 'lost' ? s.parts : s.placed.map((i) => s.tiles[i]);
  return (
    <div>
      <div className="rounded-3xl border border-line/70 bg-surface p-6">
        <p className="text-[12px] font-bold tracking-[0.12em] text-ink-faint uppercase"><UiText source={'Meaning'} /></p>
        <p className="mt-1 font-serif text-2xl leading-snug">{entry.item.meaning}</p>
      </div>
      <p className="mt-8 flex min-h-14 flex-wrap items-center gap-1 border-b-[3px] border-line-strong pb-1 font-serif text-3xl font-semibold" lang={lang} dir={rtl ? 'rtl' : undefined} aria-live="polite">
        {built.map((p, i) => <span key={i}>{p.replace(/^-|-$/g, '')}</span>)}
      </p>
      <div className="mt-6 flex flex-wrap gap-2" lang={lang} dir={rtl ? 'rtl' : undefined} role="group" aria-label={t('Parts to put in order')}>
        {s.tiles.map((p, i) => (
          <button key={i} type="button" disabled={over || s.placed.includes(i)} onClick={() => setS((x) => place(x, i))} className="rounded-xl border border-line bg-raised px-4 py-2 font-serif text-2xl font-semibold shadow-elev-1 transition-colors hover:border-line-strong hover:bg-surface disabled:opacity-25 disabled:shadow-none">
            {p}
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setS(unplace)} disabled={over || !s.placed.length} className={buttonClasses('secondary', 'sm') + ' disabled:opacity-50'}>
          <UiText source={'{0} Take back {1}'} values={[<Undo2 size={14} aria-hidden />, <Kbd>⌫</Kbd>]} />
        </button>
        <button type="button" onClick={() => setS(hint)} disabled={over || s.hints >= MAX_HINTS} className={buttonClasses('secondary', 'sm') + ' disabled:opacity-50'}>
          <UiText source={'{0} Place a part'} values={[<Lightbulb size={14} aria-hidden />]} /> <span className="text-ink-faint"><UiText source={'{0} left, costs a star'} values={[MAX_HINTS - s.hints]} /></span>
        </button>
        <p className="text-[14px] text-ink-soft">{s.wrong ? <UiText source={'{0} of {1} wrong tries'} values={[s.wrong, MAX_TRIES]} /> : <UiText source={'No wrong tries yet.'} />}</p>
      </div>
    </div>
  );
}

export function Parts({ lang, def, items, best }: { lang: string; def: GameDef; items: GameItem[]; best?: Best }) {
  const t = useUi();
  return (
    <RoundRunner<Entry>
      lang={lang}
      def={def}
      best={best}
      unit={t('Word')}
      rtl={isRtl(lang)}
      intro={<UiText source={'Five of your words, split into their parts and mixed up. Put the parts back in order, from the meaning.'} />}
      make={(random) => shuffle(usable(def, items, lang), random).slice(0, def.round).map((item) => ({ item, state: startParts(item.parts!, random) }))}
      terms={(e) => [e.item.term]}
      label={(e) => ({ title: e.item.term, detail: e.item.meaning })}
      Board={Board}
      rules={<UiText source={'Click the parts in order. Three full tries that are wrong and the word is lost. Up to three stars: a hint costs one, so do two wrong tries.'} />}
    />
  );
}
