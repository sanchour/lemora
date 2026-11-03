import { interpolate } from '@/core/i18n/messages';
import { UiText, useUi } from '@/design/i18n/UiText';
// Practice (6-4b): sets of exercises made from your own words and from Grammatica, in every kind the engine has: matching games,
// correct the mistake, rewrite, what comes next, drag the words, change a form. Each runs in one session screen.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { completeDialogue, sentenceTask } from '@/core/exercise';
import { REWRITE_TASKS } from '@/core/generate/generate';
import type { DialogueBody, DrillBody, RewritesBody, RewriteTask, SentencesBody } from '@/core/generate/generate';
import type { HeardLine } from '@/core/exercise';
import type { Cefr } from '@/core/lang/levels';
import { aiBlock } from '@/data/plan';
import { heardLines } from '@/data/listening';
import { lookUpFull } from '@/services/dictionary/fullDict';
import { generateMaterial } from '@/services/llm/generate';
import { useApp } from '@/app/context';
import { PageHeader } from '@/app/PageHeader';
import { attachRetries, correctMistake, dragSentence, gridOfGrammarTable, matchAffixes, matchAntonyms, matchDefinitions, matchPartsOfSpeech, matchPictures, matchSentences, matchSounds, matchSynonyms, planTransforms, predictForms, rewriteFix, tenseTransforms, useInSentence, drillGap, listenEndings, listenGap, listenMeaning, listenOrder, listenPicture, listenPunctuated, listenSplit, listenType, syllableSplit } from '@/core/exercise';
import type { ExerciseSpec } from '@/core/contracts/exercise';
import type { FormGrid, WordFacts } from '@/core/exercise';
import type { Topic } from '@/core/grammar/types';
import { plain } from '@/core/grammar/types';
import { getLanguage } from '@/core/lang/languages';
import { seededRandom, shuffle } from '@/core/srs/ludus';
import { trickyNotes } from '@/data/memoryViews';
import { affixesOfWords, itemsOf, practiceNotes, practiceTopics, verbGrids, wordFacts } from '@/data/practice';
import { ArrowRight, Gamepad2, Layers } from 'lucide-react';
import { buttonClasses, Segmented } from '@/design/primitives';
import { ExerciseSession } from '@/features/exercise/ExerciseSession';
import { useStudySession } from '@/features/lesson/useStudySession';

interface Ctx {
  facts: WordFacts[];
  affixes: Array<{ affix: string; meaning: string }>;
  topics: Topic[];
  verbs: Array<{ lemma: string; grids: FormGrid[] }>;
  /** Words the learner finds hard, and words not seen for a long while (from their cards). */
  difficult: WordFacts[];
  rusty: WordFacts[];
  heard: HeardLine[];
}

interface PracticeSet {
  id: string;
  group: 'words' | 'grammar' | 'listening';
  title: string;
  detail: string;
  /** Needs, said when the set cannot be made yet. */
  needs: string;
  make: () => ExerciseSpec[];
  /** Made when it is started, by Max (a story, a dialogue, rewrites): it takes a moment and the learner's key. */
  makeLater?: () => Promise<ExerciseSpec[]>;
  /** Made when started, but without Max: it only looks things up on the device. */
  local?: boolean;
}

const ROUNDS = 3;

/** Rounds of a matching game, each from five different words. */
function rounds(facts: WordFacts[], random: () => number, build: (chunk: WordFacts[], key: string) => ExerciseSpec | null, prefix: string): ExerciseSpec[] {
  const mixed = shuffle(facts, random);
  const out: ExerciseSpec[] = [];
  for (let i = 0; i < ROUNDS; i++) {
    const spec = build(mixed.slice(i * 5, i * 5 + 5), `${prefix}-${i}`);
    if (spec) out.push(spec);
  }
  return out;
}

const TASK_SET: Record<RewriteTask, { title: string; detail: string }> = {
  passive: { title: 'Say it in the passive', detail: 'An active sentence into the passive voice.' },
  reported: { title: 'Reported speech', detail: 'What someone said, told as reported speech.' },
  question: { title: 'Turn it into a question', detail: 'A statement into the question that asks about it.' },
  combine: { title: 'Combine two sentences', detail: 'Two short sentences made into one.' },
  expand: { title: 'Add more information', detail: 'A short sentence, made fuller.' },
  simplify: { title: 'Say it more simply', detail: 'A long sentence, said simply.' },
};

