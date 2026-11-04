# Lemora 1.1 · Reading, words, writing and the language behind them

**Planned 2026-11-04 at the user's request. Status: WAITING / NOT STARTED.** This is a plan, not an implementation claim. Do not start its steps until the user explicitly resumes Lemora 1.1. Existing Lemora 1 / Phase U work stays in [LEMORA-PLAN.md](LEMORA-PLAN.md); this document does not cancel an already authorised Phase U session or mark its unfinished work done.

Lemora 1.1 gathers everything relevant from Lingua 5, 6 and 7, including **Atlas (6-29), the deep language tools (6-23), Slang & Dialects and all relevant 6-26 experiments**. It preserves the original scope, feature IDs, source/review gates and acceptance criteria. Existing implementations must be checked before building replacements. Completed historical rows remain historical evidence, not a fresh certification of Lemora.

## 1. Sources and boundaries

Read [the extraction audit](EXTRACTION-AUDIT.md), [reintegration](LINGUA-REINTEGRATION.md), [Lingua 6](LINGUA-6-PLAN.md), [its feature audit](LINGUA-6-FEATURES.md), [6-23](LINGUA-6-23-PLAN.md), [its data audit](6-23-DATA.md), [Atlas](WORD-GRAPH-PLAN.md), [Lingua 7](LINGUA-7-PLAN.md) and the handbook. The copied Lingua documents are provenance; this plan and Lemora's product decisions govern implementation here. At resumption compare them with current Lingua and its new [waiting 6.1 plan](https://github.com/sanchour/lingua./blob/main/docs/LINGUA-6.1-PLAN.md), including unmerged branch work. Never overwrite newer work in either app.

Lemora keeps reading, words, decks, dictionary, phrases, Ludus, writing, alphabet, Atlas, reading discovery, progress and settings. Its Home, navigation, onboarding and responsive behaviour remain Lemora's own. Excluded rooms are not silently reintroduced. A feature needing one receives an explicit placement or a waiting product decision below; nothing disappears from the original Lingua backlog.

Version line when implementation is explicitly resumed: `0.1.1-alpha.N` (Lemora 1.1), release `0.1.1` only after acceptance. This planning checkpoint does not release 1.1.

## 2. Queue and acceptance

Every row is **waiting, unclaimed**. Sequence is a dependency guide for a later authorised session, not permission to start now.

