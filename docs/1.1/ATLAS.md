# Lemora 1.1 · Atlas: G5 tools, G6 time and bridges, G7 finish (L1.1-02, L1.1-03)

Part of [the Lemora 1.1 plan](../LEMORA-1.1-PLAN.md); rules in [CONVENTIONS.md](CONVENTIONS.md). **WAITING.**
The source is [WORD-GRAPH-PLAN.md](../WORD-GRAPH-PLAN.md): §3 (seeing everything), §4 (the lines), §6 (how it looks),
§7 (doing something with it), §8 (your own map), §9 (time and bridges), §10 (engineering), §11 (G5–G7).
Its done-when lines still hold; this file adds Lemora's placement and the push-by-push work.

**The Lemora difference:** the Atlas is a full-screen room (`/atlas`, U7), not a Thesaurus tab. **G5's rail must not
change U7's layout.** It opens as a folded panel from a *Lenses* icon at the left end of the top views slider, and
closes with Esc or `L`. U7's right column (Loose threads) also holds G5's lists.

## L1.1-02 · G5 Tools

| Push | Fit | Builds | Files | Test / check |
|---|---|---|---|---|
| 02.1 Node facts and lens engine | Careful | The worker sends per-node `attrs`: pos, gender, registers (sense tags), deck ids, tags, text ids (sightings), memory band, firstMet. They are stored as an extra **unindexed** field on the `graphLayouts` row (no Dexie version), and the stamp gains decks and tags. `core/graph/lenses.ts`: `type Lens = { kind: 'state'\|'memory'\|'pos'\|'gender'\|'register'\|'theme'\|'rank'\|'deck'\|'tag'\|'text'\|'little'\|'met'; value?: string }`, `lensAlpha(n, attrs, lenses): Float32Array` (dims to 0.25, **never hides**), `familyMask(families): Uint8Array` | `workers/graph.worker.ts`, `core/graph/lenses.ts`, `core/contracts/db.ts` (optional `attrs`) | Unit tests: dimming, never hiding, families masked |
| 02.2 The rail | Any | Show (state, memory) · Kind (pos, gender) · Register · How common (top 1k / 3k / 10k / rarer) · From (deck, tag, text, theme) · Threads (the six families on and off) · Also (only-met words, the little words). The lens goes in the address (`?lens=`) | `features/thesaurus/atlas/Rail.tsx` | Browser: each lens dims correctly; U7 intact at 1366×768 |
| 02.3 Saved views | Any | `data/atlas.ts`: `saveView`, `useViews(lang)`, `deleteView` (soft: `deletedAt`, `updatedAt`), `mapRow(lang)` (the row `${lang}:map` holding pins and the camera). The camera moves from localStorage into the map row (read localStorage once as a fallback). Saved views appear in U7's views slider; `/atlas?view=<id>` opens one | `data/atlas.ts`, `AtlasTab.tsx` | Survives a reload; a backup round trip (extend `data/graphTables.test.ts`) |
| 02.4 Lasso and selection bar | Careful | Shift-drag lasso (a screen polygon turned into world space; point-in-polygon over the visible nodes). The bar: Tag… · Make a deck… (**preview first**: "saving is not scheduling") · Practise these · Save as view · Clear. Esc clears | `AtlasCanvas.tsx`, `features/thesaurus/atlas/SelectionBar.tsx` | Browser |
| 02.5 Right-click menu | Any | Add to deck… · Mark known (`markKnownBulk` in `data/words.ts`) · Link to… · Pin / Unpin · Open in the dictionary · Open its compass. Also Shift+F10 and the context-menu key | `features/thesaurus/atlas/WordMenu.tsx` (the menu primitive from `design/primitives`) | The keyboard path works |
| 02.6 Your links | Any | Alt-drag one word onto another, or *Link to…* (a search picker). `data/words.ts`: `linkWords(a, b)` and `unlinkWords(a, b)` write `relatedWordIds` on **both** words (bumping `updatedAt`). Undo by the toast's Undo and by `Z` (the atlas keeps a small stack of operations) | `data/words.ts`, atlas files | Tests: both sides written, unlink clears both, undo restores; drawn as the `yours` family |
| 02.7 Pins | Careful | Dragging a word pins it. `core/graph/layout.ts` takes `pins: Map<key, [x, y]>`, held fixed while settling, and only that region relaxes. A pin mark is drawn. *Lay it out again* (a new stamp; keeps pins unless "also unpin" is chosen) | `core/graph/layout.ts`, `data/atlas.ts` | `layout.test.ts`: pinned nodes don't move |
| 02.8 Clusters and notes | Any | *Make a cluster* from a word or a hub: a dialog of the word and its meaning neighbours (checkboxes), named, saved as a tag (`Word.tags`). A tag of 2 to 60 words is a hub; a bigger one is a lens. *Link to a note*: a picker of the language room's Notes topics ([LANGUAGE-ROOM.md](LANGUAGE-ROOM.md)) writing `Word.grammarTopics`; a topic with 2 to 60 words is a hub | `features/thesaurus/atlas/ClusterDialog.tsx`, `data/words.ts` | Tests: hub vs lens threshold |
| 02.9 The lists (WORD-GRAPH-PLAN §7) | Any | In U7's right column, under Loose threads: **Fading here** (retrievability under 0.8, in view) → *Review these N* · **Loose threads** → link one, or open its compass with words to discover · **Words to discover** (ranked by how many of your words each joins, then by rank) → *Add to the inbox* (`data/inbox.ts`) with a sentence · **Your mix-ups** (`mixUpsOf`) → *Practise telling them apart* (a matching set). Practice gains `?words=<id,id,…>`: `PracticePage` filters `c.facts` to those words | `AtlasTab.tsx`, `features/practice/PracticePage.tsx`, `data/practice.ts` | Each action clicked and seen landing |
| 02.10 Meaning maps (F0146, F0147, F0159) | Any | Presets in the views slider: *Synonyms* (the meaning family only), *Opposites* (antonym threads with a small bar glyph), *Fields* (themes and topical sense labels as hubs) | presets in `core/graph/lenses.ts` | Browser |