/** The sets Max makes for the learner when they start them: sentence tasks, and a dialogue with a line to fill in. */
function madeSets(lang: string, level: Cefr, topics: Topic[]): PracticeSet[] {
  const needs = 'Lingua+ Max, and your AI key (Settings › AI)';
  const trains = (id: string) => ({ skill: 'grammar', item: { type: 'pattern', patternId: id } }) as const;
  const tasks = REWRITE_TASKS.map(
    (task): PracticeSet => ({
      id: `task-${task}`,
      group: 'grammar',
      ...TASK_SET[task],
      needs,
      make: () => [],
      makeLater: async () => {
        const body = (await generateMaterial({ lang, kind: 'rewrites', task, level })).row.content as RewritesBody;
        return body.items.map((it, i) => sentenceTask(task, it.given, it.answer, lang, `task-${task}-${i}`, trains(`rewrite:${task}`), true));
      },
    }),
  );
  const dialogue: PracticeSet = {
    id: 'dialogue',
    group: 'grammar',
    title: 'Complete the dialogue',
    detail: 'A short conversation with one line missing: write it.',
    needs,
    make: () => [],
    makeLater: async () => {
      const body = (await generateMaterial({ lang, kind: 'dialogue', level })).row.content as DialogueBody;
      // A different line is missing in each: never the first, which only opens it.
      const missing = shuffle(body.lines.map((_, i) => i).slice(1), () => Math.random()).slice(0, 3);
      return missing.flatMap((m, i) => completeDialogue(body.lines, m, lang, `dialogue-${i}`, trains('dialogue'), body.title) ?? []);
    },
  };
  const translate: PracticeSet = {
    id: 'translate',
    group: 'grammar',
    title: 'Translate into the language',
    detail: 'A sentence in English: put the words of its translation in order.',
    needs,
    make: () => [],
    makeLater: async () => {
      const body = (await generateMaterial({ lang, kind: 'sentences', level, topic: 'translate' })).row.content as SentencesBody;
      return shuffle(body.sentences, () => Math.random()).flatMap((s, i) => dragSentence(s.text, s.translation, lang, () => Math.random(), `translate-${i}`, trains('translate')) ?? []).slice(0, 6);
    },
  };
  const dictation: PracticeSet = {
    id: 'hear-max',
    group: 'listening',
    title: 'Dictation made for you',
    detail: 'Short sentences at your level, read by your device’s voice: type what you hear.',
    needs,
    make: () => [],
    makeLater: async () => {
      const body = (await generateMaterial({ lang, kind: 'sentences', level, topic: 'dictation' })).row.content as SentencesBody;
      return body.sentences.slice(0, 6).map((s, i) => listenType({ text: s.text }, lang, `hear-max-${i}`));
    },
  };
  const drill: PracticeSet = {
    id: 'drill',
    group: 'grammar',
    title: 'A grammar drill made for you',
    detail: 'Sentences with a gap on a point of grammar from Grammatica, made to your level.',
    needs,
    make: () => [],
    makeLater: async () => {
      const topic = shuffle(topics, () => Math.random())[0];
      const body = (await generateMaterial({ lang, kind: 'drill', level, focus: topic?.title ?? 'the present tense' })).row.content as DrillBody;
      return body.items.slice(0, 8).map((it, i) => drillGap(it, lang, `drill-${i}`, topic ? ({ skill: 'grammar', item: { type: 'grammar', topicId: topic.id } } as const) : trains('drill')));
    },
  };
  return [...tasks, dialogue, translate, dictation, drill];
}

