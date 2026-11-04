# Lemora 1.1 · Regions: Slang & Dialects (L1.1-09)

Part of [the Lemora 1.1 plan](../LEMORA-1.1-PLAN.md); rules in [CONVENTIONS.md](CONVENTIONS.md). **WAITING.**

**The user's idea (2026-10-31):** a section where learners compare and learn regional slang and dialect words,
colloquial differences and how to speak in that dialect, with a visual dialect map. The six core languages first. Named
examples: Spanish Latin American varieties (Paisa, Caleño, Costeño, Argentinian, Chilean, Peruvian, Mexican,
Dominican, Cuban, Puerto Rican), Mandarin variants, French varieties. "A stronger model needs to plan it out first."

**The planning gate:** this file is that plan, written by Opus 5.5 on 2026-11-04. The gate is **met once the user
approves it, subject to push 09.0's findings**.

**Decisions (the user, 2026-11-04):**
- Regions is a **tab of the language room** ([LANGUAGE-ROOM.md](LANGUAGE-ROOM.md)), not a room of its own.
- Varieties with no open data are **written by hand from cited sources and badged "unreviewed"** until a native speaker
  checks them.
- **Desktop only.**

It reuses 6-23 D4 (F1335, F1337, F1338) and F4/F5 (F1368, F1369) and delivers F1563 (dialect comparison maps), so
there is **one** regional lexicon, not two.

## 1. What the data holds (measured 2026-11-04, read-only)

Spanish, raw Wiktionary (`../Lingua/scripts/.cache/kaikki-es.jsonl.gz`, 814,137 lines), counting senses whose tags,
raw_tags or qualifier name the region:

| Variety label | Senses | Variety label | Senses |
|---|---|---|---|
| Mexico | 2,118 | Bolivia | 618 |
| Spain | 1,498 | Guatemala | 604 |
| El Salvador | 1,429 | Argentina | 603 |
| Chile | 1,210 | Cuba | 538 |
| Honduras | 973 | Dominican Republic | 473 |
| Venezuela | 749 | Ecuador | 471 |
| Rioplatense | 744 | Canary Islands | 458 |
| Peru | 743 | Costa Rica | 440 |
| Nicaragua | 729 | Puerto Rico | 402 |
| Colombia | 721 | Paraguay | 383 |
| Panama | 308 | Philippines | 268 |
| Uruguay | 174 | Andalusia | 154 |
| Lunfardo | 41 | | |

- **Paisa / Antioquia, Caleño / Valle del Cauca, Costeño:** an exact search over every tag, raw_tag and qualifier
  finds **no label at all**. The nearest are one "in Medellín and Manizales" and one "Bogota". These varieties must be
  written by hand.
- **The app's dictionary drops most of this.** `scripts/lang-data/dictionary.ts:52-59` (`LABELS`) keeps only Spain,
  Latin America, Mexico, Argentina, Rioplatense, Caribbean, Chile, Colombia, Peru and Cuba as tags. A few more arrive
  through the free-text `qualifier` (line 120): Southern Cone, Andes Mountains, Equatorial Guinea. Dominican Republic,
  Venezuela, Puerto Rico, Costa Rica and Central America are dropped.

The other languages, as kept in the app's dictionary (`public/dict/<lang>.v3.json.gz`). Raw counts are 09.0's job.

| Language | Labels with senses |
|---|---|
| French | Quebec 436 · Canada 219 · Belgium 164 · Switzerland 114 · Verlan 113 · Africa 35 · Ivory Coast 31 · Acadia 18 |
| German | Austria 1,682 · Switzerland 785 · Southern Germany 369 · Northern Germany 208 · Vienna 61 · South Tyrol 38 · youth slang 33 |
| Russian | colloquial 6,325 · slang 1,260 · low colloquial 340 · dialectal 306 · Internet 231 · regional 205 · youth slang 51 · Siberia 20. **Registers, hardly regions** |
| Mandarin | Cantonese 11,473 · Hong Kong 2,761 · Mainland China 1,965 · Taiwan 1,685 · Malaysian Mandarin 37 |
| Arabic | Egypt 69 · Syria 23 · Levantine 9: **too thin**. T0's dialect dumps are the source: Egyptian 1,287 headwords, South Levantine 3,012, Moroccan 2,079, North Levantine 773, Gulf 701, no Iraqi section ([6-23-DATA.md](../6-23-DATA.md)) |

## 2. Hard rules for every Regions push

1. **Do not** extend `LABELS`, rebuild `public/dict` or bump `DICT_VERSION`. Regional senses, chips and highlights come
   only from the new `public/regions/` files. A dictionary rebuild would make every learner download the dictionaries
   again, and would split Lemora's dictionaries from Lingua's.
2. **Sources missing from this machine:** the Arabic dialect dumps and Natural Earth admin-1 are not in
   `../Lingua/scripts/.cache` (the raw `kaikki-<lang>` files are). Fetch them with 6-23-DATA.md's commands and hashes,
   and admin-1 from naturalearthdata.com, **only after the user approves the download**.
