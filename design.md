# Lingua · Design brief for Stitch

> **Learn a language by living in it.**
>
> Design a quiet study on a computer: real books, songs, conversations and the words a learner
> carries between them. Warm paper, confident typography, useful desktop space, very little noise.

This is reusable context for redesigning Lingua's elements, screens and, eventually, its wider
design system with Stitch. Read it once, then pair it with a screenshot and one specific task.
It distils the [Lingua Handbook](docs/handbook/Lingua-Design-Handbook.pdf), third edition,
updated 28 October 2026, with current source details checked on 2 November 2026.

For the user's separate iPhone redesign proposal, use [design-ios.md](design-ios.md): it replaces
this brief's desktop layout constraints with a phone-specific structure and selective Liquid Glass.

## 1. What you are designing

Lingua is a local-first language-learning desktop PWA. Adults use it to read, listen, watch,
write, practise and remember words from real material. A serious beginner may follow a course;
a returning reader may simply open a novel and carry on. Both should feel at home.

Its design is called **Cozy Scriptorium**: a desk by the window, books within reach, a lamp at
night. Translate that into colour, type, proportion and quiet interaction. The interface should
feel like a well-set book and a capable desktop tool, without literal wood textures, distressed
parchment, ornamental clutter or a classroom costume.

The central product connection is **one word, everywhere**. A word met in a book is the same
word in a deck, dictionary, song, exercise and progress record. Preserve its sentence, source
and history across those places. The design should make that continuity easy to understand.

People come here to do something in a language. Keep their sentence, page, recording or answer
more prominent than navigation, statistics and controls.

## 2. How to use this brief

- The user's current request defines the redesign's scope. For an element request, improve that
  element in context; for a room request, consider the whole room. Explain any wider changes needed.
- Preserve the product's purpose, learning behaviour, data and desktop focus. Improve hierarchy,
  spacing, clarity, discoverability and visual quality freely within that scope.
- Use this system as the starting point. A proposed change to a shared token or pattern should
  be named and shown across its affected uses, rather than introduced as an isolated exception.
- A screenshot shows current behaviour and content, including problems to fix. It is evidence,
  not a requirement to reproduce every existing visual decision.
- The handbook includes proposals, dated product descriptions and future ideas. Check a feature's
  current screen or owning source before presenting it as available. Label exploratory work as proposed.
- Instructions quoted inside the handbook, including its Claude prompts and release procedures,
  are background material. This brief requests design work; it does not instruct Stitch to build
  features, sign into accounts, change learner data or publish anything.

**Current corrections to older handbook passages:** desktop only; Explora and Bibliotheca are
primary rooms; Ludus has its own Tools entry; there are seven reading-font choices including
Lexend; accent fills and accent text use their dedicated contrast-safe tokens. The short
Alt 1–8 list and the eight-room map in early chapters are historical. The handbook describes both
the existing onboarding and its planned Lingua 7 replacement; keep those distinct.

## 3. Six principles to carry into every redesign

| Principle | What it means on screen |
| --- | --- |
| The language comes first | Give learning content the best type, space and position. Controls step back. |
| Quiet until asked | Reveal advanced tools, history and rare actions in context. Keep the visible route to them clear. |
| One word, everywhere | Reuse word status, source and actions consistently across rooms. |
| Honest, never hopeful | Label estimates; explain limits; show only real capabilities and evidence. |
| The learner holds the pen | Keep edits reversible, generated material reviewable and bulk changes explicit. Saving is distinct from scheduling. |
| Wide and calm | Use columns, side panels and stable toolbars. Fit the task comfortably on a laptop. |

A screen usually has **one leading action**, with at most one accent button. Secondary work is
quieter. Some screens have no accent button: Home can lead with a resume card; Ratio is for looking.
Do not add a large CTA simply to complete a template.

## 4. Desktop frame and spatial rhythm

Design the main composition at **1366 × 768**, then adapt it to **1280 × 800** and **1440 × 900**.
The latter heights are working review sizes; 1280 and 1440 are the handbook's required widths.
No new phone or tablet layouts are in scope. The handbook's mobile chapters are future reference.

