# Working on Lemora

Lemora is a local-first app for reading, collecting words and writing in a new language: Lingua's
reading-centred half made into its own product. It shares Lingua's code and git history (Vite 8,
React 19, TypeScript, Tailwind 4, Dexie, Zustand, motion/react). Repository `sanchour/lemora`,
published by GitHub Pages at https://sanchour.github.io/lemora/ from `main`.

## Start here

- **[docs/LEMORA-PLAN.md](docs/LEMORA-PLAN.md)**: the steps, which are done, and how to claim the next.
- [docs/EXTRACTION-AUDIT.md](docs/EXTRACTION-AUDIT.md): what was taken from Lingua, what was left out and why.
- [docs/LINGUA-REINTEGRATION.md](docs/LINGUA-REINTEGRATION.md): how a change goes back to Lingua.
- Still true for the shared code: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md),
  [docs/PERFORMANCE.md](docs/PERFORMANCE.md) (the 60 fps rules), [docs/DECISIONS.md](docs/DECISIONS.md),
  the design handbook (`docs/handbook/`). Lingua's plans (`docs/LINGUA-*`, `ROADMAP.md`, `HANDOVER.md`,
  `Lingua updates.txt`, `what next.*`) are Lingua's history; don't take work from them here.

## Rules that always hold

- **Never change the original Lingua.** Its repository and folder (`../Lingua`) are read-only from
  here; the `lingua` remote is fetch-only. Nothing is merged into Lingua without the user's approval.
- **`src/product.ts` is the only file that differs by design.** Shared code asks it for the database
  name, the storage prefix, the name and the sections, and never hard-codes "Lemora".
- **Tag every commit** `[shared]` (shared code, fit to go back to Lingua) or `[lemora]` (product file,
  sections, Home, onboarding, branding, docs). One kind per commit.
- **Keep shared files where they are.** Don't rename or move anything under `src/features/codex`,
  `src/features/thesaurus`, `src/core`, `src/data` or `src/design`: identical paths are what let
  `git cherry-pick` work between the two apps.
- **Keep Lingua's database schema.** No new Dexie version and no dropped table: Lingua reserves
  version numbers, and backups move between the apps. New data goes in `settings` keys or existing tables.
- Storage stays apart from Lingua's (both apps can be on one origin): the `lemora` database, keys and
  caches starting with `PRODUCT.prefix`, the dev server on port 5175.
- API keys (Groq, Gemini) stay on the device and travel only in request headers, never in a URL.
  Tests use fake keys such as `test-not-a-real-key`.
- Never sign in to the user's real accounts or create accounts. Ask before a browser download.
- Lemora is responsive (the brief asks for touch and phone widths too), unlike Lingua's desktop-only rule.

## How each prompt is handled

1. Claim the step in docs/LEMORA-PLAN.md, then build it without waiting for confirmation.
2. Check it: `npm run typecheck`, `npm test`, `npm run build`, and look at it in a browser at 1280,
   1440 and 1366×768, light and dark (and at phone width where the step is responsive).
3. Update the docs it touches and tick the step, with what wasn't verified.
4. Version every push: `node scripts/version.ts "what this push is"` (0.1.x-alpha.N for Lemora 1),
   commit, `git pull --rebase origin main`, push to `main`, then check the Pages deploy went live.
5. When a session finishes, give end notes: what changed, what wasn't verified, what's next.

The user prefers token-efficient sessions: work inline, read only what is needed, no multi-agent
workflows unless they ask. They often work across usage limits; the work picks up once a limit resets.

Commit as `sanchour <255895307+sanchour@users.noreply.github.com>`
(`git -c user.name=sanchour -c user.email=255895307+sanchour@users.noreply.github.com commit …`).

## Practical notes

- **No formatter:** never run Prettier or `eslint --fix`; format by hand to match (single quotes,
  long lines of about 200 columns, JSX wrapped like the file around it).
- Node 24+ runs the TypeScript scripts directly (`node scripts/version.ts`).
- Vitest caches transformed modules in `node_modules/.vitest-cache`; delete it when a test should
  see a newly added or removed file and doesn't.
- `public/packs` and `public/dict` are committed language data. Rebuilding them needs
  `scripts/.cache` (2 GB, git-ignored; see docs/SETUP.md) and is rarely needed.
- `sandesigning/` is the user's design canvas for all their apps; leave it as it is.
