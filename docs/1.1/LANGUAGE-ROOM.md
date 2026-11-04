# Lemora 1.1 · The language room and the deep language tools (L1.1-04 to L1.1-08)

Part of [the Lemora 1.1 plan](../LEMORA-1.1-PLAN.md); rules in [CONVENTIONS.md](CONVENTIONS.md). **WAITING.**
The source is [LINGUA-6-23-PLAN.md](../LINGUA-6-23-PLAN.md) with its data audit [6-23-DATA.md](../6-23-DATA.md). Its
"done when" lines, numbers, licences, review rules and 40 MB budget all still hold. The existing T0, A1 and A2 work
([6-23-A1.md](../6-23-A1.md), [6-23-A2-RUSSIAN.md](../6-23-A2-RUSSIAN.md), [6-23-A2-GREEK.md](../6-23-A2-GREEK.md))
is kept and finished, never restarted.

**What changes for Lemora:**
- **Placement.** 6-23 §1 rule 3 still holds for *where content is written*: teaching goes into
  `core/grammar/topics/<lang>.ts`, shared with Lingua's Grammatica. Lemora shows it in the language room's **Notes**
  tab, not in a Grammatica room.
- **Desktop only** (decision 4), as 6-23 rule 8 already says.

## The room (decision 1, the user, 2026-11-04)

Alphabet grows into a room for **every** language, with these tabs:

| Tab | Shows | When it appears |
|---|---|---|
| Letters | Alphabet, letters, stroke order, the character reference link (today's `ScriptMarksTab`) | A non-Latin script that `hasScript` knows |
| Sounds | Today's `SoundsTab`, plus Tones (06.6) | Wherever `SoundsTab` has content, Latin scripts included (this plan's reading of the decision) |
| Marks | Diacritics, conversion, drills (05.x) | `hasMarks(lang)`, or A4 drills exist |
| Notes | Sourced reference topics and their drills (07) | At least one topic with `tool` set |
| Regions | Slang and dialects ([REGIONS.md](REGIONS.md)) | `hasRegions(lang)` |

**Its name is not decided.** This plan proposes **Glossa** ("your language, up close"), pending the user. Push 04.1
asks the user first if the name is still open; it is one string in `src/app/sections.ts`.

## 04.1 · The language room (Any; `[lemora]` commits plus one `[shared]` restore)

- **`src/app/sections.ts`.** The `alphabet` entry **keeps its id**, so `ToolId 'alphabet'` (`core/goals/tools.ts`),
  `FlowStep 'alphabet'` (`core/flow/steps.ts`) and the per-tool goals keep working. It gets the chosen name and the
  role "Letters, marks, notes, regions". `forLanguage` becomes "at least one tab has content" (the table above).
- **`src/app/rooms/AlphabetPage.tsx` becomes `src/app/rooms/LanguageRoom.tsx`** (Lemora-only, so the rename is fine).
  - The route stays `/cursus/alphabets`, with `?tab=letters|sounds|marks|notes|regions`.
  - Only tabs with content show; an unknown or empty tab opens the first one available, never a redirect Home.
  - Letters keeps `ScriptMarksTab`; the Marks view gets its own tab.
  - `/cursus/characters` stays, linked from Letters and Marks.
  - Update `router.tsx`'s import.
- **Restore from Lingua (`[shared]`).** After `git fetch lingua`, `git checkout lingua/main --` these files:
  - `src/features/grammatica/TopicPage.tsx`, `GrammarVisuals.tsx`, `lessonParts.tsx`, `GrammarLesson.tsx`
  - then whatever their imports need: let typecheck name them (likely `SentenceExplainer.tsx`, `LessonCard.tsx`)
  - **not** `GrammaticaPage.tsx`, `TopicMap.tsx` or `GrammarHorizontalPath.tsx`: the curriculum room stays excluded
  - merge their interface strings with `scripts/merge-i18n.mjs`
- **`core/grammar/types.ts` (`[shared]`).** Add `Topic.tool?: string`: the 6-23 track id (`'A4'`, `'C3'`, `'D1'`,
  `'E1'`, `'F3'`…). It is optional and harmless to Lingua.
- **`src/features/cursus/notes/NotesTab.tsx` (new, shared path).**
  - Lists the topics with `tool`, grouped by track, each with its sources and a review badge.
  - Opens `TopicPage` inside the room (`?tab=notes&topic=<id>`); drills run through `GrammarLesson`.
- **Context links.** Where `core/grammar/forWord.ts` maps a word to a tool topic, the word drawer and the dictionary
  `Entry` show "Notes: …", linking into the room.
- **Done when:**
  - Spanish shows Marks and Notes (once there is content for them), and Russian shows all five tabs
  - no tab is empty and no link is dead
  - Home's flow step `alphabet` still opens Letters
  - looked at in the browser at the three desktop sizes, both themes

## 08.1 · The Practice set registry (Careful, `[shared]`; right after 04.1)

Pushes 02.9, 05.4, 07, 09.7 and 10 all add Practice sets, so this comes early.