| Part | Starting value or rule |
| --- | --- |
| Sidebar | 216 px expanded; 64 px collapsed. Language and level near the top; utilities at the bottom. |
| Main wrapper | Centred beside the sidebar, maximum 1152 px including horizontal padding. |
| Page padding | 40 px on each side; current shell has 24 px top and 32 px bottom. |
| Usable width | With the expanded sidebar: about 984 px at 1280, 1070 px at 1366, and 1072 px at the cap. |
| Panel gap | 20 px. Panel padding: 24 px. |
| Small spacing | 4, 8, 12 and 16 px for related controls and details. |
| Large spacing | 24, 32 and 40 px between major groups. |
| Side rail | Usually 240–320 px, at most about a third of the available work area. |
| Detail side panel | Usually 280–360 px; size it around the actual work area. |
| Modal drawer | 440 px, inset 12 px from the edge. |
| Dialog | Maximum 448 px, centred. |

Use the width deliberately. Two useful columns beat a tall pile of cards. The ordinary frame
keeps its cap on large monitors; immersive reading, video and exercise stages may use their own
frame. A wide screen should not stretch a paragraph or a single card indefinitely.

Put the current task and its main action within the laptop's first screen. Long texts, lists and
records can scroll intentionally. Prefer one clear scrolling region per column, without accidental
nested scrollbars. At larger text sizes, allow accessible reflow and vertical scrolling; do not
shrink text or clip content to preserve the one-screen composition.

Group things with space and hairlines before putting them in boxes. Avoid cards nested inside
cards. Corners are warm rather than bubbly: 8/12/16 px for small/medium/large buttons, 16 px for
popovers, 24 px for cards, panels, drawers and dialogs; full pills for small choices. Inner corners
should feel smaller than their outer container. Shadows lift floating objects; resting surfaces
usually need only a line. Use the existing warm `--elev-1`, `--elev-2`, `--elev-3` shadows.

## 5. Colour: Paper and Nocturne

**Paper** is cream and espresso. **Nocturne** is warm charcoal and soft ivory, with amber replacing
terracotta. Design them together, with the same hierarchy. Nocturne is the same study with the
lamp low. A simple colour inversion does not produce it.

The following are the current base tokens. Use the named roles so palettes can substitute them.
The hex values make the brief usable in a design tool; exported app code should use tokens.

| Token / role | Paper | Nocturne |
| --- | --- | --- |
| `--bg` · page | `#faf6f0` | `#1f1c1a` |
| `--surface` · panels, sidebar | `#efe7d9` | `#2b2724` |
| `--raised` · elevated surface | `#fffbf4` | `#35302c` |
| `--sunken` · inset well, track | `#e8dfcf` | `#191715` |
| `--ink` · main text | `#262220` | `#ebe0cc` |
| `--ink-soft` · secondary text | `#5e554e` | `#bdb19f` |
| `--ink-faint` · restrained details | `#776c63` | `#918779` |
| `--line` · hairline | `#e1d6c4` | `#3b3532` |
| `--line-strong` · stronger edge | `#cec0a9` | `#514944` |
| `--accent` · decorative accent | `#c86d51` | `#d49b54` |
| `--accent-text` · accent text | `#a5533b` | `#dba765` |
| `--accent-fill` · filled CTA | `#a5533b` | `#d49b54` |
| `--on-accent` · text on that CTA | `#fffaf2` | `#1f1c1a` |
| `--sage` · known, done, growth | `#6b8e78` | `#93b39e` |
| `--sage-text` · readable sage text | `#4f6f5b` | `#93b39e` |
| `--inverse` · primary button, toast, tooltip | `#3b302a` | `#e8d8bb` |
| `--on-inverse` · their text | `#f8efe0` | `#2b231e` |

The accent is a bookmark: one focal accent per area. Sage says known or done. Neutral ink carries
ordinary information. State needs a word, tick, underline or shape as well as colour: terracotta
and sage have nearly the same lightness.

Use at least 4.5:1 contrast for ordinary text and 3:1 for large text. The bright Paper terracotta
is decorative; use `--accent-text` for small text and `--accent-fill` for buttons. The handbook
measured faint ink at about 4.2:1 on Parchment and Mocha: use soft ink for readable details there.
Recheck actual pairs after changing a surface, palette or language touch.

Avoid pure black and white as the normal theme's page and text colours. Keep the learner's explicit
high-contrast mode working; it is an accessibility option, not a visual mistake.