3. **Respectful labels:**
   - varieties are named by neutral names or endonyms, never a slur or a mocking nickname for a people or place (a test
     keeps a deny list)
   - vulgar, offensive and derogatory senses stay folded behind *All registers*, off by default
4. **Related languages are not dialects.** Cantonese, Hakka, Wu and Min (beside Mandarin); Catalan, Galician and
   Basque (beside Spanish); Occitan and Breton (beside French); Ukrainian and Belarusian (beside Russian); Maltese
   (beside Arabic). Each is `kind: 'related-language'`, compared, never taught as a variety.
5. **Audio honesty:** a synthetic or device voice is never presented as a recording of a region.
6. **Every hand-written line** goes into `docs/review/regions-<lang>.md` and is badged "unreviewed" in the app.

## 3. Scope per language

| Language | Data-backed varieties | Hand-written (unreviewed badge) | Related languages (compared only) |
|---|---|---|---|
| Spanish | Spain; Mexico; Central America (El Salvador, Honduras, Nicaragua, Guatemala, Costa Rica, Panama); Caribbean (Cuba, Dominican Republic, Puerto Rico); Venezuela; Colombia; the Andes (Peru, Bolivia, Ecuador); Chile; Rioplatense (Argentina, Uruguay); Paraguay; Canary Islands; Andalusia; Philippines; Equatorial Guinea | **Paisa** (Antioquia), **Caleño** (Valle del Cauca), **Costeño** (Colombian Caribbean coast), Chilango (Mexico City), Lunfardo (thin data), Andalusian sub-varieties | Catalan, Galician, Basque |
| French | France, Québec, Belgium, Switzerland, Africa (Ivory Coast, DR Congo…), Acadia; social: Verlan | Marseille and the Midi; the Belgian and Swiss numbers (septante, nonante) as a guide | Occitan, Breton, Alsatian |
| German | Germany (north and south), Austria (Vienna), Switzerland, South Tyrol; youth slang | Berlin, Bavarian, Swabian and Saxon guides | Swiss German labelled as a dialect continuum; Low German; Luxembourgish |
| Mandarin | Mainland, Taiwan, Hong Kong usage, Malaysia and Singapore | Beijing erhua, Northeastern | Cantonese, Hakka, Wu, Min |
| Russian | Registers and slang: colloquial, low colloquial, youth, Internet; prison slang folded as offensive/sensitive | Northern okanye, Southern fricative г, Siberian; Russian in Ukraine, Belarus and Kazakhstan, in neutral wording with careful review | Ukrainian, Belarusian |
| Arabic | From the dialect dumps: Egyptian, Levantine (north and south), Gulf, Moroccan; Modern Standard as the reference | Iraqi (no data); a 60-phrase phrasebook per dialect; the diglossia explainer; 60 register pairs (F5) | Maltese |
| Italian, Portuguese | **Waiting:** tier 2, with no full dictionary. D4's pt/it targets and the Brazil ⇄ Portugal converter wait until one exists | | |

## 4. Pushes

**09.0 The data check** (Careful; a script and a doc, no interface). A "no" here changes the pushes below, as T0 did
for 6-23.
- `scripts/regions/measure.ts` streams the raw `kaikki-<lang>.jsonl.gz` (es fr de ru zh) and the Arabic dialect dumps.
- It writes `docs/1.1/REGIONS-DATA.md` with:
  - senses per variety label (tags, raw_tags, qualifier), how many fall within rank 10,000, with examples
  - regional pronunciations and audio (`sounds[].tags` such as Spain or Latin America)
  - Wiktionary's dialectal-synonym tables (Chinese)
  - **the concept-alignment yield:** how many concepts (POS plus the normalised first English gloss) have words in two
    or more varieties
  - Commons and Lingua Libre recordings with a known speaker region, only if that is derivable offline; otherwise
    "needs the network, waiting"
  - every source's licence

**09.1 The builder** (Careful).
- `scripts/regions/build.ts` writes `public/regions/<lang>.v1.json.gz`: at most 1 MB gzip each, lazy, runtime cache
  `${PRODUCT.prefix}-regions`.
- Shared types in `src/core/regions/types.ts`:

```ts
interface Variety {
  id: string; lang: string; name: string; endonym?: string; parent?: string;
  kind: 'country' | 'region' | 'city' | 'social' | 'related-language';
  countries: string[];          // ISO 3166 codes, matching WORLD_MAP
  admin1?: string[];            // Natural Earth admin-1 ids (geo.v1.json)
  labels: string[];             // the Wiktionary labels that map to it
  source: 'wiktionary' | 'hand'; reviewed: boolean; sources: string[];
}
interface RegionalSense { key: string; word: string; varieties: string[]; pos: string; gloss: string; register?: string; ex?: [text: string, translation?: string]; ipa?: string; source: string }
interface Concept { id: string; gloss: string; pos: string; words: Array<{ variety: string; key: string }>; aligned: 'auto' | 'checked' }
interface RegionGuide {
  variety: string; reviewed: boolean;
  sections: Array<{ kind: 'overview' | 'sounds' | 'intonation' | 'grammar' | 'usage' | 'slang'; text: string; examples?: string[]; sources: string[] }>;
}
```

