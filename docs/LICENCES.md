# Licences and credits

What Lemora is built from, and what it shows, with the terms each comes under. The same credits are in Settings › About.
Checked 2026-11-04 against `package.json` and the code that fetches each source.

## Code (npm dependencies, 46)

| Licence | Packages |
|---|---|
| MIT | React, React DOM, React Router, Motion, Zustand, TipTap (starter kit, react, pm, extensions), Floating UI, ts-fsrs, sql.js, fzstd, uqr, pinyin-pro, PeerJS, onnxruntime-web, Piper WASM (`@diffusionstudio/piper-wasm`) |
| Apache-2.0 | Dexie (and dexie-react-hooks), PDF.js, Tesseract.js (and its core), Transformers.js, jsQR |
| ISC | Lucide icons |
| MIT OR GPL-3.0-or-later | JSZip (used under MIT) |

## Fonts (SIL Open Font License 1.1, served from this app)

Plus Jakarta Sans, Literata, Lora, Newsreader, Merriweather, Noto Serif (and its Arabic, Japanese, Korean, Chinese
families), Inter, Hanken Grotesk, Alegreya, EB Garamond, Lexend, Comfortaa, Amiri, PT Serif, Atkinson Hyperlegible.

## Data

| What | Source and terms |
|---|---|
| Dictionaries | Wiktionary via kaikki.org, CC BY-SA 4.0 |
| Word frequencies | OpenSubtitles via FrequencyWords, CC BY-SA 4.0 |
| World map | Natural Earth, public domain |
| Comics (Explora) | *Pepper&Carrot* by David Revoy, www.peppercarrot.com, CC BY 4.0. Shown with its credit; pictures are read from the site |
| Magazine (Explora) | Global Voices, globalvoices.org, CC BY 3.0 (volunteer-written and translated stories). Each story kept in Codex ends with its credit |
| Free books | Project Gutenberg (public domain in the US), Wikisource (public domain and CC BY-SA), Wikipedia (CC BY-SA) |
| Audiobooks, lyrics, radio | LibriVox (public domain), LRCLIB, radio-browser.info: fetched on request, never bundled |
| Natural voices | Piper voices from rhasspy/piper-voices on Hugging Face; each voice has its own licence, shown with it; downloaded only when chosen |
| First books and level examples | Written for Lingua and Lemora |
| Hand-drawn icons and pictures | Drawn for Lingua's design handbook (`docs/handbook`) |
| Flags | Drawn for Lingua (`src/design/flags.tsx`); no third-party flag set |

## Privacy of what is fetched

News and article text is read through Jina Reader (r.jina.ai), which sees only the article's address. Comics are
pictures loaded from www.peppercarrot.com and magazine stories from globalvoices.org; both see the reader's address
and the request, as any website does. Nothing is sent about the learner's words, books or progress.

## Share-alike

CC BY-SA material (Wiktionary, FrequencyWords, Wikipedia) stays under CC BY-SA wherever it is copied or exported.
