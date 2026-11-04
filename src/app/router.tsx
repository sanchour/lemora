import { ParallelReadingPage } from './pages';
import { ReadingPracticePage } from './pages';
import { createBrowserRouter, Navigate } from 'react-router';
import HomeRouter from './home/HomeRouter';
import {
  AlphabetPage,
  AtlasRoom,
  FirstBook,
  BibliothecaPage,
  BookDetailsPage,
  CodexPage,
  CharactersPage,
  DeckPage,
  DiariumRoom,
  ExploraPage,
  JournalEntryPage,
  LabPage,
  LettersLessonPage,
  NewTextPage,
  OrdoPage,
  MakePage,
  PracticePage,
  GamesPage,
  ProjectsPage,
  StoryEditorPage,
  RatioPage,
  ReaderPage,
  StarterPage,
  StudyPage,
  ThesaurusPage,
  TranslatePracticePage,
} from './pages';
import { PlanRoute } from '@/features/plans/PlanRoute';
import { AppError } from './AppError';
import { Root } from './Root';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

// Lemora's rooms (src/product.ts) at Lingua's addresses, so links inside the shared code lead where they did there.
export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Root />,
      errorElement: <AppError />,
      children: [
        { index: true, element: <HomeRouter /> },
        // Alphabet: Lingua's Cursus › Script on its own, with the character reference and the letters' lessons.
        { path: 'cursus', element: <Navigate to="/cursus/alphabets" replace /> },
        { path: 'cursus/alphabets', element: <AlphabetPage /> },
        { path: 'cursus/characters', element: <CharactersPage /> },
        { path: 'cursus/alphabets/review', element: <LettersLessonPage review /> },
        { path: 'cursus/alphabets/:groupId/lesson', element: <LettersLessonPage /> },
        // Explora & Bibliotheca: what there is to read, and what you have.
        { path: 'explora', element: <ExploraPage /> },
        { path: 'bibliotheca', element: <BibliothecaPage /> },
        { path: 'codex', element: <CodexPage /> },
        { path: 'codex/graded', element: <CodexPage /> },
        { path: 'codex/discover', element: <CodexPage /> },
        { path: 'codex/goodreads', element: <CodexPage /> },
        { path: 'codex/parallel/:textId/:chapterIndex', element: <ParallelReadingPage /> },
        { path: 'codex/comprehension/:textId/:chapterIndex', element: <ReadingPracticePage /> },
        { path: 'codex/read/:textId', element: <ReaderPage /> },
        { path: 'codex/new', element: <NewTextPage /> },
        { path: 'codex/first', element: <FirstBook /> },
        { path: 'codex/book/:textId', element: <BookDetailsPage /> },
        { path: 'thesaurus', element: <ThesaurusPage /> },
        // Atlas, Thesaurus's word map, as a room of its own; its old tab address opens it.
        { path: 'atlas', element: <AtlasRoom /> },
        { path: 'thesaurus/deck/:deckId', element: <DeckPage /> },
        { path: 'thesaurus/ready/:key', element: <StarterPage /> },
        { path: 'thesaurus/study/:deckId', element: <StudyPage /> },
        // What Max makes: a story, sentences, a dialogue or a word list, checked and labelled (6-6b).
        { path: 'thesaurus/make', element: <MakePage /> },
        // Practice sets in every kind of exercise (6-4b), and Ludus's games on the learner's words (6-21): with the plan.
        ...[
          { path: 'thesaurus/practice/:set?', page: <PracticePage /> },
          { path: 'thesaurus/games/story-editor', page: <StoryEditorPage /> },
          { path: 'thesaurus/games/projects/:project?', page: <ProjectsPage /> },
          { path: 'thesaurus/games/:game?', page: <GamesPage /> },
          { path: 'thesaurus/translate/:set?', page: <TranslatePracticePage /> },
        ].map(({ path, page }) => ({
          path,
          element: (
            <PlanRoute feature="ludus" fallback="/thesaurus">
              {page}
            </PlanRoute>
          ),
        })),
        // Diarium and Things to try, the two of Mentis's tabs Lemora keeps, as rooms; an entry is a page of its own.
        { path: 'mentis/diarium', element: <DiariumRoom /> },
        // Things to try lives in Explora in Lemora.
        { path: 'mentis/try', element: <Navigate to="/explora?kind=try" replace /> },
        { path: 'mentis/*', element: <Navigate to="/mentis/diarium" replace /> },
        { path: 'mentis/diarium/:entryId', element: <JournalEntryPage /> },
        { path: 'ratio', element: <RatioPage /> },
        { path: 'settings', element: <OrdoPage /> },
        { path: 'settings/lab', element: <LabPage /> },
        { path: 'settings/:group', element: <OrdoPage /> },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ],
  { basename },
);
