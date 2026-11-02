# 6-25 · final storage and deletion audit

Codex · 2026-11-02 · versions alpha.155 (claim), alpha.156 (storage), alpha.157 (remaining recovery).

The claimed implementation and deletion audit are complete. This is not a certification of every browser, assistive technology or external application. The verification limits below are part of the completion record and supersede earlier partial/stop notes.

## Storage

Settings › Your data › Storage lists installed language packs, downloaded full dictionaries, Piper models/configuration, and saved audio/video/recording/image/cover files. Removal is scoped to the named resource. Personal dictionary definitions remain indexed; personal entries alone do not appear as an installed full dictionary. Voice preferences remain saved and speaker caches are invalidated after removal/recovery. No download is required for Undo.

The browser's total quota/usage is an estimate; deleting database rows need not immediately shrink the browser's physical database file. In-session recovery retains removed content until its message is replaced/dismissed or the app reloads. Media-kind recovery retains its original page lifetime.

## Persisted-content deletion inventory

| Learner action / owning source | Recovery after this pass | Evidence |
| --- | --- | --- |
| Remove pack / full dictionary / downloaded voice (`services/packs`, `services/dictionary/fullDict`, `services/speech/piper`) | Scoped atomic row recovery; voice response recovery checks for a newer download and rolls back failed partial restoration | Database/cache regressions; German pack and real approved Davefx model removed/restored in browser |
| Delete saved media by kind (`data/storageMedia`) | Original page Undo, preserving newer files | Earlier disposable WAV delete/Undo; regression retained |
| Remove text, cover or chapter (`data/library`) | Chapters, blobs, progress, vocabulary and text metadata recovered together | Text/chapter suites and binary deletion regression |
| Remove deck, folder, note or selected notes (`data/decks`, `data/deckTools`) | One Undo for the whole cascade, including linked word IDs and card schedules | Thesaurus/workshop suites; bulk-deletion regression |
| Merge decks, remove card directions, forget deck/card progress | Restore original decks, directions and schedules; remove newly created rows on Undo | Existing deck suites and shared creation/update recovery tests |
| Remove Sonus/Visio item, audiobook, download, transcript, subtitle track, feed or bookmark (`data/media`, `data/books`, `data/video`) | One recovery for dependent rows and files, including an entire audiobook | Media/book/video suites plus shared cascade/binary tests; not every screen interaction tried |
| Remove Diarium entry, chat or pronunciation recording (`data/journal`, `data/chats`, `data/diary`) | Shared recovery; journal navigation waits for deletion and errors are surfaced | Existing data suites; no real model or microphone |
| Remove journey moment, study log, goal or capability (`data/journey`) | Original row restored; newer edits prevent stale restoration | Journey suites and shared update/conflict tests |
| Leave Learning/reset a word (`data/words`) | Restore side effects and removed never-reviewed card; reader receives the existing word-state event | Existing word/thesaurus suites and shared recovery tests |
| Reset one language's progress / remove a language (`data/reset`, `data/removeLanguage`) | Atomic recovery of the original operation's affected rows and active-language state; pack removal uses the supplied database | Multi-language regression; browser reset changed 5 cards/4 decks to 0 and Undo restored 5/4 |
| Restore a backup from file (`data/backup`) | Restore overwritten/deleted rows and remove newly imported rows/files; device-only settings rules retained | Real backup parser/export/replace/Undo regression with binary attachment |
| Automatic sync applying a backup (`services/sync/engine`) | Existing synchronization behavior; deliberately does not create a user deletion toast | Existing sync/backup suites; no real device pairing tried |
| Notebook/phrasebook items, reading highlights, shopping/media lists | Existing local Undo retained | Earlier browser checks and existing regressions; their original recovery lifetimes remain |
| Remove local design notes / clear done / clear all (`features/lab/designNotes/notes`) | Restore removed notes while retaining newer notes | Store regression |
| Clear translation/AI caches; remove a custom reward | Shared settings/cache recovery | Shared database regression; reachable existing controls |

Recovery lives in `src/data/removalUndo.ts`. Each operation captures only its changed rows in a transaction; nested cascades share one recovery. Undo verifies the post-change rows, including binary content, before restoring anything, and refuses the entire restore if newer data conflicts. Restored synchronized rows get a fresh update timestamp. Chapter statistics may yield to the browser, so the transaction is explicitly kept alive across native waits. Failed asynchronous toast actions remain available for retry.

## Explicit boundaries

- **Erase all data:** typed confirmation starts a 30-second cancellation window. Undo, Escape or leaving/unmounting the page cancels the pending erase. After that window the original permanent wipe runs; there is no retained credential/data snapshot after erasure. Recovery then requires the learner's backup. Timing/unmount behavior is tested with a fake erase; the real wipe was not performed.
- **Forget a paired device:** remains permanent. Automatic approval review rejected adding recovery because restoring a deliberately revoked pairing could weaken access control. No bypass or alternative implementation was attempted.
- Unsaved form cancellation and replacing an edited field are not a persistent revision-history feature. Existing discard confirmations remain. This audit does not claim Undo for every possible edit or security action.
- The language-removal recovery covers the existing removal operation; it is not a redesign of retention for newer feature-specific settings/drafts.

## Verification

- Typecheck; **247 test files, 1,607 tests passing, one skipped**; production/PWA build with `BASE_PATH=/lingua./`.
- The existing 12,004-row dictionary test passed in isolation but reproducibly exceeded five seconds under full-suite contention. Its fixture deadline is now 15 seconds; all assertions remain and production search behavior/budgets are unchanged.
- Browser: storage/voice removal confirmation at **1440×900, 1280×800 and 1366×768**, light and Nocturne; no horizontal overflow. Nocturne progress-reset dialog at those sizes. Voice model download completion/selection, voice removal/Undo, German pack removal→navigate→Undo, and Spanish progress reset/Undo were observed. Sample playback was requested; audio quality was not listened to/certified.
- Earlier alpha.154 keyboard/markup, high-contrast, reading-font/spacing, Home review/Undo and desktop checks remain recorded in `LINGUA-6-VERIFICATION.md`; unchanged screens were not all retested.
- Browser automatic approval review then failed because of a usage limit. The remaining light-theme reset-dialog captures, a fresh full-dictionary removal/Undo screen check, restored-voice playback after the final cache-conflict change, native screen-reader listening, external export applications and live floating-window interaction were **not verified**. No alternate browser/surface or hidden-state workaround was used. The local test app remains in Nocturne after this block.
- Max/AI requests still use injected fake models, as required by the repository. No real key/model was used. **Microphone stays simulated by the user's choice.** Real Whisper hardware, notification delivery, device synchronization and a complete language×screen×theme matrix remain unverified.

No further feature step is claimed. Future publication goes through a PR and the required `verify` check; main protection remains enabled.
