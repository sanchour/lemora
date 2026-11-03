// Finish it (6-21, F1203 and F1204): a dialogue with a line missing, or a story without its ending; pick the line that fits.
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { Best } from '@/core/games/bests';
import { choiceStars, MAX_WRONG_PICKS } from '@/core/games/choice';
import { completeItems, makeComplete } from '@/core/games/complete';
import type { CompleteRound } from '@/core/games/complete';
import type { GameDef } from '@/core/games/defs';
import type { GameItem } from '@/core/games/source';
import { isRtl } from '@/core/lang/languages';
import { shuffle } from '@/core/srs/ludus';
import { recordGameSkill } from '@/data/games';
import { Kbd } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { cx } from '@/lib/cx';
import { RoundRunner, useSettleOnce } from './RoundRunner';
import type { BoardProps } from './RoundRunner';

function Board({ entry, lang, settle }: BoardProps<CompleteRound>) {
  const t = useUi();
  const rtl = isRtl(lang);
  const [wrong, setWrong] = useState<number[]>([]);
  const [right, setRight] = useState(false);
  const over = right || wrong.length >= MAX_WRONG_PICKS;
  useSettleOnce(over, () => void recordGameSkill(lang, 'complete', 'reading', `complete:${entry.item.kind}:${entry.item.before.slice(0, 30)}`, right, wrong.length > 0).catch(() => undefined));
  useSettleOnce(over, () => settle({ won: right, stars: choiceStars(wrong.length, right), hints: 0, message: right ? t('Right.') : t('The line that fits is marked.') }));
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
  const dialogue = entry.item.kind === 'dialogue';
  const line = 'font-serif text-xl leading-snug';
  return (
    <div className="max-w-xl">
      <div className="rounded-3xl border border-line/70 bg-surface p-6" lang={lang} dir={rtl ? 'rtl' : undefined}>
        <p className={line}>{entry.item.before}</p>
        <p className={cx(line, 'my-3 rounded-xl border border-dashed border-line-strong px-4 py-2 text-ink-soft')}>
          {over ? entry.options[entry.answer] : '…'}
        </p>
        {entry.item.after && <p className={line}>{entry.item.after}</p>}
      </div>
      <p className="mt-4 text-[12px] font-bold tracking-[0.12em] text-ink-faint uppercase">{dialogue ? <UiText source={'Which line fits?'} /> : <UiText source={'Which ending fits?'} />}</p>
      <div className="mt-2 grid gap-2">
        {entry.options.map((o, i) => (
          <button key={i} type="button" disabled={over || wrong.includes(i)} onClick={() => pick(i)} className={cx('flex items-center gap-3 rounded-2xl border px-4 py-3 text-start transition-colors', over && i === entry.answer ? 'border-sage-text/30 bg-sage-soft' : wrong.includes(i) ? 'border-transparent bg-accent-soft opacity-70' : 'border-line bg-raised hover:border-line-strong hover:bg-surface')}>
            <Kbd>{i + 1}</Kbd>
            <span className="text-[16px]" lang={lang} dir={rtl ? 'rtl' : undefined}>{o}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Complete({ lang, def, best }: { lang: string; def: GameDef; items: GameItem[]; best?: Best }) {
  const t = useUi();
  return (
    <RoundRunner<CompleteRound>
      lang={lang}
      def={def}
      best={best}
      unit={t('Question')}
      rtl={isRtl(lang)}
      intro={<UiText source={'A dialogue with a line missing, or a story without its ending. Pick the line that fits.'} />}
      options={
        <p className="text-[13px] text-ink-soft">
          <UiText source={'For any language, with Max: Practice has dialogues to complete.'} />{' '}
          <Link to="/thesaurus/practice/dialogue" className="font-semibold text-ink underline decoration-line-strong underline-offset-4"><UiText source={'Open Practice'} /></Link>
        </p>
      }
      make={(random) => shuffle(completeItems(lang), random).slice(0, def.round).map((i) => makeComplete(i, random))}
      empty={t('This could not be made from what you have yet.')}
      terms={() => []}
      label={(e, i) => ({ title: `${i + 1}`, detail: e.options[e.answer] })}
      Board={Board}
      rules={<UiText source={'Click a line or press its number. Right the first time is three stars, the second time two, the third one; two wrong picks and it is lost.'} />}
    />
  );
}