- **`core/exercise/sets.ts`.** `PracticeSetDef { id, group: 'words'|'grammar'|'listening'|'script'|'notes'|'regions',
  title, detail, needs, make(ctx), makeLater?, local? }`, and `registerSets(provider)`.
- **`PracticePage` builds its list from the registry.** Today's `buildSets` and `madeSets` become the first providers.
  The existing set ids and behaviour stay identical, and a test lists the old ids.
- Answers are recorded in the learner's record as today (6-23 G2).

## L1.1-04 · Track A, scripts (A1 and A2)

- **04.2 A1 offline (F1306)** (Any).
  - Reproduce the failed offline reload of `/cursus/characters` after first use (DevTools offline).
  - Find the gap: the route chunk, the `public/chars/unicode/*` runtime rule (`vite.config.ts`, around line 69), or
    the Unicode data fetch. Fix it.
  - Record the evidence in [6-23-A1.md](../6-23-A1.md).
- **04.3 A2's other named schemes (F1298, F1301, F1371)** (Careful).
  - One file per script, `core/script/translit/<script>.ts`, registered in `core/script/reading.ts`
    (`NAMED_READING_SCHEMES`).
  - Golden tests come from each standard's own example tables; the fixture cites the table and page.
  - One push each, in this order:
    1. Korean: Revised Romanization, McCune–Reischauer, Yale
    2. Japanese: Hepburn (long vowels as macrons, doubled or `ou`), Kunrei-shiki, Nihon-shiki
    3. Mandarin: pinyin with marks or numbers, Zhuyin, Wade–Giles
    4. Arabic: DIN 31635, ALA-LC, IJMES, Buckwalter, plain, chat Arabic. Vowelled text only; unvowelled text says
       "reading uncertain"
    5. Georgian: national 2002, ISO 9984
    6. Cantonese: Jyutping, Yale
- **04.4 Per-surface controls and the reveal (F1300)** (Careful).
  - **Setting:** `settings.readingAids[lang] = { reader, cards, dictionary, alphabet: { scheme?: string; show:
    'over'|'under'|'hover'|'off' }; reveal: 'click'|'none'; fade: 'state'|'none' }`. The defaults reproduce today's
    behaviour, and `reader.readingSchemes` stays readable as the reader's scheme.
  - **Surfaces:** honoured in the reader (`ChapterBody`), study cards, the dictionary `Entry` header and Letters
    lessons.
  - **No transliteration:** a visible mode with a "check yourself" click-reveal, recorded as assisted.
  - **Checks:** tests resolve the setting; each surface is looked at in the browser.
- **Done when:** 6-23 A1's and A2's own done-when lines hold.

## L1.1-05 · A3 conversion and A4 drills

- **05.1 OpenCC (F1299)** (Careful).
  - **Data:** `scripts/script/opencc.ts` builds compact tries from OpenCC 1.4.2's sixteen dictionaries (T0: 577,959
    bytes gzip) into `public/chars/opencc/<mode>.json`. **Downloading OpenCC needs the user's approval** (sources and
    hashes in 6-23-DATA.md).
  - **Engine:** `core/script/opencc.ts`, longest-match conversion. Golden tests come from OpenCC's own test cases.
  - **Reader:** a per-text view menu: *Simplified / Traditional / Taiwan / Hong Kong*. Lookups convert back with `t2s`
    before searching, so lookups and pinyin keep working.
  - **Marks:** a list of the many-to-one traps (发 后 干 面).
- **05.2 Serbian** (Any). The lj, nj and dž exception list (from a cited word list) in `core/script/convert.ts`, with
  tests and a reader view.
- **05.3 Kana and Hangul** (Any). Hiragana ⇄ katakana, full-width forms, Hangul ⇄ Revised Romanization, each with
  round-trip tests. **Kazakh and Mongolian stay waiting** unless the user scopes them (CLDR 48 is forward only, T0).
- **05.4 A4 drills (F1302–F1305, F1334, F1366)** (Careful for the stress engine, Any for the rest).
  - **Minimal pairs by diacritic:** `core/script/drills/minimalPairs.ts` finds headwords that differ only by marks
    (folding with the existing normalisers), both ranked ≤ 20,000; each pair becomes a pack-sentence cloze.
  - **Accent placement (es, pt, it, fr):** extend `core/lang/stress.ts`. A test runs the rule over **every** accented
    dictionary word and lists the exceptions.
  - **Ligatures:** Arabic lām-alif recognition over pack words; notes on Latin æ, œ, ß, ﬁ.
  - **Russian cursive:** an OFL face with Cyrillic (licence checked, loaded lazily), recognising letters and then words;
    the confusable letters т, г, д, и, л, м together.
  - **Arabic spelling:** `hamzaSeat()`, tested against the dictionary.
  - **Placement:** Marks › Drills, and Practice sets with `group: 'script'`.
- **Done when:** 6-23 A3's and A4's own done-when lines hold.

## L1.1-06 · Track B, characters

