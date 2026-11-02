# 6-23 · T0 source-data findings

Audit date: **2026-11-02**, Codex. **T0 only is complete; tracks A–G remain unimplemented.**
No feature audit boxes are ticked by this work. The earlier light tools remain as they were.

## Reproduce and interpret the measurements

Run `python3 scripts/script/audit-6-23.py --self-test`, then
`python3 scripts/script/audit-6-23.py > /private/tmp/lingua-623-results.json` from the repository.
Python 3.11+ and its standard library suffice (measured with Python 3.15.2). The script is read-only:
it verifies every source's byte count and SHA-256 before scanning it, and never changes shipped data.
The recorded output is [6-23-RESULTS.json](6-23-RESULTS.json); every source URL, retrieval time,
HTTP revision metadata, size and hash is in [6-23-SOURCES.json](6-23-SOURCES.json).

The user approved up to 1 GB of public source downloads, one at a time. Successfully cached inputs
are **454,927,564 bytes** (455 MB); they remain ignored in `scripts/.cache/6-23/`, not in the app,
its precache, or this commit. No repository wording, learner data, recordings or keys were sent.
To prepare an empty audit cache after obtaining download approval, use the recorded URLs:

```sh
node --input-type=module <<'JS'
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const dir = 'scripts/.cache/6-23/';
mkdirSync(dir, { recursive: true });
for (const s of JSON.parse(readFileSync('docs/6-23-SOURCES.json', 'utf8'))) {
  if (!existsSync(dir + s.name)) execFileSync('curl', ['--fail', '--location', '--max-filesize', String(s.bytes), '--output', dir + s.name, s.url], { stdio: 'inherit' });
}
JS
```

Then run the audit; delete incomplete/corrupt files before retrying. Upstream snapshot URLs such as
Kaikki, EDRDG and MDBG change in place: retain the original cache to reproduce these exact findings.
The hash checks deliberately reject replacement snapshots. GitHub tags/commits and Unicode 17.0.0
are pinned in the manifest. The archive files are read as data; no upstream executable was run.
A failed initial guess at a Unicode security URL was resolved using Unicode's published relocation
notice; security files from 17.0 onward are under `/Public/<version>/security/`.

All sizes below are bytes, with MB meaning 1,000,000 bytes. Gzip uses level 9 with timestamp zero;
its exact output may vary with the Python/zlib version. Corpus counts are complete scans of the
named cached files, not extrapolated samples. Mentions, records, senses and unique words are
reported separately. Counts establish availability, not linguistic accuracy.

## Results and changes to the deep plan

### OpenCC · A3

