# Lingua for iPhone · Design brief for Stitch

> A whole language in your pocket. Open it, carry on, keep a word, leave with your place saved.

Design an **iOS app organised around what a person wants to do on a phone**. Rethink the
navigation, screen hierarchy and interactions rather than shrinking Lingua's desktop rooms.
Use **Liquid Glass selectively** for navigation and appropriate controls, including buttons
and sliders. Keep reading, writing, lyrics and learning content warm, steady and exceptionally legible.

This is a design proposal requested on 2 November 2026. It extends the
[Lingua Handbook](docs/handbook/Lingua-Design-Handbook.pdf) and complements the
[desktop brief](design.md). The user's new request authorises phone design exploration;
the older desktop-only restriction does not govern this proposal. No iOS app, new native
capability or proposed navigation below is claimed to be implemented by this document.

## 1. The experience to aim for

Lingua helps adults learn through real books, songs, podcasts, video, writing and practice.
A word encountered in any of them retains its meaning, source sentence, history and learning
status everywhere else. The phone should make those connections feel immediate.

The desktop's Cozy Scriptorium becomes a **pocket reading room**: warm paper, expressive book
type, a little terracotta, calm feedback. Native iOS navigation and controls provide familiarity.
The content supplies Lingua's identity; the functional layer supplies clarity and reachability.

Design for interrupted moments: reading on a train, listening while walking, reviewing a few
words in a queue, writing three sentences before bed. Someone should be able to resume in one
tap, work comfortably with one hand and leave without losing an answer, draft or place.

The structural change is substantial:

- Four stable destinations replace a long list of rooms.
- An item opens directly into its activity, without an intermediate room dashboard.
- A single Library owns saved material; Practice acts on it without creating a second copy.
- One shared word detail connects reading, listening, phrases and review.
- Contextual sheets replace permanent desktop side rails.
- Active audio has one compact dock; ordinary screens stay free of competing floating controls.

This is the recommended architecture to prototype. Validate it with navigation tasks and actual
learners before treating it as a settled product decision.

## 2. Four destinations, named for the learner

Use a labelled bottom tab bar: **Today · Library · Practice · Explore**. These are destinations,
not action buttons. Keep all four stable across plans and supported learning languages.
Each retains its own position, filters and navigation stack when the person switches tabs.

| Tab | The question it answers | What appears first | What stays one level deeper |
| --- | --- | --- | --- |
| **Today** | Where do I carry on? | One strong Continue item, a compact daily line, one useful alternative. | Progress, goals, the guide's reasoning, weekly history. |
| **Library** | Where is my stuff? | Recent and saved items; search; a clear Add action. | Reading, Audio, Video, Words, Writing; folders, filters and imports. |
| **Practice** | What can I work on now? | Due review and the next lesson; a small set of practice routes. | Learn, Speak, Write and Games; language-specific tools within those routes. |
| **Explore** | What could I try next? | A few level-appropriate finds with clear kinds and sources. | Reading, listening, watching and ready-made decks; search and filtering. |

Use one plain-language label per destination. Latin names remain part of Lingua's character in
section subtitles and familiar tools: “Read · Codex”, “Your words · Thesaurus”, “Journal · Diarium”.
Knowing Latin room names must not be a prerequisite for finding a task.

The current learning language appears as a small, labelled switcher on Today and the other
tab roots. Changing it is explicit and preserves the other language's place. Settings opens
from a clearly named control on Today; do not introduce an account or a pretend profile avatar.
Progress is a visible link on Today, not something hidden inside Settings.

**Reach targets for the prototype:** resume from Today in one tap; reach due review in no more
than two; find saved words or a journal entry within three deliberate selections from a tab root.
These are design goals to test, not measured claims about the existing app.

Apple's [tab-bar guidance](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
supports persistent, state-preserving destinations. The four labels and grouping here are a
Lingua proposal, not an Apple-prescribed architecture.

## 3. Where every existing room goes

Reorganisation must preserve access to the whole product. Some activities have several useful
entry points, but they still open the same underlying item and record.

