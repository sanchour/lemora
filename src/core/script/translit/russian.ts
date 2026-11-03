// Sources and published examples: docs/review/6-23-ru.md. These are spelling conversions, not stress predictions.
export const RUSSIAN_SCHEMES = ['bgn-pcgn-1947', 'iso-9-1995', 'ala-lc-2012', 'icao-9303-2021'] as const;
export type RussianScheme = (typeof RUSSIAN_SCHEMES)[number];
export const russianScheme = (saved?: string): RussianScheme => RUSSIAN_SCHEMES.includes(saved as RussianScheme) ? saved as RussianScheme : 'bgn-pcgn-1947';
export const RUSSIAN_SCHEME_NAMES: Record<RussianScheme, string> = { 'bgn-pcgn-1947': 'BGN/PCGN 1947', 'iso-9-1995': 'ISO 9:1995', 'ala-lc-2012': 'ALA-LC 2012', 'icao-9303-2021': 'Passport · ICAO 9303' };

const LETTERS = [...'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'];
const BGN = ['a', 'b', 'v', 'g', 'd', 'e', 'ë', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'kh', 'ts', 'ch', 'sh', 'shch', '”', 'y', '’', 'e', 'yu', 'ya'];
const ISO = ['a', 'b', 'v', 'g', 'd', 'e', 'ë', 'ž', 'z', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'c', 'č', 'š', 'ŝ', 'ʺ', 'y', 'ʹ', 'è', 'û', 'â'];
const ALA = ['a', 'b', 'v', 'g', 'd', 'e', 'ë', 'zh', 'z', 'i', 'ĭ', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'kh', 't͡s', 'ch', 'sh', 'shch', 'ʺ', 'y', 'ʹ', 'ė', 'i͡u', 'i͡a'];
const ALA_OLD: Record<string, string> = { і: 'ī', ѣ: 'i͡e', ѳ: 'ḟ', ѵ: 'ẏ' };
const ICAO = ['a', 'b', 'v', 'g', 'd', 'e', 'e', 'zh', 'z', 'i', 'i', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'kh', 'ts', 'ch', 'sh', 'shch', 'ie', 'y', '', 'e', 'iu', 'ia'];
const TABLES: Record<RussianScheme, string[]> = { 'bgn-pcgn-1947': BGN, 'iso-9-1995': ISO, 'ala-lc-2012': ALA, 'icao-9303-2021': ICAO };
const VOWELS = 'аеёиоуыэюя';

/** Unknown Cyrillic is declined. Punctuation/Latin text stay; ICAO makes converted letters uppercase (not a full MRZ formatter). */
export function russian(text: string, scheme: RussianScheme): string | undefined {
  if (!RUSSIAN_SCHEMES.includes(scheme)) return undefined;
  const chars = [...text.normalize('NFC').replace(/([А-Яа-яЁёІіѢѣѲѳѴѵ])[̀́]/gu, '$1')];
  const lower = chars.map((c) => c.toLowerCase());
  const table = TABLES[scheme];
  let changed = false;
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const c = lower[i];
    const at = LETTERS.indexOf(c);
    const old = scheme === 'ala-lc-2012' ? ALA_OLD[c] : undefined;
    if (at < 0 && old === undefined) {
      if (/\p{Script=Cyrillic}/u.test(c)) return undefined;
      out += chars[i];
      continue;
    }
    changed = true;
    let latin = old ?? table[at];
    if (scheme === 'bgn-pcgn-1947') {
      const prev = lower[i - 1] ?? '';
      const next = lower[i + 1] ?? '';
      if ((c === 'е' || c === 'ё') && (!/[а-яё]/u.test(prev) || 'аеёиоуыэюяйъь'.includes(prev))) latin = 'y' + latin;
      // BGN note 3 separates uncommon sequences which would otherwise look like a regular digraph.
      if ((c === 'й' || c === 'ы') && next && 'ауыэ'.includes(next)) latin += '·';
      if (c === 'ы' && prev && VOWELS.includes(prev)) latin = '·' + latin;
      if (c === 'э' && /[бвгджзклмнпрстфхцчшщъь]/u.test(prev)) latin = '·' + latin;
      if ((c === 'т' && next === 'с') || (c === 'ш' && next === 'ч')) latin += '·';
    }
    if (scheme === 'icao-9303-2021') latin = latin.toUpperCase();
    else if (chars[i] !== c) {
      const neighbour = (offset: number) => chars[i + offset] && /[А-ЯЁІѢѲѴ]/u.test(chars[i + offset]);
      // LC's tied digraph capitals are T͡S, I͡U, I͡A and I͡E, including in title case.
      latin = neighbour(-1) || neighbour(1) || (scheme === 'ala-lc-2012' && latin.includes('͡')) ? latin.toUpperCase() : latin[0].toUpperCase() + latin.slice(1);
    }
    out += latin;
  }
  return changed ? out : undefined;
}
