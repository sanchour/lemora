# Lemora 1.1 · Adaptation, paths and diagnostics (L1.1-10, L1.1-11)

Part of [the Lemora 1.1 plan](../LEMORA-1.1-PLAN.md); rules in [CONVENTIONS.md](CONVENTIONS.md). **WAITING.**
The source is [LINGUA-6-PLAN.md](../LINGUA-6-PLAN.md) §6-16 ("every suggestion says why, and can be dismissed or
overridden") and the audit entries in [LINGUA-6-FEATURES.md](../LINGUA-6-FEATURES.md).
It builds on U1–U3: the level chooser `core/flow/steps.ts` and Home's What next.

## L1.1-10 · Adaptation (Careful for the engine, Any for the surfaces)

**The engine:** `src/core/adapt/` (shared, pure, tested), plus `src/data/adapt.ts`, which gathers its inputs from
Dexie.
- A suggestion is `{ id, kind, title, why, action: { to: string }, weight }`. `why` is one plain sentence with the real
  number in it ("This book is 94 % words you know").
- **Every suggestion has *Why?*, *Not now* (snooze), *Never* and *Show me something else*.** This is F1465 (from
  Lingua 5.2-7).
- Settings `adapt = { off: boolean; dismissed: Record<id, until>; pace: 'gentle' | 'normal' }`.
- `flowSteps` stays the backbone; the pieces below add weight to its steps and new cards.

| Piece | Rule | IDs |
|---|---|---|
| Reading fit | First add `knownOnlyShare` to `TextStats` (an unindexed field; **today's `knownShare` counts learning words as known**, `data/library.ts`). Recompute stale stats: older than 7 days, or 50+ word-state changes since. Bands: above 98 % too easy · 90–98 % fits · 85–90 % a stretch · below 85 % hard. An unmeasured text says "not measured", never a guess | F0403, F1445, F1453 |
| Today's session | `core/adapt/session.ts`. The learner picks minutes (5, 10, 20 or 30), and gets ordered blocks: reviews at their own pace (seconds per review from `reviewLogs`), a reading chunk at their speed (from `sessions`), one practice set, writing. Every block skippable | F1008, F1444, F1456, F1037, F0972 |
| Review from the record | Due cards, then weak spots, then mix-ups, as one session. Mastered material is skipped: known words, mature cards, topics above 90 % | F0577, F0908, F1010 |
| Mistakes become exercises | A wrong evidence row with `given` and `expected` becomes `correctMistake` (grammar) or a cloze or typed item (a word); Practice gets *From your mistakes* | F0670, F0980, F0263 (Notes topics only) |
| Difficulty ladder | Rolling accuracy per exercise kind over the last 30 answers, aiming at 75–85 %. Above it, move up (recognise → recall → produce); below it, move down. Ludus setup defaults follow, with the reason shown | F0504, F0948, F0969, F1441, F1603 |
| Next words | Unknown words in the current book's next chapters by frequency, then the frequency list | F1442 |
| Coming back | A gap of more than 3 days → a catch-up plan: reviews capped, the most-forgotten first, no guilt in the wording | F1464 |
| Confidence | From hint use (`assisted`), self-ratings, and Again/Hard rates. A suggestion only ("try it without the hint"), **never a score** | F1463 |
| Balance | `skillBalance`: when reading far outweighs writing, or recognition outweighs production, suggest the other | F1462 |
| Stalled | Known-word growth and accuracy flat over 14 and 28 days → another way (easier texts, sentence cards, writing) | F1469 |
| Goals | A book goal: finish X by a date, giving pages a day. A trip goal (`GoalKind 'travel'`): a date and a region, giving phrase and theme decks and that variety in Regions ([REGIONS.md](REGIONS.md)). Behind or ahead → suggest an adjustment | F1470, F1006, F1172 |
| Examples | Example sentences with the most known words and the learner's themes. Notes on cognates and false friends from the languages they speak (`LanguageProfile.native` and `.spoken`), with the dictionary's `cog` and `data/contrastNotes.ts` | F1451, F1450 |
| Prerequisites | Letters before reading (exists); a Notes topic's prerequisites (`core/grammar/prerequisites.ts`) | F1011 |
| Umbrella | Ticked only when every other entry is done | F1610 |
| **Lingua only** | F0282 a grammar curriculum · F0283 hardest topics (Lemora: only a hint inside Notes) · F0838 an immersion plan · F0954 homework after lessons · F1446 listening speed · F1447 conversation complexity · F1449 pronunciation drills | `handed-to-Lingua` in the ledger |

- **Surfaces:**
  - Home's What next (`src/app/home/LemoraHome.tsx`, Lemora's own)
  - Explora's *For you* shelf
  - Practice's *Made for you* group
  - Settings › Learning (adaptation on/off, pace)
- **Never** a proficiency claim: estimates are ranges, said as estimates.
- **Tests:** each rule is a pure function, tested with fixtures.
- **Done when:** the row's criterion holds. Each suggestion explains why, can be dismissed and overridden, avoids
  mastered material and keeps the learner's choice.

## L1.1-11 · Reading and writing paths, diagnostics (Any, after 10)

- **11.0 Which IDs:** list the 6-14 and 6-18 IDs that are about reading or writing in [LEDGER.md](LEDGER.md); the rest
  are `handed-to-Lingua`.
- **11.1 Reading paths:** `core/reading/paths.ts` makes an ordered list of texts (short or long; story, topic or
  interest) from the library and the graded texts, by fit band.
  - Stored with the existing reading-project data (`data/readingProject.ts`) where possible, otherwise in a `settings`
    key `paths`.
  - Recaps come from comprehension; the existing bookmarks and history are reused.
- **11.2 Writing paths:** Diarium tasks (`core/journal/tasks.ts`) sequenced by level and topic. Rubric feedback comes
  from `core/journal/feedback.ts` and `measures.ts`, with the rubric shown.
- **11.3 Diagnostics:**
  - **Vocabulary size:** sample frequency bands with yes/no answers, corrected for guessing with non-words that are
    checked to be absent from the dictionary.
  - **Reading:** graded texts plus comprehension.
  - **Writing:** a sample marked against the rubric.
  - Every result is a range ("likely A2–B1").
- **The gate:** course builders, a curriculum, dedicated exams, timed mocks and exam preparation are written into
  DECISIONS as waiting candidates and **not built**.