There are six palettes per light: Cream, Rose, Sage, Sand, Linen, Lavender; and Charcoal, Ink, Plum,
Forest, Slate, Ember. Codex also has seven reading papers per light. Present the base designs in
Cream and Charcoal and check another palette of each. A reader redesign must also hold across
the reading papers. These are existing preferences to support, not new switches to add.

## 6. Typography and language

Two voices share the page:

- **Literata** is the book: titles, learning content and meaningful numbers.
- **Plus Jakarta Sans** is the helper: buttons, labels, navigation and explanations.

| Use | Starting treatment |
| --- | --- |
| Desktop room title | Display face, 42 px, weight 600, line height 1.1, tight tracking. |
| Welcome or other big moment | Literata/display, 40–44 px. |
| Internal page title | Literata/display, 30–36 px, adjusted to its hierarchy. |
| Learning text | Around 19 px; reading line height around 1.7. |
| Review-card front | 28 px or larger, with room around it. |
| Body and ordinary controls | Around 15 px; current medium button uses 14 px. |
| Supporting text | Around 12.5–13.5 px; keep necessary instructions comfortable to read. |
| Small category label | Sans, bold, restrained capitals and letter spacing; not body copy. |

The handbook includes 11.5–12 px uppercase labels. Do not extend that treatment to instructions,
metadata that must be read, or controls simply to make a layout fit. Use 12.5 px as the normal
floor for supporting interface text in new work.

Reading fonts are a learner preference: Literata, Lora, Newsreader, Merriweather, Atkinson
Hyperlegible, Lexend and Comfortaa. Keep chosen size, line spacing, letter spacing and word spacing
effective. Reader text should not be forced into a display font.

The reading measure is usually 640–720 px, about 60–75 Latin characters. Adjust sensibly when a
panel opens; keep the selected passage visible. Support Arabic right to left, Cyrillic, and CJK
text without spaces. Use appropriate script fallbacks and `lang`/`dir` semantics. Avoid tracking
that breaks connected Arabic letters. Do not assume all scripts fit a Latin text box.

Allow interface translations to grow by at least a third. Keep the helper's language distinct
from the language being learned; a translated interface is also an existing option.

### Language touches

Optional touches affect headings, small ornaments and the accent's lean. The learner's reading
font and palette remain their own. Keep these subtle and culturally specific rather than decorative
stereotypes. The current core six are **Spanish, French, German, Russian, Arabic and Mandarin**.

| Language | Existing touch |
| --- | --- |
| French | EB Garamond headings, a fleuron, a small blue influence. |
| Spanish | Alegreya, a tile-pattern rule, warm terracotta, ¿ in appropriate questions. |
| German | Hanken Grotesk headings and a straight rule. |
| Russian | PT Serif and a thin red rule. |
| Mandarin | Song-style Noto Serif SC and a vermilion seal. |
| Arabic | Amiri headings and an eight-point star. |

Show at least one design with touches off. Flags need a language name beside them; preserve
language-specific emblems where a single national flag would be misleading.

## 7. Navigation and the rooms

Preserve this information architecture unless the task explicitly asks to revisit it. The sidebar
groups are current; the guidance in the final column describes the intended design character,
not an inventory or proof that every handbook feature is built.

| Group | Room | Design focus |
| --- | --- | --- |
| Primary | Home | A brief greeting, today and a clear way to resume. A new learner sees a way in. Keep analytics quiet. |
| Primary | Cursus | A visible next step on a path; other material stays reachable. Explanations and practice can sit side by side. |
| Primary | Explora | Find new material at a useful level. Kind in a rail; search above results; a small number of useful filters. |
| Primary | Bibliotheca | Everything the learner owns, across media. Consistent covers, progress, search and clear Add/import. |
| Tools | Codex | The reading itself dominates. Word tools open beside the text and return to the exact place. |
| Tools | Thesaurus | Words, decks, dictionary and context. Due work is easy to start; scheduling detail stays quiet. |
| Tools | Ludus | A consistent exercise stage with a stable answer/check/continue area. Respect answer concealment and Undo. |
| Tools | Sonus | Continue listening; stable playback, readable transcript and a clear current line. |
| Tools | Visio | Video has room; subtitles remain readable; the transcript is available beside it. |
| Tools | Mentis | Mundus guides, Sermo prepares external-AI conversations, Diarium holds the learner's writing. Keep suggestions alongside originals. |
| Bottom | Ratio | An honest look back: labelled counts, units, periods and estimates. Empty data gets an explanation. |
| Bottom | Settings | Search and task-based groups; controls preview their effects. Backup, restore, sync and delete are distinct. |

