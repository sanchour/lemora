# Lemora 1.1 · Experiments (L1.1-12)

Part of [the Lemora 1.1 plan](../LEMORA-1.1-PLAN.md); rules in [CONVENTIONS.md](CONVENTIONS.md). **WAITING.**
Every family below is **WAITING FOR PROPOSAL / NOT STARTED**. The source IDs are for traceability, not a claim that
the whole entry belongs in a reading app (the plan's Appendix C).

## How an experiment moves

`WAITING FOR PROPOSAL → PROPOSED → AUTHORISED (the user) → PROTOTYPE → KEPT | DROPPED`

- **12.0 A proposal per family** is written in this file under its heading. It covers:
  - the learner's problem, and the value to them
  - the data used, privacy, and the running cost
  - **the limits of the evidence**
  - the prototype's scope
  - when to drop it

  Writing a proposal builds nothing.
- **12.1 Lab switches.** Built only when the user authorises the first family:
  - a setting `experiments: Record<string, boolean>`
  - a Settings › Lab › *Experiments* card, everything off by default
  - an "Experiment" chip on anything experimental

  A prototype is never called accurate or complete.

## The families

| Family | Source IDs | Status | Start from (what exists) |
|---|---|---|---|
| Literary and personal corpus analysis | F0398, F1558–F1562, F1583 | WAITING FOR PROPOSAL | Text statistics (`data/library.ts` stats, `core/text`), reading stats, Diarium as the written corpus. Spoken output only if chosen separately |
| Word and language maps | F1269, F1554–F1557, F1563, F1575, F1587, F1588 | WAITING FOR PROPOSAL (F1563 is built in [REGIONS.md](REGIONS.md)) | Atlas (bridges, origins, families), Regions, 6-23's roots and morphology; a tutor aware of the learner's graph |
| Interactive reading and writing | F1551, F1574, F1576 | WAITING FOR PROPOSAL | Ludus's `Story.tsx` and `StoryEditor.tsx`, `generated` rows, Diarium (multilingual journal), print CSS over the learner's words and texts (personal textbook) |
| Images and contextual vocabulary | F1570–F1573 | WAITING FOR PROPOSAL | `services/comics/ocr.ts`, `services/import/pagePhotos.ts` (OCR as a reading import). Camera permissions and on-device privacy required; it must lead into a reading flow |
| Learning research and maintenance | F1467, F1468, F1581, F1582, F1584, F1585 | WAITING FOR PROPOSAL | Ratio and the learner record; adaptation ([ADAPTIVE.md](ADAPTIVE.md)) for maintenance and heritage paths. **Says plainly that ordinary activity cannot show cause** |
| Reading and audio aids | F1578 | WAITING FOR PROPOSAL | Level-adapted audiobooks only if Lemora chooses to add them; unknown-word-only annotations may inform a reader aid. Subtitle playback stays excluded |
| Alphabet-adjacent lab | F1564, F1565 | WAITING FOR PROPOSAL | The Sounds tab; a waveform or spectrogram only if approved for script learning; **no pronunciation score made from loudness** |

These stay in Lingua 6.1 and do not enter Lemora without a later expansion decision: F0491, F1552, F1553, F1566–F1569
and F1577.