The B sources (KANJIDIC2, the Korean hanja export, CC-CEDICT) are **not** in `../Lingua/scripts/.cache`; MMH, KanjiVG
and Unihan are. Fetch the missing ones with 6-23-DATA.md's commands and hashes, **after the user approves the
download**. Each push is one item, checked against 6-23 §3 Track B:

| Push | Fit | What | Lemora placement |
|---|---|---|---|
| 06.1 B1 all strokes | Careful | Every MMH and KanjiVG character in shards of at most 256, within the 20 MB allocation; a runtime cache; *Download all strokes* in Settings › Storage; stroke names; the order rules as a lesson; Hangul syllable assembly | Letters, cards |
| 06.2 B2 radicals | Any | The 214 radicals page, component trees, the phonetic/semantic hint, a missing-component quiz, building a character as a `drag-drop` exercise | Letters › Radicals |
| 06.3 B3 recogniser | Careful | `core/script/handwriting.ts`. Done when a test shows 95 % of 1,000 noisy copies accepted and 95 % of swapped or reversed copies rejected | Letters write pad, cards |
| 06.4 B4 kanji readings | Careful | KANJIDIC2 fields, plus an alignment algorithm that finds the reading each word uses; at least 95 % of words aligned (measured) | Letters, word drawer ("why is it read like this") |
| 06.5 B5 hanja | Any | The English Wiktionary's 15,275 tagged headwords: hanja in the drawer, a hanja page, families, education-list membership (2007 is the list's year, not a level) | Drawer, Letters |
| 06.6 B6 tones | Careful | The zh-CN Piper voice's syllable inventory, generated once and cached; tone pairs; sandhi; the pitch contour (`core/sounds/pitch.ts`). Cantonese tones say plainly whether a voice exists | **Sounds › Tones**, Practice |
| 06.7 B7 reading aids | Any | Reading aids per character, from the characters of known words; the 500 most confusable pairs | Reader, Practice |
| 06.8 B8 | Any | The Traditional ⇄ Simplified comparison page, the kana→kanji (IME-like) exercise, a homophone cloze | Marks, Practice |

## L1.1-07 · Tracks C, D, E, F, the teaching (Any: content made with data, following 6-23's done-when exactly)

- **How every topic is written:**
  - in `core/grammar/topics/<lang>.ts`, with `tool` set to its track id
  - at least 12 items whose sentences are in the pack (the existing grammar test enforces it), each with three wrong
    forms
  - sources, and every hand-written line in `docs/review/6-23-<lang>.md`
- **Drills** are made from data: paradigm grids (`core/exercise/grid.ts`), pack sentences, the dictionary. They are
  registered as Practice sets with `group: 'notes'`.
- **In context:** reading and dictionary support go where the word is: the drawer's "Notes" link, and the Russian
  stress toggle in the reader and on cards (C2).
- **One push per item:**

| Track | Pushes | Notes for Lemora |
|---|---|---|
| C Russian | C1 spelling and sound · C2 stress · C3 aspect (400+ reviewed pairs from the dictionary's 11,134 raw candidates) · C4 verbs of motion (the verb builder) · C5 numerals, participles, reflexives, word order | Notes, plus the stress toggle in the reader and cards |
| D Romance | D1 clitic pronouns (es, fr, pt, it; 30 `transform`s each) · D2 accents (with 05.4) · D3 verbs with prepositions (150+ per language, with a browser and a cloze) | pt and it are tier 2: topics only where the pack allows. **D4 is in [REGIONS.md](REGIONS.md)** |
| E East Asian | E1 politeness (the style converter **only after** a forward conjugation engine is validated; T0 found the current data insufficient) · E2 counters (CC-CEDICT for Mandarin classifiers) · E3 particles (the explorer: 200 pack sentences, 50 hand-checked) | E4 Cantonese takes what the data has; its gaps are listed in DECISIONS |
| F Arabic | F1 short vowels (stages in the reader) · F2 spelling · F3 roots and patterns (explicit `ar-root` links first; inferred roots at least 80 % right on a reviewed held-out set) | **F4 and F5 are in [REGIONS.md](REGIONS.md)**; F3's roots also feed the Atlas's root hubs |

## L1.1-08 · Track G, what every track shares (Any)

- **08.1** The Practice set registry (above).
- **08.2 Report a mistake** on Marks, Notes topics, Regions entries and the word drawer:
  - extend `DictIssueKind` (in `core/dictionary/userDictionary.ts`) with `'note' | 'region' | 'mark'`
  - stored as today
  - listed and exportable in Settings › Data
- **08.3 Review files:** first move the existing Marks items into `docs/review/6-23-<lang>.md` (6-23 §7), then every new
  hand-written line the day it is written.
- **08.4 Tests:** golden tests for converters and schemes; property tests for round trips; a data test per generated
  file.
- **08.5 Docs:**
  - [6-23-DATA.md](../6-23-DATA.md) gets the built sizes: at most 40 MB compressed in total, lazy, sharded, none
    precached
  - each tool says on screen whether it works offline after first use
- **Done when:** the source's G1–G4 lines hold, with right-to-left and non-Latin text looked at and native-review
  limits declared.