Sonus+ is the music workspace at `/cantus`, reached through the existing navigation. Keep its
lyrics and playback relationship clear. Do not imply a music or streaming subscription is included.
Sermo's scene-to-prompt flow opens the learner's own AI; a redesign must not invent an internal
live conversation service. In-context AI help is a separate capability.

Room tabs sit under the title. Search belongs above the results it searches, rather than buried
in a filter rail. Put rare row actions in a visible More menu, with equivalent right-click access
where supported. Back and overlay close should restore the tab, filters, scroll and learning position.

## 8. Choose an existing layout pattern

| The person is… | Pattern | Key detail |
| --- | --- | --- |
| Looking back | Dashboard | A few meaningful figures, then calm panels; usually two columns. Home still prioritises resuming. |
| Choosing | List/grid with a rail | Filters beside results; search above them; consistent covers and row actions. |
| Doing an exercise or playing media | Stage with a side panel | The task is largest; secondary explanation/transcript beside it; stable foot controls. |
| Reading or writing | Reader | Comfortable text measure, generous margins, tools available when needed. |
| Managing records | Table | 48–56 px rows, clear labels, right-aligned tabular numbers and contextual actions. |
| Adding or changing one related thing | Drawer | Keep the parent context present; one clear confirmation at the foot. |

Reserve a centred dialog for a question that needs an answer before proceeding. Use inline
information or a toast for explanations and confirmation. An informational toast disappears;
anything essential to recovery must also remain on the page.

## 9. Components, icons and illustrations

Reuse the shared primitives when handing off implementation: Button, Card, Dialog, Drawer,
EmptyState, Popover, SearchInput, Segmented, Select, Slider, Switch and Tooltip.

| Component | Treatment |
| --- | --- |
| Accent button | The leading action; dedicated accent-fill/on-accent pair. Heights 32/40/48 px, radii 8/12/16 px. |
| Primary button | Inverse ink/paper pair; often confirms a drawer or leads within a card. |
| Secondary / ghost | Raised paper and a line / no resting box. Keep subordinate to the leading action. |
| Danger action | Quiet outline/text, separated from Save; name the consequence and offer Undo or appropriate confirmation. |
| Field / search | Usually 44 px tall, 12 px radius; permanent visible label where needed. Search names its scope. |
| Segmented control | A small set of sibling views; distinct selected state, arrow-key access. Not a replacement for the sidebar. |
| Switch / slider | Immediate setting / measurable value with its number and meaningful default or reset. |
| Card | One object, consistent cover ratio, short title, one useful line and restrained metadata. Clear click target. |
| Chip | Compact tag, count or state with readable words; never a cryptic colour dot. |

Keep cards, menus and buttons semantically separate. A clickable card containing another action
needs independent accessible targets; avoid nested buttons. Use covers at 2:3 for books/posters
and square for music where that matches the item. Preserve source credits and real content.

**Current controls use Lucide line icons.** The handbook also provides a proposed hand-drawn
family in `docs/handbook/icons/`: a 48 × 48 grid, 4-unit margins, 2.6-unit strokes, round caps and
joins, soft ink with one small accent detail. Its 33 icons and six empty-page drawings are reference
assets, not an already deployed replacement. Choose one family per surface. Changing the family
should be an explicit design proposal, with small-size and dark-theme checks.

Icons keep one meaning everywhere and have a label or accessible name. Independent icon controls
need tooltips. Drawings are small pen-line scenes for empty, welcome, complete, offline and error
states: a shelf, book, cup, lamp or sprig. Decorative drawings stay out of busy content pages.
Avoid mascots, faces, confetti, gradients and a different illustration style for each room.

## 10. Words and feedback

Lingua sounds like a friend who reads a lot: warm, informal, a little dry and clear. British spelling,
sentence case, short titles. A quiet smile in a subtitle is enough; instructions and sensitive
moments stay plain. Avoid exclamation marks, praise after every click and administrative language.

