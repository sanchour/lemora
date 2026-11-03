// Guess the definition and picture vocabulary (6-21, F0176, F0177 and F1198): one word of the learner's, four answers.
import { useEffect, useState } from 'react';
import type { Best } from '@/core/games/bests';
import { choiceStars, makeChoice, MAX_WRONG_PICKS } from '@/core/games/choice';
import type { Choice as ChoiceData, ChoiceKind } from '@/core/games/choice';
import type { GameDef } from '@/core/games/defs';
import { usable } from '@/core/games/source';
import type { GameItem } from '@/core/games/source';
import { isRtl } from '@/core/lang/languages';
import { shuffle } from '@/core/srs/ludus';
import { Kbd } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { RoundRunner, useSettleOnce } from './RoundRunner';
import type { BoardProps } from './RoundRunner';

/** Learner words go into messages between bidi isolates, so right-to-left words do not scramble the sentence around them. */
const iso = (s: string) => `⁨${s}⁩`;

function Board({ entry, lang, settle }: BoardProps<ChoiceData>) {
  const t = useUi();
  const rtl = isRtl(lang);
  const [wrong, setWrong] = useState<number[]>([]);
  const [right, setRight] = useState(false);
  const over = right || wrong.length >= MAX_WRONG_PICKS;
  const term = entry.item.term;
  useSettleOnce(over, () => settle({ won: right, stars: choiceStars(wrong.length, right), hints: 0, message: right ? t('Right: {0}', [iso(term)]) : t('It was {0}', [iso(entry.options[entry.answer])]) }));
  const pick = (i: number) => {
    if (over || wrong.includes(i)) return;
    if (i === entry.answer) setRight(true);
    else setWrong((w) => [...w, i]);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= entry.options.length && !e.ctrlKey && !e.metaKey && !e.altKey) pick(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const picture = entry.kind === 'picture';
  return (
    <div className="max-w-xl">
      <div className="rounded-3xl border border-line/70 bg-surface p-6">
        <p className="text-[12px] font-bold tracking-[0.12em] text-ink-faint uppercase">{picture ? <UiText source={'Which word does the picture show?'} /> : <UiText source={'Which meaning is right?'} />}</p>
        {picture ? <img src={entry.item.image} alt="" className="mt-3 max-h-56 rounded-2xl" /> : <p className="mt-2 font-serif text-4xl font-semibold" lang={lang} dir={rtl ? 'rtl' : undefined}>{term}</p>}
      </div>
      <div className="mt-4 grid gap-2">
        {entry.options.map((o, i) => (
          <button key={i} type="button" disabled={over || wrong.includes(i)} onClick={() => pick(i)} className={cx('flex items-center gap-3 rounded-2xl border px-4 py-3 text-start transition-colors', over && i === entry.answer ? 'border-sage-text/30 bg-sage-soft' : wrong.includes(i) ? 'border-transparent bg-accent-soft opacity-70' : 'border-line bg-raised hover:border-line-strong hover:bg-surface')}>
            <Kbd>{i + 1}</Kbd>
            <span className={cx('text-[17px]', picture && 'font-serif text-xl font-semibold')} lang={picture ? lang : undefined} dir={picture && rtl ? 'rtl' : undefined}>{o}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Choice({ lang, def, items, best, kind }: { lang: string; def: GameDef; items: GameItem[]; best?: Best; kind: ChoiceKind }) {
  const t = useUi();
  return (
    <RoundRunner<ChoiceData>
      lang={lang}
      def={def}
      best={best}
      unit={t('Word')}
      rtl={isRtl(lang)}
      intro={kind === 'picture' ? <UiText source={'Five pictures from your cards, each with four words. Pick the word the picture shows.'} /> : <UiText source={'Five of your words, each with four meanings. Pick the right one.'} />}
      make={(random) => {
        const pool = usable(def, items, lang);
        return shuffle(pool, random).flatMap((item) => makeChoice(item, items.filter((i) => (kind === 'picture' ? i.term : i.meaning)), kind, random) ?? []).slice(0, def.round);
      }}
      empty={t('This could not be made from what you have yet.')}
      terms={(e) => [e.item.term]}
      label={(e) => ({ title: e.item.term, detail: e.item.meaning })}
      Board={Board}
      rules={<UiText source={'Click an answer or press its number. Right the first time is three stars, the second time two, the third one; two wrong picks and it is lost.'} />}
    />
  );
}
