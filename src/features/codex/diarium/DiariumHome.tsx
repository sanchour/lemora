import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { PenLine, Shuffle, Sparkles } from 'lucide-react';
import { useApp } from '@/app/context';
import { curatedPrompt, otherPrompt } from '@/core/lang/prompts';
import type { WritingPrompt } from '@/core/lang/prompts';
import { createEntry, useJournal } from '@/data/journal';
import type { JournalEntry } from '@/data/types';
import { aiBlock } from '@/data/plan';
import { Button, Card } from '@/design/primitives';
import { spring } from '@/design/motion';
import { quote } from '@/design/flavours';
import { localDateKey } from '@/lib/format';
import { aiPrompt } from '@/services/llm/journal';
import { toPlain } from '@/core/journal/markdown';
import { Entries } from './Entries';
import { WritingTasks } from './WritingTasks';
import { WritingPortfolio } from './WritingPortfolio';

const DAY = 86_400_000;

/** The header's "New entry": a blank page for today. */
export function NewEntryButton() {
  const { language } = useApp();
  const navigate = useNavigate();
  return (
    <Button icon={PenLine} onClick={() => void createEntry(language.id).then((id) => navigate(`/mentis/diarium/${id}`))}><UiText source={'New entry'} /></Button>
  );
}

/** Consecutive days with an entry, ending today or yesterday. */
function writingStreak(entries: JournalEntry[]): number {
  const days = new Set(entries.filter((e) => e.words > 0).map((e) => e.date));
  let cursor = days.has(localDateKey()) ? Date.now() : Date.now() - DAY;
  let n = 0;
  while (days.has(localDateKey(cursor))) {
    n++;
    cursor -= DAY;
  }
  return n;
}

/** Mentis › Diarium: today's prompt, a few honest numbers, and every entry by month. */
export function DiariumHome() {
  const translateUi = useUi();
  const { language, settings } = useApp();
  const lang = language.id;
  const entries = useJournal(lang);
  const navigate = useNavigate();
  const block = aiBlock(settings, settings.llm.provider);
  const hasAi = !block && Boolean(settings.llm.model);
  // The guide's "Write three lines about …" opens here with that as the day's prompt.
  const about = useSearchParams()[0].get('about')?.trim().slice(0, 120) || '';
  const aboutPrompt = (title: string): WritingPrompt => ({ text: title, en: `Write three lines about ${title}.` });
  const [prompt, setPrompt] = useState<WritingPrompt>(() => (about ? aboutPrompt(about) : curatedPrompt(lang, language.level)));
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (about) return setPrompt(aboutPrompt(about));
    setPrompt(curatedPrompt(lang, language.level));
    if (!hasAi || !navigator.onLine) return;
    let alive = true;
    aiPrompt(lang, language.level)
      .then((p) => alive && setPrompt(p))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [lang, language.level, hasAi, about]);

  const today = entries?.find((e) => e.date === localDateKey());
  const stats = useMemo(() => {
    const list = entries ?? [];
    const graded = list.filter((e) => e.review).slice(0, 5);
    return {
      count: list.filter((e) => e.words > 0).length,
      words: list.reduce((n, e) => n + e.words, 0),
      grade: graded.length ? Math.round(graded.reduce((n, e) => n + e.review!.scores.overall, 0) / graded.length) : null,
      streak: writingStreak(list),
    };
  }, [entries]);


  const start = async (withPrompt: boolean) => {
    // An empty entry from earlier today is picked up rather than duplicated.
    if (withPrompt && today && !today.words) return navigate(`/mentis/diarium/${today.id}`);
    setStarting(true);
    const id = await createEntry(lang, withPrompt ? prompt : undefined);
    navigate(`/mentis/diarium/${id}`);
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Today */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="relative overflow-hidden rounded-3xl border-line/75 p-6 sm:p-7">
          <span aria-hidden className="pointer-events-none absolute -top-6 right-5 font-serif text-[140px] leading-none text-sage/12 select-none">
            {quote(lang, '').trim().charAt(0)}
          </span>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-sage-text" aria-hidden />
            <p className="text-[11px] font-bold tracking-[0.14em] text-sage-text uppercase">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {today && today.words > 0 ? (
            <>
              <h2 className="mt-2.5 font-serif text-2xl font-semibold tracking-tight"><UiText source={'You wrote today'} /></h2>
              <p lang={lang} className="mt-2 line-clamp-2 max-w-xl font-serif text-[17px] leading-relaxed text-ink-soft">
                {toPlain(today.text).replace(/\s*\n+\s*/g, ' · ')}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to={`/mentis/diarium/${today.id}`} className="inline-flex h-9 items-center gap-2 rounded-lg bg-inverse px-3.5 text-[13px] font-semibold text-on-inverse shadow-elev-1"><UiText source={'{0} Open today’s entry'} values={[<PenLine size={15} aria-hidden />]} /></Link>
                <Button size="sm" variant="secondary" onClick={() => void start(false)} loading={starting}><UiText source={'Write another'} /></Button>
              </div>
            </>
          ) : (
            <>
              <motion.p key={prompt.text} lang={lang} className="relative mt-3 max-w-xl font-serif text-[21px] leading-snug font-medium sm:text-[24px]" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring.soft}>
                {prompt.text}
              </motion.p>
              {prompt.en && <p className="relative mt-2 text-[13.5px] text-ink-faint italic">{prompt.en}</p>}
              <p className="relative mt-1.5 text-[12.5px] text-ink-faint"><UiText source={'A few sentences a day is plenty.'} /></p>
              <div className="relative mt-5 flex flex-wrap items-center gap-2">
                <Button size="sm" icon={PenLine} onClick={() => void start(true)} loading={starting}>
                  {today ? translateUi('Continue writing') : translateUi('Write about this')}
                </Button>
                <Button size="sm" variant="secondary" icon={Shuffle} onClick={() => setPrompt(otherPrompt(lang, language.level, prompt.text))}><UiText source={'Another prompt'} /></Button>
                <Button size="sm" variant="ghost" onClick={() => void start(false)}><UiText source={'Write freely'} /></Button>
              </div>
            </>
          )}

          {stats.count > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line/60 pt-4 sm:grid-cols-4">
              {[
                ['Entries', stats.count.toLocaleString()],
                ['Words written', stats.words.toLocaleString()],
                ['Writing streak', `${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`],
                ['Recent grade', stats.grade === null ? '—' : String(stats.grade)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dd className="font-serif text-lg leading-tight font-semibold tabular-nums">{value}</dd>
                  <dt className="mt-0.5 text-[10.5px] font-bold tracking-[0.12em] text-ink-faint uppercase">{label}</dt>
                </div>
              ))}
            </dl>
          )}
        </Card>
        <WritingTasks key={lang} lang={lang} />
      </div>

      {/* Entries */}
      {entries && entries.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line/80 bg-surface/40 py-8 text-center text-ink-soft">
          <Sparkles size={20} className="mb-2.5 text-sage-text" aria-hidden />
          <p className="max-w-sm text-[14.5px] leading-relaxed"><UiText source={'A few sentences a day is plenty. Write, then let the AI correct and explain{0}; your mistakes become flashcards.'} values={[hasAi ? '' : block === 'max' ? <UiText source={' (with Lingua+ Max)'} /> : <UiText source={' (add a free key in Settings › AI)'} />]} /></p>
        </div>
      )}
      {entries && <Entries entries={entries} lang={lang} />}
      {entries && <WritingPortfolio key={lang} entries={entries} />}
    </div>
  );
}
