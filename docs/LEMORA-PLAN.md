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
| 1.2 | Lemora's CLAUDE.md, README and this plan; first push to `sanchour/lemora`; GitHub Pages on | ⬜ | Opus 5.5, 2026-11-03 |
| 1.3 | Lemora's icons and logo (the book mark, its own colour), splash screens | ⬜ | |
| 2.1 | Sections and routes: `PRODUCT.sections`, sidebar, router, redirects, shortcuts, command search | ⬜ | |
| 2.2 | Explore reading-only; Library without audio and video; no dead links | ⬜ | |
| 2.3 | Mentis room → Diarium + Things to Try; tips filtered to Lemora's activities | ⬜ | |
| 2.4 | Alphabet on its own (Cursus tab alone); Ratio without Tabula or excluded panels | ⬜ | |
| 2.5 | Settings without Listening and Music; Lemora+ naming checked | ⬜ | |
| 2.6 | Delete what nothing reachable imports any more; bundle size before and after | ⬜ | |
| 3.1 | Home: Lemora's own (greeting, tools 2-up with per-tool progress, overall time, continue reading, recent, next actions); fixed sidebar | ⬜ | |
| 3.2 | Showcase → Lingua-Launch (rewritten in plain HTML and JS, checked there), then out of Lemora's onboarding | ⬜ | |
| 3.3 | Onboarding map: frame each language from country geometry; multi-region languages get a primary focus plus alternatives | ⬜ | |
| 3.4 | Level step: title → slider → content sequence (reduced motion respected); hover, click, multi-word and long-press translation of the example sentence from local data | ⬜ | |
| 3.5 | Known words from the same `starterLists` lemmas as the frequency decks; tests | ⬜ | |
| 3.6 | Languages you speak: any living language (Intl.DisplayNames + Lingua's data), honest flags, suggestions only after typing, at most two, never over Continue | ⬜ | |
| 3.7 | No horizontal overflow on any page (causes fixed); no stray scroll bars or edge controls | ⬜ | |
| 3.8 | Per-tool daily goals (Codex, Thesaurus, Ludus, Diarium, Alphabet), one attribution rule, persisted, tested | ⬜ | |
| 4.1 | Functional audit of every page (imports, files, lookups, saving, flashcards, Ludus, Diarium, language switch, backup and restore, offline, errors) | ⬜ | |
| 4.2 | UX pass: spacing, type, focus, empty, loading and error states | ⬜ | |
| 4.3 | Performance: bundle, lazy routes, rerenders, reader | ⬜ | |
| 4.4 | Accessibility: keyboard, labels, contrast, touch targets, reduced motion | ⬜ | |
| 4.5 | Privacy and security: API keys, imported files, exports | ⬜ | |
| 4.6 | Licences: every bundled dataset and font listed with its attribution in Settings › About and `docs/LICENCES.md` | ⬜ | |
| 5.1 | Module boundaries of Codex and Thesaurus reviewed; reintegration document final | ⬜ | |
| 5.2 | Feasibility check: cherry-pick a `[shared]` commit onto a throwaway clone of Lingua, typecheck and test it (never pushed) | ⬜ | |
| 6.1 | Completion report | ⬜ | |

## How a step is checked

`npm run typecheck`, `npm test`, `npm run build`, and a look in a browser at 1280, 1440 and
1366×768, in light and dark, and at phone width for the steps the brief makes responsive. Results
go in the step's line below, with what wasn't checked said plainly.

## Notes per step

- **0.1, 1.1** (2026-11-03): the audit's section 6 lists the isolation. Typecheck and 1,869 tests
  pass.
