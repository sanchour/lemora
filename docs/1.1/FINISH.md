# Lemora 1.1 · Design, audit and release (L1.1-14, L1.1-15, L1.1-16)

Part of [the Lemora 1.1 plan](../LEMORA-1.1-PLAN.md); rules in [CONVENTIONS.md](CONVENTIONS.md). **WAITING.**

## L1.1-14 · Design (Any, alongside each surface)

- **A handbook pass** (Part One plus the room's chapter) on every new 1.1 surface:
  - the language room's tabs
  - the Atlas rail, lists, selection bar and menus
  - the Regions map, guides and lexicon
  - the adaptive cards and Today's session
- **Shared states, room by room:** empty, loading, error, dialog, toast. One list per room, each fixed or recorded.
- **The reader and word drawer:** new links (Notes, Regions, Bridges) are added calmly, with a short drawer and no
  crowding.
- **U8–U14 are done in Lemora 1.** "Reconcile" means checking each against its brief and listing the gaps, not
  redoing it. Lemora's latest room-specific brief governs.
- **Not applied:** Lingua 7-1's onboarding removals. Ratio keeps every real number and chart (the user, 2026-11-03).
- **Desktop only** (decision 4).

## L1.1-15 · The audit (Any, with the user for real accounts)

- The original 4.1–4.6 and 5.1–5.2 gates ([LEMORA-PLAN.md](../LEMORA-PLAN.md)) run again over the 1.1 work.
- **Real data paths:**
  - imports and exports
  - backup and restore in both apps
  - offline, per tool
  - editing and Undo
  - audio aids
  - switching language
  - statistics that are true
- **Desktop sizes and themes:** 1280, 1440 and 1366×768, in Paper and Nocturne, plus right to left and the keyboard
  alone.
- **External checks:** each real-provider, native-review or outside check is either evidenced or listed on its own,
  never folded into a general "not checked".
- **No release with an unresolved data-loss defect.**

## L1.1-16 · Final coverage and release (with the user)

- Every included source requirement is mapped and checked in [LEDGER.md](LEDGER.md).
- Waiting decisions stay visibly waiting, each with its reason.
- A checked **`[shared]` handoff inventory** for Lingua: commit SHAs, paths, what each needs on Lingua's side. Nothing
  is merged automatically; Lingua's own [LEMORA-INTEGRATION.md] process decides.
- The user approves the release, and then `node scripts/version.ts --release "Lemora 1.1"` (0.1.1).

[LEMORA-INTEGRATION.md]: https://github.com/sanchour/lingua./blob/main/docs/LEMORA-INTEGRATION.md