| Existing area | iPhone home | Contextual entry or detail |
| --- | --- | --- |
| Home | Today | Resume the exact item, lesson or draft. |
| Bibliotheca | Library | One collection across media; Recent, Saved and Downloaded are views of it. |
| Explora | Explore | Discovery by material type and level. Preview before adding. |
| Codex | Library → Reading | Open directly into the reader. Reading exercises also appear in Practice. |
| Thesaurus: decks, words, dictionary | Library → Words | Due work opens in Practice → Review; dictionary lookup opens the shared word detail. |
| Word inbox and phrases | Library → Words → Inbox / Phrases | Source capture can open the same inbox or phrase draft. Saving does not silently schedule review. |
| Ludus | Practice → Games | One shared exercise frame, with the game's own interaction in the centre. |
| Cursus: course and grammar | Practice → Learn | One next lesson; a topic catalogue below, with explanations and exercises. |
| Sounds, alphabets, marks, typing, exams | Practice → Learn → Relevant tool | Show only tools applicable to the chosen language; represent current availability honestly. |
| Sonus: audio, podcasts, radio, audiobooks | Library → Audio | New sources in Explore → Listen; open an item into its player. |
| Sonus+ music | Library → Audio → Music | Find music through Explore; lyrics and song tools live in the player. |
| Visio | Library → Video | New finds in Explore → Watch; service limitations belong beside the affected action. |
| Mundus guide and Things to try | Today | A suggestion with a reason and a way to dismiss it; more in a guide detail. |
| Sermo and speaking practice | Practice → Speak | Scenes, prompt preparation, the existing external-AI handoff and supported speaking activities. |
| Diarium and writing practice | Library → Writing → Journal; Practice → Write | The same draft/entry from either route. Suggestions never overwrite the original. |
| Notebook and error log | Library → Writing → Notes | Related notes from a word or lesson; errors can link to targeted practice. |
| Ratio, Tabula and goals | Today → Progress | A concise overview, deeper metrics, and language-by-language records. |
| Settings, plans, backups and device tools | Today → Settings | Task-based groups, search and separate data actions. Developer tools remain out of normal study flows. |

The six core languages remain Spanish, French, German, Russian, Arabic and Mandarin. Other
languages retain their actual capability tiers. Do not fill missing tabs with fake lessons or
promise every tool in every language. Atlas and Slang & Dialects require their own current plan;
this proposal does not make them available by placing a new icon in the interface.

## 4. What the main screens should feel like

### Today: a beginning, not a dashboard

A brief greeting, the language, and a large Continue item with its cover or kind, exact position
and a clear verb: “Continue reading” or “Resume listening”. Beneath it, show one alternative,
such as due review or the next lesson. Keep the daily target to one quiet line.

The guide can offer a small suggestion below that. Weekly charts and detailed numbers belong
in Progress. A new learner gets one useful first activity instead of blank statistics.
Do not fill the first screen with a grid of all the old rooms or an endless recommendation feed.

### Library: owned material, immediately recognisable

Use recent items first, then a compact, understandable way to choose Reading, Audio, Video,
Words or Writing. These filters can scroll or open a type menu when text is large; they are not
another app-wide tab bar. Dense collections use generous rows; cover-led shelves use a restrained
grid. Avoid nested horizontal carousels for managing hundreds of items.

Search here means **your Lingua**: saved material, words, phrases, notes and entries, with results
grouped by kind. A local “Find in this book” remains separate. Explore search clearly means finding
new material, so it never appears to search the Library and silently returns something else.
Place search within comfortable reach; a bottom search affordance may expand above the keyboard.
See Apple's [search guidance](https://developer.apple.com/design/human-interface-guidelines/search-fields).

Add opens a short choice sheet for supported file, text or link imports. Downloads carry a
meaningful local-availability state. Context menus and swipe actions supplement a visible menu
or Edit route; they are never the only way to discover an action.

### Practice: start doing, then choose depth

Due review and the next lesson should lead directly into a session. Below them, Learn, Speak,
Write and Games are clear routes, with a concise description. Each contains its tools; avoid
wrapping six desktop tab rows into a smaller screen.

A focused session gives the prompt or sentence the main space, with stable progress and answer
controls. Exit returns to the same Practice position. If an answer has not been saved, preserve
it or ask before discarding it; never lose it simply because the person received a call.

