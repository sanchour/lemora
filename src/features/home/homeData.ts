import { useMemo } from 'react';
import { AudioLines, BookOpen, Bookmark, Clapperboard, Feather, Gamepad2, Headphones, Languages, Layers, MessageCircle, MessagesSquare, Music, PenLine, Radio, Sparkles, Waypoints } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '@/app/context';
import { getLanguage } from '@/core/lang/languages';
import { SAMPLES } from '@/core/lang/samples';
import { LESSONS, OUTLINE } from '@/core/course/outline';
import type { CourseLevel, LessonId, UnitId } from '@/core/course/outline';
import { UNIT_LOOK } from '@/features/cursus/course/AdventurePath';
import { topicsOf } from '@/core/grammar/types';
import { nextLesson, useCourseProgress } from '@/data/course';
import { useAllProgress, useLibrary } from '@/data/library';
import type { Text } from '@/data/types';
import { nextGroup, useScriptProgress } from '@/data/script';
import { useDueSummary } from '@/data/study';
import { useCourse, lessonPath } from '@/features/cursus/course/parts';
import { useScript } from '@/features/grammatica/letters/parts';
import { useGrammar } from '@/features/grammatica/parts';
import { useGrammarProgress } from '@/data/grammar';
import { useGuide } from '@/features/mundus/useGuide';
import type { PickLevel } from '@/core/mundus/types';
import type { ImageQuery } from '@/services/mundus/images';
import { homeGreeting } from './HomeClassic';
import { SECTIONS, shownFor } from '@/app/sections';
import { reaches, shows } from '@/product';
import { flowSteps, starterFor } from '@/core/flow/steps';
import type { FlowStep } from '@/core/flow/steps';
import { FIRST_BOOKS } from '@/core/lang/firstBooks';
import { useDecks } from '@/data/decks';
import { starterKey } from '@/data/starter';
import { useToolDays } from '@/data/toolGoals';
import type { HandName } from '@/design/drawings';

/** Core tool entry with SVG icon and route */
export interface HomeToolItem {
  id: 'codex' | 'sonus' | 'cantus' | 'visio' | 'thesaurus' | 'ludus' | 'mentis' | 'cursus' | 'diarium' | 'alphabet' | 'atlas';
  name: string;
  role: string;
  to: string;
  icon: LucideIcon;
  badge?: string | number;
}

export const HOME_TOOLS: HomeToolItem[] = [
  { id: 'codex', name: 'Codex', role: 'Read books, stories & articles', to: '/codex', icon: BookOpen },
  { id: 'sonus', name: 'Sonus', role: 'Listen to podcasts, audiobooks & radio', to: '/sonus', icon: Headphones },
  { id: 'cantus', name: 'Cantus', role: 'Music, songs & synchronized lyrics', to: '/cantus', icon: Music },
  { id: 'visio', name: 'Visio', role: 'Watch video with synchronized subtitles', to: '/visio', icon: Clapperboard },
  { id: 'thesaurus', name: 'Thesaurus', role: 'Cards, dictionary & vocabulary recall', to: '/thesaurus', icon: Layers },
  { id: 'ludus', name: 'Ludus', role: 'Games, sentence builder & drills', to: '/thesaurus/games', icon: Gamepad2 },
  { id: 'mentis', name: 'Mentis', role: 'Scriptorium guide, prompts & diarium', to: '/mentis', icon: Sparkles },
  // Rooms of their own in Lemora (src/product.ts); in Lingua they live inside Mentis and Cursus.
  { id: 'diarium', name: 'Diarium', role: 'Your journal, written and corrected', to: '/mentis/diarium', icon: Feather },
  { id: 'alphabet', name: 'Alphabet', role: 'Letters, sounds & stroke order', to: '/cursus/alphabets', icon: Languages },
  { id: 'atlas', name: 'Atlas', role: 'Every word you have, as a map', to: '/atlas', icon: Waypoints },
];

/** The tools this build has, in its sidebar's order (Alphabet only for a language in another script). */
export function useHomeTools(): HomeToolItem[] {
  const { language } = useApp();
  return useMemo(() => SECTIONS.filter(shownFor(language.id)).flatMap((s) => HOME_TOOLS.filter((t) => t.id === s.id)), [language.id]);
}

