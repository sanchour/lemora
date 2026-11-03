// Timed translation and dictation races (6-21, F1185 and F1190): sentences one after another until the time runs out, judged by the exercise engine.
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Volume2 } from 'lucide-react';
import type { Best } from '@/core/games/bests';
import type { GameDef } from '@/core/games/defs';
import type { GameItem } from '@/core/games/source';
import { dictationLines, judgeDictation, judgeTranslation, timedStars, translationPool } from '@/core/games/timed';
import type { Verdict } from '@/core/games/timed';
import { isRtl } from '@/core/lang/languages';
import { shuffle } from '@/core/srs/ludus';
import { buttonClasses } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { recordGameSkill } from '@/data/games';
import { speak } from '@/services/speech/voice';
import { RoundRunner, useSettleOnce } from './RoundRunner';
import type { BoardProps } from './RoundRunner';

const SECONDS = 90;

interface Line {
  id: string;
  /** Shown: the English to translate. Absent in a dictation, where the line is heard. */
  prompt?: string;
  expected: string;
  judge: (typed: string) => Verdict;
}
interface Entry {
  kind: 'translate' | 'dictation';
  lines: Line[];
}

function Board({ entry, lang, settle }: BoardProps<Entry>) {
  const t = useUi();
  const rtl = isRtl(lang);
  const [at, setAt] = useState(0);
  const [right, setRight] = useState(0);
  const [typed, setTyped] = useState('');
  const [miss, setMiss] = useState<Line | null>(null);
  const [left, setLeft] = useState(SECONDS);
  const [done, setDone] = useState(false);
  const started = useRef(performance.now());
  const input = useRef<HTMLInputElement>(null);
  const line = entry.lines[at];
  const dictation = line && line.prompt === undefined;
  const over = done || left <= 0 || !line;
  useEffect(() => {
    if (over) return;
    const timer = window.setInterval(() => setLeft(Math.max(0, SECONDS - Math.floor((performance.now() - started.current) / 1000))), 250);
    return () => window.clearInterval(timer);
  }, [over]);
  useEffect(() => {
    if (dictation && !miss && !over) void speak(lang, line.expected).catch(() => undefined);
  }, [at, dictation, miss, over, lang, line]);
  useSettleOnce(over, () => settle({ won: right > 0, stars: timedStars(right), hints: 0, message: t('Done: {0} right.', [right]) }));

  const next = () => {
    setMiss(null);
    setTyped('');
    setAt((n) => n + 1);
    input.current?.focus();
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!typed.trim() || over || miss) return;
    const verdict = line.judge(typed);
    void recordGameSkill(lang, entry.kind, entry.kind === 'translate' ? 'translating' : 'listening', `${entry.kind}:${line.id}`, verdict !== 'wrong').catch(() => undefined);
    if (verdict === 'wrong') setMiss(line);
    else {
      setRight((n) => n + 1);
      next();
    }
  };
  return (
    <div className="max-w-xl">
      <div className="rounded-3xl border border-line/70 bg-surface p-6">
        {dictation ? (
          <button type="button" onClick={() => void speak(lang, line.expected).catch(() => undefined)} className={buttonClasses('secondary', 'lg')}>
            <UiText source={'{0} Hear it again'} values={[<Volume2 size={18} aria-hidden />]} />
          </button>
        ) : (
          <>
            <p className="text-[12px] font-bold tracking-[0.12em] text-ink-faint uppercase"><UiText source={'Say it in the language'} /></p>
            <p className="mt-2 font-serif text-2xl leading-snug">{line?.prompt}</p>
          </>
        )}
      </div>
      <p className="mt-4 font-serif text-3xl font-semibold tabular-nums"><UiText source={'Time left: {0}'} values={[left]} /> · <UiText source={'Right: {0}'} values={[right]} /></p>
      {!over && (
        <form onSubmit={submit} className="mt-3 flex flex-wrap items-center gap-3">
          <input ref={input} autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} disabled={!!miss} lang={lang} dir={rtl ? 'rtl' : undefined} autoComplete="off" spellCheck={false} aria-label={t('Your answer')} className="h-12 w-80 max-w-full rounded-xl border border-line bg-raised px-4 font-serif text-xl outline-none focus:border-line-strong" />
          <button type="submit" disabled={!typed.trim() || !!miss} className={buttonClasses('primary', 'md') + ' disabled:opacity-50'}><UiText source={'Check'} /></button>
          <button type="button" onClick={() => setDone(true)} className={buttonClasses('ghost', 'md')}><UiText source={'Done'} /></button>
        </form>
      )}
      {miss && !over && (
        <div className="mt-4 rounded-2xl border border-line/70 bg-surface p-4" role="status">
          <p className="text-[13px] text-ink-soft"><UiText source={'The model answer'} /></p>
          <p className="font-serif text-xl" lang={lang} dir={rtl ? 'rtl' : undefined}>{miss.expected}</p>
          <div className="mt-3 flex gap-2">
            {!dictation && (
              <button type="button" onClick={() => { setRight((n) => n + 1); next(); }} className={buttonClasses('secondary', 'sm')}><UiText source={'Mine was as good'} /></button>
            )}
            <button type="button" onClick={next} className={buttonClasses('primary', 'sm')}><UiText source={'Next sentence'} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Timed({ lang, def, items, best, kind }: { lang: string; def: GameDef; items: GameItem[]; best?: Best; kind: 'translate' | 'dictation' }) {
  const t = useUi();
  return (
    <RoundRunner<Entry>
      lang={lang}
      def={def}
      best={best}
      unit={t('Round')}
      rtl={isRtl(lang)}
      intro={kind === 'translate' ? <UiText source={'English sentences to put into the language. You have 90 seconds: as many as you can.'} /> : <UiText source={'Lines to hear and type. You have 90 seconds: as many as you can.'} />}
      make={(random) => {
        const lines: Line[] =
          kind === 'translate'
            ? shuffle(translationPool(lang, items), random).slice(0, 25).map((s) => ({ id: s.id, prompt: s.source, expected: s.expected, judge: (typed) => judgeTranslation(s, typed, lang) }))
            : shuffle(dictationLines(lang, items), random).slice(0, 25).map((l) => ({ id: l.slice(0, 40), expected: l, judge: (typed) => judgeDictation(l, typed, lang) }));
        return lines.length ? [{ kind, lines }] : [];
      }}
      empty={t('This could not be made from what you have yet.')}
      terms={() => []}
      label={() => ({ title: kind === 'translate' ? t('Timed translation') : t('Dictation race') })}
      Board={Board}
      rules={kind === 'translate' ? <UiText source={'Type the translation and press Enter. A near miss counts. If a translation is marked wrong but was as good as the model, say so and it counts. Three stars for five, two for three, one for any.'} /> : <UiText source={'The line is read aloud by your device’s voice; press Hear it again as often as you like. Words matter, case and punctuation do not. Three stars for five, two for three, one for any.'} />}
    />
  );
}
