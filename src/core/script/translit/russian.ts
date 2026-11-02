// Sources and published examples: docs/review/6-23-ru.md. These are spelling conversions, not stress predictions.
export const RUSSIAN_SCHEMES = ['bgn-pcgn-1947', 'iso-9-1995'] as const;
export type RussianScheme = (typeof RUSSIAN_SCHEMES)[number];
export const russianScheme = (saved?: string): RussianScheme => saved === 'iso-9-1995' ? saved : 'bgn-pcgn-1947';
export const RUSSIAN_SCHEME_NAMES: Record<RussianScheme, string> = { 'bgn-pcgn-1947': 'BGN/PCGN 1947', 'iso-9-1995': 'ISO 9:1995' };

const LETTERS = [...'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'];
const BGN = ['a', 'b', 'v', 'g', 'd', 'e', 'ë', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'kh', 'ts', 'ch', 'sh', 'shch', '”', 'y', '’', 'e', 'yu', 'ya'];
const ISO = ['a', 'b', 'v', 'g', 'd', 'e', 'ë', 'ž', 'z', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'c', 'č', 'š', 'ŝ', 'ʺ', 'y', 'ʹ', 'è', 'û', 'â'];
const VOWELS = 'аеёиоуыэюя';

/** Unknown Cyrillic characters are declined; punctuation, Latin text and word case are preserved. */
export function russian(text: string, scheme: RussianScheme): string | undefined {
  if (!RUSSIAN_SCHEMES.includes(scheme)) return undefined;
  const chars = [...text.normalize('NFC').replace(/([А-Яа-яЁё])[̀́]/gu, '$1')];
  const lower = chars.map((c) => c.toLowerCase());
  const table = scheme === 'iso-9-1995' ? ISO : BGN;
  let changed = false;
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const c = lower[i];
    const at = LETTERS.indexOf(c);
    if (at < 0) {
      if (/\p{Script=Cyrillic}/u.test(c)) return undefined;
      out += chars[i];
      continue;
    }
    changed = true;
    let latin = table[at];
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
    if (chars[i] !== c) {
      const neighbour = (offset: number) => chars[i + offset] && /[А-ЯЁ]/u.test(chars[i + offset]);
      latin = neighbour(-1) || neighbour(1) ? latin.toUpperCase() : latin[0].toUpperCase() + latin.slice(1);
    }
    out += latin;
  }
  return changed ? out : undefined;
}
