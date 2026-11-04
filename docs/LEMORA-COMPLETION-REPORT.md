# Lemora: completion report (2026-11-04)

Version 0.1.0-alpha.24, live at https://sanchour.github.io/lemora/ (repo `sanchour/lemora`, GitHub Pages from Actions).
**It is an early alpha, not production-ready**; the open items below are why.

## What exists

- **Lemora**, a standalone app extracted from Lingua with its own database, storage keys, caches, manifest, icon (dark and
  light) and dev port, so it can share an origin with Lingua without touching its data. Rooms: Home, Explora (reading,
  comics and magazines, word decks, Ludus, things to try), Bibliotheca, Codex, Thesaurus (decks, dictionary, words,
  phrases), Atlas, Ludus, Diarium, Alphabet (only for languages not in Latin script), Ratio, Settings.
- **Lemora's website**, `sanchour/lemora-site` (private repo, public Pages site https://sanchour.github.io/lemora-site/):
  one static page with five working demos.
- **The showcase** "See what Lingua can do" now lives in `sanchour/Lingua-Launch` (private).
- **Docs:** `EXTRACTION-AUDIT.md`, `LEMORA-PLAN.md` (every step, claimed and ticked), `LINGUA-REINTEGRATION.md`,
  `LICENCES.md`.

## How it was checked

Typecheck clean; 251 test files, 1,781 tests pass; the production build passes; the deploy is green; 30 routes visited in
a headless browser at 1440 and 1366 wide with no page errors, no sideways overflow, one `h1` each, no unnamed controls;
keyboard focus visible on 11 pages; the live app loads offline; the interface language switches. Reintegration was
rehearsed on a throwaway clone of Lingua (5 commits picked, 0 type errors, 181 Lingua test files pass); nothing was
pushed to Lingua.

## Findings fixed on the way (real bugs, not polish)

- The monthly report invented accuracy figures and awarded stamps by its own rule; it now shows only this month's real
  numbers (the user's rule: never display fabricated analytics).
- Decks made from a text, or by Max, kept words already known: a database query used an index that doesn't exist.
- Known-words seeding marked word forms while the frequency decks list lemmas, so "Top 100" looked unknown.
- The plans sheet offered Lemora learners rooms Lemora doesn't have.
- Home crashed when no book was started (`undefined.room`).
- Things to try was 46 px wider than the window (a sideways swipe); the shelves' hidden-scrollbar style was never defined.
- The deployed app once served raw source: Pages was set to build from a branch as well as from Actions.
- First load shipped about 3 MB of translations nobody was using: 1,768 KB → 593 KB of JavaScript.
- 155 files unreachable from the app (about 27,000 lines) were deleted, proven by typecheck, tests and a build.

## Privacy and licences

API keys travel only in request headers, are not in URLs, and are left out of backups unless asked. Links carry `rel`; the
one raw-HTML spot is a locally drawn QR code. All dependencies are MIT, Apache-2.0, ISC or OFL; data and media credits
(Wiktionary, FrequencyWords, Pepper&Carrot, Global Voices, Natural Earth, Piper voices…) are in Settings › About and
`docs/LICENCES.md`.

## Not verified, or open (honest list)

- **Real data:** the Russian dictionary never finished downloading in my test browser, so deck counts and dictionary
  entries with real data were not seen in the new layouts. Check them once on your own machine.
- **Reader performance:** re-renders in the reader were not profiled (4.3 stays partial).
- **Dark mode and 1366×768** were spot-checked on the new pages, not exhaustively.
- **Translations:** new interface text is in all six languages, but some older plan-list lines may show in English.
- **Offline:** loaded offline on the live site; the headless browser reported an empty cache list, so Workbox's cache
  contents were not inspected directly.
- **Touch and phone:** not audited (desktop only, by the user's rule).
- **Earlier designs per page (U15)** were skipped at the user's request; only My decks keeps its earlier-design switch.
- **A Lemora 1.1 plan** is referenced from Lingua's CLAUDE.md; it did not exist in this repo when the work ended.

## Decisions waiting for the user

1. Whether and when to bring the redesigned shared pages into Lingua (it changes Lingua's look; see
   `LINGUA-REINTEGRATION.md`, which also says how: replay the `[shared]` chain in order, merge catalogues with
   `scripts/merge-i18n.mjs`).
2. Whether to publish `lemora-site` beyond its current public Pages URL, and whether the private Lingua-Launch should go live.
3. Whether to do the unprofiled and unverified items above before calling Lemora ready for others.
