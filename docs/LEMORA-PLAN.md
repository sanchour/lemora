# Lemora · The plan and where it stands

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
| 2.6 | Delete what nothing reachable imports any more; bundle size before and after | ⬜ | |
| 3.1 | Home: Lingua's right-rail Home made for Lemora by default (circle tools, Time today open on the page, Tools on the greeting's line); the desk layout as a choice in Settings. Lemora's own, **redesigned** (greeting, tools 2-up with per-tool progress, overall time, continue reading, recent, next actions); fixed sidebar with the tools always visible | ✅ | Opus 5.5, 2026-11-03 |
| 3.2 | Showcase → Lingua-Launch (rewritten in plain HTML and JS, checked there), then out of Lemora's onboarding | ⬜ | |
| 3.3 | Onboarding map: frame each language from country geometry; multi-region languages get a primary focus plus alternatives | ⬜ | |
| 3.4 | Level step: title → slider → content sequence (reduced motion respected); hover, click, multi-word and long-press translation of the example sentence from local data | ⬜ | |
| 3.5 | Known words from the same `starterLists` lemmas as the frequency decks; tests | ⬜ | |
| 3.6 | Languages you speak: any living language (Intl.DisplayNames + Lingua's data), honest flags, suggestions only after typing, at most two, never over Continue | ⬜ | |
| 3.7 | No horizontal overflow on any page (causes fixed); no stray scroll bars or edge controls | ⬜ | |
| 3.8 | Per-tool daily goals (Codex, Thesaurus, Ludus, Diarium, Alphabet), one attribution rule, persisted, tested | ✅ | Opus 5.5, 2026-11-03 |
| 3.9 | **Redesign: Thesaurus, every tab** (a new layout and look; big changes welcome) | ⬜ | |
| 3.10 | **Redesign: Ludus** | ⬜ | |
| 3.11 | **Redesign: Diarium** | ⬜ | |
| 3.12 | **Redesign: Ratio**, with only real numbers (Overview's monthly report feeds made-up "accuracy" figures and stamps today) | ⬜ | |
| 3.13 | **Redesign: Settings** | ⬜ | |
| 3.14 | Things to try redrawn and moved into Explora (out of the sidebar) | ✅ | Opus 5.5, 2026-11-03 |
| 3.15 | Alphabet (with Sounds) only for languages not written in Latin script | ✅ | Opus 5.5, 2026-11-03 |
| 3.16 | Explora's rotating hero in the bookish look, not a streaming billboard | ✅ | Opus 5.5, 2026-11-03 |
| 3.17 | Word decks: a better layout and design (Explora › Word decks, the starter library) | ✅ | Opus 5.5, 2026-11-03 |
| 3.18 | Bibliotheca: a better layout | ⬜ | |
| 3.19 | Thesaurus's Discover moves to Explora entirely; a Discover icon at Thesaurus's top right | ✅ | Opus 5.5, 2026-11-03 |
| 3.20 | Hand-drawn touches where they fit, still clean (src/design/drawings.tsx: the handbook's icons and empty-page art) | ◐ Home, Things to try, Explora's hero, word decks | |
| 4.1 | Functional audit of every page (imports, files, lookups, saving, flashcards, Ludus, Diarium, language switch, backup and restore, offline, errors) | ⬜ | |
| 4.2 | UX pass: spacing, type, focus, empty, loading and error states | ⬜ | |
| 4.3 | Performance: bundle, lazy routes, rerenders, reader | ⬜ | |
| 4.4 | Accessibility: keyboard, labels, contrast, touch targets, reduced motion | ⬜ | |
| 4.5 | Privacy and security: API keys, imported files, exports | ⬜ | |
| 4.6 | Licences: every bundled dataset and font listed with its attribution in Settings › About and `docs/LICENCES.md` | ⬜ | |
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