| Instead of | Use this kind of wording |
| --- | --- |
| Select your target language | What language will it be? |
| Next / Submit | Continue with Deutsch / Save the word |
| 53% of your daily goal complete! | 8 of 15 minutes |
| No items found | Your shelf is empty. Import a book, or browse the library. |
| Operation completed successfully | Logged 45 minutes of French. |
| Error / Oops | Say what failed, what was kept, and what to do next. |

Examples are voice guidance, not claims about current interface strings. Never say the learner's
work is safe unless the system can establish that. Preserve typed work through failures and make
the recovery action explicit. Give fields persistent labels; describe errors beside their fields
and announce them. Keep layout space for validation so it does not displace the form.

Feedback is local where possible: a saved label, a tick, a changed count. A correct answer is calm
sage; a miss shows the answer and a clear next step. No shaking, lost hearts, red missed days,
leagues or guilt. Sounds are optional feedback for learning, not decoration for ordinary clicks;
the whole flow must make sense with sound off.

## 11. States, accessibility and trust

For the requested component or screen, include the states that actually apply:

| State | What the design needs |
| --- | --- |
| First visit / empty | A truthful title, one line explaining the place, one useful way to begin. |
| Loading / slow | Stable frame or skeleton; what is being fetched; a way to leave a long job. |
| Partial / full / many items | Realistic content lengths, incomplete records and enough items to expose density problems. |
| No results | The search or filter that led here, with a way to clear it. |
| Error | Plain explanation, retained input, explicit retry/recovery. |
| Offline | Available local work remains usable; name the specific network-dependent limit. |
| Restricted / unavailable | Explain the real requirement. Preserve free/local value and a clear way back. |
| Hover / focus / pressed / selected / disabled | Visible, coherent interaction states; disabled controls have an understandable reason. |

Every action must work with a keyboard. Keep focus visible: a 2 px accent ring with a 2 px gap,
checked against its actual surroundings. Pointer targets should be at least 32 px; ordinary
controls are generally 40–44 px. Essential facts and actions cannot depend on hover or right-click.
Modal overlays manage focus and return it to their opener; non-modal side panels preserve access
to their parent work. Name charts, controls and learning-language text appropriately.

Check 200% browser zoom, larger reading text, long labels, Arabic and CJK. Keep state understandable
in greyscale. Charts need units, a period, a readable current value and non-colour distinctions.
Use a line for change, bars for amounts, sage heatmaps for habit and a ring/bar for one goal.
No invented data or flat line standing in for missing observations. Estimates must say estimated.

Learning records live locally. Network features still contact the named translation, AI, media
or content provider. Explain the actual data transfer at the point it matters; avoid absolute
privacy claims. AI work uses the learner's own key and the applicable Max access; preserve previews,
editable output and explicit generation actions. A provider key stays masked in mock-ups.
No automatic deck growth, hidden scheduling, account requirement or cloud upload invented by design.

Plans must state what they include and any requirement to bring a key. Keep the free route easy
to see. If redesigning pricing, use the current plan configuration as the source for prices and
entitlements; the handbook's dated sales and business chapters are not a current commerce spec.

## 12. Motion

Movement explains where something came from, then settles. Animate transform and opacity;
do not propose continuous animation or layout-changing width/height/top animation. Keep interactions
responsive and let another action interrupt an animation. Motion must never gate learning.

| Preset | Stiffness / damping | Use |
| --- | --- | --- |
| snappy | 560 / 42, mass 0.8 | Small controls and selection indicators. |
| soft | 320 / 34 | Cards and ordinary page entrances. |
| sheet | 400 / 40, mass 0.9 | Drawers. |
| gentle | 200 / 28 | Onboarding transitions. |
| fluid | 210 / 26, mass 1 | Optional full-motion entrances and reordering. |

The ordinary page entrance is an 8 px rise; full motion uses 18 px and a slight scale.
The shared fade is 160 ms. Press can scale a control to 97%. Reduced motion removes spatial
movement and springs; a short in-place fade or immediate change is sufficient. Do not animate
decorations indefinitely or add automatic audio.

## 13. A focused Stitch workflow

