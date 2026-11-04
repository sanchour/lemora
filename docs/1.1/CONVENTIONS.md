# Lemora 1.1 · How every step is built

Part of [the Lemora 1.1 plan](../LEMORA-1.1-PLAN.md). Written 2026-11-04 (Opus 5.5) from the code at 0.1.0-alpha.25
(`4782d72`). **1.1 is WAITING:** nothing here authorises starting a step. Read this file before any 1.1 push.

## 1. What exists already (reuse it, don't rebuild it)

| Area | Where | State on 2026-11-04 |
|---|---|---|
| Atlas room | `src/app/rooms/AtlasRoom.tsx` → `features/thesaurus/atlas/AtlasTab.tsx` (511 lines, `immersive`), `AtlasCanvas.tsx` (784) | G1–G4 done; U7 layout: full screen, Loose threads column on the right, views slider on top, search icon, − and + bottom left |
| Graph model | `core/graph/{model,regions,layout,scene,curves,tree,langs}.ts`, `workers/graph.worker.ts`, `services/graph/graph.ts`, `data/atlas.ts` | Tested; `buildWeb` already reads `Word.relatedWordIds` as the `yours` family |
| Graph storage | `graphLayouts` (a cache, `skip` in backups), `graphViews` (`lww`); row types in `core/contracts/db.ts` (`GraphLayoutRow`, `GraphViewRow`) | **`graphViews` is unused**; the atlas camera lives in localStorage |
| Word fields | `Word.tags`, `Word.grammarTopics`, `Word.relatedWordIds` in `data/types.ts` (unindexed) | **Nothing in the UI writes `grammarTopics` or `relatedWordIds` yet** |
| Learner record | `data/learner.ts` (`learnerRecord`, `useWeakSpots`, `useSkillBalance`, `recentWrong`), `core/learner/learner.ts` (`weakSpotsOf`, `mixUpsOf`, `quietSkills`, `skillBalance`) | Used by Ratio and Practice |
| Level chooser | `core/flow/steps.ts` (`flowSteps`, `starterFor`) | U1, tested; Home's What next and Explora's picks |
| Practice sets | `features/practice/PracticePage.tsx` (`PracticeSet`, `buildSets`, `madeSets`, local to the page) | Sets can't be registered from elsewhere yet (push 08.1 fixes that) |
| Exercise kinds | `core/contracts/exercise.ts`, `core/exercise/{kinds,judge,grid}.ts` | `drag-drop`, `match-*`, `correct-mistake`, `transform`, `cloze`, `type`, `predict-form`… |
| Script | `core/script/{reading,romanize,convert,unicode,marks,hanzi,strokes,kana,arabic}.ts`, `core/script/translit/{russian,greek}.ts` | A1 page `/cursus/characters` (offline gap open); A2 named schemes only for Russian (4) and Greek (2), honoured **only in the reader** (`ReaderPage.tsx` reads `reader.readingSchemes`) |
| Alphabet room | `src/app/rooms/AlphabetPage.tsx` (Letters = `features/cursus/studio/ScriptMarksTab.tsx`, Sounds = `features/cursus/sounds/SoundsTab.tsx`), `features/cursus/marks/MarksTab.tsx`, `features/grammatica/letters/*` | Hidden for Latin script (`src/app/sections.ts` `forLanguage`) |
| Grammar content | `core/grammar/topics/<lang>.ts` (18 languages), `core/grammar/{types,drills,forWord,prerequisites,load}.ts`, `features/grammatica/{drillViews,parts,links}.tsx` | Content kept, but `TopicPage.tsx`, `GrammarVisuals.tsx`, `GrammarLesson.tsx`, `lessonParts.tsx` and `SentenceExplainer.tsx` were pruned in step 2.6. **They are still in `lingua/main` at the same paths** |
| Dictionary | `public/dict/<lang>.v3.json.gz` (es fr de ru zh ar), `core/dictionary/format.ts` (`FullSense.tags`, `FullEntry.cog/parts/root/pair`), issue reports in `core/dictionary/userDictionary.ts` (`DictIssueReport`, stored in a settings row) | Region labels filtered by `LABELS` in `scripts/lang-data/dictionary.ts:52-59` (see [REGIONS.md](REGIONS.md)) |
| Text coverage | `Text.stats.knownShare`, computed in `data/library.ts` (around line 169) | **Counts learning words as known** (`w.state` truthy) |
| Maps | `features/sonus/radio/worldMap.ts` (`WORLD_MAP`: Natural Earth 1:50m countries as polylines), `data/territories.ts`, `app/onboarding/LanguageMap.tsx` with its framing | Countries only, no subregions |
| Goals | `goals` table; `GoalKind` has `'travel'`, `'books'`, `'real-life'` (`data/types.ts`); per-tool goals `core/goals/tools.ts`, `data/toolGoals.ts` | |
| Learner's languages | `LanguageProfile.native` and `.spoken`, written by `app/onboarding/Onboarding.tsx` | |
| Ludus stories | `features/games/Story.tsx`, `features/games/StoryEditor.tsx` | Reuse for interactive novels (F1551) |
| OCR, import, export | `services/comics/ocr.ts`, `services/import/{importers,pagePhotos,epub,pdf,decks}.ts`, `services/export/{apkg,index}.ts`, `extension/` | |
| Versioning | `scripts/version.ts` | The first 1.1 push uses `node scripts/version.ts --line 0.1.1 "…"` (0.1.1-alpha.1); the release `--release` |
| Browser checks | No Playwright in `package.json` | Use the built-in browser or Claude in Chrome on `npm run dev` (port 5175) |
| Lingua | Nothing newer than Lemora's fork except docs (`a59b6e6`, `8d34c97`) | Unmerged Lingua branches to read in push 01.5: `claude/f0704-sound-audio` (4 commits), `claude/6-9-10-scope` (2), `antigravity/local-changes` (1) |

