# Bringing Lemora's improvements back to Lingua

Lemora exists partly to perfect Codex and Thesaurus away from the rest of the super-app. This file
says how those improvements go back to Lingua without rebuilding them, and what never goes back.
Status: the strategy is in use since Lemora's first commit. **The measured feasibility check (plan
step 5.2) is still to do**; until then the difficulty below is read from the code, not tried.

## 1. Three strategies compared

| | 1. Move commits with git | 2. Extract shared packages | 3. A shared workspace (monorepo) |
|---|---|---|---|
| First effort | none: Lemora is a clone with shared history | high: Codex imports 13 feature folders, Thesaurus 9; untangle first | highest: move both apps into one repository, rebuild CI and deploys |
| Ongoing cost | a cherry-pick per change | versioning, publishing, two consumers per change | one install, but every change builds and tests both apps |
| Conflict risk | only where both apps changed the same lines | low inside packages, high at their edges while the boundary moves | none in code; all in coordination |
| Moving an improvement | `git cherry-pick <sha>` | bump a version | it's already there |
| Effect on Lingua today | none | large refactor of Lingua's two biggest modules | Lingua's repository changes shape |
| One developer with AI agents | best: plain git, every agent knows it | agents must keep package APIs stable | workable, but each session must read two apps |

**Chosen: 1 now, with the way to 3 kept open.** Identical paths and shared history make
cherry-picks clean today. If the two apps keep sharing most of their code after a few months, the
files that never differed (most of `src/core`, `src/design/primitives`, `src/data`) are the obvious
first shared folder. The `src/product.ts` seam already marks what's app-specific.

## 2. What goes back how

| Component | Goes back | Notes |
|---|---|---|
| `src/features/codex` (reader, word engine, drawer, importers, Diarium) | directly | same paths; `[shared]` commits |
| `src/features/thesaurus`, `src/features/games` (Ludus), `practice`, `translate` | directly | same |
| `src/core/**`, `src/data/**`, `src/design/**`, `src/services/**`, `src/workers/**` | directly | same; schema rule below |
| `src/features/explora`, `bibliotheca`, `mentis`, `ratio`, `ordo`, `cursus` | after the one-time product commit | Lemora's changes there are `has(section)` checks |
| `src/product.ts` | **never as is** | Lingua keeps its own copy with `'lingua'` values |
| `src/app/sections.ts`, `router.tsx`, Home, onboarding, icons, manifest, `index.html` | no (ideas only) | Lemora's own product layer |
| Docs | Lemora's own | |

**The one-time product commit, the first thing to bring back.** Take `[lemora] Its own database,
storage, caches and name` (`abaa024`) apart: Lingua gets `src/product.ts` with `id: 'lingua'`,
`name: 'Lingua'`, `db: 'lingua'`, `prefix: 'lingua'`, and the shared files that read it.
With those values every key, cache and database name stays exactly what Lingua uses now, so no
user data moves. One behaviour changes, on purpose: "erase everything" then removes only keys
starting with `lingua`, so it stops wiping Lemora's on the same origin. Do this in a branch of
Lingua and open a pull request; Lingua's `main` needs one.

## 3. How a change moves (the commands)

In Lingua, once:

```bash
git remote add lemora https://github.com/sanchour/lemora.git
```

For each improvement:

```bash
git fetch lemora
git log --oneline --grep='^\[shared\]' origin/main..lemora/main   # what's waiting
git switch -c from-lemora/<what> origin/main
git cherry-pick -x <sha> [<sha>…]       # -x notes where it came from
npm run typecheck && npm test && npm run build
git push -u origin from-lemora/<what>   # then a pull request in Lingua
```

The other way, Lingua → Lemora, is the same with the remotes swapped (`git fetch lingua`, then
cherry-pick onto a Lemora branch). Don't `git merge` whole branches across: a merge brings Lingua's
excluded rooms back into Lemora, or Lemora's deletions into Lingua.

**When a cherry-pick conflicts**, it's nearly always one of three things:

