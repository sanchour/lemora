# 6-23 A2.2b · Greek named schemes · Codex · 2026-11-03

Settings › Reading now offers ELOT 743 Type 2 transcription and ISO 843:1997 Type 1 transliteration,
with a preview and a visible modern-monotonic-only scope note. The reader and shared transcript
render consume the selected language's scheme, retaining literal original words. The shared named-
choice list now serves Russian and Greek; no learner data/table/dependency or lesson fixture change.
[Source editions, independent fixtures and review limits](review/6-23-el.md).

## Verification before incoming-main integration

Node 26.13.0, typecheck, 256 test files / 1,806 passing tests / one skipped and production-path build
pass. Focused Greek/reader suite: 60 tests passed; the full suite also checks the shared saved-choice resolver. No formatter used.

The approved 2.49 MB local Greek pack was added through the real onboarding flow and completed
installation (11 MB unpacked in language settings). A0 synthetic test profile, no seeded known words,
no account, real key or AI request. The other five newly approved packs were not added in this slice.
Onboarding requires explicitly clicking a goal even when its default is drawn selected; no bypass.

Browser: both named choices persisted after reload. Saved synthetic passage showed ELOT Avgí /
Eftychía / Bámpis / Óra versus ISO Augī́ / Eutychía / Mpámpīs / Ṓra. Both schemes inspected at
1280×800, 1366×768 and 1440×900 in Lux/Paper and Nox/Nocturne (twelve views). Source `.w` text stayed
Greek; readings were attributes. The polytonic test word ἀλφα stayed literal with no reading. No warn/
error log entries in the verification tab. Representative saved screenshots:
[controls](verification/6-23-a2-greek-controls.png),
[ELOT light](verification/6-23-a2-greek-elot-paper-1366.png),
[ELOT dark](verification/6-23-a2-greek-elot-nocturne-1366.png),
[ISO light](verification/6-23-a2-greek-iso-paper-1366.png),
[ISO dark](verification/6-23-a2-greek-iso-nocturne-1366.png).

Not verified: native linguistic/standards review, full polytonic/archaic/numerical/punctuation ISO
conversion, screen readers, clipboard round trip, live transcript/audio, real AI/microphone or a new
Arabic interface/RTL pass. This is word display, not a full reversible text converter or passport tool.
Other named languages and the independent surface/position/reveal/lesson-fading controls remain open.
Full A2 feature entries stay unchecked; Codex retains A2. A1 offline acceptance is still separate.

**Language isolation:** switching back to Russian retained all four options and the saved ICAO
choice/preview; returning to Greek retained its separate ELOT choice. No Russian setting overwritten.

## Required stop · incoming-main whitespace check

Greek implementation/evidence is committed locally as 7065da6; last pushed Codex checkpoint remains
v0.6.0-alpha.178 (5a47c2d, Russian; both GitHub verify runs passed). Integration of origin/main
a76b749 is resolved and staged, but the merge is not committed. The staged whitespace check reports:

```text
src/features/games/Story.tsx:107: new blank line at EOF.
```

`git diff origin/main -- src/features/games/Story.tsx` is empty: the offending line is exactly the
incoming main file, not a Greek edit. Under the user's explicit unrelated-check stop rule, leave it
unchanged and stop. No integrated typecheck/tests/build were run after this failure; no Greek version,
tag or push, no main push/deployment. Do not call the incoming-main integration or A2 complete.
Next: have the incoming file corrected or obtain explicit authorization to fix that inherited line,
finish the pending merge, run integrated checks, version/push Greek, then continue the remaining A2
named languages and controls. Codex retains A2; no A3 claim.

**Continuation authorised 2026-11-03:** the user now requests full A1/A2 completion. Resumed
integrated baseline passes: typecheck, 257 files / 1,824 tests / one skipped and build. Remove only
the known incoming blank EOF line, retain the resolved merge, then complete checks/publication.
This supersedes the stop above, not the recorded verification limits or A2 acceptance criteria.