- **Feature IDs:** F1083, F1084, F1088, F1091, F1094, F1095, F0146, F0147, F0159.
- **Done when:**
  - G5's own done-when holds: every list's action has been tried in a browser and lands in Practice, the inbox or a
    deck preview
  - a view is saved, survives a reload and is brought back
  - a link is drawn and undone with Z
  - U7's layout is unchanged at 1366×768

## L1.1-03 · G6 time and bridges, G7 finish (all Careful)

- **03.1 The first-met fix** (WORD-GRAPH-PLAN §15). In `data/words.ts`, `wordHistory`'s `firstMetAt` becomes the minimum
  of `Word.createdAt` and each sighting's **`createdAt`**. Today it reads `at`, which `recordSighting` sets to the last
  meeting. Add a test.
- **03.2 The time slider and Play.**
  - A strip at the bottom centre, running from the first word to today.
  - A node appears once its firstMet (from 02.1's attrs) is reached; a thread grows over 200 ms once both its words
    exist; nothing moves.
  - Play takes about 8 seconds for any span.
  - With reduced motion it steps without growing.
- **03.3 Bridges (F1089).** When the learner has two or more languages (`languages` table):
  - The compass's Origin quarter lists the learner's words in their other languages first: `cog` matched through
    `normalizeWord` against that language's `words`.
  - The atlas gets a *Bridges* lens; on hover, the thread is drawn out to a small inset of the other language's region.
  - False friends are marked (`data/contrastNotes.ts`), and the hover shows both meanings.
  - **Shared-meaning bridges:** a script samples 50 pairs and the result goes in DECISIONS. They are kept only if the
    sample reads right, which is the source's bar.
- **03.4 The finish.**
  - Every hub's glyph: a lozenge for a theme, the affix in italic, a seal square for a character, a roundel for a root,
    a closed book for a text, quotation marks for a sentence, an underlined phrase.
  - Washes and paper grain.
  - Tokens read from CSS whenever the theme or palette changes (a `MutationObserver` on `<html>`).
  - All twelve palettes in both lights; reduced motion everywhere.
- **03.5 The screen reader and the keyboard.**
  - The canvas is `role="img"` with a summary ("Your web: 3,043 words in 38 regions; mar chosen").
  - A *List* view: regions as headings with their words, as a real DOM list, windowed above 2,000 words.
  - A polite live line follows the keys ("marea, form, not yours yet").
  - Every key works: the arrows, Enter, Esc, `/`, `+`, `−`, `0`, `L`, `T`.
- **03.6 The performance check.**
  - Profiles: the 5,000-word test profile (WORD-GRAPH-PLAN §11), plus a 10,000-word synthetic web made by a dev-only Lab
    button. The button fills a **separately named throwaway database** (for example `${PRODUCT.db}-perf`, opened only
    by that check) and never touches the real `lemora` dev database.
  - Targets: the first frame from the cache under 300 ms; frames at p95 ≤ 16.7 ms (the Lab's FPS monitor,
    `features/lab/PerfHud.tsx`); nothing drawn at rest; memory under 40 MB at 10,000 words.
  - Measured in Chrome and Safari at 1366×768.
- **03.7 Docs.**
  - The handbook's Atlas page (`docs/handbook/handbook.html`, then `node scripts/handbook-pdf.ts`).
  - All twenty graph entries (WORD-GRAPH-PLAN §12) reconciled in [LEDGER.md](LEDGER.md).
  - The user is asked the handbook's own question ("what did you learn from it?") and the answer is recorded.
- **Done when:** the row's criterion holds, without "responsive access" (desktop only, decision 4).