| ID | Work and inherited scope | Complete only when |
|---|---|---|
| L1.1-01 | Baseline and provenance: reconcile Lemora 1/Phase U, inherited Reading/Writing, games, dictionary, cards, exercises, tutor, goals, phrases, import/export and storage with actual reachable code. Carry unresolved Part A limitations, real-provider checks, cost disclosure before long AI jobs and evidence/analytics gaps. | Each inherited capability has a source commit, reachable Lemora route, existing check or explicit remaining task. No fake progress, copied completion claim or duplicate implementation. |
| L1.1-02 | Atlas G5: full rail/lenses, saved views, lasso/selection, context actions, user links/pins, clusters, grammar/topic/mistake connections and lists leading to practice/inbox/deck previews. Include synonym/antonym/semantic-field maps still open in the audit. | Every G5 action works, views survive reload, links can be undone; all relevant original audit entries verified. Lemora's U7 layout is preserved or deliberately reconciled. |
| L1.1-03 | Atlas G6/G7: time slider/Play, first-met history fix, cross-language bridges; glyphs, washes, palettes, reduced motion, keyboard, list alternative and screen-reader descriptions. | Original 5,000/10,000-word profiles, first frame under 300 ms and 60 fps interaction at 1366×768 in Chrome/Safari checked; no drawing at rest; responsive access checked; handbook/docs and all 20 graph entries reconciled. |
| L1.1-04 | 6-23 A1/A2: complete Unicode reference/offline acceptance, named transliteration schemes and per-surface/position/reveal/fading controls in reader, cards, dictionary and alphabet. | Preserve T0 and partial A1/A2 work (including Russian/Greek named schemes); finish remaining languages and controls with standard-derived golden tests and real offline/browser evidence. No reset to “nothing built”. |
| L1.1-05 | 6-23 A3/A4: phrase-aware Chinese OpenCC variants, Serbian/kana/Hangul conversions and conditional sourced forward romanisation; dictionary-generated accents/diacritics, ligatures, cursive and spelling drills. | Original conversion and dictionary-wide checks pass; converted reading still supports lookups; exercises reachable in Alphabet/Practice. Conditional Kazakh/Mongolian work retains its source and ambiguity gates. |
| L1.1-06 | 6-23 B: expanded hanzi/kanji/kana strokes, radicals/components, handwriting feedback; kanji word-reading alignment, hanja families; tones, confusables, unknown-character annotations, traditional/simplified and kana-to-kanji exercises. | Original B1–B8 data coverage, licensing, measured handwriting/reading thresholds and acceptance criteria met; pronunciation activities have an explicit Alphabet/Practice placement without restoring a whole Sounds room. |
| L1.1-07 | 6-23 C/D/E/F: Russian stress/aspect/motion/forms; Romance clitics/accents/prepositions/regions; Japanese/Korean politeness, counters, particles; Arabic vowels/spelling/roots/patterns/dialects/registers. Put reading/dictionary support in context and drills in Practice/Alphabet; use sourced reference panels for teaching. | Every relevant language-tool feature has equivalent teaching and practice depth, sourced tables and data-generated exercises, original numerical targets and review gates; no reduced MCQ substitute. Full Grammatica/course navigation requires a separate product decision. |
| L1.1-08 | 6-23 G: shared exercise registration/evidence, report-a-mistake, review files for every hand-written line, golden/property/data tests; source/licence/size/offline documentation. | Original deep-plan review and quality criteria met, including RTL, non-Latin text and declared native-review limitations. Data remains lazy/sharded within the corrected 40 MB compressed budget. |
| L1.1-09 | Slang & Dialects: a full sourced plan then implementation for the six core languages; visual regional map/subregions, comparative slang lexicon, dialect guides, phonology/intonation/rhythm and colloquial usage, recognition/practice and regional audio where licensed recordings exist. | Strong-model planning gate from the original idea honoured before implementation. Spanish regional/subregional examples, Mandarin varieties, French varieties and German/Italian/Russian scope preserved; distinguish languages/varieties accurately. Sources, respectful labels, native review and real audio coverage stated. Reuse 6-23 D4/F4 and Atlas rather than duplicate lexicons. |
| L1.1-10 | 6-16 adaptation: recommendations from reading performance/known-word coverage (90–98%), reviews and vocabulary/exercise difficulty from accuracy, mistakes, confidence and inactivity; time-aware daily sessions, interest/language-aware examples, follow-up exercises, catch-up and book/trip goals, balance recognition and production. | Build on U1–U3's level chooser; each suggestion explains why, can be dismissed/overridden, avoids mastered material and preserves learner choice. No unsupported proficiency or certainty claim. |
| L1.1-11 | Reading/writing learning paths from 6-14/18: optional short/long, story/text/topic/interest-based reading and writing practice, recaps/bookmarks/history, personal goal or syllabus/textbook-derived plans; vocabulary/reading/writing diagnostics and transparent estimates/rubric feedback. | Existing comprehension/tasks reused. Product decision recorded before introducing course builders, a curriculum, dedicated exams, timed mocks or exam-specific preparation; these remain waiting candidates rather than silently restoring Cursus. |
| L1.1-12 | Relevant 6-26 experiments: every candidate in section 4 below gets a short proposal, then a Lab prototype only after explicit authorisation. | Candidate status is explicit; known existing interactive stories, graph or image exercises are reused. No experimental feature is promised accurate or marked complete from a prototype. |
| L1.1-13 | Sharing/mobile candidates from 6-27: deck/resource/reading-list/plan files, clone/edit, progress cards; reading clubs, writing peer correction, shared challenges; native/share-sheet/widget/offline mobile possibilities. | Local file sharing checked first. Community/accounts/cloud/native apps require explicit product decisions and their operational/safety work; not assumed built or approved by this plan. |
| L1.1-14 | Lingua 7 overlap and Lemora design: finish/reconcile U8–U14 and prior onboarding/redesign work; reader/word drawer, phrases, dictionary, Atlas, Ludus, Diarium, Ratio, Settings and shared empty/loading/error/dialog/toast states. | Lemora's latest room-specific brief governs; responsive/touch requirements checked alongside desktop. Do not apply conflicting Lingua onboarding removals or remove real analytics to make Ratio minimal. |
| L1.1-15 | Functional, UX, performance, accessibility, privacy, licences and reintegration audit; real imports/exports/backup/restore, offline, dictionary, editing/Undo, audio aids, language switch and truthful statistics. | Original 4.1–4.6 and 5.1–5.2 gates reconciled; tests/build and desktop/theme/phone/RTL keyboard checks pass; real-provider/native/external checks evidenced or individually disclosed. No release with an unresolved data-loss defect. |
| L1.1-16 | Final coverage and release review. | Every included source requirement mapped and checked; waiting decisions remain visibly waiting with reasons; user's release approval obtained. A checked `[shared]` handoff inventory is ready for Lingua, without merging it automatically. |