## 2. The rules for every push

1. **Read first:** the push in the plan's queue, its spec file in `docs/1.1/`, the source sections it names,
   [ARCHITECTURE.md](../ARCHITECTURE.md), [PERFORMANCE.md](../PERFORMANCE.md), and the handbook chapter for the room.
2. **Claim** the push in [the queue](../LEMORA-1.1-PLAN.md) (name, date) as its own versioned push, as Lemora does.
3. **Layers point down:** `app/` → `features/` → `design/ · state/ · services/ · data/` → `core/`. Features reach Dexie
   only through `data/`. Work over 50 ms goes in a worker.
4. **No new Dexie version and no new table.** New state goes in:
   - `settings` keys (the interface and defaults in `data/settings.ts`, plus `data/settingsDefaults.test.ts`)
   - unindexed fields of existing rows (`Word`, `Text.stats`, `graphLayouts`, `graphViews`)
   - `goals` or `generated` rows

   If a step truly needs an index or a table: **stop**, write it under "Schema requests" in
   [DECISIONS.md](../DECISIONS.md), and ask the user.
5. **Paths stay put.** Nothing under `src/core`, `src/data`, `src/design`, `src/features/codex` or
   `src/features/thesaurus` is moved or renamed. New shared code goes on shared paths. Lemora-only code goes in
   `src/app/`, `src/product.ts` and `src/app/rooms/`.
   - **Restore, don't rewrite:** a file Lingua has comes back with `git fetch lingua` and then
     `git checkout lingua/main -- <path>`, as its own `[shared]` commit: "restore <path> from Lingua <sha>".
6. **Commits:** `[shared]` or `[lemora]`, one kind per commit. Shared code never says "Lemora"; it asks
   `PRODUCT.name`, `shows()` and `reaches()`.
7. **Interface text:** goes through `useUi()` / `UiText`. Every literal is registered in
   `src/core/i18n/sources.json` and translated in the six catalogues (`es fr de ru ar zh.json`).
   `src/core/i18n/coverage.test.ts` fails otherwise.
8. **Data files:**
   - built by a script in `scripts/<area>/` from `scripts/.cache` (copy it from `../Lingua/scripts/.cache` or rebuild
     it as [SETUP.md](../SETUP.md) says), written to `public/<area>/` and fetched lazily on first use
   - each gets a Workbox `runtimeCaching` rule in `vite.config.ts` (CacheFirst, the cache name starting with
     `PRODUCT.prefix`) and is never precached
   - its compressed size goes in DECISIONS, its licence in [LICENCES.md](../LICENCES.md) and Settings › About
   - **a download from the internet needs the user's approval first**
9. **Sources and review:**
   - every hand-written line goes into `docs/review/<area>-<lang>.md` (item, claim, source, then
     `unreviewed | ok | wrong`)
   - data carries `reviewed: boolean`, and the interface shows an **"unreviewed"** badge until a native speaker marks
     the line ok
   - a model never marks anything reviewed
10. **Tests (Vitest):**
    - golden tests from a standard's own examples
    - property tests (round trips)
    - a data test per generated file (coverage, uniqueness, sources present)
    - fake keys only (`test-not-a-real-key`)

    Delete `node_modules/.vitest-cache` when a new file isn't seen.
11. **Checks:**
    - `npm run typecheck`, `npm test`, `npm run build`
    - **desktop only (decision 4):** a browser at 1280×800, 1440×900 and 1366×768, in Paper and Nocturne
    - Arabic right to left wherever text shows, reduced motion wherever something moves, the keyboard alone wherever
      something is clicked

    Write down what was seen and what wasn't.
12. **Performance:** React never renders per frame; a canvas is driven through refs; route and tab code is
    `React.lazy`; nothing is drawn at rest.
13. **Docs:** tick the push in the queue and its feature IDs in [LEDGER.md](LEDGER.md), update FEATURES.md and
    DECISIONS.md, and list what wasn't verified.
14. **Push:**
    - `node scripts/version.ts "L1.1-xx.y: what"` (the very first 1.1 push uses `--line 0.1.1`)
    - commit as `sanchour <255895307+sanchour@users.noreply.github.com>`
    - `git pull --rebase origin main`, then push `main`
    - check the Pages deploy (`gh run list -L 3`)
15. **Model fit** (from 6-23 §4): pushes marked **Careful** (algorithms, layouts, recognisers, engines) need a strong
    model. Pushes marked **Any** are mechanical, or content made from data, and a weaker model can do them by following
    the spec exactly. When a spec and the code disagree, the code is the truth: stop and note it, don't guess.
16. **End notes** after every session: what changed, what wasn't verified, what's next.
