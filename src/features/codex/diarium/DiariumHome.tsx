import { UiText, useUi } from '@/design/i18n/UiText';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { PenLine, Shuffle } from 'lucide-react';
import { RoomTabs } from '@/app/RoomTabs';
import { HoverTranslation } from './HoverTranslation';
import { useApp } from '@/app/context';
import { curatedPrompt, otherPrompt } from '@/core/lang/prompts';
import type { WritingPrompt } from '@/core/lang/prompts';
import { createEntry, useJournal } from '@/data/journal';
import type { JournalEntry } from '@/data/types';
import { aiBlock } from '@/data/plan';
import { Button } from '@/design/primitives';
import { spring } from '@/design/motion';
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
  const [params] = useSearchParams();
  const about = params.get('about')?.trim().slice(0, 120) || '';
  const tab: 'journal' | 'tasks' = params.get('tab') === 'tasks' ? 'tasks' : 'journal';
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
    <div className="space-y-10">
      {/* Lemora U12: two tabs, the journal and the writing tasks. */}
      <RoomTabs label={translateUi('Diarium')} active={tab} tabs={[{ id: 'journal', label: 'Journal', to: '/mentis/diarium' }, { id: 'tasks', label: 'Writing tasks', to: '/mentis/diarium?tab=tasks' }]} />
      {tab === 'tasks' ? (
        <WritingTasks key={lang} lang={lang} />
      ) : (
        <>
          {/* The day's question, centred, in the book face; its English on hover. */}
          <section aria-label={translateUi('Today')} className="mx-auto max-w-3xl pt-4 text-center">
            <p className="text-[11.5px] font-bold tracking-[0.16em] text-ink-faint uppercase">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            {today && today.words > 0 ? (
              <>
                <h2 className="mt-4 font-serif text-[30px] leading-tight font-semibold italic"><UiText source={'You wrote today'} /></h2>
                <p lang={lang} className="mx-auto mt-3 line-clamp-2 max-w-xl font-serif text-[17px] leading-relaxed text-ink-soft">{toPlain(today.text).replace(/\s*\n+\s*/g, ' · ')}</p>
                <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                  <Link to={`/mentis/diarium/${today.id}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-fill px-5 text-[14px] font-semibold text-on-accent"><UiText source={'{0} Open today’s entry'} values={[<PenLine size={15} aria-hidden />]} /></Link>
                  <Button variant="ghost" onClick={() => void start(false)} loading={starting}><UiText source={'Write another'} /></Button>
                </div>
              </>
            ) : (
              <>
                <motion.p key={prompt.text} className="mt-5 font-serif text-[32px] leading-[1.25] font-medium italic sm:text-[38px]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring.soft}>
                  <HoverTranslation text={prompt.text} en={prompt.en} lang={lang} />
                </motion.p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                  <Button icon={PenLine} onClick={() => void start(true)} loading={starting}>
                    {today ? translateUi('Continue writing') : translateUi('Write about this')}
                  </Button>
                  <button type="button" onClick={() => setPrompt(otherPrompt(lang, language.level, prompt.text))} aria-label={translateUi('Another prompt')} title={translateUi('Another prompt')} className="grid size-11 place-items-center rounded-full border border-line transition-transform hover:rotate-180">
                    <Shuffle size={17} aria-hidden />
                  </button>
                  <Button variant="ghost" onClick={() => void start(false)}><UiText source={'Write freely'} /></Button>
                </div>
              </>
            )}
            {stats.count > 0 && (
              <dl className="mx-auto mt-10 flex max-w-xl justify-center gap-10 border-t border-line/60 pt-5">
                {[
                  ['Entries', stats.count.toLocaleString()],
                  ['Words written', stats.words.toLocaleString()],
                  ['Writing streak', `${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`],
                  ['Recent grade', stats.grade === null ? '—' : String(stats.grade)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dd className="font-serif text-[20px] leading-tight font-semibold tabular-nums">{value}</dd>
                    <dt className="mt-0.5 text-[10.5px] font-bold tracking-[0.12em] text-ink-faint uppercase"><UiText source={label} /></dt>
                  </div>
                ))}
              </dl>
            )}
          </section>
          {entries && <Entries entries={entries} lang={lang} />}
          {entries && <WritingPortfolio key={lang} entries={entries} />}
        </>
      )}
    </div>
  );
}
