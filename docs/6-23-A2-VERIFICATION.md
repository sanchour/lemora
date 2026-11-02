# 6-23 A2.1 · browser follow-up · Codex · 2026-11-02

**Functional Russian checks passed; further implementation stopped at two browser log errors.**
This supersedes alpha.167's pending Russian test-pack approval, not A2's remaining scope or A1's
unresolved offline reload. A2 remains claimed by Codex; no feature entries are closed.

## Checks and approved local data

Clean alpha.167 checkout; Node 26.13.0. Typecheck, all 250 test files/1,637 tests passing/one skipped,
and production-path build passed before browser interaction. No runtime code changed in this
follow-up. The user explicitly approved adding Russian and saving the bundled 2.6 MB pack. The
Languages screen then showed Russian's installed Offline dictionary at 12 MB (unpacked), alongside
the existing Arabic dictionary at 14 MB. No voice/model download, real account or key was used.

## Observed in the local production preview

- Settings › Reading showed BGN/PCGN 1947 and ISO 9:1995. Choosing ISO changed the preview to
  Ekaterinburg / Ëlkino / Zmeevka; it remained selected after reload.
- Created a local synthetic passage through Codex › Add › Write or paste. The actual reader showed
  ISO readings including Ŝit / Ûžnyj / alʹbom / Èto / obŝestvo / Časy / škola. DOM inspection confirmed
  each source span still contained its original Russian word; the reading lived in data-r.
- Switching to BGN/PCGN changed the same reader's first readings to Yekaterinburg / Yëlkino /
  Zmeyevka / Shchit / Yuzhnyy. Switching to Arabic and back preserved the Russian BGN setting.
- Inspected the Russian ISO reader at 1280×800, 1366×768 and 1440×900 in Paper and Nocturne.
  Inspected Arabic interface/RTL text in Reading settings at the same sizes/themes; the Russian-only
  scheme control was absent there. This is a scoped text/layout pass, not certification of a fully
  mirrored interface or the linguistic quality of all Arabic translations.
- Restored English interface and Nocturne in the disposable test profile; restored the viewport.
  The local verification tab is retained for handoff.

Representative screenshots: [Russian Paper](verification/6-23-a2-iso-paper-1366.png),
[Russian Nocturne](verification/6-23-a2-iso-nocturne-1366.png),
[reachable selector](verification/6-23-a2-controls-nocturne-1366.png),
[Arabic text/interface](verification/6-23-a2-arabic-nocturne-1366.png).

## Required stop

At the end of this pass the browser log contained two errors, at 16:04:11.894 UTC and 16:04:48.010 UTC:
`AbortError: Transition was skipped. New ViewTransition started`.
[Exact observed log entries](verification/6-23-a2-browser-errors.json).

The log associates them with /settings/reading but provides no stack identifying their exact caller.
The existing transition implementations are src/app/theme.ts (starts the theme transition without
awaiting its promises) and src/app/languageSwitch.ts (awaits finished and catches skipped transitions).
Both files are unchanged from origin/main; their latest owning commit is af01057, before A2. No
A2-caused transition defect is established. Under the user's stop-on-unrelated-failure instruction,
stop implementation here. Do not change the transition code, disable motion, swallow the log or
repeat the matrix to make a clean-log claim. The functional observations above remain evidence;
this is not a clean-console or full-A2 acceptance.

## Remaining

ALA-LC/passport and seven other language engines; independent controls for reader/cards/dictionary/
lessons/subtitles; positions, click/check-yourself reveal and lesson fading; final integration and
browser acceptance. The previously failed LC Word/PDF and ICAO reference downloads now succeeded
within the approved 25 MB source limit (about 4.6 MB cached in total); the ICAO file moved to the
confirmed DocSeries URL. [Source hashes](6-23-A2-SOURCES.json). Those sources have not yet produced
new engines/golden fixtures; LC's equation-like cells still need visual inspection before use.

Not verified: screen readers, native linguistic/standards review, clipboard round trip, live transcript
playback, real AI/microphone, installed-PWA offline launch, or A1's offline reload gap. No main merge,
deployment or new step claim. Next: resolve/authorize the shared transition-log blocker, then continue
A2; preserve the claim and all stated gaps.