- **The label map:** `src/core/regions/labels.ts` maps Wiktionary labels to varieties. A test covers every label 09.0
  measured.
- **The hand overlay:** `src/core/regions/hand/<lang>.ts` is merged in, and every line also appears in
  `docs/review/regions-<lang>.md`.
- **Loading:** `src/core/regions/load.ts` and `hasRegions(lang)`.
- **Data test:**
  - every sense has a source
  - every variety has a name, and either geometry or `noMap`
  - no duplicates
  - nothing hand-written is `reviewed: true`

**09.2 Geometry** (Any).
- `scripts/regions/geo.ts` takes Natural Earth admin-1 (public domain; 1:10m, simplified) for the listed subregions
  only. Examples: Colombia's departments, Spain's communities, Mexico's states, Argentina's provinces, the German Länder,
  Canada's provinces, Belgium's regions, China's provinces with Taiwan and Hong Kong, the Arab countries.
- Output: `public/regions/geo.v1.json`, encoded as polylines like `WORLD_MAP`, at most 400 KB.
- Country outlines reuse `WORLD_MAP`, imported from `features/sonus/radio/worldMap.ts` with its path unchanged.
- The projection and framing helper becomes `src/core/geo/frame.ts` (shared). Onboarding can switch to it later in a
  `[lemora]` commit.

**09.3 The Regions tab** (Careful for the layout, Any for content).
- **Layout:** the map takes about 60 % of the width. It is SVG; varieties are soft watercolour washes, and hover shows
  the name and three signature words. The selected variety's guide sits on the right, with its sources and review badge.
- **Toolbar:** *Compare* (two to four varieties side by side) · *Lexicon* · *Practice* · *All registers* (off by
  default).

**09.4 The comparison lexicon, and Regions in context** (Any).
- **The lexicon:** a concept × variety table, with search, a register filter and a topic filter.
  - Example: *bus* → guagua (Cuba, Puerto Rico, Canary Islands), camión (Mexico), colectivo (Argentina), micro (Chile).
  - Each cell opens the dictionary entry and can be added to a deck.
- **Region chips** in the dictionary `Entry` and the word drawer.
- **A reader highlight:** setting `regions.highlight: 'off' | 'mine' | 'all'`.
- **A variety of interest:** setting `regions.mine[lang]`, F4's "dialect of interest", for every language. The drawer
  shows that variety's word beside the standard one.

**09.5 The guides** (Any; hand-written with sources). One guide per variety: overview, sounds, intonation and rhythm,
grammar (for example voseo tables), usage, slang. Each claim gets a review line. Intonation and rhythm are text plus IPA
unless there is a licensed recording. Sources to start from:
- Spanish: RAE/ASALE *Nueva gramática de la lengua española* (voseo), Lipski *Latin American Spanish*, Hualde *The
  Sounds of Spanish*
- French: the OQLF's *Banque de dépannage linguistique*
- German: *Variantenwörterbuch des Deutschen*
- Mandarin: the Taiwan Ministry of Education's dictionaries
- Arabic: Wiktionary's dialect entries and published grammars

**09.6 Audio, honestly** (Any).
- Piper's es-ES and es-MX voices side by side (both are in the voice registry).
- Dictionary or Commons recordings, where 09.0 found their region.
- Device voices by locale (es-AR, fr-CA, de-AT, zh-TW…), labelled "your device's voice, not a recording of the region".

**09.7 Practice** (Any; Practice sets with `group: 'regions'`).
- *Which variety says this?*
- *Say it in <variety>*, against an accepted list
- *Spot the regional word* in a pack or dictionary sentence
- concept ↔ word matching

Evidence is recorded with skill `vocabulary`, item `word`.

**09.8 Atlas** (Any). A *Regional* lens: 02.1's node attrs gain `varieties`, from `RegionalSense`.

**09.9 Arabic F4/F5, and D4's dialect pages** (Any).
- **The Arabic dialect table:** 300 aligned concepts only once alignment and Iraqi sourcing are established; until then,
  the measured number shown honestly.
- Phrasebooks, the diglossia explainer, register pairs, and F5's three exercises.
- D4's dialect pages for Spanish and French become Regions guides.

## 5. Done when

- The row's criterion holds: Spanish (with its subregions), Mandarin, French, German and Russian are built as in
  section 3, or explicitly waiting with a reason. Languages and varieties are told apart correctly.
- Sources are shown, review files are complete, and every unreviewed line is badged.
- Sizes are recorded, with real audio coverage stated plainly.
- D4's and F4/F5's numerical targets are met, or their measured shortfall is stated.
- It reuses 6-23 D4/F4 and the Atlas rather than adding a second lexicon.