/** Active or starter text for "Where you left off" */
export interface LeftOffData {
  id: string;
  title: string;
  author: string;
  to: string;
  percent: number;
  book?: Text;
  isStarter?: boolean;
}

export function useHomeLeftOff(): LeftOffData {
  const { language } = useApp();
  const target = getLanguage(language.id);
  const allTexts = useLibrary(language.id);
  const progress = useAllProgress();

  return useMemo(() => {
    const readable = (allTexts ?? []).filter((t) => t.kind !== 'shelfItem' && !t.finishedAt);
    const active = readable
      .filter((t) => t.lastOpenedAt || (progress?.get(t.id)?.percent ?? 0) > 0)
      .sort((a, b) => (b.lastOpenedAt ?? b.createdAt) - (a.lastOpenedAt ?? a.createdAt));

    if (active.length > 0) {
      const b = active[0];
      const pct = Math.round((progress?.get(b.id)?.percent ?? 0) * 100);
      return {
        id: b.id,
        title: b.title,
        author: b.author || (target?.name ? `${target.name} Library` : 'Library'),
        to: `/codex/read/${b.id}`,
        percent: pct,
        book: b,
        isStarter: false,
      };
    }

    // Nothing started yet: a beginner is offered the tiny first book (Lemora U1), others the welcome text.
    const first = language.level === 'A0' || language.level === 'A1' ? FIRST_BOOKS[language.id] : undefined;
    const sample = first ?? SAMPLES[language.id] ?? SAMPLES.en;
    return {
      id: 'sample',
      title: sample.title,
      author: target?.name ?? 'Sample Story',
      to: first ? '/codex/first' : '/codex',
      percent: 0,
      book: undefined,
      isStarter: true,
    };
  }, [allTexts, progress, language.id, language.level, target]);
}

/** Cursus step: Alphabet / Marks group, Course lesson, or Grammar topic */
export interface CursusStepData {
  type: 'alphabet' | 'marks' | 'course' | 'grammar';
  title: string;
  subtitle: string;
  badge: string;
  to: string;
  glyphs?: string[];
  aim?: string;
  progressPercent: number;
  totalSteps?: number;
  completedSteps?: number;
  // Authentic Cursus page aesthetic tokens
  unitId?: UnitId;
  unitIndex?: number;
  unitLevel?: CourseLevel;
  unitHue?: string;
  canDo?: string[];
  lessonId?: LessonId;
  lessonTitle?: string;
  lessonAim?: string;
  lessonIndex?: number;
  totalLessonsInUnit?: number;
}

