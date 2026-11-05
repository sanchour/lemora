import { lazy } from 'react';

// Sections are separate chunks; they are preloaded in the background after start-up
// so switching tabs never waits on the network.
const loaders = {
  codex: () => import('@/features/codex/CodexPage'),
  // The reader, behind Lemora's optional deck-first page (U8).
  reader: () => import('@/features/codex/reader/DeckFirst'),
  newText: () => import('@/features/codex/NewTextPage'),
  bookDetails: () => import('@/features/codex/BookDetailsPage'),
  journalEntry: () => import('@/features/codex/diarium/EntryPage'),
  thesaurus: () => import('@/features/thesaurus/ThesaurusPage'),
  deck: () => import('@/features/thesaurus/deck/DeckPage'),
  starter: () => import('@/features/thesaurus/StarterPage'),
  study: () => import('@/features/thesaurus/study/StudyPage'),
  practice: () => import('@/features/practice/PracticePage'),
  games: () => import('@/features/games/GamesPage'),
  projects: () => import('@/features/games/Projects'),
  storyEditor: () => import('@/features/games/StoryEditor'),
  make: () => import('@/features/generate/MakePage'),
  characters: () => import('@/features/cursus/characters/CharactersPage'),
  alphabet: () => import('./rooms/AlphabetPage'),
  diarium: () => import('./rooms/DiariumRoom'),
  atlas: () => import('./rooms/AtlasRoom'),
  firstBook: () => import('@/features/codex/FirstBook'),
  comic: () => import('@/features/explora/ComicReader'),
  comicSeries: () => import('@/features/explora/ComicSeries'),
  exploraCollection: () => import('@/features/explora/ExploraCollection'),
  lettersLesson: () => import('@/features/grammatica/letters/LettersLessonPage'),
  bibliotheca: () => import('@/features/bibliotheca/BibliothecaPage'),
  explora: () => import('@/features/explora/ExploraPage'),
  ratio: () => import('@/features/ratio/RatioPage'),
  ordo: () => import('@/features/ordo/OrdoPage'),
  lab: () => import('@/features/lab/LabPage'),
  translatePractice: () => import('@/features/translate/TranslatePracticePage'),
};

export const CodexPage = lazy(loaders.codex);
export const ReaderPage = lazy(loaders.reader);
export const NewTextPage = lazy(loaders.newText);
export const BookDetailsPage = lazy(loaders.bookDetails);
export const JournalEntryPage = lazy(loaders.journalEntry);
export const ThesaurusPage = lazy(loaders.thesaurus);
export const DeckPage = lazy(loaders.deck);
export const StarterPage = lazy(loaders.starter);
export const StudyPage = lazy(loaders.study);
export const PracticePage = lazy(loaders.practice);
export const GamesPage = lazy(loaders.games);
export const ProjectsPage = lazy(loaders.projects);
export const StoryEditorPage = lazy(loaders.storyEditor);
export const MakePage = lazy(loaders.make);
export const CharactersPage = lazy(loaders.characters);
export const AlphabetPage = lazy(loaders.alphabet);
export const DiariumRoom = lazy(loaders.diarium);
export const AtlasRoom = lazy(loaders.atlas);
export const FirstBook = lazy(loaders.firstBook);
export const ComicReader = lazy(loaders.comic);
export const ComicSeriesPage = lazy(loaders.comicSeries);
export const ExploraCollectionPage = lazy(loaders.exploraCollection);
export const LettersLessonPage = lazy(loaders.lettersLesson);
export const BibliothecaPage = lazy(loaders.bibliotheca);
export const ExploraPage = lazy(loaders.explora);
export const RatioPage = lazy(loaders.ratio);
export const OrdoPage = lazy(loaders.ordo);
export const LabPage = lazy(loaders.lab);
export const TranslatePracticePage = lazy(loaders.translatePractice);

/** Fetches every section chunk when the browser is idle, staggered to preserve 60 fps. Returns a cancel function. */
export function preloadSections(): () => void {
  const entries = Object.values(loaders);
  let stepTimer: number | undefined;
  let index = 0;

  const loadNext = () => {
    if (index >= entries.length) return;
    const load = entries[index++];
    void load();
    if (index < entries.length) {
      stepTimer = window.setTimeout(loadNext, 120);
    }
  };

  // Wait 4 seconds for the initial screen to render and settle entrance animations at 60 fps
  const startTimer = window.setTimeout(loadNext, 4000);

  return () => {
    window.clearTimeout(startTimer);
    if (stepTimer !== undefined) window.clearTimeout(stepTimer);
  };
}

export const ReadingPracticePage = lazy(() => import('@/features/codex/reader/ReadingPractice'));
export const ParallelReadingPage = lazy(() => import('@/features/codex/reader/ParallelReading'));