## 3. Every Lingua 6 step accounted for

| Original step | Lemora 1.1 disposition |
|---|---|
| 6-0–6-6, including all b/c rows | Inherited foundations; L1.1-01 verifies reachable behaviour, remaining limits, AI/cost checks and data compatibility. |
| 6-7 Grammar | Contextual references, word explanations and applicable drills in L1.1-07/11; full grammar room stays in Lingua. |
| 6-8 Reading | Inherited completion checked by L1.1-01/15; continued reading improvements go through L1.1-10/12/14. |
| 6-9 Listening | Audio supporting words, reader and drills is retained/verified; media library, radio, podcast, video/subtitle and speaker/accent recording backlog stays in Lingua 6.1. |
| 6-10 Pronunciation | Alphabet/script sounds, tone/stress and applicable character practice included in L1.1-06/07; full pronunciation lab/coaching is a candidate in section 4, not an implicit restored room. |
| 6-11 Speaking | Writing/prompt helpers may be reused; Sermo, conversation simulation and live speaking features stay in Lingua. |
| 6-12 Writing | Inherited Diarium/tasks/corrections/drafts verified and refined under L1.1-01/14/15. |
| 6-13 Translation/contrast | Existing translation practice and comparison relevant to reading/words/writing retained and checked; language-tool links under L1.1-07. |
| 6-14 Courses | Relevant text/task learning paths under L1.1-11; full course/curriculum decision stays waiting. |
| 6-15 Tutor | Contextual Ask and settings already inherited; verify reachable contexts, privacy and real-provider behaviour. |
| 6-16 Adaptive | L1.1-10; audio/conversation-only adaptation stays with excluded rooms. |
| 6-17 Goals/progress | Inherited; verify attribution and genuine figures, per-tool goals and U14 Ratio. |
| 6-18 Exams | Relevant diagnostics/feedback candidates under L1.1-11; dedicated exams/certification preparation waits for a product decision. |
| 6-19 Culture/interface | Word/reference culture helpers and offline interface translations verified; regional material under L1.1-09. Culture/Mundus rooms are not restored. |
| 6-20 Phrases/notebook | Phrases/templates relevant and included; notebook-derived helpers may be reused, standalone Notebook room remains excluded. |
| 6-21 Games/projects | Inherited Ludus and reading/writing projects verified; no duplicate build solely from an older open row. |
| 6-22 Dictionary | Inherited search/custom dictionaries verified; richer language metadata under L1.1-07/09. |
| 6-23 Language tools | L1.1-04–08, full relevant depth and original criteria retained. |
| 6-24 Import/export | Relevant files, personal dictionaries, Anki/Quizlet/Goodreads and error-log exports verified. Browser-extension text import F1486 is a waiting integration candidate; no streaming extension scope. |
| 6-25 Accessibility/desktop | L1.1-15, plus Lemora's own responsive checks and product-scoped storage. |
| 6-26 Experiments | All relevant candidates explicitly listed below. |
| 6-27 Community/beyond desk | L1.1-13 decision queue; no accounts/community approval inferred. |
| 6-28 Final check | L1.1-16 is Lemora's own check; Lingua's release check remains waiting in Lingua 6.1. |
| 6-29 Word graph | L1.1-02/03, all original G5–G7 and open feature IDs preserved. |

