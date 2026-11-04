# Lemora 1.1 · Reading, words, writing and the language behind them

**Planned 2026-11-04 at the user's request. Status: WAITING / NOT STARTED.** This is a plan, not an implementation claim. Do not start its steps until the user explicitly resumes Lemora 1.1. Existing Lemora 1 / Phase U work stays in [LEMORA-PLAN.md](LEMORA-PLAN.md); this document does not cancel an already authorised Phase U session or mark its unfinished work done.

Lemora 1.1 gathers everything relevant from Lingua 5, 6 and 7, including **Atlas (6-29), the deep language tools (6-23), Slang & Dialects and all relevant 6-26 experiments**. It preserves the original scope, feature IDs, source/review gates and acceptance criteria. Existing implementations must be checked before building replacements. Completed historical rows remain historical evidence, not a fresh certification of Lemora.

**Planned in depth, 2026-11-04 (Opus 5.5, at the user's request: "so weaker models could even implement it").**
Every row below is broken into numbered pushes with files, data shapes, tests and checks. The detail lives in
[`docs/1.1/`](1.1/):
- [CONVENTIONS.md](1.1/CONVENTIONS.md): what exists already, and the rules every push follows. **Read it first.**
- [LEDGER.md](1.1/LEDGER.md): every feature ID and its status.
- One spec per area:
  - [ATLAS.md](1.1/ATLAS.md) (02, 03)
  - [LANGUAGE-ROOM.md](1.1/LANGUAGE-ROOM.md) (04–08)
  - [REGIONS.md](1.1/REGIONS.md) (09)
  - [ADAPTIVE.md](1.1/ADAPTIVE.md) (10, 11)
  - [EXPERIMENTS.md](1.1/EXPERIMENTS.md) (12)
  - [SHARING.md](1.1/SHARING.md) (13)
  - [FINISH.md](1.1/FINISH.md) (14–16)

The in-depth planning changes no scope: the original sections 1, 3, 4 and 5 are kept word for word as appendices A to
D, and each row's own text is unchanged.

## 1. Decisions (the user, 2026-11-04)

Asked while planning in depth; recorded in [DECISIONS.md](DECISIONS.md).

1. **One language room for every language.** Alphabet grows into a room for every language, with tabs: *Letters*
   (non-Latin scripts only), *Sounds*, *Marks*, *Notes* and *Regions*. The route stays `/cursus/alphabets`. It replaces
   step 3.15's "Alphabet only for non-Latin".
   - **The room's name is not decided:** the plan proposes *Glossa*, pending the user (push 04.1 asks).
   - The deep language tools' teaching (6-23 C–F) shows in *Notes*, written in the shared `core/grammar/topics/` so
     Lingua's Grammatica can use the same content.
2. **Slang & Dialects is the *Regions* tab** of that room, not a room of its own.
3. **Sub-regional varieties with no open data** (Paisa, Caleño, Costeño and similar) are written by hand from cited
   sources, kept in review files, and shown with an **"unreviewed"** badge until a native speaker checks them.
4. **Desktop only for 1.1.** New 1.1 features are designed and checked at 1280, 1440 and 1366×768, in Paper and
   Nocturne. No phone or touch checks for 1.1, and existing responsive code stays as it is. Where a row below says
   "responsive", "touch" or "phone", read it as desktop.

Version line when implementation is explicitly resumed: `0.1.1-alpha.N` (Lemora 1.1; the first push uses
`node scripts/version.ts --line 0.1.1 "…"`), release `0.1.1` only after acceptance. Planning checkpoints are not 1.1
releases.

## 2. Queue and acceptance

Every row is **waiting, unclaimed**. Sequence is a dependency guide for a later authorised session, not permission to start now. To claim a push, write its number, the model and the date in *Claimed*.

| ID | Work and inherited scope | Complete only when | Pushes (spec) | Claimed |
|---|---|---|---|---|
| L1.1-01 | Baseline and provenance: reconcile Lemora 1/Phase U, inherited Reading/Writing, games, dictionary, cards, exercises, tutor, goals, phrases, import/export and storage with actual reachable code. Carry unresolved Part A limitations, real-provider checks, cost disclosure before long AI jobs and evidence/analytics gaps. | Each inherited capability has a source commit, reachable Lemora route, existing check or explicit remaining task. No fake progress, copied completion claim or duplicate implementation. | 01.1 ledger · 01.2 reachability · 01.3 inherited capabilities · 01.4 carried limits · 01.5 Lingua branches ([CONVENTIONS](1.1/CONVENTIONS.md), [LEDGER](1.1/LEDGER.md)) | |
| L1.1-02 | Atlas G5: full rail/lenses, saved views, lasso/selection, context actions, user links/pins, clusters, grammar/topic/mistake connections and lists leading to practice/inbox/deck previews. Include synonym/antonym/semantic-field maps still open in the audit. | Every G5 action works, views survive reload, links can be undone; all relevant original audit entries verified. Lemora's U7 layout is preserved or deliberately reconciled. | 02.1 lens engine · 02.2 rail · 02.3 saved views · 02.4 lasso · 02.5 menu · 02.6 links · 02.7 pins · 02.8 clusters · 02.9 lists · 02.10 meaning maps ([ATLAS](1.1/ATLAS.md)) | |
| L1.1-03 | Atlas G6/G7: time slider/Play, first-met history fix, cross-language bridges; glyphs, washes, palettes, reduced motion, keyboard, list alternative and screen-reader descriptions. | Original 5,000/10,000-word profiles, first frame under 300 ms and 60 fps interaction at 1366×768 in Chrome/Safari checked; no drawing at rest; responsive access checked; handbook/docs and all 20 graph entries reconciled. | 03.1 first-met · 03.2 time · 03.3 bridges · 03.4 finish · 03.5 screen reader · 03.6 performance · 03.7 docs ([ATLAS](1.1/ATLAS.md)); "responsive" is desktop (decision 4) | |
| L1.1-04 | 6-23 A1/A2: complete Unicode reference/offline acceptance, named transliteration schemes and per-surface/position/reveal/fading controls in reader, cards, dictionary and alphabet. | Preserve T0 and partial A1/A2 work (including Russian/Greek named schemes); finish remaining languages and controls with standard-derived golden tests and real offline/browser evidence. No reset to “nothing built”. | **04.1 the language room** · 08.1 set registry (early) · 04.2 A1 offline · 04.3 schemes · 04.4 surfaces ([LANGUAGE-ROOM](1.1/LANGUAGE-ROOM.md)) | |
| L1.1-05 | 6-23 A3/A4: phrase-aware Chinese OpenCC variants, Serbian/kana/Hangul conversions and conditional sourced forward romanisation; dictionary-generated accents/diacritics, ligatures, cursive and spelling drills. | Original conversion and dictionary-wide checks pass; converted reading still supports lookups; exercises reachable in Alphabet/Practice. Conditional Kazakh/Mongolian work retains its source and ambiguity gates. | 05.1 OpenCC · 05.2 Serbian · 05.3 kana and Hangul · 05.4 A4 drills ([LANGUAGE-ROOM](1.1/LANGUAGE-ROOM.md)) | |
| L1.1-06 | 6-23 B: expanded hanzi/kanji/kana strokes, radicals/components, handwriting feedback; kanji word-reading alignment, hanja families; tones, confusables, unknown-character annotations, traditional/simplified and kana-to-kanji exercises. | Original B1–B8 data coverage, licensing, measured handwriting/reading thresholds and acceptance criteria met; pronunciation activities have an explicit Alphabet/Practice placement without restoring a whole Sounds room. | 06.1 B1 to 06.8 B8, one push each ([LANGUAGE-ROOM](1.1/LANGUAGE-ROOM.md)) | |
| L1.1-07 | 6-23 C/D/E/F: Russian stress/aspect/motion/forms; Romance clitics/accents/prepositions/regions; Japanese/Korean politeness, counters, particles; Arabic vowels/spelling/roots/patterns/dialects/registers. Put reading/dictionary support in context and drills in Practice/Alphabet; use sourced reference panels for teaching. | Every relevant language-tool feature has equivalent teaching and practice depth, sourced tables and data-generated exercises, original numerical targets and review gates; no reduced MCQ substitute. Full Grammatica/course navigation requires a separate product decision. | 07 C1–C5, D1–D3, E1–E3, F1–F3, one push each; teaching in Notes. D4 and F4/F5 are built in 09 ([LANGUAGE-ROOM](1.1/LANGUAGE-ROOM.md)) | |
| L1.1-08 | 6-23 G: shared exercise registration/evidence, report-a-mistake, review files for every hand-written line, golden/property/data tests; source/licence/size/offline documentation. | Original deep-plan review and quality criteria met, including RTL, non-Latin text and declared native-review limitations. Data remains lazy/sharded within the corrected 40 MB compressed budget. | 08.1 set registry · 08.2 report a mistake · 08.3 review files · 08.4 tests · 08.5 docs ([LANGUAGE-ROOM](1.1/LANGUAGE-ROOM.md)) | |
| L1.1-09 | Slang & Dialects: a full sourced plan then implementation for the six core languages; visual regional map/subregions, comparative slang lexicon, dialect guides, phonology/intonation/rhythm and colloquial usage, recognition/practice and regional audio where licensed recordings exist. | Strong-model planning gate from the original idea honoured before implementation. Spanish regional/subregional examples, Mandarin varieties, French varieties and German/Italian/Russian scope preserved; distinguish languages/varieties accurately. Sources, respectful labels, native review and real audio coverage stated. Reuse 6-23 D4/F4 and Atlas rather than duplicate lexicons. | The gate: [REGIONS](1.1/REGIONS.md), once the user approves it and subject to 09.0's findings. 09.0 data check · 09.1 builder · 09.2 geometry · 09.3 tab · 09.4 lexicon · 09.5 guides · 09.6 audio · 09.7 practice · 09.8 Atlas lens · 09.9 Arabic F4/F5, D4 pages | |
| L1.1-10 | 6-16 adaptation: recommendations from reading performance/known-word coverage (90–98%), reviews and vocabulary/exercise difficulty from accuracy, mistakes, confidence and inactivity; time-aware daily sessions, interest/language-aware examples, follow-up exercises, catch-up and book/trip goals, balance recognition and production. | Build on U1–U3's level chooser; each suggestion explains why, can be dismissed/overridden, avoids mastered material and preserves learner choice. No unsupported proficiency or certainty claim. | The engine, then one push per piece of its table ([ADAPTIVE](1.1/ADAPTIVE.md)) | |
| L1.1-11 | Reading/writing learning paths from 6-14/18: optional short/long, story/text/topic/interest-based reading and writing practice, recaps/bookmarks/history, personal goal or syllabus/textbook-derived plans; vocabulary/reading/writing diagnostics and transparent estimates/rubric feedback. | Existing comprehension/tasks reused. Product decision recorded before introducing course builders, a curriculum, dedicated exams, timed mocks or exam-specific preparation; these remain waiting candidates rather than silently restoring Cursus. | 11.0 IDs · 11.1 reading paths · 11.2 writing paths · 11.3 diagnostics ([ADAPTIVE](1.1/ADAPTIVE.md)) | |
| L1.1-12 | Relevant 6-26 experiments: every candidate in section 4 below gets a short proposal, then a Lab prototype only after explicit authorisation. | Candidate status is explicit; known existing interactive stories, graph or image exercises are reused. No experimental feature is promised accurate or marked complete from a prototype. | 12.0 proposals · 12.1 Lab switches, only once authorised ([EXPERIMENTS](1.1/EXPERIMENTS.md)); "section 4" is Appendix C | |
| L1.1-13 | Sharing/mobile candidates from 6-27: deck/resource/reading-list/plan files, clone/edit, progress cards; reading clubs, writing peer correction, shared challenges; native/share-sheet/widget/offline mobile possibilities. | Local file sharing checked first. Community/accounts/cloud/native apps require explicit product decisions and their operational/safety work; not assumed built or approved by this plan. | 13.1 share files · 13.2 progress card · 13.3 decision queue ([SHARING](1.1/SHARING.md)) | |
| L1.1-14 | Lingua 7 overlap and Lemora design: finish/reconcile U8–U14 and prior onboarding/redesign work; reader/word drawer, phrases, dictionary, Atlas, Ludus, Diarium, Ratio, Settings and shared empty/loading/error/dialog/toast states. | Lemora's latest room-specific brief governs; responsive/touch requirements checked alongside desktop. Do not apply conflicting Lingua onboarding removals or remove real analytics to make Ratio minimal. | Alongside every surface ([FINISH](1.1/FINISH.md)); "responsive/touch" is desktop (decision 4) | |
| L1.1-15 | Functional, UX, performance, accessibility, privacy, licences and reintegration audit; real imports/exports/backup/restore, offline, dictionary, editing/Undo, audio aids, language switch and truthful statistics. | Original 4.1–4.6 and 5.1–5.2 gates reconciled; tests/build and desktop/theme/phone/RTL keyboard checks pass; real-provider/native/external checks evidenced or individually disclosed. No release with an unresolved data-loss defect. | ([FINISH](1.1/FINISH.md)); "phone" is dropped (decision 4) | |
| L1.1-16 | Final coverage and release review. | Every included source requirement mapped and checked; waiting decisions remain visibly waiting with reasons; user's release approval obtained. A checked `[shared]` handoff inventory is ready for Lingua, without merging it automatically. | ([FINISH](1.1/FINISH.md)) | |

## 3. Order

```
01 baseline ─► 04.1 language room ─► 08.1 set registry ─┬─► 04–08 language tools, track by track
                                                        ├─► 09.0 region data check ─► 09.1–09.9 Regions
02 Atlas G5 ─► 03 Atlas G6/G7  (can start right after 01, beside the rest)
10 adaptation ─► 11 paths and diagnostics  (after 01 and 08.1)
12 proposals any time; prototypes only once authorised · 13 files first
14 design passes beside each surface ─► 15 audit ─► 16 release review
```

Pushes marked **Careful** in the specs (algorithms, layouts, recognisers, engines) need a strong model; **Any** pushes
suit a weaker model that follows the spec exactly ([CONVENTIONS.md](1.1/CONVENTIONS.md), rule 15).

---

## Appendix A · Sources and boundaries (the original section 1, unchanged)

Read [the extraction audit](EXTRACTION-AUDIT.md), [reintegration](LINGUA-REINTEGRATION.md), [Lingua 6](LINGUA-6-PLAN.md), [its feature audit](LINGUA-6-FEATURES.md), [6-23](LINGUA-6-23-PLAN.md), [its data audit](6-23-DATA.md), [Atlas](WORD-GRAPH-PLAN.md), [Lingua 7](LINGUA-7-PLAN.md) and the handbook. The copied Lingua documents are provenance; this plan and Lemora's product decisions govern implementation here. At resumption compare them with current Lingua and its new [waiting 6.1 plan](https://github.com/sanchour/lingua./blob/main/docs/LINGUA-6.1-PLAN.md), including unmerged branch work. Never overwrite newer work in either app.

Lemora keeps reading, words, decks, dictionary, phrases, Ludus, writing, alphabet, Atlas, reading discovery, progress and settings. Its Home, navigation, onboarding and responsive behaviour remain Lemora's own. Excluded rooms are not silently reintroduced. A feature needing one receives an explicit placement or a waiting product decision below; nothing disappears from the original Lingua backlog.

Version line when implementation is explicitly resumed: `0.1.1-alpha.N` (Lemora 1.1), release `0.1.1` only after acceptance. This planning checkpoint does not release 1.1.

## Appendix B · Every Lingua 6 step accounted for (the original section 3, unchanged)

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

## Appendix C · All relevant 6-26 experiments, preserved as candidates (the original section 4, unchanged)

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

## Appendix D · Shared work and return to Lingua (the original section 5, unchanged)

Use `[shared]` for reusable code and `[lemora]` for product/navigation/onboarding/branding/docs; keep commits separate and shared paths stable. No whole-repository merge across the products. Lingua later imports selected checked commits with provenance and adapts product seams, keeping its full room set and desktop rules. Lemora's branding, database/cache prefix and responsive product layer never replace Lingua's.

The current no-new-Dexie-version rule remains. If deeper tools require new persisted structures, stop that schema portion for a coordinated schema decision; do not invent a version, drop tables or silently remove scope. Prefer existing settings/tables where appropriate. Test backup compatibility and same-origin reset isolation in both apps before any integration claim.

A source/commit/feature-ID ledger must distinguish: inherited and verified; implemented in Lemora; still waiting; handed to Lingua; verified in Lingua. A passing Lemora check does not certify Lingua. Reintegration feasibility, real providers, native review and external applications require actual evidence. This plan authorises no merge, release, purchase or account setup.
