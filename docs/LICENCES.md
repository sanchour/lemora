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
| Explora catalogue (fr, es, de, ru, zh, ar) | `src/core/explora/data/*.json`, written by `scripts/build-catalogue.mjs`. **Classics:** Project Gutenberg, only works by authors who died before 1956 (free in the US and the EU), single-language editions, read through the HTML edition. **Short reads:** Wikisource pages, public domain texts (transcriptions CC BY-SA, which stays CC BY-SA if copied). **Picture books:** StoryWeaver by Pratham Books, CC BY 4.0; the app keeps only the title, credits, level, cover address and link, shows the credit with the shelf and opens the book on StoryWeaver (its API does not allow apps to read it). **Recordings:** LibriVox (public domain), found on archive.org and streamed, never bundled |
| Comic series and old magazines (Explora) | **Comic series:** scans of public-domain albums on Wikimedia Commons (fr: Töpffer, Christophe; de: Busch; ru: Mayakovsky's ROSTA windows; ar: illustrated manuscripts of Kalila wa Dimna and the Maqamat), their page lists read from the Commons API; Pepper&Carrot (CC BY 4.0) stays the comic for every language. Some French scans come from the BnF's Gallica, which asks for a licence for commercial reuse of its digital copies: check before shipping those, or drop `crepin`, `pencil`, `cryptogame` from `scripts/catalogue-spec.json`. **Old magazines:** articles of 1800s and early 1900s periodicals on Wikisource (Le Tour du monde, Die Gartenlaube, La Ilustración Española y Americana, Отечественные записки, Al-Bayan); Chinese has none, since the periodicals on Wikisource are mostly of the 1900s and their authors' death dates are unchecked |
| Sayings of the day (Explora) | Traditional proverbs, anonymous folk wisdom, written in `src/core/explora/proverbs.ts` |
| Today in history (Explora) | Wikipedia's "On this day" feed, CC BY-SA, fetched on request |
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