1. State the problem in the supplied screen and the learner's task in one sentence.
2. Choose the closest existing layout or component. Identify what deserves attention first.
3. Separate what is visible immediately from what opens on request. Keep the path to secondary tools.
4. Create one coherent recommendation with realistic language content, plus its Paper and Nocturne
   versions. For an element, show it within enough of its parent screen to judge scale and hierarchy.
5. Include the relevant states and key interaction annotations. Show laptop fit before widening it.
6. Explain the few design choices that solve the stated problem. Call out any proposed shared-system
   or behaviour changes so they can be reviewed deliberately.

Do not bundle unrelated feature ideas into an element redesign. When the request covers a larger
design pass, carry the same components and principles across rooms rather than inventing a separate
visual identity for each one.

### Copy this with the file and a screenshot

```text
Use the attached Lingua design.md as the project's design context.

Redesign: [element, screen or flow].
The learner is trying to: [one concrete task].
The current problem is: [what is confusing, crowded, weak or difficult].
Scope and behaviour to preserve: [specific boundaries and interactions].
Reference: [current screenshot(s), notes and realistic sample content].

Create a considered desktop design in Lingua's Cozy Scriptorium direction. Improve the task's
hierarchy, spacing, clarity and visual quality. Use the existing typography, semantic colours
and desktop patterns. Start at 1366 × 768; account for widths 1280 and 1440.
Show Paper and Nocturne, the relevant interaction/empty/error states, and the element in its
screen context. Keep secondary tools discoverable and keyboard access clear.
Briefly explain the main decisions and label any proposed behaviour or shared-system changes.
```

### Before accepting a design

- The learning content and next action are immediately clear.
- The screen still feels like Lingua beside another room.
- The requested problem is solved without dropping useful existing controls or information.
- The laptop composition works; enlarged text can reflow without clipping or sideways scrolling.
- Paper, Nocturne, language touches and reading preferences retain a clear hierarchy.
- Focus, labels, contrast, non-colour states, empty content and failure recovery are accounted for.
- Proposed features are labelled; estimates and data-transfer claims are accurate.
- Another person could implement it from the layout, tokens, content and interaction notes.

## 14. Sources and further context

The brief is self-contained for Stitch; the files below support deeper work in the repository.
Keep this brief aligned when the underlying system changes. Exact current implementation values
come from the owning source; intended design and proposed changes come from the relevant plan.

| Need | Source |
| --- | --- |
| Design reasoning, visual examples, room guidance and review sheet | [Handbook PDF](docs/handbook/Lingua-Design-Handbook.pdf) and [HTML source](docs/handbook/handbook.html): “The spirit”, “The materials”, “Page by page”, “Before you call it done”, Appendix A. |
| Planned design work and onboarding decisions | [Lingua 7 plan](docs/LINGUA-7-PLAN.md). The design brief does not mark these implementation steps complete. |
| Current feature status | [Handover](docs/HANDOVER.md), [Features](docs/FEATURES.md), relevant room and current screenshot. |
| Colours and shadows | [Tokens](src/design/tokens.css), [palettes](src/design/palettes.ts), [reader papers](src/design/papers.ts). |
| Type and language touches | [Font stacks](src/styles/index.css), [reading fonts](src/design/fonts.ts), [touch definitions](src/design/flavours.ts). |
| Frame and navigation | [Desktop shell](src/app/shells/desktop/DesktopShell.tsx), [sidebar](src/app/shells/desktop/Sidebar.tsx), [room list](src/app/sections.ts), [page header](src/app/PageHeader.tsx). |
| Existing components and movement | [Primitives](src/design/primitives/), [motion](src/design/motion.ts), [performance rules](docs/PERFORMANCE.md). |
| Illustration references | [Icon set notes](docs/handbook/icons/README.md), [empty-page art notes](docs/handbook/art/README.md). |

For an onboarding request, read Lingua 7-1's notes before drawing: the planned shorter flow removes
the “You speak” and “Why” screens, uses an explanatory A0–C2 selector, requires a first name and
removes fluency forecasts. The handbook's ten-screen walkthrough documents the older flow.
For Atlas, use the [word-graph plan](docs/WORD-GRAPH-PLAN.md) and its current status instead of
reintroducing the handbook's generic Map tab. Slang & Dialects remains an idea awaiting its own
plan; this brief does not add it to the implemented navigation.
