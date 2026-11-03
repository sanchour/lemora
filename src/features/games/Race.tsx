// Races on words that go together (6-21, F0179 to F0181 and F1192): synonyms, opposites or anything related, before the time runs out.
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Best } from '@/core/games/bests';
import type { GameDef } from '@/core/games/defs';
import { judgeWord, raceStars, relatedOf } from '@/core/games/races';
import type { Relation } from '@/core/games/races';
import { usable } from '@/core/games/source';
import type { GameItem } from '@/core/games/source';
import { isRtl } from '@/core/lang/languages';
import { shuffle } from '@/core/srs/ludus';
import { normalizeWord } from '@/core/text/normalize';
import { relatedBack } from '@/data/games';
import { buttonClasses } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { RoundRunner, useSettleOnce } from './RoundRunner';
import type { BoardProps } from './RoundRunner';

const SECONDS = 45;

interface Entry {
  item: GameItem;
  relation: Relation;
}

function Board({ entry, lang, settle }: BoardProps<Entry>) {
  const { item, relation } = entry;
  const t = useUi();
  const rtl = isRtl(lang);
  const forms = relatedOf(item, relation);
  const [counted, setCounted] = useState<string[]>([]);
  const [missed, setMissed] = useState<string[]>([]);
  const [typed, setTyped] = useState('');
  const [again, setAgain] = useState(false);
  const [left, setLeft] = useState(SECONDS);
  const [done, setDone] = useState(false);
  const started = useRef(performance.now());
  const input = useRef<HTMLInputElement>(null);
  const over = done || left <= 0;
  useEffect(() => {
    if (over) return;
    const timer = window.setInterval(() => setLeft(Math.max(0, SECONDS - Math.floor((performance.now() - started.current) / 1000))), 250);
    return () => window.clearInterval(timer);
  }, [over]);
  const rest = forms.filter((f) => !counted.includes(normalizeWord(f, lang)));
  useSettleOnce(over, () => settle({ won: counted.length > 0, stars: raceStars(counted.length, forms.length), hints: 0, message: t('Found {0}.{1}', [counted.length, rest.length ? t(' Also in the dictionary: {0}.', [rest.slice(0, 5).join(', ')]) : '']) }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const word = typed.trim();
    setTyped('');
    input.current?.focus();
    if (!word || over) return;
    const norm = normalizeWord(word, lang);
    let verdict = judgeWord(word, forms, counted, lang);
    if (verdict === 'no' && !missed.includes(norm) && (await relatedBack(lang, word, item.term, relation))) verdict = 'new';
    setAgain(verdict === 'again');
    if (verdict === 'new') setCounted((c) => (c.includes(norm) ? c : [...c, norm]));
    else if (verdict === 'no') setMissed((m) => (m.includes(norm) ? m : [...m, norm]));
  };
  const prompt = relation === 'synonym' ? t('Name synonyms of') : relation === 'antonym' ? t('Name opposites of') : t('Name words that go with');
  return (
    <div className="max-w-xl">
      <div className="rounded-3xl border border-line/70 bg-surface p-6">
        <p className="text-[12px] font-bold tracking-[0.12em] text-ink-faint uppercase">{prompt}</p>
        <p className="mt-1 font-serif text-4xl font-semibold" lang={lang} dir={rtl ? 'rtl' : undefined}>{item.term}</p>
        <p className="mt-1 text-[14px] text-ink-soft">{item.meaning}</p>
      </div>
      <p className="mt-4 font-serif text-3xl font-semibold tabular-nums" aria-live="off"><UiText source={'Time left: {0}'} values={[left]} /></p>
      {!over && (
        <form onSubmit={(e) => void submit(e)} className="mt-3 flex flex-wrap items-center gap-3">
          <input ref={input} autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} lang={lang} dir={rtl ? 'rtl' : undefined} autoComplete="off" spellCheck={false} aria-label={t('Your word')} className="h-12 w-64 rounded-xl border border-line bg-raised px-4 font-serif text-xl outline-none focus:border-line-strong" />
          <button type="submit" disabled={!typed.trim()} className={buttonClasses('primary', 'md') + ' disabled:opacity-50'}><UiText source={'Add'} /></button>
          <button type="button" onClick={() => setDone(true)} className={buttonClasses('ghost', 'md')}><UiText source={'Done'} /></button>
        </form>
      )}
      <p className="mt-3 min-h-6 text-[14px] text-accent-text" role="status">{again && <UiText source={'Already counted.'} />}</p>
      <ul className="mt-2 flex flex-wrap gap-2" lang={lang} dir={rtl ? 'rtl' : undefined} aria-label={t('Counted')}>
        {counted.map((w) => <li key={w} className="rounded-full bg-sage-soft px-3 py-1 font-serif text-lg text-sage-text">{w}</li>)}
      </ul>
      {missed.length > 0 && (
        <p className="mt-3 text-[13px] text-ink-faint">
          <UiText source={'Not related in the dictionary: {0}'} values={[<bdi lang={lang}>{missed.join(', ')}</bdi>]} />
        </p>
      )}
    </div>
  );
}

/** One race: the prompt word's relation, which the game is about. */
export function Race({ lang, def, items, best, relation }: { lang: string; def: GameDef; items: GameItem[]; best?: Best; relation: Relation }) {
  const t = useUi();
  return (
    <RoundRunner<Entry>
      lang={lang}
      def={def}
      best={best}
      unit={t('Word')}
      rtl={isRtl(lang)}
      intro={<UiText source={'Three of your words. For each you have 45 seconds to name the words the dictionary relates to it.'} />}
      make={(random) => shuffle(usable(def, items, lang), random).slice(0, def.round).map((item) => ({ item, relation }))}
      terms={(e) => [e.item.term]}
      label={(e) => ({ title: e.item.term, detail: e.item.meaning })}
      Board={Board}
      rules={<UiText source={'Type a word and press Enter. It counts when the dictionary relates it to the prompt, read from either word. Three stars for naming three, or all there are.'} />}
    />
  );
}