export function useHomeCursus(): CursusStepData | null {
  const { language } = useApp();
  const lang = language.id;
  const script = useScript(lang);
  const scriptProg = useScriptProgress(lang);
  const loadedCourse = useCourse(lang);
  const courseProg = useCourseProgress(lang);
  const grammar = useGrammar(lang);
  const grammarProg = useGrammarProgress(lang);

  return useMemo(() => {
    // 1. Script / Alphabet / Marks has highest priority for early learners of non-Latin languages
    if (script && scriptProg) {
      const next = nextGroup(script, scriptProg);
      const learned = script.groups.filter((g) => (scriptProg.get(g.id)?.step ?? 1) >= 6).length;
      if (next) {
        const glyphs = next.letters.map((l) => (typeof l === 'string' ? l : l.glyph));
        const total = script.groups.length;
        const alphabetHue = '#4f93a0'; // Coastal jade / teal from Cursus studio
        return {
          type: 'alphabet',
          title: next.title,
          subtitle: `${script.name} · Group ${learned + 1} of ${total}`,
          badge: `${learned}/${total} learned`,
          to: `/cursus/alphabets/${next.id}/lesson`,
          glyphs: glyphs.slice(0, 5),
          aim: next.set ? `Focus: ${next.set}` : script.summary,
          progressPercent: Math.round((learned / Math.max(1, total)) * 100),
          totalSteps: total,
          completedSteps: learned,
          unitHue: alphabetHue,
          lessonTitle: next.title,
          lessonIndex: learned,
          totalLessonsInUnit: total,
        };
      }
    }

    // 2. Guided Course Trail (Spanish & Core languages)
    if (loadedCourse && courseProg) {
      const next = nextLesson(courseProg, loadedCourse.lessonsOf);
      if (next) {
        const unit = OUTLINE.find((u) => u.id === next.unit) ?? OUTLINE[0];
        const unitIndex = OUTLINE.indexOf(unit);
        const doneUnits = OUTLINE.filter((u) => courseProg.get(u.id)?.doneAt).length;
        const lessonInfo = LESSONS[next.lesson] ?? { title: 'Practice', aim: 'Master the unit essentials' };
        const unitLessons = loadedCourse.lessonsOf(next.unit);
        const lessonIdx = unitLessons.indexOf(next.lesson);
        const look = UNIT_LOOK[unit.id] ?? { hue: 'var(--accent)' };

        return {
          type: 'course',
          title: unit.title,
          subtitle: `Unit ${unitIndex + 1} · ${lessonInfo.title}`,
          badge: `${unit.level} · Unit ${unitIndex + 1}`,
          to: lessonPath(next.unit, next.lesson),
          aim: lessonInfo.aim,
          progressPercent: Math.round((next.done / Math.max(1, next.of)) * 100),
          totalSteps: OUTLINE.length,
          completedSteps: doneUnits,
          unitId: unit.id,
          unitIndex: unitIndex + 1,
          unitLevel: unit.level,
          unitHue: look.hue,
          canDo: unit.canDo,
          lessonId: next.lesson,
          lessonTitle: lessonInfo.title,
          lessonAim: lessonInfo.aim,
          lessonIndex: lessonIdx >= 0 ? lessonIdx : next.done,
          totalLessonsInUnit: next.of,
        };
      }
    }

    // 3. Grammar milestones
    if (grammar && grammarProg) {
      const topics = topicsOf(grammar);
      const done = topics.filter((t) => (grammarProg.get(t.id)?.step ?? 0) >= 3);
      const next = topics.find((t) => (grammarProg.get(t.id)?.step ?? 0) < 3) ?? topics[0];
      if (next) {
        const grammarHue = '#c86d51'; // Terracotta
        return {
          type: 'grammar',
          title: next.title,
          subtitle: `Grammatica · ${next.summary || 'Essential pattern'}`,
          badge: `${done.length} of ${topics.length} topics`,
          to: `/cursus/grammatica/${next.id}/lesson`,
          aim: next.summary || 'Read explanations & practice key sentence drills',
          progressPercent: Math.round((done.length / Math.max(1, topics.length)) * 100),
          totalSteps: topics.length,
          completedSteps: done.length,
          unitHue: grammarHue,
          lessonTitle: next.title,
          lessonIndex: done.length,
          totalLessonsInUnit: topics.length,
        };
      }
    }

    // Fallback default
    const fallbackUnit = OUTLINE[0];
    const fallbackLook = UNIT_LOOK[fallbackUnit.id] ?? { hue: '#c86d51' };
    return {
      type: 'course',
      title: fallbackUnit.title,
      subtitle: `Unit 1 · ${LESSONS.words.title}`,
      badge: `${fallbackUnit.level} · Unit 1`,
      to: '/cursus/course',
      aim: fallbackUnit.canDo[0] ?? 'Learn the words of the unit and start talking',
      progressPercent: 0,
      totalSteps: OUTLINE.length,
      completedSteps: 0,
      unitId: fallbackUnit.id,
      unitIndex: 1,
      unitLevel: fallbackUnit.level,
      unitHue: fallbackLook.hue,
      canDo: fallbackUnit.canDo,
      lessonId: 'words',
      lessonTitle: LESSONS.words.title,
      lessonAim: LESSONS.words.aim,
      lessonIndex: 0,
      totalLessonsInUnit: 5,
    };
  }, [script, scriptProg, loadedCourse, courseProg, grammar, grammarProg]);
}

/** Suggestion item for "What next" */
export interface WhatNextItem {
  id: string;
  room: string;
  title: string;
  detail: string;
  to: string;
  icon: LucideIcon;
  badge: string;
  actionLabel: string;
  hue: string;
  percent?: number;
  /** The hand-drawn icon (design/drawings) shown instead of the line icon. */
  hand?: HandName;
}