1. a line both apps changed: resolve by hand, keeping both intents;
2. a file Lemora deleted (pruned features): `git rm` it in Lemora, or keep it in Lingua;
3. a `has('…')` check in a file Lingua hasn't got the product commit for: bring the product commit
   first (section 2).

## 4. A worked example: a Codex fix

Say Lemora fixes the reader's word drawer so a phrase lookup keeps its sentence context:

1. In Lemora it's one commit, `[shared] Codex: phrase lookups keep the sentence`, touching
   `src/features/codex/reader/WordDrawer.tsx` and its test. It names no Lemora section and no
   Lemora branding.
2. In Lingua: `git fetch lemora && git switch -c from-lemora/phrase-context origin/main`.
3. `git cherry-pick -x <sha>`. Same file, same path, same history, so it applies, or stops at the
   exact lines Lingua changed meanwhile.
4. `npm run typecheck && npm test && npm run build`, a look at the reader in Lingua, version it
   (Lingua's `node scripts/version.ts`), push the branch, pull request, merge when checks pass.

## 5. Keeping the two from drifting apart

- **One kind per commit.** `[shared]` commits change shared code only; `[lemora]` commits change the
  product layer only. A mixed commit can't be cherry-picked cleanly; split it before pushing.
- **No hard-coded product in shared code.** Shared files ask `src/product.ts` (`PRODUCT.name`,
  `PRODUCT.prefix`, `has(section)`), never `'lemora'` or `'Lemora'`.
- **Same paths.** Nothing under `features/codex`, `features/thesaurus`, `core`, `data`, `design`
  is renamed or moved in Lemora.
- **Bring Lingua's fixes to shared code into Lemora regularly** (and the other way), a few commits
  at a time, so neither side has to catch up on months at once.
- **Version lines stay separate.** Lemora 0.1.x-alpha.N, Lingua 0.6.x-alpha.N; a cherry-picked
  commit gets a version in the app it lands in.

## 6. Schema and data

- **Lemora adds no Dexie version and drops no table.** Lingua reserves version numbers per step
  (`src/core/contracts`), so a Lemora version would collide. New Lemora data lives in `settings`
  keys or existing tables. A schema change Lemora needs is made in Lingua first, with its reserved
  number, and cherry-picked over.
- **Same backup format.** Both apps write and read the same backup ZIP (`src/data/backup.ts`, merge
  in `src/core/backup/merge.ts`): a Lingua backup restores into Lemora and the other way. Rows of
  excluded features (songs, media, chats) ride along untouched. There is **no automatic sync**
  between the apps; moving data means exporting a backup in one and importing it in the other, or
  the device-to-device exchange in Settings › Your data.

What a learner can carry from Lemora into Lingua (via a backup):

| Data | How | Conversion |
|---|---|---|
| Reading progress, bookmarks, marks | backup | none (`readingProgress`, `texts`, `chapters`) |
| Imported books and texts | backup (text and covers in `chapters`, `blobs`) | none |
| Vocabulary, word states | backup (`words`) | none; newest `updatedAt` wins per word |
| Decks, notes, cards | backup | none |
| Review history | backup (`reviewLogs`, unioned) | none |
| Journal entries | backup (`journalEntries`) | none |
| Settings | backup | device-only settings (API keys, UI, meta) are never overwritten |
| Per-tool goals (plan step 3.8) | backup (a `settings` key) | Lingua ignores the key until it takes the feature |

## 7. Testing a reintegration

1. On a branch of Lingua (never `main`), after the cherry-picks: `npm run typecheck`, `npm test`,
   `npm run build`.
2. In a browser: the rooms the commits touched, plus Home and one excluded-in-Lemora room (Sonus or
   Cursus) to see nothing Lemora hid has gone missing in Lingua.
3. Restore a Lemora backup into Lingua on a test profile (a separate browser profile, not the
   user's) and check the reading, words and decks arrived.

## 8. What stays in Lemora

`src/product.ts`'s values, Lemora's sections and router, its Home, its onboarding (without the
showcase, which went to Lingua-Launch), icons, manifest, `index.html`, and its docs. The *ideas*
can go to Lingua (for example the 2-up tool cards) but as new Lingua work, not cherry-picks.
