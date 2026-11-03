// Each language's own threads for the word graph (6-29, docs/WORD-GRAPH-PLAN.md sections 1 and 5).

/** Endings that only make a part of speech: as hubs they would be stars of hundreds of lines, so they are lenses. */
export const LENS_AFFIXES: Record<string, ReadonlySet<string>> = {
  es: new Set(['-ar', '-er', '-ir', '-mente', '-ado', '-ido', '-s', '-es']),
  fr: new Set(['-er', '-ir', '-re', '-ment', '-é', '-s']),
  de: new Set(['-en', '-n', '-e', '-er', '-s', '-es']),
  ru: new Set(['-ся', '-сь', '-о', '-ть', '-ный', '-ий', '-ой', '-ый']),
  ar: new Set(['-َة', '-ة']),
};

/** Pairs that are two words (gender, aspect); a plural or a comparative is a form of the same word. */
export const PAIR_LABELS: ReadonlySet<string> = new Set(['feminine', 'masculine', 'perfective', 'imperfective']);

/** Parts of speech that make "the little words": they touch everything, so they get a region of their own. */
const LITTLE_POS = new Set(['pron', 'article', 'det', 'prep', 'postp', 'conj', 'particle', 'num', 'contraction', 'classifier', 'intj']);
/** Adverbs this common count as little words too (así, ya, ещё); rarer ones are ordinary words. */
export const LITTLE_ADVERB_RANK = 500;

export function isLittle(pos: string | undefined, rank: number | undefined): boolean {
  return Boolean(pos && (LITTLE_POS.has(pos) || (pos === 'adv' && rank !== undefined && rank <= LITTLE_ADVERB_RANK)));
}

export const isAffix = (part: string) => part.startsWith('-') || part.endsWith('-');

/** Languages written in Han characters: words that share a character share a hub, from the spelling alone. */
const HAN_LANGS = new Set(['zh', 'ja']);
const HAN = /\p{Script=Han}/u;
export const hanCharacters = (lang: string, word: string): string[] => (HAN_LANGS.has(lang) ? [...new Set([...word].filter((c) => HAN.test(c)))] : []);

/** Arabic roots are only named in the etymology text ("Morphologically from the root و ج د (w j d)"). */
export function arabicRoot(ety: string | undefined): string | undefined {
  return ety?.match(/\broot ((?:\S ){2,3}\S)\s*\(/)?.[1];
}