export type ContinueItem = WhatNextItem;

/**
 * What next (Lemora U1, U3): the steps that fit the learner's level and today's activity first (core/flow/steps), then
 * the rest of the build's rooms. A complete beginner gets the alphabet when its letters are new, a tiny first book and a
 * small starter deck; a reader gets their book, their reviews and something new. Only rooms this build has.
 */
export function useHomeWhatNext(): WhatNextItem[] {
  const { language } = useApp();
  const lang = language.id;
  const allTexts = useLibrary(lang);
  const progress = useAllProgress();
  const due = useDueSummary(lang);
  const decks = useDecks(lang);
  const today = useToolDays(lang, 1)?.[0];

  return useMemo(() => {
    const readable = (allTexts ?? []).filter((t) => t.kind !== 'shelfItem' && !t.finishedAt);
    const activeBook = readable
      .filter((t) => t.lastOpenedAt || (progress?.get(t.id)?.percent ?? 0) > 0)
      .sort((a, b) => (b.lastOpenedAt ?? b.createdAt) - (a.lastOpenedAt ?? a.createdAt))[0];
    const bookPct = activeBook ? Math.round((progress?.get(activeBook.id)?.percent ?? 0) * 100) : 0;
    const dueCount = (due?.due ?? 0) + (due?.fresh ?? 0);
    const minute = (ms = 0) => ms >= 60_000;
    const spec = starterFor(language.level, language.seededKnownTopN ?? 0);
    const firstBook = FIRST_BOOKS[lang];

    const FLOW: Partial<Record<FlowStep, WhatNextItem>> = {
      alphabet: { id: 'flow:alphabet', room: 'Alphabet', title: 'Learn the letters', detail: 'A few letters, their sounds and a first word each.', to: '/cursus/alphabets', icon: Languages, hand: 'letter', badge: 'Alphabet', actionLabel: 'Start', hue: '#6f9cc0' },
      'first-book': { id: 'flow:first-book', room: 'Codex', title: firstBook ? `Read “${firstBook.title}”` : 'Read your first story', detail: 'A tiny first book: a line a page, the easiest words.', to: '/codex/first', icon: BookOpen, hand: 'book', badge: 'First book', actionLabel: 'Read', hue: '#6b8e78' },
      'starter-deck': { id: 'flow:starter-deck', room: 'Thesaurus', title: spec.kind === 'theme' ? 'Your first words' : `The next ${spec.milestone.toLocaleString()} words`, detail: spec.kind === 'theme' ? 'A small deck of everyday basics to begin with.' : 'The next most common words, after the ones you know.', to: `/thesaurus/ready/${starterKey(spec)}`, icon: Layers, hand: 'cards', badge: 'Starter deck', actionLabel: 'Open', hue: '#d49b54' },
      continue: activeBook ? { id: 'flow:continue', room: 'Codex', title: activeBook.title, detail: 'Pick up where you left off.', to: `/codex/read/${activeBook.id}`, icon: BookOpen, hand: 'bookmark', badge: 'Reading', actionLabel: 'Continue', hue: '#6b8e78', percent: bookPct > 0 ? bookPct : undefined } : undefined,
      review: { id: 'flow:review', room: 'Thesaurus', title: dueCount > 0 ? `Review ${dueCount} cards` : 'Review flashcards', detail: 'The cards that are due, before they slip.', to: '/thesaurus/study/all?mode=recall', icon: Layers, hand: 'repeat', badge: 'Recall', actionLabel: 'Start', hue: '#d49b54', percent: dueCount > 0 ? Math.min(100, dueCount * 5) : undefined },
      ludus: { id: 'flow:ludus', room: 'Ludus', title: 'Play with your words', detail: 'A quick game with the words you are learning.', to: '/thesaurus/games', icon: Gamepad2, hand: 'play', badge: 'Play', actionLabel: 'Play', hue: '#8a7fb0' },
      write: { id: 'flow:write', room: 'Diarium', title: 'Write a few lines', detail: 'A sentence or two about your day.', to: '/mentis/diarium', icon: PenLine, hand: 'quill', badge: 'Writing', actionLabel: 'Write', hue: '#a07858' },
      read: { id: 'flow:read', room: 'Explora', title: 'Find something to read', detail: 'Books and stories at your level.', to: '/explora?kind=books', icon: BookOpen, hand: 'glasses', badge: 'Reading', actionLabel: 'Browse', hue: '#6b8e78' },
      import: { id: 'flow:import', room: 'Codex', title: 'Read an article you like', detail: 'Paste a link or any text.', to: '/codex/new', icon: Bookmark, hand: 'letter', badge: 'Library', actionLabel: 'Add', hue: '#6b8e78' },
      try: { id: 'flow:try', room: 'Explora', title: 'Something to try today', detail: 'A small thing to do in the language, away from the screen.', to: '/explora?kind=try', icon: Sparkles, hand: 'candle', badge: 'Try', actionLabel: 'See', hue: '#c86d51' },
    };
    const order = flowSteps({
      level: language.level,
      nonLatin: (getLanguage(lang)?.script ?? 'Latn') !== 'Latn',
      script: language.script,
      due: dueCount,
      hasDecks: Boolean(decks?.length),
      reading: Boolean(activeBook),
      did: { read: minute(today?.byTool.codex), review: minute(today?.byTool.thesaurus), write: minute(today?.byTool.diarium), ludus: minute(today?.byTool.ludus), alphabet: minute(today?.byTool.alphabet) },
    });
    const flow = order.flatMap((step) => (FLOW[step] ? [FLOW[step]!] : []));

    // The rooms a fuller build has (Lingua), after the level's own steps.
    const rooms: WhatNextItem[] = [
      // 1. Sermo (AI Tutor)
      {
        id: 'sermo:chat',
        room: 'Sermo',
        title: 'Chat with AI',
        detail: 'Talk freely with your AI tutor.',
        to: '/mentis/sermo',
        icon: MessagesSquare,
        badge: 'AI Tutor',
        actionLabel: 'Start',
        hue: '#5f87a8',
      },
      // 2. Colloquium (Roleplay Scenes)
      {
        id: 'colloquium:scene',
        room: 'Colloquium',
        title: 'Order at a café',
        detail: 'Practice spontaneous dialogue in a café scene.',
        to: '/colloquium',
        icon: MessageCircle,
        badge: 'Scene',
        actionLabel: 'Start',
        hue: '#c86d51',
      },
      // 3. Thesaurus (Flashcard Recall)
      {
        id: 'thesaurus:recall',
        room: 'Thesaurus',
        title: dueCount > 0 ? `Review ${dueCount} cards` : 'Review flashcards',
        detail: 'Review flashcards and solidify words.',
        to: '/thesaurus/study/all?mode=recall',
        icon: Layers,
        badge: 'Recall',
        actionLabel: 'Start',
        hue: '#d49b54',
        percent: dueCount > 0 ? Math.min(100, dueCount * 5) : undefined,
      },
      // 4. Codex (Reading)
      {
        id: 'codex:story',
        room: 'Codex',
        title: 'Read a short story',
        detail: 'Read with instant word lookup.',
        to: activeBook ? `/codex/read/${activeBook.id}` : '/codex',
        icon: BookOpen,
        badge: 'Reading',
        actionLabel: 'Start',
        hue: '#6b8e78',
        percent: bookPct > 0 ? bookPct : undefined,
      },
      // 5. Ludus (Language Games)
      {
        id: 'ludus:play',
        room: 'Ludus',
        title: 'Play a word game',
        detail: 'Quick vocabulary and speed games.',
        to: '/thesaurus/games',
        icon: Gamepad2,
        badge: 'Play',
        actionLabel: 'Start',
        hue: '#8a7fb0',
      },
      // 6. Diarium (Daily Journaling)
      {
        id: 'diarium:journal',
        room: 'Diarium',
        title: 'Write a few lines',
        detail: 'Write about your day with gentle feedback.',
        to: '/mentis/diarium',
        icon: PenLine,
        badge: 'Writing',
        actionLabel: 'Start',
        hue: '#a07858',
      },
      // 7. Sonus (Podcasts & Transcripts)
      {
        id: 'sonus:listen',
        room: 'Sonus',
        title: 'Listen to a podcast',
        detail: 'Listen to native speech with transcript.',
        to: '/sonus',
        icon: Headphones,
        badge: 'Listening',
        actionLabel: 'Start',
        hue: '#cf6a6a',
      },
      // 8. Visio (Video Immersion)
      {
        id: 'visio:watch',
        room: 'Visio',
        title: 'Watch a short clip',
        detail: 'Video immersion with dual subtitles.',
        to: '/visio',
        icon: Clapperboard,
        badge: 'Immersion',
        actionLabel: 'Start',
        hue: '#5e6fa8',
      },
      // 9. Sonus (Live World Radio)
      {
        id: 'sonus:radio',
        room: 'Sonus',
        title: 'Tune into live radio',
        detail: 'Live radio streams from target countries.',
        to: '/sonus?tab=radio',
        icon: Radio,
        badge: 'Live',
        actionLabel: 'Start',
        hue: '#cf6a6a',
      },
      // 10. Cantus (Songs & Phrasing)
      {
        id: 'cantus:music',
        room: 'Cantus',
        title: 'Learn with a song',
        detail: 'Sing along with lyrics and phrasing.',
        to: '/cantus',
        icon: Music,
        badge: 'Songs',
        actionLabel: 'Start',
        hue: '#c4707f',
      },
      // 11. Cursus Studio (Pronunciation & Sounds)
      {
        id: 'cursus:sounds',
        room: 'Studio',
        title: 'Practice sounds',
        detail: 'Pronunciation and minimal pair listening.',
        to: '/cursus/studio?tool=sounds',
        icon: AudioLines,
        badge: 'Sounds',
        actionLabel: 'Start',
        hue: '#4f93a0',
      },
      // 12. Codex (Add text or Goodreads)
      {
        id: 'codex:import',
        room: 'Codex',
        title: 'Import an article',
        detail: 'Paste any foreign text to read.',
        to: '/codex/new',
        icon: Bookmark,
        badge: 'Library',
        actionLabel: 'Start',
        hue: '#6b8e78',
      },
    ];

    // The level's steps speak for their rooms; the other rooms (Lingua's Sermo, Sonus…) follow.
    const covered = new Set(Object.values(FLOW).flatMap((f) => (f ? [f.room] : [])));
    // Only what leads to a room this build has (src/product.ts).
    return [...flow, ...rooms.filter((r) => !covered.has(r.room))].filter((s) => reaches(s.to));
  }, [allTexts, progress, due, decks, today, language.level, language.script, language.seededKnownTopN, lang]);
}

