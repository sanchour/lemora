import { useMemo } from 'react';
import {
  BookOpen,
  Headphones,
  Clapperboard,
  Layers,
  Gamepad2,
  Sparkles,
  PenLine,
  MessagesSquare,
  MessageCircle,
  Radio,
  Music,
  AudioLines,
  Bookmark,
} from 'lucide-react';
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

/** Core tool entry with SVG icon and route */
export interface HomeToolItem {
  id: 'codex' | 'sonus' | 'cantus' | 'visio' | 'thesaurus' | 'ludus' | 'mentis' | 'cursus';
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
];

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

    const sample = SAMPLES[language.id] ?? SAMPLES.en;
    return {
      id: 'sample',
      title: sample.title,
      author: target?.name ?? 'Sample Story',
      to: '/codex',
      percent: 0,
      book: undefined,
      isStarter: true,
    };
  }, [allTexts, progress, language.id, target]);
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
}

export type ContinueItem = WhatNextItem;

/**
 * Suggestions pool for "What next":
 * Randomly cycles diverse activities across all of Lingua:
 * Sermo, Colloquium, Thesaurus, Codex, Sonus, Visio, Ludus, Diarium, Cantus, Studio.
 */
export function useHomeWhatNext(): WhatNextItem[] {
  const { language } = useApp();
  const lang = language.id;
  const allTexts = useLibrary(lang);
  const progress = useAllProgress();
  const due = useDueSummary(lang);

  return useMemo(() => {
    // Check if user has an active book in progress
    const readable = (allTexts ?? []).filter((t) => t.kind !== 'shelfItem' && !t.finishedAt);
    const activeBook = readable
      .filter((t) => t.lastOpenedAt || (progress?.get(t.id)?.percent ?? 0) > 0)
      .sort((a, b) => (b.lastOpenedAt ?? b.createdAt) - (a.lastOpenedAt ?? a.createdAt))[0];
    const bookPct = activeBook ? Math.round((progress?.get(activeBook.id)?.percent ?? 0) * 100) : 0;
    const dueCount = (due?.due ?? 0) + (due?.fresh ?? 0);

    const pool: WhatNextItem[] = [
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

    return pool;
  }, [allTexts, progress, due]);
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

    // Return up to 12 curated daily items
    return shuffled.slice(0, 12);
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
