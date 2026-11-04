# Lemora · The plan and where it stands

**Next generation planned · 2026-11-04:** [Lemora 1.1](LEMORA-1.1-PLAN.md) gathers all relevant Lingua 6 work, including Atlas, deep 6-23 tools, Slang & Dialects, adaptive learning and relevant experiments, plus shared verification/design work from Lingua 5/7. **1.1 is WAITING / unclaimed; do not start it without explicit user resumption.** Existing Lemora 1 / Phase U work below keeps its own status and authorisation. No application implementation is performed by this planning checkpoint.

The brief is the user's "Project LEMORA" master prompt (2026-11-03). Its findings are in
[EXTRACTION-AUDIT.md](EXTRACTION-AUDIT.md). The way back to Lingua is in
[LINGUA-REINTEGRATION.md](LINGUA-REINTEGRATION.md). **A session continuing the work starts here:**
take the first step that isn't done, write its name and the date in *Claimed*, and tick it when it's
pushed and checked.

Every commit is tagged `[shared]` (a change to code both apps share, fit to go back to Lingua) or
`[lemora]` (Lemora only: product file, sections, Home, onboarding, branding, docs). Never mix the
two in one commit.

## Steps

| # | Step | Status | Claimed |
|---|------|--------|---------|
| 0.1 | Audit Lingua, Lemora and Lingua-Launch; write the extraction audit | ✅ | Opus 5.5, 2026-11-03 |
| 1.1 | Lemora's own database, storage keys, caches, dev port, name and manifest | ✅ | Opus 5.5, 2026-11-03 |
| 1.2 | Lemora's CLAUDE.md, README and this plan; first push to `sanchour/lemora`; GitHub Pages on | ✅ | Opus 5.5, 2026-11-03 |
| 1.3 | Lemora's icon: the wordmark's l as a bookmark and its full stop, light and dark; the favicon follows the system | ✅ | Opus 5.5, 2026-11-03 |
| 2.1 | Sections and routes: `ROOMS` and `shows()` in the product file, sidebar, router, page chunks, global search | ✅ | Opus 5.5, 2026-11-03 |
| 2.2 | Explore reading-only; Library without audio and video; no dead links | ✅ | Opus 5.5, 2026-11-03 |
| 2.3 | Mentis room → Diarium + Things to Try; tips filtered to Lemora's activities | ✅ | Opus 5.5, 2026-11-03 |
| 2.4 | Alphabet on its own (Cursus tab alone); Ratio without Tabula or excluded panels | ✅ | Opus 5.5, 2026-11-03 |
| 2.5 | Settings without Listening and Music; Lemora+ naming checked | ✅ | Opus 5.5, 2026-11-03 |
| 2.6 | Delete what nothing reachable imports any more; bundle size before and after | ✅ | Opus 5.5, 2026-11-04: 155 files, precache -22 KiB, player lazy |
| 3.1 | Home: Lingua's right-rail Home made for Lemora by default (circle tools, Time today open on the page, Tools on the greeting's line); the desk layout as a choice in Settings. Lemora's own, **redesigned** (greeting, tools 2-up with per-tool progress, overall time, continue reading, recent, next actions); fixed sidebar with the tools always visible | ✅ | Opus 5.5, 2026-11-03 |
| 3.2 | Showcase → Lingua-Launch (rewritten in plain HTML and JS, checked there), then out of Lemora's onboarding | ✅ | Opus 5.5, 2026-11-04 (live demo now in Lingua-Launch, `d407991`) |
| 3.3 | Onboarding map: frame each language from country geometry; multi-region languages get a primary focus plus alternatives | ✅ | Opus 5.5, 2026-11-04 |
| 3.4 | Level step: title → slider → content sequence (reduced motion respected); hover, click, multi-word and long-press translation of the example sentence from local data | ✅ | Opus 5.5, 2026-11-04 |
| 3.5 | Known words from the same `starterLists` lemmas as the frequency decks; tests | ✅ | Opus 5.5, 2026-11-04 |
| 3.6 | Languages you speak: any living language (Intl.DisplayNames + Lingua's data), honest flags, suggestions only after typing, at most two, never over Continue | ✅ | Opus 5.5, 2026-11-04 |
| 3.7 | No horizontal overflow on any page (causes fixed); no stray scroll bars or edge controls | ✅ | Opus 5.5, 2026-11-04 |
| 3.8 | Per-tool daily goals (Codex, Thesaurus, Ludus, Diarium, Alphabet), one attribution rule, persisted, tested | ✅ | Opus 5.5, 2026-11-03 |
| 3.9 | **Redesign: Thesaurus, every tab** (a new layout and look; big changes welcome) | ✅ | Opus 5.5, 2026-11-04 (Phase U) |
| 3.10 | **Redesign: Ludus** | ✅ | Opus 5.5, 2026-11-04 (Phase U) |
| 3.11 | **Redesign: Diarium** | ✅ | Opus 5.5, 2026-11-04 (Phase U) |
| 3.12 | **Redesign: Ratio**, with only real numbers (Overview's monthly report feeds made-up "accuracy" figures and stamps today) | ✅ | Opus 5.5, 2026-11-04 |
| 3.13 | **Redesign: Settings** | ✅ | Opus 5.5, 2026-11-04 (Phase U) |
| 3.14 | Things to try redrawn and moved into Explora (out of the sidebar) | ✅ | Opus 5.5, 2026-11-03 |
| 3.15 | Alphabet (with Sounds) only for languages not written in Latin script | ✅ | Opus 5.5, 2026-11-03 |
| 3.16 | Explora's rotating hero in the bookish look, not a streaming billboard | ✅ | Opus 5.5, 2026-11-03 |
| 3.17 | Word decks: a better layout and design (Explora › Word decks, the starter library) | ✅ | Opus 5.5, 2026-11-03 |
| 3.18 | Bibliotheca: a better layout | ✅ | Opus 5.5, 2026-11-04 (Phase U) |
| 3.19 | Thesaurus's Discover moves to Explora entirely; a Discover icon at Thesaurus's top right | ✅ | Opus 5.5, 2026-11-03 |
| 3.20 | Hand-drawn touches where they fit, still clean (src/design/drawings.tsx: the handbook's icons and empty-page art) | ✅ | Opus 5.5, 2026-11-04 |
| 4.1 | Functional audit of every page (imports, files, lookups, saving, flashcards, Ludus, Diarium, language switch, backup and restore, offline, errors) | ✅ | Opus 5.5, 2026-11-04: 30 routes, no page errors; reader click keeps a word; interface language switches; live app loads offline |
| 4.2 | UX pass: spacing, type, focus, empty, loading and error states | ⬜ | |
| 4.3 | Performance: bundle, lazy routes, rerenders, reader | ◐ | first load 1,768 → 593 KB JS (catalogues lazy); reader rerenders not profiled |
| 4.4 | Accessibility: keyboard, labels, contrast, touch targets, reduced motion | ◐ | 30 routes: one h1 each, no unnamed controls, alt, labels or duplicate ids; one slider labelled; contrast and keyboard order not re-audited |
| 4.5 | Privacy and security: API keys, imported files, exports | ✅ | Opus 5.5, 2026-11-04: no keys in URLs or default exports, links carry rel, one local innerHTML |
| 4.6 | Licences: every bundled dataset and font listed with its attribution in Settings › About and `docs/LICENCES.md` | ✅ | Opus 5.5, 2026-11-04: docs/LICENCES.md, Settings › About |
| 5.1 | Module boundaries of Codex and Thesaurus reviewed; reintegration document final | ⬜ | |
| 5.2 | Feasibility check: cherry-pick a `[shared]` commit onto a throwaway clone of Lingua, typecheck and test it (never pushed) | ⬜ | |
| 6.1 | Completion report | ⬜ | |

Ratio (3.12) must feel minimal while keeping every number, chart and feature it has (the user, 2026-11-03).

The redesigns (3.1 and 3.9 to 3.13) are the user's addition of 2026-11-03: "improve and create a new
layout and aesthetic … for settings, ratio, home, thesaurus all tabs … diarium and ludus too … be creative and
not afraid to make big changes, only these". Only those six rooms are redesigned. The look stays Lemora's
(bookish, warm, calm, the handbook's type and colour); the layouts may change a lot. Shared rooms (Thesaurus,
Ludus, Diarium, Ratio, Settings) are redesigned in their shared files as `[shared]` commits, with no Lemora
branding in them, so Lingua can take them later or leave them.

## Phase U · The user's list of 2026-11-04

The user's second brief, by room. Steps are built in this order, each pushed with its own version; "◐" means part built.
Ratio's layout (3.12) and the redesigns already listed (3.9 to 3.13, 3.18) fold into the matching U step.

| # | Step | Status |
|---|------|--------|
| U1 | **Flow by level.** From the first open, recommendations fit the learner's level: at A0 the easiest child's book with few words and small, unoverwhelming starter decks first; higher levels get their own. Home's What next and Explora's picks share one level-aware chooser (tested) | ✅ |
| U2 | **Onboarding.** No Sonus et Visio step. For a language not written in Latin letters, a page of its own, minimal: can you read its alphabet? (Yes / A little / Not yet); the answer steers the first recommendations (Alphabet first when not yet) | ✅ |
| U3 | **Home.** What next redrawn (hand-drawn, less "AI"), chosen by level and recent activity; Discover more cards larger; a Settings toggle to show or hide Tools on Home; Time today and Where you left off kept and polished; the Ask button a Settings option, and "explain a reference" and the other helpers as choices inside the Ask sidebar | ✅ |
| U4 | **Explora.** Tabs: All · Books (opens on today's See all, with working filter and sort) · Articles (news, articles, Wikipedia) · Comics and magazines (new, only free, legal, commercially usable sources) · Word decks · Ludus · Things to try. The hero holds 7, upright book covers (not tilted), chosen by level, mixing books, comics, articles, things to try and Goodreads-imported books. No subtitles under cards. Level and filter as round icons beside the title icon; a Library icon left of Search | ✅ |
| U5 | **Bibliotheca.** An empty "add" placeholder at the end of every section; Explora as a round hand-drawn icon; no icon over a card on hover; Add shows Codex and Thesaurus first, then that room's options | ✅ |
| U6 | **Codex.** Continue reading sits better under the header and says what each item is (book, comic, news…) | ✅ |
| U7 | **Atlas.** Opens full screen: the map fills the room, Loose threads in a spaced column at the right, the views as a minimal slider at the top, a search icon that opens into a field, − and + at the bottom left | ✅ |
| U8 | **Settings: read with the deck first.** An option to study a book's word deck before reading it | ✅ |
| U9 | **Thesaurus › My decks.** Minimal and compact, no background colour, decks in a list down the right; the old design as a Settings toggle; books back in the deck format; Today first, with Anki-like figures and a minimal week of what's due; Today's actions (Ludus, review, lightning, sentences) as icons with a small pop-up name; a clearer list (today, last studied, deck). One new non-AI, hand-drawn card design shared by Explora, Bibliotheca and Thesaurus | ✅ |
| U10 | **Thesaurus › Dictionary.** Search bar with icon buttons on its right for a custom entry and importing a personal dictionary (a click says what each is); My words becomes Words, its own tab; looking up a word takes the full page | ✅ |
| U11 | **Thesaurus › Phrases.** The same principles | ✅ |
| U12 | **Diarium.** A minimal overhaul with two tabs, Journal and Writing tasks; the "A few sentences a day is plenty…" lines gone; the day's question centred in a beautiful face, fitted to the level, translated on hover instead of an English line under it; while writing, the helpers (describe a picture, compare drafts, simpler wording…) as small hand-drawn icons under one icon at the top right | ✅ |
| U13 | **Things to try.** A fixed page that fits the screen (no sideways swipe), in the new minimal design, with every feature kept | ✅ |
| U14 | **Full redesigns: Ludus and Settings** (3.10, 3.13), then Ratio's layout (3.12: a summary always in view, one chapter at a time) | ✅ |
| U15 | **Earlier designs, page by page** (the user, 2026-11-04): Settings › Appearance › Earlier designs, one switch per redesigned page (Home, Explora, Bibliotheca, Codex, Atlas, My decks, Dictionary, Phrases, Diarium, Things to try, Ludus, Settings, Ratio), each bringing that page's previous look back | Skipped (the user, 2026-11-04); My decks keeps its earlier-design switch from U9 |

## Lemora's website: `lemora-site` (the user, 2026-11-03)

"A super duper, aesthetic, minimal, cute, visually impressive website, full of hand-drawn icons and elements, with a
few of the demonstrations", in a new private GitHub repository, `sanchour/lemora-site` (local folder `../lemora-site`).

**Shape.** One static page, no build step and no framework (plain HTML, CSS and a little JavaScript), so it opens
from the folder and can be hosted anywhere. Literata and Plus Jakarta Sans as in the app; Paper by day and Nocturne
at night (`prefers-color-scheme`), the same tokens. Hand-drawn throughout: the handbook's icons and empty-page art,
pen-stroke underlines, dashed roads, small doodles in the margins; one terracotta thing per area. Motion only as
transform and opacity, things rising into place as they scroll in, none at all with reduced motion. Phone to wide
desktop with no horizontal scrolling.

**Sections, top to bottom.**

| # | Section | What it shows |
|---|---------|---------------|
| W1 | Hero | The bookmark mark dropping onto its line, "lemora." with its full stop, one sentence of what it is, *Open Lemora* (the live app) and *See it read* |
| W2 | Demo: read | A short Spanish passage. Hover or tap a word for its meaning; click to cycle Unseen → Learning → Known, coloured as in Codex; words you mark gather in a little jar |
| W3 | Demo: remember | The words from W2 as flashcards that flip (Thesaurus), with *Again* and *Good*; each card remembers the sentence it came from |
| W4 | Demo: write | A Diarium line corrected in front of you: the word diff draws itself (crossed out, written in), with the reason beside it |
| W5 | Demo: a new alphabet | Cyrillic letters as tiles that turn over to their sound and a word (Alphabet) |
| W6 | Things to try | A row of hand-drawn challenge cards |
| W7 | How it's made | Yours on your device, honest numbers, reading first, calm by design: four drawn icons with a line each |
| W8 | Footer | An ornament, *Built from Lingua*, the data's attributions (Wiktionary via kaikki.org, FrequencyWords, CC BY-SA 4.0) |

**Steps.** ✅ W-a plan (this section) · ✅ W-b the page and its demos · ✅ W-c checked at 390, 1366 and 1440 wide, light
and dark, reduced motion, from the folder (`file://`) and served, every demo clicked · ✅ W-d pushed to the private
repository `sanchour/lemora-site` (v0.1.0). Hosting is left to the user: GitHub Pages on a
private repository needs a paid plan, so the site is not published anywhere yet.

**Pages (2026-11-03).** The repository's Pages was set to *deploy from a branch*, so a legacy build served the raw
source `index.html` (`/src/main.tsx`) whenever it finished after the Actions deploy. It is now set to *GitHub Actions*
only (`gh api -X PUT repos/sanchour/lemora/pages -f build_type=workflow`).

## How a step is checked

`npm run typecheck`, `npm test`, `npm run build`, and a look in a browser at 1280, 1440 and
1366×768, in light and dark, and at phone width for the steps the brief makes responsive. Results
go in the step's line below, with what wasn't checked said plainly.

## Notes per step

- **0.1, 1.1** (2026-11-03): the audit's section 6 lists the isolation. Typecheck and 1,869 tests
  pass.
- **1.2** (2026-11-03): pushed with Lingua's full history; Pages on (`sanchour.github.io/lemora/`).
  The first deploy failed on a network timeout in `npm ci` on GitHub's runner (Checks passed), and the next push deployed.
- **2.1 to 2.5** (2026-11-03): checked in a headless Chromium at 1440×900: Explora (All, Books, Word decks),
  Bibliotheca, Ratio, Settings, Things to try, Thesaurus and Codex have no link into a missing room and no
  horizontal overflow. Home is still Lingua's and links to Sonus, Cantus, Visio and Cursus until 3.1.
  Found and fixed on the way (shared, good for Lingua too): global search's Diarium results linked to an
  address with no route. Not yet done: deleting the excluded code (2.6); the Sonus mini player still loads in
  the shell.
- **1.3, 3.1, 3.8, 3.14, 3.15** (2026-11-03): Home is `src/app/home` (Lingua's `features/home` untouched and no longer
  loaded). Time per tool: `core/goals/tools.ts` (the rule, with tests), `data/toolGoals.ts`; the day's goal (`goalMet`,
  the streak) now counts review, Ludus and letters time too, a deliberate change for Lingua as well. Ludus's games
  and practice pages record time now (`features/lesson/useStudySession.ts`). Checked at 1440×900 and 1366×768, Paper
  and Nocturne, Spanish (no Alphabet) and Russian (Alphabet): no horizontal overflow. Not checked yet: a phone width;
  a locked Ludus with a plan that opens it; the PWA icon once installed (only the PNGs and the SVG were looked at).
  Home is taller than one 1366×768 screen (Next for you falls below), on purpose, for the breathing room the brief asks.