/** Backward-compatibility alias */
export const useHomeContinue = useHomeWhatNext;

/** Curated picks for "Discover more" in Explora style */
export interface DiscoverItem {
  id: string;
  kind: 'books' | 'podcasts' | 'series' | 'films' | 'themes' | 'audiobooks';
  title: string;
  sub?: string;
  detail: string;
  to: string;
  level: PickLevel;
  tag: string;
  icon: LucideIcon;
  query?: ImageQuery | null;
}

export function useHomeDiscover(): DiscoverItem[] {
  const { language } = useApp();
  const lang = language.id;
  const guide = useGuide();
  const picks = guide?.picks;

  return useMemo(() => {
    const raw: DiscoverItem[] = [];

    // 1. Books from Explora
    for (const b of picks?.books ?? []) {
      raw.push({
        id: `discover:book:${b.title}`,
        kind: 'books',
        title: b.title,
        sub: b.by || 'Library book',
        detail: b.why || b.by || 'Curated graded reading for your level',
        to: `/explora?kind=books&q=${encodeURIComponent(b.title)}`,
        tag: 'Book',
        level: b.level ?? 'A2',
        icon: BookOpen,
        query: { kind: 'book', title: b.title, by: b.by },
      });
    }

    // 2. Podcasts from Explora
    for (const p of picks?.podcasts ?? []) {
      raw.push({
        id: `discover:podcast:${p.title}`,
        kind: 'podcasts',
        title: p.title,
        sub: p.by || 'Podcast host',
        detail: p.why || p.by || 'Authentic audio conversation with natural flow',
        to: `/explora?kind=podcasts&q=${encodeURIComponent(p.title)}`,
        tag: 'Podcast',
        level: p.level ?? 'B1',
        icon: Headphones,
        query: { kind: 'podcast', title: p.title },
      });
    }

    // 3. Series from Explora
    for (const s of picks?.series ?? []) {
      raw.push({
        id: `discover:series:${s.title}`,
        kind: 'series',
        title: s.title,
        sub: s.by || 'Original series',
        detail: s.why || s.by || 'Immersive show with clear dialog',
        to: `/explora?kind=series&q=${encodeURIComponent(s.title)}`,
        tag: 'Series',
        level: s.level ?? 'B1',
        icon: Clapperboard,
        query: { kind: 'tv', title: s.title, en: s.en },
      });
    }

    // 4. Films from Explora
    for (const f of picks?.films ?? []) {
      raw.push({
        id: `discover:film:${f.title}`,
        kind: 'films',
        title: f.title,
        sub: f.by || 'Cinema',
        detail: f.why || f.by || 'Feature film with subtitles',
        to: `/explora?kind=films&q=${encodeURIComponent(f.title)}`,
        tag: 'Film',
        level: f.level ?? 'B2',
        icon: Clapperboard,
        query: { kind: 'wiki', q: `${f.title} film`, must: f.title, lang },
      });
    }

    // 5. Thematic vocabulary decks from Thesaurus
    const themePicks: DiscoverItem[] = [
      {
        id: 'discover:themes:essential',
        kind: 'themes',
        title: 'Everyday conversational phrases',
        sub: '500 words',
        detail: 'Core high-frequency words with natural audio',
        to: '/thesaurus',
        tag: 'Deck',
        level: 'A1',
        icon: Layers,
        query: null,
      },
      {
        id: 'discover:themes:dining',
        kind: 'themes',
        title: 'Café, dining & gastronomy',
        sub: '250 words',
        detail: 'Ordering dishes, flavors, ingredients, and etiquette',
        to: '/thesaurus',
        tag: 'Deck',
        level: 'A2',
        icon: Layers,
        query: null,
      },
      {
        id: 'discover:themes:travel',
        kind: 'themes',
        title: 'Transit, streets & journeys',
        sub: '300 words',
        detail: 'Airport, trains, directions, and hotel check-ins',
        to: '/thesaurus',
        tag: 'Deck',
        level: 'B1',
        icon: Layers,
        query: null,
      },
      {
        id: 'discover:themes:emotions',
        kind: 'themes',
        title: 'Feelings, opinions & debate',
        sub: '350 words',
        detail: 'Expressing nuanced viewpoints, humor, and emotions',
        to: '/thesaurus',
        tag: 'Deck',
        level: 'B2',
        icon: Layers,
        query: null,
      },
    ];
    raw.push(...themePicks);

    if (raw.length === 0) return [];

    // Daily rotating selection: changes every day at midnight using day seed
    const daySeed = Math.floor(Date.now() / 86_400_000);
    const shuffled = [...raw];
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Deterministic linear pseudo-random index per day
      const pseudo = Math.sin(daySeed * 997 + i * 31) * 10000;
      const j = Math.floor((pseudo - Math.floor(pseudo)) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return up to 12 curated daily items, of the kinds this build has a room for
    return shuffled.filter((d) => (d.kind === 'podcasts' || d.kind === 'audiobooks' ? shows('sonus') : d.kind === 'series' || d.kind === 'films' ? shows('visio') : true)).slice(0, 12);
  }, [picks, lang]);
}

/** Header context facts: Eyebrow string and bookish greeting */
export function useHomeHeader() {
  const { language, settings } = useApp();
  const target = getLanguage(language.id);
  const name = settings.learner.name?.trim() || 'reader';

  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now).toUpperCase();
  const langStr = (target?.endonym ?? language.id).toUpperCase();
  const eyebrow = `${dateStr} · ${langStr}`;
  const greeting = homeGreeting(now.getHours(), name, target?.name);

  return { eyebrow, greeting, langName: target?.name ?? language.id, name };
}