function buildSets(lang: string, c: Ctx, level: Cefr): PracticeSet[] {
  const random = () => Math.random();
  const trains = (topic: string) => ({ skill: 'grammar', item: { type: 'grammar', topicId: topic } }) as const;
  const items = () => shuffle(itemsOf(c.topics), random);
  const games = (id: string, title: string, detail: string, needs: string, build: (chunk: WordFacts[], r: () => number, key: string) => ExerciseSpec | null, fits?: (w: WordFacts) => boolean): PracticeSet => ({
    id,
    group: 'words',
    title,
    detail,
    needs,
    // Only the words that have what the game needs are dealt, so a round is not left short by words with nothing to match.
    make: () => rounds(fits ? c.facts.filter(fits) : c.facts, random, (chunk, key) => build(chunk, random, key), id),
  });
  return [
    games('definitions', 'Words and meanings', 'Match each of your words with what it means.', 'words with a meaning in your decks', (w, r, k) => matchDefinitions(w, lang, r, k)),
    games('synonyms', 'Words that mean the same', 'Match each word with a synonym.', 'the dictionary, and words that have synonyms', (w, r, k) => matchSynonyms(w, lang, r, k), (w) => (w.synonyms?.length ?? 0) > 0),
    games('antonyms', 'Opposites', 'Match each word with its opposite.', 'the dictionary, and words that have opposites', (w, r, k) => matchAntonyms(w, lang, r, k), (w) => (w.antonyms?.length ?? 0) > 0),
    games('pos', 'Kinds of words', 'Match nouns, verbs, adjectives and the rest.', 'words of different kinds', (w, r, k) => matchPartsOfSpeech(w, lang, r, k)),
    games('sentences', 'Words in sentences', 'Match each word with the sentence it fits.', 'words with an example sentence', (w, r, k) => matchSentences(w, lang, r, k), (w) => Boolean(w.sentence)),
    games('sounds', 'Sounds and words', 'Hear a word, match it with how it is written.', 'a voice for this language', (w, r, k) => matchSounds(w, lang, r, k)),
    {
      id: 'use',
      group: 'words',
      title: 'Use it in a sentence',
      detail: 'Write your own sentence with a word, then see an example and rate yourself. No AI needed.',
      needs: 'words with an example sentence',
      make: () => shuffle(c.facts.filter((w) => w.sentence), random).slice(0, 6).flatMap((w, i) => useInSentence(w, lang, `use-${i}`) ?? []),
    },
    {
      id: 'hear-type',
      group: 'listening',
      title: 'Dictation of what you listened to',
      detail: 'Hear a line from your own podcasts, songs and films, and type it.',
      needs: 'a transcript of something you listened to',
      make: () => shuffle(c.heard, random).slice(0, 6).map((l, i) => listenType(l, lang, `hear-type-${i}`)),
    },
    {
      id: 'hear-gap',
      group: 'listening',
      title: 'The missing word',
      detail: 'A line of something you listened to, with one word left out: hear it, type the word.',
      needs: 'a transcript of something you listened to',
      make: () => shuffle(c.heard, random).flatMap((l, i) => listenGap(l, lang, random, `hear-gap-${i}`) ?? []).slice(0, 6),
    },
    {
      id: 'hear-order',
      group: 'listening',
      title: 'Hear it, put it in order',
      detail: 'Hear a line you listened to, then drag its words into order.',
      needs: 'a transcript of something you listened to',
      make: () => shuffle(c.heard, random).flatMap((l, i) => listenOrder(l, lang, random, `hear-order-${i}`) ?? []).slice(0, 6),
    },
    {
      id: 'hear-partial',
      group: 'listening',
      title: 'Partial dictation',
      detail: 'A line of something you listened to with three words left out: hear it, type the three.',
      needs: 'a transcript of something you listened to, with longer lines',
      make: () => shuffle(c.heard, random).flatMap((l, i) => listenGap(l, lang, random, `hear-partial-${i}`, 3) ?? []).slice(0, 6),
    },
    {
      id: 'hear-punct',
      group: 'listening',
      title: 'Dictation with punctuation',
      detail: 'Hear a line you listened to and type it with its commas and full stops.',
      needs: 'a transcript of something you listened to, with punctuation',
      make: () => shuffle(c.heard.filter((l) => /[,.;:!?¿¡]/.test(l.text.replace(/[.!?]$/, '')) || /[,;:]/.test(l.text)), random).slice(0, 6).map((l, i) => listenPunctuated(l, lang, `hear-punct-${i}`)),
    },
    {
      id: 'hear-endings',
      group: 'listening',
      title: 'Dictation: the endings',
      detail: 'The stems are shown and the endings are not: hear the line and type it whole, endings and all.',
      needs: 'a transcript of something you listened to',
      make: () => shuffle(c.heard, random).flatMap((l, i) => listenEndings(l, lang, `hear-endings-${i}`) ?? []).slice(0, 6),
    },
    {
      id: 'hear-split',
      group: 'listening',
      title: 'Where do the words begin?',
      detail: 'A line you listened to, written without spaces: hear it and cut it into its words. This is connected speech.',
      needs: 'a transcript of something you listened to',
      make: () => shuffle(c.heard, random).flatMap((l, i) => listenSplit(l, lang, `hear-split-${i}`) ?? []).slice(0, 6),
    },
    {
      id: 'hear-meaning',
      group: 'listening',
      title: 'Hear it, choose the meaning',
      detail: 'A word of yours is said: choose what it means from four.',
      needs: 'at least four words with a meaning',
      make: () => { const w = shuffle(c.facts, random); return w.slice(0, 8).flatMap((x, i) => listenMeaning(x, w, lang, random, `hear-meaning-${i}`) ?? []); },
    },
    {
      id: 'hear-picture',
      group: 'listening',
      title: 'Hear it, choose the picture',
      detail: 'A word of yours is said: choose its picture from four.',
      needs: 'cards with a picture',
      make: () => { const w = shuffle(c.facts.filter((x) => x.image), random); return w.slice(0, 8).flatMap((x, i) => listenPicture(x, w, lang, random, `hear-picture-${i}`) ?? []); },
    },
    {
      id: 'hear-spell',
      group: 'listening',
      title: 'Hear it, spell it',
      detail: 'A word of yours is said, in your device’s voice: type how it is written.',
      needs: 'words in your decks and a voice for this language',
      make: () => shuffle(c.facts, random).slice(0, 8).map((x, i) => listenType({ text: x.word }, lang, `hear-spell-${i}`)),
    },
    {
      id: 'syllables',
      group: 'listening',
      local: true,
      title: 'Cut it into syllables',
      detail: 'A word of yours, written without breaks: say it, and cut it where each syllable begins.',
      needs: 'the full dictionary and words of two or more syllables',
      make: () => [],
      makeLater: async () => {
        const out: ExerciseSpec[] = [];
        for (const x of shuffle(c.facts, random).slice(0, 24)) {
          const syl = (await lookUpFull(lang, x.word).catch(() => undefined))?.entries.find((e) => e.syl && e.syl.length >= 2)?.syl;
          const spec = syl ? syllableSplit(x.word, syl.map((s) => s.replace(/\u0301/g, '')), lang, `syllables-${out.length}`) : null;
          if (spec) out.push(spec);
          if (out.length >= 6) break;
        }
        return out;
      },
    },
    games('pictures', 'Words and pictures', 'Match each word with its picture.', 'cards with a picture', (w, r, k) => matchPictures(w, lang, r, k), (w) => Boolean(w.image)),
    ...(['difficult', 'rusty'] as const).map(
      (id): PracticeSet => ({
        id,
        group: 'words',
        title: id === 'difficult' ? 'Your difficult words' : 'Words you have not seen in a while',
        detail: id === 'difficult' ? 'The words you forget most often, as meanings and in sentences.' : 'Words that have gone quiet: a refresher, as meanings and in sentences.',
        needs: id === 'difficult' ? 'cards you have forgotten a few times' : 'cards not seen for six weeks',
        make: () => {
          const words = c[id];
          return [...rounds(words, random, (w, k) => matchDefinitions(w, lang, random, k), `${id}-m`), ...rounds(words, random, (w, k) => matchSentences(w, lang, random, k), `${id}-s`)];
        },
      }),
    ),
    {
      id: 'affixes',
      group: 'words',
      title: 'Beginnings and endings',
      detail: 'Match prefixes and suffixes with what they do.',
      needs: 'the dictionary, and words made of parts',
      make: () => [matchAffixes(shuffle(c.affixes, random), lang, random, 'affixes-0')].filter((s): s is NonNullable<typeof s> => s !== null),
    },
    {
      id: 'tense',
      group: 'words',
      title: 'Present into past',
      detail: 'Change a verb from one tense to another.',
      needs: 'the dictionary, and verbs in your decks',
      make: () => shuffle(c.verbs, random).flatMap((v) => tenseTransforms(v.grids, lang, random, 2, { skill: 'grammar', item: { type: 'word', wordId: `${lang}:${v.lemma}` } }, `tense-${v.lemma}`, v.lemma)).slice(0, 8),
    },
    {
      id: 'correct',
      group: 'grammar',
      title: 'Correct the mistake',
      detail: 'A sentence with a wrong form: type the right one.',
      needs: 'a grammar for this language',
      make: () => {
        const all = items();
        const main = all.slice(0, 8).map((x, i) => correctMistake(x.item, x.topic, lang, random, `correct-${i}`));
        return attachRetries<ExerciseSpec>(main, all.slice(8, 16).map((x, i) => correctMistake(x.item, x.topic, lang, random, `correct-s${i}`)));
      },
    },
    {
      id: 'rewrite',
      group: 'grammar',
      title: 'Rewrite the sentence',
      detail: 'Write the whole sentence again, without the mistake.',
      needs: 'a grammar for this language',
      make: () => {
        const all = items();
        return attachRetries<ExerciseSpec>(all.slice(0, 6).map((x, i) => rewriteFix(x.item, x.topic, lang, random, `rewrite-${i}`)), all.slice(6, 12).map((x, i) => rewriteFix(x.item, x.topic, lang, random, `rewrite-s${i}`)));
      },
    },
    {
      id: 'predict',
      group: 'grammar',
      title: 'What comes next?',
      detail: 'The forms of a verb in order (I, you, he…): type the next one.',
      needs: 'the dictionary, and verbs in your decks',
      // Only a conjugation is an order: a grammar table lists different words, so its "next" row would be a guess.
      make: () => shuffle(c.verbs, random).flatMap((v) => v.grids.flatMap((g, n) => predictForms(g, `word:${lang}:${v.lemma}`, lang, random, 1, `predict-${v.lemma}-${n}`).map((p) => ({ ...p, trains: { skill: 'grammar', item: { type: 'word', wordId: `${lang}:${v.lemma}` } } as const, body: { ...p.body, lemma: v.lemma } })))).slice(0, 8),
    },
    {
      id: 'forms',
      group: 'grammar',
      title: 'Change the form',
      detail: 'One form of a word into another: singular to plural, and the like.',
      needs: 'a grammar with tables',
      make: () => c.topics.flatMap((t) => planTransforms((t.tables ?? []).map((tb) => gridOfGrammarTable(tb, t.title)), lang, random, 2, { trains: trains(t.id), keyPrefix: `forms-${t.id}` })).slice(0, 8),
    },
    ...madeSets(lang, level, c.topics),
    {
      id: 'drag',
      group: 'grammar',
      title: 'Drag the words into order',
      detail: 'Build the sentence from its words by dragging.',
      needs: 'a grammar with sentences and their translations',
      make: () => items().flatMap((x, i) => dragSentence(plain(x.item.s), x.item.en, lang, random, `drag-${i}`, trains(x.topic)) ?? []).slice(0, 8),
    },
  ];
}