[OpenCC ver.1.4.2](https://github.com/BYVoid/OpenCC/releases/tag/ver.1.4.2), Apache-2.0.
The official resource manifest identifies commit `025f371dc76b598d77384fbdab90c937471844d8`.
These are **actual native `.ocd2` compiled artifacts** from the official portable release, not an
estimate of a future browser trie:

| Dictionary | Text entries | Text bytes | Compiled bytes | Compiled gzip bytes |
|---|---:|---:|---:|---:|
| STCharacters | 4,012 | 34,787 | 45,879 | 17,074 |
| STPhrases | 49,238 | 1,006,285 | 927,077 | 466,407 |
| TWPhrases | 818 | 19,181 | 24,015 | 14,081 |
| HKVariants | 66 | 572 | 4,957 | 1,296 |

The seven planned configurations require **16 distinct dictionaries**, **1,182,515 compiled bytes**,
**577,959 bytes gzipped separately**. Their exact dependency closure is in the results JSON.
It includes reverse dictionaries, phrase exceptions, compatibility normalization and generated
regional phrases; the four files in the original T0 row do not implement all seven modes.
Preserve the configuration's normalization, segmentation, group policies and chain order.
A3 must measure its eventual browser representation and run upstream golden cases; neither its
browser engine nor round trips were implemented or tested in T0. Preserve upstream LICENSE/NOTICE
and attribution when derived conversion data ships.

### Unicode · A1, B5

[Unicode 17.0.0 UCD](https://www.unicode.org/Public/17.0.0/ucd/),
[security data](https://www.unicode.org/Public/17.0.0/security/) and
[Unicode License V3](https://www.unicode.org/license.txt). This is a deliberately pinned baseline,
not a claim that 17 is the latest Unicode version.

| Input | Download bytes | Coverage |
|---|---:|---|
| UnicodeData.txt | 2,198,209 | 40,575 rows; 299,382 code points after range expansion, including private-use and surrogate ranges |
| Blocks.txt | 11,663 | 346 block ranges |
| Scripts.txt | 192,460 | 2,287 property ranges |
| confusables.txt | 745,683 | 6,565 mappings; 132,984 bytes gzip |
| Unihan.zip | 8,518,517 | 1,800 education-hanja characters; Korean and Japanese readings available |

A1 must handle range records and algorithmic names, distinguish unnamed/private-use/unassigned
characters, and use normalization/case data correctly rather than treating each UnicodeData line
as one named character. Confusable mappings are sequences, not a one-character replacement table.
Retain the Unicode notice with derived data. This audit does not validate every alphabet's UI names.

Unihan's `kKoreanEducationHanja` contains **exactly 1,800 characters**, all with value **2007**.
That is the list version year, **not a school grade or an elementary/secondary split**
([property definition](https://www.unicode.org/reports/tr38/#kKoreanEducationHanja)).
`kHangul` covers 8,525 characters. B5 can ship list membership and readings; education levels need
another cited source. `kJapaneseOn`/`kJapaneseKun` cover 13,177/11,296 characters but use romanized
readings; B4 should use KANJIDIC's kana instead.

### Full stroke data · B1, B2

[Make Me a Hanzi](https://github.com/skishore/makemeahanzi/tree/bddc96d41bef78427ed0e034e9f7e31d71fd1b92)
contains **9,574 characters**, graphics **30,778,076 bytes**, dictionary **2,570,140 bytes**.
[KanjiVG r20260714 main](https://github.com/KanjiVG/kanjivg/releases/tag/r20260714)
contains **6,703 base SVGs**, including **184 kana-range characters**, **28,995,941 SVG bytes**;
the downloaded main ZIP is **12,650,667 bytes**. Variant SVGs from the larger `all` release were
not downloaded or measured.

The prototype serializes characters in code-point order, at most 256 per shard. Every compressed
shard is decompressed and compared with its original object; no path coordinates are simplified:

| Audit representation | Shards | Gzip sum | Largest shard |
|---|---:|---:|---:|
| MMH full graphics + full dictionary records | 38 | 13,133,677 | 466,900 |
| MMH fields used by the current stroke builder | 38 | 12,864,385 | 459,210 |
| KanjiVG complete SVGs, including component hierarchy and stroke types | 27 | 4,523,321 | 235,889 |
| KanjiVG paths only (excludes component/stroke-type metadata) | 27 | 2,533,086 | 133,237 |

**The 8 MB combined assumption fails for these representations.** Full lossless MMH + KanjiVG
uses **17,656,998 bytes**; even the reduced MMH fields + paths-only KanjiVG uses 15,397,471.
Reserve **20 MB of the existing 40 MB total compressed-data ceiling** for full strokes and their
metadata. B1 may improve encoding losslessly, but must remeasure actual shipping shards, coverage
and visual/recognizer fidelity. The smaller paths-only result cannot stand in for B2's full trees.
These are size experiments, not production bundles, a path-compression algorithm or a proof that
no better encoding could reach 8 MB.

Licences differ: MMH graphics use the **Arphic Public License**; its dictionary uses **LGPL-3.0-or-later**
([upstream COPYING](https://github.com/skishore/makemeahanzi/blob/bddc96d41bef78427ed0e034e9f7e31d71fd1b92/COPYING)).
Keep the corresponding notices, attribution, source and modification information with derived
assets. KanjiVG SVG headers specify **CC BY-SA 3.0**, attribution to KanjiVG/Ulrich Apel and a link
to its site; preserve share-alike for derived data. Do not relabel the combined data Apache or MIT.

### KANJIDIC2 · B4

Official [KANJIDIC documentation](https://www.edrdg.org/wiki/KANJIDIC_Project.html),
[download](https://www.edrdg.org/kanjidic/kanjidic2.xml.gz),
[EDRDG licence statement](https://www.edrdg.org/edrdg/licence.html): **CC BY-SA 4.0**.
Downloaded gzip **1,488,570 bytes**, file version **4**, database **2026-306**, created **2026-11-02**.

| Character field | Characters with data, of 13,108 |
|---|---:|
| Grade | 2,999 |
| Pre-2010 JLPT level | 2,230 |
| Frequency | 2,501 |
| On reading, kana | 12,161 |
| Kun reading, kana/okurigana notation | 9,827 |
| English meaning | 10,384 |

Missing fields must remain missing. Grade codes include general-use/name-use categories; they are
not all elementary grades. JLPT is explicitly the **old four-level test**, not modern N1–N5; no
automatic relabelling. Preserve reading restrictions and okurigana notation in the eventual builder.
EDRDG requests acknowledgement, documentation/licence links and an update procedure. If future
work includes SKIP codes, credit Jack Halpern and KDPS under its
[separate CC BY-SA 4.0 statement](https://www.kanji.org/dictionaries/skip_permission.htm).
No reading alignment, learner page or 95% word-coverage claim was verified in T0.

### Korean hanja · B5

Both exports were scanned, not just their template names:

| Source | Download bytes | Measured coverage |
|---|---:|---|
| Korean edition, raw export | 26,869,664 | 356,341 records across languages; 109,000 Korean records, 104,549 unique Korean headwords |
| English edition, Korean dataset | 21,576,381 | 64,457 records; 57,810 unique headwords; 15,275 unique headwords with tagged hanja forms |

The native Korean export retains no `ko-hanja`/`hanja` head templates and no `forms.tags=hanja`
records. It does contain hanja in `etymology_texts`/`etymology_links` and unlabelled forms; absence
of the template is **not absence of hanja information**. The final results JSON counts those
**34,112 native Korean records** mention hanja with Han characters in etymology text; **34,812**
have Han-character etymology links. Their extraction needs source-specific parsing and sense checks.
The English export directly supplies **18,868 tagged hanja form records**, plus `ko-hanja` and
related character templates. Prefer these structured word links for the first B5 builder; preserve
multiple senses and alternate spellings. Character templates alone are not word-family links.
The 1,800 education-list question is resolved by Unihan above, without deriving school levels.

### Mandarin classifiers · E2

[CC-CEDICT via MDBG](https://www.mdbg.net/chinese/dictionary?page=cedict), **CC BY-SA 4.0**,
2026-11-02 01:18:15 UTC: **3,983,033 downloaded gzip bytes**, **125,356 entries**.
**1,454 entries** have classifier senses, with **1,460 `/CL:` segments**. Preserve traditional,
simplified and pinyin variants when parsing those segments.

The English-Wiktionary Chinese file is **155,996,429 compressed bytes**, **328,919 records**,
**91,611 noun records**. Across all fields it has **zero top-level structured classifiers** and
**zero senses with structured classifiers**. One noun head-template record mentions classifier
text; this is not a usable noun→classifier map. Other textual mentions exist (4,549 records'
sense fields mention classifier/CL wording), so the original absolute “zero head templates” needs
that qualification. Use CC-CEDICT for structured noun/classifier links; separately curate classifier
meanings and usage. Counts alone do not prove E2's complete drills, examples or accuracy targets.

### Arabic dialects · F4

These are **language sections extracted from the English Wiktionary**, not five separately
maintained native dialect-Wiktionary editions. The export still distinguishes North and South
Levantine. Do not silently collapse `ajp` into `apc`.

| Cached dialect section | Extracted code | Gzip bytes | Records | Unique headwords | Senses |
|---|---|---:|---:|---:|---:|
| Egyptian | arz | 817,965 | 1,575 | 1,287 | 2,075 |
| North Levantine | apc | 506,693 | 961 | 773 | 1,264 |
| South Levantine | ajp | 2,270,387 | 3,467 | 3,012 | 4,383 |
| Gulf | afb | 293,479 | 830 | 701 | 1,039 |
| Moroccan | ary | 908,032 | 2,404 | 2,079 | 2,874 |
| Iraqi/Mesopotamian | acm | **No downloadable section found in the audited index** | — | — | — |

The [Kaikki language index](https://kaikki.org/dictionary/index.html) has no Iraqi/Mesopotamian
section at this snapshot. That does **not** prove Iraqi vocabulary is absent from all Wiktionaries;
the combined 2.9 GB dump was outside the approved budget and was not scanned. Full sizes, English
gloss counts are in the results JSON. Only **19 exact English gloss strings** occur in all of
standard Arabic, Egyptian, North Levantine, Gulf and Moroccan (Iraqi excluded).
Matching English glosses only suggests alignment candidates; polysemy and dialect spellings still
need review. **300 concepts aligned across all five dialects are not established by this data.**
F4 must source Iraqi entries and review the aligned concept list before promising that table;
it must show missing cells rather than invent equivalents. The 60-phrase books remain separately
written/reviewed work, not something this download verifies. No dialect recordings were checked.

The Kaikki pages date the English extraction 2026-10-30 from the 2026-10-01 dump and mark the
postprocessed per-language format **deprecated**. This audit uses that format to compare with
Lingua's current builders; migrate future builders to a supported raw format and recheck counts.
[Wiktionary text terms](https://en.wiktionary.org/wiki/Wiktionary:Copyrights) include CC BY-SA 4.0;
retain attribution, entry provenance and share-alike for derived lexical data. Quoted examples and
media may carry separate rights; no audio/example bundle is licensed by assumption here.

### Arabic roots · F3

English-Wiktionary Arabic gzip **72,370,936 bytes**, **233,417 records**, **177,029 unique headwords**.
The complete scan checks etymology templates, text, categories and senses for explicit spaced
3/4-letter Arabic root mentions. It finds **10,449 distinct linked headwords** and **2,944 distinct
root strings**; this is source coverage, **not a validated gold set or inference accuracy**.

The old 192-template sample does not describe this whole snapshot: it has **2,532 `ar-root`**, **31
`root`** (some point to other languages), and **4,989 `ar-rootbox`** occurrences. The existing
`scripts/script/roots.ts` ignores `ar-rootbox` and applies shipped-word and minimum-family filters.
Extract and inspect explicit Arabic links first, keeping their field/sense provenance; then infer
only missing roots. Generic `root` templates must be checked for source language, not blindly read
as Arabic. The results JSON also reports how many linked words match the shipped dictionary after
removing Arabic vowel marks: **9,601 of 17,369 shipped spellings** match an explicit-root mention.
These are candidates, not adjudicated word-family labels; a mentioned foreign etymology can differ
from the Arabic word’s morphological root.

F3 must build a held-out, reviewed root→word set, avoid training/evaluating on the same links, and
report ambiguity, loanwords and abstentions. Its 80% target is **not measured** by T0. The earlier
phrase “192 known roots' words” must be replaced with the reviewed dataset actually used.

### Voices and forward conjugation · B6, D4, E1

The local `PIPER_VOICES` list still contains exactly **seven models**, locales **fr-FR, es-ES,
es-MX, de-DE, ru-RU (two models), zh-CN**. There are no bundled pt, ja, ko or ar models. This is
an audit of **Lingua's registry**, not a claim about every voice available upstream. Device voices
remain installation-dependent; their presence, dialect correctness and playback were not checked.
No voice model was downloaded for T0.

Shipped Japanese pack: **20,388 lemmas, 2,041 paradigms**. Korean: **8,213 lemmas, 1,410 paradigms**.
**Neither pack has a paradigm with politeness/formality/honorific/humble tags.** The builder's
`PARADIGM_TAGS` drops those distinctions. `core/lang/japanese.ts` provides reverse deinflection,
segmentation and reading helpers, **not forward conjugation**. Existing tables therefore do not
provide the promised plain→polite→honorific converter. E1 must retain speech-level distinctions,
add/validate forward generation and explicit unsupported cases, and perform its separate 100-sentence
review. No converter or real AI model was tested here.

### Conditional Mongolian/Kazakh conversion · A3

[CLDR release 48 transforms](https://github.com/unicode-org/cldr/tree/release-48/common/transforms),
Unicode License V3: Kazakh BGN/PCGN **1979**, **11,657 bytes**; Mongolian BGN/PCGN **1964**,
**7,278 bytes**. Both are marked **`direction="forward"`, `draft="contributed"`**, and include
normalization/context rules. They offer a cited forward romanization starting point, not a
ready-made bidirectional converter or a claim to current official Kazakh Latin spelling.
Limit the optional A3 proposal to named forward BGN schemes until a reverse source and ambiguity
tests exist; no automatic Cyrillic⇄Latin round-trip promise. No ICU engine was run in T0.

## Validation boundary and handoff

T0 checks availability, counts, measured compression, source identity and licence statements.
It implements **no UI, data migration, language converter, teaching content or runtime download**.
The app remains local-first; none of the audit files become learner data or bundled dictionaries.
No browser, screen reader, voice playback, microphone, native-speaker review, human handwriting,
external export app, real AI model or device-installed voice was checked in T0.

Next, only if the user requests continuation: claim **A1** and follow its implementation and visible
acceptance checks. This session stops at T0; no implementation claim is retained.

Local setup and final checks passed: typecheck; 247 test files, 1,607 passing tests and one skipped
(one worker); production/PWA build at `/lingua./`, 455 precache entries. Audit self-check, source
hashes, lossless compression round trips and report links passed. Publication versions: alpha.161
(T0-only claim), alpha.162 (audit and claim closure), through the protected-main PR workflow.
