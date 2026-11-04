# Lemora 1.1 · Sharing (L1.1-13)

Part of [the Lemora 1.1 plan](../LEMORA-1.1-PLAN.md); rules in [CONVENTIONS.md](CONVENTIONS.md). **WAITING.**
The source is Lingua 6's step 6-27 (the plan's Appendix B). **Local files come first.** Community features, accounts,
cloud and native apps need the user's explicit product decision, with their operating and safety work. Nothing is
assumed built or approved.

## Pushes (Any)

- **13.1 Share files.**
  - A share format `lingua-share` v1, shared with Lingua, with a `product` field. It can carry a deck, a reading list, a
    reading path ([ADAPTIVE.md](ADAPTIVE.md) 11.1) or a saved Atlas view.
  - Export lives in `services/export/`, import in `services/import/`. Import shows a preview first, then clones the
    contents for editing; nothing is merged silently.
  - Anki `.apkg` and CSV already exist and are checked, not rebuilt.
  - Backups are tested both ways, Lingua ⇄ Lemora, as round trips.
- **13.2 A progress card:** a PNG drawn on a canvas from a Ratio summary, with real numbers only (the user's rule:
  never fabricated analytics).
- **13.3 The decision queue** (below): written, not built.

## Decision queue (each waits for the user)

| Candidate | What a decision needs to settle |
|---|---|
| Reading clubs | Accounts or not, moderation, privacy of reading lists, running cost |
| Writing peer correction | Who corrects, abuse and safety, moderation, storage of others' texts |
| Shared challenges | Identity, cheating, notifications, cost |
| Accounts and cloud sync | Provider, cost, data protection, how the local-first model and backups change (`services/sync` exists only as a backup exchange) |
| Native apps, share sheet, widgets, offline mobile | A separate product decision; Lemora 1.1 is desktop only (decision 4) |
| F1486 import through the browser extension | `extension/` exists and is partly there; it stays a waiting integration candidate |