### Explore: a small selection worth opening

Start with a few real, relevant finds, then let the learner browse by kind. Cards say what the
item is, the language/level where known, length and source. Preview an item before adding it.
External services, subscriptions and network requirements are explained where they matter.
The discovery design must not imply new licensing or a universal streaming service.

### First start, Progress and Settings

Make the first start a short sequence of focused phone screens. Retain the required first name,
language, starting level and useful goal/light choices; explain each where it is asked. Replace
the desktop's wide language map with a searchable list and inviting core-language choices, with
country browsing available when wanted. Explain A0–C2 in plain words instead of squeezing a
horizontal staircase onto the screen. Keep free continuation obvious, with no account request,
unsupported fluency forecast or permission prompt before its feature is used.

Progress opens from Today as a readable overview with deeper sections on request. Languages
become rows opening a language record, rather than a horizontally scrolling Tabula table.
Settings uses native grouped lists and detail pages; theme/font choices preview their effect.
Keep export, backup, restore, sync and deletion distinct and clearly labelled. Neither screen
needs a permanent fifth tab or a hidden collection of unrelated tools.

## 5. Liquid Glass: specify its job

Use two visually distinct layers. **Content** is warm, quiet and readable: paper, lists, covers,
sentences and notes. **Controls/navigation** float above it where appropriate, using the system's
adaptive Liquid Glass treatment. Text content does not become a transparent card just because
glass is available. A transient slider or toggle interaction can use glass without turning its
whole settings row into glass. [Apple: Materials](https://developer.apple.com/design/human-interface-guidelines/materials).

| Element | Proposed material and behaviour |
| --- | --- |
| Bottom tab bar | System Liquid Glass, labelled destinations, clear selection. Content can pass behind it, with sufficient scroll clearance. |
| Navigation and compact toolbars | System groups over content; keep related actions together and the main action distinct. Avoid glass controls stacked on glass containers. |
| Floating playback controls | A restrained adaptive glass group where the system pattern supports it. Keep play/pause and return-to-player obvious. |
| Main confirmation / action button | A prominent native treatment with restrained Lingua tint where emphasis helps. Use a solid content button when it is more legible. |
| Secondary toolbar button | Standard unfilled or glass treatment appropriate to its group; a recognisable symbol and accessible name. |
| Slider | Standard native track and interaction-responsive thumb. During adjustment, the thumb may adopt the system's glass effect; the label and value remain readable. |
| Toggle and segmented choice | Standard controls with distinct states and native interaction; avoid drawing a custom glass imitation over them. |
| Word detail, forms and sheets | Native presentation with a quiet readable content surface. Let the system handle surrounding material; do not make definitions translucent. |
| Book pages, lyrics, answer cards, notes | Opaque or standard readable surfaces. No refraction, shimmer or blur through the words being learned. |

Colour is restrained: most glass controls use adaptive neutral labels. The main action may carry
terracotta in light appearance or amber in dark appearance. Test it against changing imagery,
not only an empty cream background. Native materials determine their own opacity and contrast;
do not prescribe one fixed “glass alpha” for every surface. [Apple: Colour](https://developer.apple.com/design/human-interface-guidelines/color).

At handoff, prefer real system components and supported glass styles. A Stitch mock-up illustrates
the design intent; a blur filter in generated web code is not evidence of native Liquid Glass
behaviour. Earlier platform versions need a clear conventional material fallback if supported.
Minimum OS and implementation technology remain separate implementation decisions.
[Apple: Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass).

## 6. Buttons and sliders, in detail

**Buttons:** use a minimum 44 × 44 pt hit area, even when the visible symbol is smaller. Major
study actions should be easy to hit near the lower part of the activity screen. Keep one leading
action per task, verb-led text, obvious pressed/loading states and a separate destructive role.
Glass is a material choice, not a reason for every button to have the same prominence.
[Apple: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons).

Do not use a floating plus as a substitute for a clear Add action in Library. Do not use an
unlabelled magic-wand symbol for several different AI operations. When a button changes to
“Saved”, keep its footprint stable and announce the result.

**Sliders:** show the setting name and current value, with the actual effect visible while
adjusting. Use sliders for ranges, such as text size or playback position; use a picker or stepper
where exact discrete choices matter. Provide accessible increment/decrement operation and a
clear value with units. [Apple: Sliders](https://developer.apple.com/design/human-interface-guidelines/sliders).

| Lingua slider | Design notes |
| --- | --- |
| Reading size | “Text size” with an Aa preview and live sample. Keep the preview clear of the thumb and finger. Preserve the learner's selected font. |
| Playback speed | Show the multiplier; offer a few supported preset choices as well as precise adjustment where supported. The interface must reflect the actual player range. |
| Playback position | Show elapsed and remaining time; make scrubbing distinct from reading a transcript. Update a readable time preview above the finger. |
| Volume | Use the platform's expected audio controls where possible; avoid an extra slider with an unclear relationship to system volume. |

Show slider rest, active drag, release, disabled and VoiceOver-adjusted states. The user should be
able to understand the value when the glass effect is removed. Do not make a text-size control
move the very toolbar being touched or reset the reading position.

## 7. Activity flows built for a phone

### Read → understand → keep → continue

Library or Today opens the reading page directly. Use a single comfortable column, adjustable
type and generous line spacing. A tap reveals necessary controls; they do not cover the sentence.
Single-word lookup opens a concise word sheet; selecting a phrase provides an explicit phrase
action without breaking ordinary selection and copying.

At a medium sheet height, keep the selected sentence visible above it. Show the word, meaning,
sound and separate Keep/Learn/Known actions as appropriate to the current vocabulary workflow.
More meanings and forms expand within the same detail. Large type or a small phone can require
a full-height detail; closing still returns to the exact word, with no lost place.

Keeping a word preserves its source. Scheduling review is an explicit decision with a preview
where needed. Do not redesign the connection into an automatic “create fifty cards” action.
The same detail opens from a lyric, dictionary result, phrase or review card.

### Listen or watch → find a word → return to the line

One player owns playback. Use a compact mini-player accessory above the tabs when audio continues
outside its screen; opening it returns to the active item. Do not stack a second audio dock,
universal Ask button and capture bubble in the same thumb area. Use the system accessory pattern
where supported. [Apple: Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars).

The full player has a clear play control, scrubber, time and a small number of key actions. Lyrics
or a transcript use a readable content surface with the current line clearly marked. Looking
something up preserves playback position and provides an obvious return-to-current-line action.
State whether lookup pauses this activity; do not let that behaviour depend on an invisible gesture.

For portrait video, picture above and timed text below are usually more useful than tiny controls
over the image. Landscape can prioritise the picture. Keep subtitles readable against the video
with a suitable backing surface; glass refraction must not reduce subtitle legibility.

Background audio, lock-screen controls and interruption recovery are proposed iOS requirements,
not certified existing mobile behaviour. Show call interruption, disconnected headphones and
unavailable-network states. Audio must never start just because a screen opened.

### Review → answer → undo

Keep the card or question large and the answer hidden until the learner attempts it. After reveal,
Again, Hard, Good and Easy remain distinct, with readable intervals where applicable. Use a
comfortable two-by-two layout if four horizontal buttons become cramped. Keep the action region
stable across questions and make Undo visibly available.

Swipes may be optional shortcuts once their meaning is clear. They cannot replace labelled
answers or silently grade a card. The existing learning record, schedule and Undo semantics remain
the source of truth; the phone is another way into the same practice.

### Write or speak → feedback → keep the original

Writing opens the draft with the keyboard and its actions in view. Formatting belongs in an
appropriate keyboard accessory or selection menu, not a full desktop toolbar. Checking is an
explicit action. Corrections can appear as a review view or sheet with a clear Original/Reviewed
choice; the original remains available and no suggestion is applied silently.

Speaking makes record, stop, playback and the current state obvious, with a text alternative.
Explain microphone permission when recording is requested. Sermo still prepares a prompt for
the learner's chosen external AI; this redesign does not invent an internal live conversation.
On return, recover the scene and draft rather than dropping the person at the tab root.

## 8. Sheets, gestures and the keyboard

Push a full page for a sustained destination: a book, course topic, collection or progress detail.
Use a sheet for a related task: a quick definition, filter, Add choice or editable phrase.
Use the native share sheet for sharing supported material. Reserve alerts for consequences that
require a decision. Avoid a navigation path made of sheets stacked inside sheets.

A resizable sheet has a clear grabber and suitable medium/large resting heights; a long editor
can start full height. Include a reachable close or Done action as well as swipe dismissal.
Unsaved edits must be retained or explicitly handled before dismissal.
[Apple: Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets).

Preserve native edge-back, text selection and system gestures. Add a visible alternative for
every custom gesture. Do not put page-turn gestures in conflict with back navigation or make
long-press the only route to a word's tools. For Arabic, use appropriate RTL navigation and reading
direction while retaining the platform's expected gesture behaviour.

When the keyboard appears, the field, error and confirmation remain reachable. Do not squeeze
the keyboard, tab bar, player, answer bar and sheet into one stack. Hide or relocate irrelevant
chrome for that mode. Search can sit above the keyboard; a writing view should prioritise the draft.

## 9. Visual system: recognisably Lingua, native to iOS

The following are starting **content** colours, not fixed colours for adaptive glass.

| Role | Paper | Nocturne |
| --- | --- | --- |
| Page | `#faf6f0` | `#1f1c1a` |
| Grouped surface | `#efe7d9` | `#2b2724` |
| Raised content | `#fffbf4` | `#35302c` |
| Main ink | `#262220` | `#ebe0cc` |
| Supporting ink | `#5e554e` | `#bdb19f` |
| Decorative accent | `#c86d51` | `#d49b54` |
| Readable accent text | `#a5533b` | `#dba765` |
| Accent fill / its text | `#a5533b` / `#fffaf2` | `#d49b54` / `#1f1c1a` |
| Known / done text | `#4f6f5b` | `#93b39e` |

Keep normal content warm rather than pure black/white, while honouring explicit high-contrast
preferences. Use theme tokens and semantic states; do not colour every toolbar icon terracotta.
The reader retains its existing paper choices and font preferences.

For this iOS proposal, use the **system UI typeface** for navigation, forms and controls, with
semantic text styles and Dynamic Type. Use Literata and the learner's chosen reading face for
bookish titles and learning content, scaled appropriately. This deliberately differs from the
desktop's Plus Jakarta Sans chrome. Around 17 pt is a useful default body starting point; learning
text can start around 19–21 pt and remains adjustable. Size hierarchy must survive text enlargement.
[Apple: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility).

Use approximately 16–20 pt content margins and an 8/12/16/24 pt spacing rhythm; let system controls
keep their native metrics. Cards can have soft 20–24 pt corners. Respect the actual safe areas,
screen shape and home indicator; do not hard-code one device's bottom inset. Content may extend
under navigation visually, but its last item and essential controls must remain reachable.

Use familiar system symbols for native navigation and actions, consistently. Keep Lingua's fine-line
book, sprig and shelf art for a few empty or welcome moments. Language touches can influence
display headings and a restrained ornament; never sacrifice Arabic shaping, CJK coverage, RTL
layout or readability for a Latin-looking composition.

## 10. Accessibility, trust and real-world states

Include **Reduce Transparency, Increase Contrast and Reduce Motion** variants in the design.
Glass should become a more legible conventional surface when needed; no action depends on
refraction or movement. VoiceOver names the action, state and value of controls; focus returns
to the selected word or opener after a sheet closes. Do not announce every playback tick.
[Apple: Testing accessibility settings](https://developer.apple.com/documentation/accessibility/testing-system-accessibility-features-in-your-app).

Use at least 4.5:1 ordinary text contrast, with non-colour distinctions for known, learning,
selected, error and completed states. Test control contrast over both a plain page and a busy
cover/video background. Allow larger accessibility text to turn rows into vertical groups and
make long content scroll; do not preserve a screenshot by clipping text or shrinking hit areas.

For every relevant flow, design: first use, empty, loading, no results, full collection, error,
offline, restricted access, active keyboard and interrupted/resumed activity. Distinguish saved
metadata from an item actually downloaded for offline use. A missing connection must not erase
a local draft or disable unrelated downloaded learning.

Learning data remains local-first. An AI or external service action explains what it sends and
to which provider; masked sample keys only. Keep applicable Max/own-key requirements and a clear
non-AI path. No accounts, cloud sync, subscriptions to outside services, native share extension,
background downloads or notifications are assumed to exist merely because a mock-up shows them.

Use the handbook's warm, plain British English. One small smile is enough; errors, privacy,
deletion and money stay direct. Progress is evidence, not a grade. Keep the free route visible,
label estimates and never add streak guilt, lives, leagues or unsupported fluency forecasts.

## 11. What Stitch should produce

Start with an architecture board and **seven connected screens**: Today, Library, Practice,
Explore, the reader with word sheet, an audio player, and one review exercise with its answer
state. Include a compact playback accessory and a reading-size slider state. Use one coherent
system across them, with realistic language content rather than repeated placeholder cards.

Design in iOS logical points. Use **393 × 852** as the main working frame, then show how the
composition adapts at **375 × 667** and **430 × 932**. These are representative design canvases,
not a claim about the current device catalogue. Add landscape reader/video examples where useful.
Do not turn this request into an iPad or Android design pass.

Provide Paper and Nocturne, the glass control states, a large-text variant and a reduced-transparency
variant. Static images should annotate how the materials and gestures behave; they cannot prove
native interaction, accessibility or performance. If Stitch supports a prototype, connect the
core routes rather than animating decorative effects.

### Copyable prompt

```text
Design Lingua for iPhone using the attached design-ios.md as the primary brief.
This is a new phone-specific organisation, not a compressed desktop sidebar.

Use four stable destinations: Today, Library, Practice and Explore. Preserve access to every
existing Lingua capability through the mapping in the brief. Keep real books, words, lyrics,
writing and exercises prominent. Warm paper and book typography carry Lingua's identity;
native iOS navigation and selective Liquid Glass carry the controls.

Show the architecture and seven connected screens: the four tab roots, a reader with word
sheet, an audio player and an answered review card. Include an active text-size slider and
the mini-player accessory. Make the design coherent at 393 × 852, with compact and large
iPhone adaptations, Paper/Nocturne, large text and reduced transparency.

Pay particular attention to one-handed reach, direct resume, shared word details, explicit
save-versus-learn choices, keyboard clearance, back navigation and interruption recovery.
Use glass on appropriate controls and navigation; keep learning content readable and stable.
Explain the main structural decisions and label proposed native capabilities as proposals.
```

## 12. How to judge the result

- A new learner can explain the four tabs without learning the desktop's room structure.
- Resume, review, saved words and writing meet the navigation targets, with a clear way back.
- Every existing room/tool has a findable home; a visual simplification has not silently removed it.
- The same word opens the same detail and retains its source from every learning activity.
- Only one audio activity plays; docks, keyboard, sheets and tab bar do not compete for the same area.
- Controls remain legible and operable with large text, VoiceOver and reduced glass/motion.
- Empty, offline and interrupted states preserve work and explain the next useful action.
- The result feels like Lingua and like an iPhone app, with a clear distinction between content and controls.

This brief is ready for design exploration. Native device testing, service integration, performance,
data migration and implementation planning follow only when that work is requested. The desktop
brief continues to describe the desktop product.

## 13. Sources and interpretation

Lingua's identity, learning semantics, voice and room purposes come from the
[handbook](docs/handbook/handbook.html), with the current
[room list](src/app/sections.ts), [colour tokens](src/design/tokens.css) and
[reading fonts](src/design/fonts.ts) as implementation context. The handbook's phone guidance
is background; the four-destination architecture and layouts above are this proposal.

Apple guidance was checked on 2 November 2026: [Materials](https://developer.apple.com/design/human-interface-guidelines/materials),
[Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass),
[Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars),
[Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields),
[Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons),
[Sliders](https://developer.apple.com/design/human-interface-guidelines/sliders),
[Colour](https://developer.apple.com/design/human-interface-guidelines/color),
[Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets),
[Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) and
[Testing accessibility settings](https://developer.apple.com/documentation/accessibility/testing-system-accessibility-features-in-your-app).
These support platform behaviour and material choices; the product architecture and Lingua-specific
flows are design recommendations, not claims that Apple requires this organisation.
