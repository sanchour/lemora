# 6-23 A2.2a · Russian schemes · Codex · 2026-11-03

The Russian slice adds ALA-LC 2012 and passport-letter spelling from ICAO Doc 9303 (2021) to the
already published BGN/PCGN 1947 and ISO 9:1995 choices. All four are reachable in Settings › Reading
and saved per language. [Exact source, edition and review limits](review/6-23-ru.md).

ALA-LC covers its full 37-letter Russian table, including the four obsolete letters and the tied
capital pairs. The passport choice produces uppercase converted letters and omits the soft sign;
it is a display conversion, not a full MRZ formatter or a guarantee of an individual's official name.
No learner text, database table or original alphabet-lesson fixture is rewritten. No dependency added.

## Verification before integrating incoming main

Node 26.13.0, typecheck, all 251 test files/1,712 passing tests/one skipped and production build pass
on the resumed work. Golden fixtures check the published table cells independently of the engine;
synthetic regressions distinguish case, stress and composed words from published word examples.
The reader regression covers the selected new schemes even when an old reading is supplied.

Browser: both new choices persisted after reload. The synthetic Russian passage showed ALA-LC
I͡Uzhnyĭ / alʹbom / Ėto and passport IUZHNYI / ALBOM / ETO, with the original Russian word spans
intact. Both choices inspected at 1280×800, 1366×768 and 1440×900 in Paper and Nocturne. No warn/
error log entries appeared in that tab. Four-option selector and preview observed in Settings.
Representative screenshots: [controls](verification/6-23-a2-four-russian-controls.png),
[ALA-LC light](verification/6-23-a2-alalc-paper-1366.png),
[ALA-LC dark](verification/6-23-a2-alalc-nocturne-1366.png),
[passport light](verification/6-23-a2-passport-paper-1366.png),
[passport dark](verification/6-23-a2-passport-nocturne-1366.png).

Incoming main has advanced through the onboarding PR; integrate it without rewriting published
Codex commits and run the integrated checks before publication. That result is recorded below.

Not verified in this slice: obsolete-letter glyphs in an actual reader passage, native linguistic/
standards review, screen readers, clipboard round trip, live transcript playback, real AI/microphone
or an additional Arabic browser pass. The earlier Arabic baseline is recorded separately. The other
seven languages and independent surface/position/reveal/lesson-fading controls remain open; no
full-A2 feature entry is closed, Codex keeps the A2 claim. A1's offline gap remains separate.

## Integrated outcome · 2026-11-03

Merged origin/main at 3c519b6 into Codex, preserving all published history. The seven catalogue
conflicts were additive only: retained both sets of lines, checked the exact three-way content and
rejected duplicate keys; no formatter or whole-file serialization was used. All integrated checks
passed: typecheck, 251 test files/1,712 tests passing/one skipped and production build. Loaded the
integrated main asset in the browser, observed all four saved choices, and rechecked the actual
passport reader at 1366×768 in the light theme with source spans intact and an empty warn/error
log. [Integrated reader screenshot](verification/6-23-a2-russian-merged-1366.png). The twelve new-
scheme size/theme views above preceded integration; they were not all repeated after the merge.
Incoming onboarding behavior was not audited. This finishes the Russian named-scheme slice only;
continue A2 under the existing claim. No main merge/deployment, no full-A2 audit tick.

**Further incoming-main checks:** main 07008c7 (graph model) passed typecheck, 252 test files /
1,727 tests / one skipped and build. Main then advanced to 62b703a (games, conversation scenes and
Atlas); merged without rewriting published Codex history, retaining the independent claims and
decision entries. Typecheck, 254 files / 1,740 tests / one skipped and production build pass on that
integration. These incoming features were not audited in the browser. No A2-wide acceptance tick.

**Publication baseline:** main advanced once more to 7eee382 (G4 games); merged additively and
rechecked: typecheck, 255 files / 1,748 tests / one skipped and build pass. Earlier browser evidence
was not repeated for this final integration. An unpublished duplicate-number release commit was
removed before retrying; no existing remote tag or published history was changed.
