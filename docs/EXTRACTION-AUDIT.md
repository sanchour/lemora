# Lemora · Extraction audit (Phase 0)

Written 2026-11-03 from Lingua `main` at `f0a088f` (0.6.0-alpha.190 plus PR #24), before Lemora's first
change. Lemora is Lingua's reading-centred half: Home, Explore, Library, Codex, Thesaurus, Ludus,
Ratio (without Tabula), Settings, Diarium, Things to Try and Alphabet. This file records what that
means in Lingua's code. The plan that follows from it is [LEMORA-PLAN.md](LEMORA-PLAN.md); the way
back to Lingua is [LINGUA-REINTEGRATION.md](LINGUA-REINTEGRATION.md).

## 1. The decision: copy with shared history, then hide and prune

**Lemora is a clone of Lingua's git history with Lemora's commits on top**, every shared file at the
same path. Lingua is a remote of Lemora (`git remote -v`: `lingua`, fetch only; its push URL is
deliberately broken), so a commit can move either way with `git cherry-pick`.

Shared packages were considered and rejected for now:

- Nothing in Lingua is a package today. `features/codex` imports from 13 other feature folders,
  `features/thesaurus` from 9 (section 3). Cutting a package boundary means first untangling those,
  which rewrites the two modules the user wants to keep compatible.
- The coupling runs through `data/` (one Dexie schema of 51 tables), `core/` (45 k lines) and
  `design/`. A package would have to carry almost all of them. That's the whole app with extra
  build steps.
- One developer with AI agents gains most from identical paths and history: a diff made in one app
  applies in the other with no tooling.

The copy keeps the path to packages open. Once both apps have run for a while, the files that never
differ (most of `core/`, `design/primitives`) are the natural first package.

**Excluded features are hidden first and deleted only where nothing shared imports them.** For
example, Bibliotheca imports Sonus' `Artwork` and Visio's `Poster`, and Explora imports Mundus'
picks 14 times. Deleting Sonus would force edits in those shared files. That would make every later
fix to them conflict between the apps. So excluded routes, navigation, Home cards, Explore shelves
and settings go away through `src/product.ts` (section 9), and their code stays until nothing
reachable needs it.

## 2. Architecture as found

- Vite 8, React 19, TypeScript 7, Tailwind 4 (CSS-variable tokens), motion/react, Lucide, Dexie 4 +
  dexie-react-hooks, Zustand for ephemeral UI state, React Router 8, vite-plugin-pwa (Workbox),
  Vitest + fake-indexeddb. No backend: AI and translation services are called from the browser with
  the user's own keys (device-only, sent in headers).
- Layers point downward: `app/` (shells, router, onboarding) → `features/` (one folder per room) →
  `design/` · `state/` · `services/` · `data/` (Dexie and repositories) → `core/` (pure TypeScript,
  unit-tested). Features reach Dexie through `data/` only.
- Size (non-test lines): core 44.8 k, services 12.0 k, data 8.1 k, app 5.2 k, design 3.5 k;
  features: codex 10.3 k, thesaurus 10.2 k, sonus 6.2 k, grammatica 5.9 k, cantus 5.1 k, home 4.0 k,
  lab 3.9 k, cursus 3.8 k, ordo (settings) 3.7 k, games (Ludus) 3.3 k, ratio 3.0 k, explora 2.8 k,
  visio 2.5 k, colloquium 1.9 k, mundus 1.6 k, bibliotheca 1.5 k, smaller ones below 1 k.
- 267 test files, 1,869 tests, all passing on the copy (`npx vitest run`, 23 s).
- Language data is committed: `public/packs` (59 MB, frequency + forms + glosses + starter lists),
  `public/dict` (60 MB, full dictionaries), `public/strokes`, `public/chars`, `public/sounds`. They
  are built by `scripts/lang-data` from a 2 GB git-ignored cache that the app never needs.
- Deploy: `.github/workflows/deploy.yml` builds with `BASE_PATH=/<repo name>/` and publishes to
  GitHub Pages; `checks.yml` runs typecheck, tests and the production-path build.

## 3. What the included features import

From `grep "from '@/features/…"` over each folder (file counts):

| Feature | Imports from other features |
|---|---|
| codex (incl. diarium) | culture 2, exercise 3, generated 4, grammatica 1, lesson 1, ordo 2, phrasebook 1, plans 2, production 1, speech 4, thesaurus 1, tutor 1 |
| thesaurus (incl. Ludus) | cantus 1 (`SongClip`), codex 6, culture 1, exercise 1, generated 1, lesson 5, phrasebook 1, plans 7, speech 3 |
| explora | cantus 3 (`discoverFor`, `PickedArtist`), codex 1, mundus 14, sonus 5, thesaurus 2 |
| bibliotheca | cantus 1 (`SongArt`), codex 3, sonus 6 (`Artwork`, `AddMenu`, `AddBookDrawer`), visio 5 (`Poster`, `VideoCard`, `AddVideoMenu`) |
| home | cantus 2, codex 3, colloquium 2, cursus 3, explora 1, grammatica 4, mundus 7, plans 4, sonus 2, visio 4 |
| ordo (settings) | codex 2, plans 4, speech 1, thesaurus 2, tutor 1 |
| grammatica/letters (Alphabet) | lesson 4 (`kit`), speech 3, thesaurus 1 (`StudyBar`), cursus 1 (`marks/StrokeOrder`) |
| ratio | none (only `data/`, `core/`, `design/`) |

Conclusions:

- Codex and Thesaurus need the small helper features as they are: `speech`, `lesson`, `exercise`,
  `culture`, `tutor`, `phrasebook`, `production`, `generated`, `plans`. All stay, unchanged.
- The pull towards excluded features comes from Home, Explora and Bibliotheca. Those three are where
  Lemora adapts; Codex and Thesaurus need almost nothing.
- Alphabet needs one Cursus component (`StrokeOrder`) and Grammatica's `letters` folder, not the
  course or grammar engines.

## 4. Routes

**Kept, at the same addresses** (shared code links to them, so they don't move):

| Lemora section | Addresses |
|---|---|
| Home | `/` |
| Explore | `/explora` (reading kinds only: books, read, dictionaries, words, saved) |
| Library | `/bibliotheca` (texts and books; audio and video shelves hidden) |
| Codex | `/codex`, `/codex/{graded,discover,goodreads,new}`, `/codex/read/:textId`, `/codex/book/:textId`, `/codex/parallel/…`, `/codex/comprehension/…` |
| Thesaurus | `/thesaurus`, `/thesaurus/{deck,ready,study}/…`, `/thesaurus/make`, `/thesaurus/practice/:set?`, `/thesaurus/translate/:set?` |
| Ludus | `/thesaurus/games/:game?`, `/thesaurus/games/projects/:project?`, `/thesaurus/games/story-editor` |
| Diarium | `/mentis/diarium`, `/mentis/diarium/:entryId` |
| Things to Try | `/mentis/try` |
| Alphabet | `/cursus/alphabets`, `/cursus/alphabets/:groupId/lesson`, `/cursus/alphabets/review` |
| Ratio | `/ratio` (Overview; `?tab=tabula` falls back to Overview) |
| Settings | `/settings/:group`, `/settings/lab` (Device lab, under Developer) |

**Excluded** (route removed, so the router's catch-all leads Home): `/cursus/course/…`,
`/cursus/grammatica/…`, `/cursus/typing`, `/sonus/*`, `/cantus/*`, `/visio/*`,
`/mentis/sermo`, `/mentis/notebook`, Mundus' guide, culture and immerse tabs (`/mentis`,
`/mentis/culture`, `/mentis/immerse`), Ratio's Tabula.

## 5. Shared services that must stay

`services/`: `dictionary`, `translate` (MyMemory, Lingva, cache), `llm` (Groq, Gemini), `packs`
(+ `workers/packs.worker.ts`), `files`, `import` (epub, txt, pdf, Goodreads, apkg, csv), `export`,
`goodreads`, `news` (articles via Jina Reader), `comics` (OCR, readable content), `images`, `script`,
`speech` (device voices and Piper, used by the reader and Ludus), `storage`, `perf`, `licence`,
`notifications`, `graph` (+ `workers/graph.worker.ts`, the Thesaurus atlas), `sync` (backup
exchange), `discover` (Codex discover). Unused by Lemora, kept until pruned: `sonus`, `visio`,
`cantus`, `radio`, `mundus` (picks for Explora come through `core/mundus`), `transcribe`.

## 6. Database

One Dexie database, 51 tables in the newest version (46), every version kept so old data upgrades.
Lemora uses: `languages`, `settings`, `texts`, `chapters`, `readingProgress`, `textVocab`, `words`,
`frequency`, `dictForms`, `dictEntries`, `dictPacks`, `dictParadigms`, `dictExamples`, `starterLists`,
`fullDict`, `translationCache`, `llmCache`, `folders`, `decks`, `notes`, `cards`, `reviewLogs`,
`sessions`, `dailyStats`, `journalEntries`, `goals`, `studyLogs`, `challenges` (Things to Try),
`grammarItems` + `grammarProgress` (Alphabet progress is stored there, by `data/script.ts`), `evidence` +
`evidenceDays` (the learner model), `generated`, `graphLayouts`, `graphViews`, `blobs` (covers, comic
pages). Reading marks and bookmarks live inside `texts` and `chapters` rows. Not used by Lemora's
sections: `media`, `transcripts`, `playbackProgress`, `feeds`, `songs`, `stations`, `speech`, `chats`,
`sightings`, `courseProgress`, `typing`, `capabilities` (Tabula), `journeyEvents`.

**Rule: Lemora keeps Lingua's schema exactly.** It adds no Dexie version and drops no table, even
for excluded features. `core/contracts` reserves version numbers per Lingua step (23 → 46), so a
Lemora-only version would collide with a later Lingua one and break restoring a backup across the
apps. New Lemora data (the per-tool goals) goes in existing tables: `settings` keys or `goals` rows.

**Storage isolation (done in Lemora's first commit).** Lingua is served at
`sanchour.github.io/lingua./` and Lemora at `sanchour.github.io/lemora/`. Both are on one origin, so
they share IndexedDB, localStorage and Cache Storage. With Lingua's names, Lemora would have opened
the user's real `lingua` database. Its "erase everything" (`data/reset.ts`) called
`localStorage.clear()` and deleted every `lingua-*` cache, which would have wiped Lingua's too.
Now:

| What | Lingua | Lemora |
|---|---|---|
| IndexedDB database | `lingua` | `lemora` (`PRODUCT.db`) |
| localStorage keys | `lingua.theme`, `lingua-explore-saved:…`, … | `lemora.…` (`PRODUCT.prefix`, 20 files) |
| Workbox runtime caches, Piper voices, Unicode data | `lingua-*` | `lemora-*`, `cacheId: 'lemora'` |
| Service worker scope and precache | `/lingua./` | `/lemora/` (from the path, separate already) |
| Erase everything | clears all localStorage | removes only keys starting with `lemora` |
| Dev server | `localhost:5173` | `localhost:5175` (a different origin, so dev data is apart too) |

Still shared on the origin, by design or for now: a few unprefixed localStorage keys that only
excluded features write (`notebook.draft:…`), and sessionStorage flags (per tab, harmless).
**Lingua's own "erase everything" still clears the whole origin's localStorage**, Lemora's UI
conveniences included (theme hint, atlas camera, saved Explore items), until Lingua takes
`src/product.ts` (see the reintegration document). Lemora's IndexedDB data is not touched by it.

## 7. Reusable unchanged

`features/codex` (reader, word engine, drawer, importers, parallel reading, comprehension, Diarium),
`features/thesaurus` (folders, decks, dictionary, starter decks, FSRS study, Ludus, atlas),
`features/games`, `practice`, `translate`, `exercise`, `lesson`, `speech`, `culture`, `tutor`,
`phrasebook`, `production`, `generated`, `plans`, `search`, `generate`, `features/grammatica/letters`,
`features/ratio` (Overview), all of `core/`, `data/`, `design/`, `workers/`.

## 8. Needs adapting

| Where | Why |
|---|---|
| `app/sections.ts`, `app/router.tsx`, `app/redirects.ts` | Lemora's sections and routes; old Lingua addresses that would lead to excluded rooms go Home |
| `features/home` | Lingua's Home pulls in course, grammar, Sermo, Mundus, music and video cards; Lemora's Home is its own (plan step 3.1) |
| `features/explora` | reading kinds only; hide the screen, audio and music categories, radio and audiobook shelves |
| `features/bibliotheca` | hide audio, video and song items and the add-audio/video menus |
| `features/mentis` | Lemora's room shows Diarium and Things to Try only |
| `features/mundus` (Things to Try) | tips filtered to reading, vocabulary, writing and review |
| `features/cursus` | the Alphabet tab alone, without the course, grammar and typing tabs |
| `features/ratio` | no Tabula tab; Overview without listening, watching and singing panels |
| `features/ordo` | no Listening and Music groups; Lingua+ named Lemora+ (through the message layer) |
| `app/onboarding` | showcase moves to Lingua-Launch; map, level, speak and seeding fixes (plan steps 3.2 to 3.6) |
| Branding | name (done through `core/i18n/messages.ts`), wordmark (done), icons, manifest (done), meta (done) |

## 9. How the two apps differ in code

`src/product.ts` is the one file that is different by design. It holds the database name, the
storage prefix and the name, and in Phase 2 the list of sections Lemora shows. Shared files read
from it (`PRODUCT.prefix`, `PRODUCT.name`, a `has(section)` test) instead of hard-coding Lemora.
After Lingua takes the same file with its own values, those shared files are byte-identical in both
repositories.

## 10. Risks and open issues found

1. **Same-origin data (fixed, section 6).** Without the first commit, Lemora would have run on the
   user's Lingua data.
2. **Known words ≠ frequency decks (plan step 3.5).** `applyKnownSeed` (`data/words.ts:171`) marks
   the top N *forms* of the `frequency` table as Known. The starter decks are the top N *lemmas*
   of `starterLists`. Choosing "the top 500 are known" marks 500 surface forms, many of them
   inflections of the same few lemmas. The Top-500 deck then shows most of its words unknown.
   That's the root cause of the user's report.
3. **The showcase can't move as code.** Lingua-Launch is one static `index.html` (Tailwind from a
   CDN, no build, no React), so the onboarding showcase (`IntroPages.tsx`, "See what Lingua can
   do") has to be rewritten in plain HTML and JS there. It's removed from Lemora only after the
   Launch page has been checked.
4. **Desktop-only vs. responsive.** Lingua's rule since 2026-10-20 is desktop only. The Lemora brief
   asks for responsive layouts and touch (long-press). Lemora follows its brief. Lingua's touch
   layout (`TouchShell`) exists and is the starting point.
5. **Licences for a commercial app.** The dictionaries are Wiktionary via kaikki.org (CC BY-SA 4.0)
   and the frequency lists FrequencyWords/OpenSubtitles (CC BY-SA 4.0). Selling the app is allowed,
   but the data must keep its attribution, and the packs themselves (adapted material) stay under
   CC BY-SA. Stroke data: Make Me a Hanzi (Arphic Public License / LGPL parts) and KanjiVG
   (CC BY-SA 3.0). Fonts SIL OFL, Lucide ISC. Settings › About lists most of these. A full licence
   pass is plan step 4.6.
6. **Large repository.** 365 MB of history and 120 MB of committed language data come with the copy.
   That's acceptable for Pages and needed for offline packs.
7. **Docs written for Lingua.** `CLAUDE.md`, `docs/HANDOVER.md`, `docs/ROADMAP.md` and the
   `LINGUA-*` plans describe Lingua's work. Lemora's `CLAUDE.md` now says which documents apply.

## 11. Difficulty of bringing improvements back

Measured on the code, not hoped for:

- **Codex, Thesaurus, Ludus, core, data, design: easy.** They're the same files at the same paths
  with the same history, so `git cherry-pick` applies a commit, or `git am -3` a patch with a 3-way
  fallback. Conflicts appear only where both apps changed the same lines.
- **Explora, Bibliotheca, Mentis, Ratio, Settings: moderate.** Lemora's changes there are
  `has(section)` checks. They come back cleanly once Lingua has `src/product.ts` (a one-time commit
  that changes no behaviour in Lingua).
- **Home, sections, router, onboarding: Lemora's own.** They don't go back as code; the ideas do
  (for example the per-tool goals, which live in `data/` and `core/` and go back as shared commits).
- **Schema: safe** while Lemora adds no Dexie version (section 6).

The feasibility check in plan step 5.2 tests this for real on a throwaway clone of Lingua.