export default function PracticePage() {
  const translateUi = useUi();
  const { language, settings } = useApp();
  // Ludus's time, toward the day and Ludus's own goal (core/goals/tools).
  useStudySession(language.id, 'ludus', 'practice');
  const lang = language.id;
  const level = (language.level === 'A0' ? 'A1' : language.level) as Cefr;
  const aiReady = aiBlock(settings, settings.llm.provider) === null;
  const [error, setError] = useState<string | null>(null);
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [filter, setFilter] = useState<'all' | PracticeSet['group']>('all');
  const navigate = useNavigate();
  const chosen = useParams().set;
  // A set's own address takes the whole screen; it is made when it opens, so each go is a fresh mix.
  const [running, setRunning] = useState<{ title: string; specs: ExerciseSpec[] } | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const random = seededRandom(Date.now() % 2 ** 31);
      const notes = await practiceNotes(lang);
      const [facts, affixes, topics, verbs, difficult, rusty, heard] = await Promise.all([
        wordFacts(lang, notes),
        affixesOfWords(lang, notes),
        practiceTopics(lang, random),
        verbGrids(lang, notes),
        trickyNotes(lang, 'difficult').then((n) => wordFacts(lang, n)),
        trickyNotes(lang, 'rusty').then((n) => wordFacts(lang, n)),
        heardLines(lang),
      ]);
      if (alive) setCtx({ facts, affixes, topics, verbs, difficult, rusty, heard });
    })();
    return () => {
      alive = false;
    };
  }, [lang]);

  const sets = useMemo(() => (ctx ? buildSets(lang, ctx, level) : []), [ctx, lang, level]);
  // What is made when started needs the learner's key; the rest needs enough words or grammar to make a set.
  const ready = useMemo(() => new Map(sets.map((s) => [s.id, s.makeLater && !s.local ? aiReady : s.makeLater ? true : s.make().length > 0])), [sets, aiReady]);

  useEffect(() => {
    const set = sets.find((s) => s.id === chosen);
    setError(null);
    if (set?.makeLater) {
      let alive = true;
      setRunning(null);
      set.makeLater().then(
        (specs) => alive && setRunning(specs.length ? { title: set.title, specs } : null),
        (e: unknown) => alive && setError(e instanceof Error ? e.message : 'It could not be made.'),
      );
      return () => {
        alive = false;
      };
    }
    const specs = set?.make() ?? [];
    // A set that cannot be made (too few words for it) never opens as an empty lesson.
    setRunning(set && specs.length ? { title: set.title, specs } : null);
  }, [chosen, sets]);

  if (chosen && !running)
    return (
      <div className="p-10 text-ink-soft">
        <p>{error ?? (sets.find((s) => s.id === chosen)?.makeLater && !sets.find((s) => s.id === chosen)?.local ? translateUi('Max is making it for you…') : ctx ? translateUi('This set can’t be made yet.') : translateUi('Getting it ready…'))}</p>
        {error && (
          <Link to="/thesaurus/practice" className="mt-3 inline-block font-semibold text-ink underline decoration-line-strong underline-offset-4"><UiText source={'Back to Practice'} /></Link>
        )}
      </div>
    );
  if (running) return <ExerciseSession title={running.title} lang={lang} specs={running.specs} onClose={() => navigate('/thesaurus/practice')} />;

  const name = getLanguage(lang)?.name ?? lang;

  const section = (group: PracticeSet['group'], title: string) => {
    const groupSets = sets.filter((s) => s.group === group);
    if (!groupSets.length) return null;
    return (
      <section key={group} aria-label={title}>
        <header className="mb-4 flex items-baseline gap-2.5 border-b border-line pb-2">
          <h2 className="font-serif text-xl font-semibold">
            <UiText source={title} />
          </h2>
          <span className="text-sm font-bold text-ink-faint tabular-nums">{groupSets.length}</span>
        </header>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {groupSets.map((s) => {
            const isReady = ready.get(s.id);
            if (isReady) {
              return (
                <Link
                  key={s.id}
                  to={`/thesaurus/practice/${s.id}`}
                  className="group flex flex-col justify-between rounded-2xl border border-line/70 bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-elev-2"
                >
                  <div>
                    <h3 className="font-serif text-[17.5px] leading-snug font-semibold text-ink transition-colors group-hover:text-accent-text">
                      <UiText source={s.title} />
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
                      <UiText source={s.detail} />
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-line/50 pt-3 text-[12.5px] font-semibold text-ink transition-colors group-hover:text-accent-text">
                    <span><UiText source={'Start'} /></span>
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={s.id}
                className="flex flex-col justify-between rounded-2xl border border-line/50 bg-surface/45 p-5 opacity-70"
              >
                <div>
                  <h3 className="font-serif text-[17.5px] leading-snug font-semibold text-ink">
                    <UiText source={s.title} />
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
                    <UiText source={s.detail} />
                  </p>
                </div>
                <p className="mt-4 border-t border-line/40 pt-3 text-[12px] leading-snug text-ink-faint">
                  <UiText source={'Needs {0}.'} values={[translateUi(s.needs)]} />
                </p>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <>
      <PageHeader
        title={translateUi('Practice')}
        englishTitle={'Practice'}
        eyebrow={translateUi('{0}, in every kind of exercise', [translateUi(name)])}
        englishEyebrow={interpolate('{0}, in every kind of exercise', [name])}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/thesaurus/games" className={buttonClasses('secondary', 'md')}>
              <Gamepad2 size={16} aria-hidden />
              <UiText source={'Ludus'} />
            </Link>
            <Link to="/thesaurus" className={buttonClasses('secondary', 'md')}>
              <Layers size={16} aria-hidden />
              <UiText source={'Thesaurus'} />
            </Link>
          </div>
        }
      />

      <div className="mt-6">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <Segmented<'all' | PracticeSet['group']>
            label={translateUi('Practice')}
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: translateUi('All') },
              { value: 'words', label: translateUi('Your words') },
              { value: 'grammar', label: translateUi('Grammar') },
              { value: 'listening', label: translateUi('Listening') },
            ]}
          />
        </div>

        {!ctx ? (
          <p className="mt-8 text-ink-soft"><UiText source={'Looking at your words…'} /></p>
        ) : (
          <div className="space-y-10">
            {(filter === 'all' || filter === 'words') && section('words', 'Your words')}
            {(filter === 'all' || filter === 'grammar') && section('grammar', 'Grammar')}
            {(filter === 'all' || filter === 'listening') && section('listening', 'Listening')}
          </div>
        )}
      </div>
    </>
  );
}