The original audit also leaves Lingua 5 assignments open: F0391 (discuss a text with the contextual tutor) and F1465 (override recommendations) are verified under L1.1-01/10, alongside their existing implementations. F0193/F0265/F1448 belong to Lingua's grammar room; F0796/F0810/F1489/F1503 belong to its video/transcript/extension scope. They remain in Lingua 6.1, not lost because the old Lingua 5 release was ticked.

## 4. All relevant 6-26 experiments, preserved as candidates

All rows are **WAITING FOR PROPOSAL / NOT STARTED**. Source IDs are traceability, not a claim the entire entry belongs in a reading app.

| Candidate family | Source IDs and complete relevant scope |
|---|---|
| Literary/personal corpus analysis | F0398, F1558–F1562, F1583: imported-book linguistic profiles and difficulty curves, compare authors/works, personal written-output corpus, historical usage and language-evolution exploration. Spoken-output corpus only if separately chosen. |
| Word and language maps | F1269, F1554–F1557, F1563, F1575, F1587–F1588: origin/meaning/grammar/morphology/dialect maps, cross-language families and transfer, personal multilingual knowledge graph and a tutor aware of it. Coordinate Atlas and 6-23. |
| Interactive reading/writing | F1551, F1574, F1576: interactive novels, multilingual journaling, printable personal textbook from learner words/texts. Preserve any existing branching-story implementation. |
| Images and contextual vocabulary | F1570–F1573: sign/menu OCR as reading import, image vocabulary, optional object labelling and contextual phrases. Camera permissions/on-device privacy and a meaningful reading flow required. |
| Learning research and maintenance | F1467–F1468, F1581–F1582, F1584–F1585: compare learning/recall methods, personal research dashboard, language-maintenance and heritage-language paths. Describe evidence limits; do not infer causal results from ordinary activity. |
| Reading/audio aids | F1578: level-adapted audiobooks only if Lemora explicitly chooses to add them; unknown-word-only annotations/subtitles may inform a reader aid, while actual subtitle playback stays excluded. |
| Alphabet-adjacent Lab | F1564–F1565: waveform/spectrogram and AI pronunciation coaching only if approved for script learning; not a required standalone pronunciation room. |

F0491, F1552–F1553, F1566–F1569 and F1577 (native/synthetic voice game, persistent chat characters, roleplay worlds, live conversation help, simulated environments, speech adventures and audio dramas) stay recorded in Lingua 6.1. They do not enter Lemora without a later expansion decision. No original experiment is deleted from Lingua.

## 5. Shared work and return to Lingua

Use `[shared]` for reusable code and `[lemora]` for product/navigation/onboarding/branding/docs; keep commits separate and shared paths stable. No whole-repository merge across the products. Lingua later imports selected checked commits with provenance and adapts product seams, keeping its full room set and desktop rules. Lemora's branding, database/cache prefix and responsive product layer never replace Lingua's.

The current no-new-Dexie-version rule remains. If deeper tools require new persisted structures, stop that schema portion for a coordinated schema decision; do not invent a version, drop tables or silently remove scope. Prefer existing settings/tables where appropriate. Test backup compatibility and same-origin reset isolation in both apps before any integration claim.

A source/commit/feature-ID ledger must distinguish: inherited and verified; implemented in Lemora; still waiting; handed to Lingua; verified in Lingua. A passing Lemora check does not certify Lingua. Reintegration feasibility, real providers, native review and external applications require actual evidence. This plan authorises no merge, release, purchase or account setup.
