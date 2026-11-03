// Word hunt in a language that glues small words on (6-21): the forms a written word may stand for once the glued-on beginning is taken off.
// Arabic: the article and the one-letter words (and, by, like, to); Hebrew: the article and the one-letter words. Others return the word as it is.
const BEGINNINGS: Record<string, string[]> = {
  ar: ['وال', 'بال', 'كال', 'فال', 'لل', 'ال', 'و', 'ف', 'ب', 'ك', 'ل'],
  he: ['וה', 'שה', 'ה', 'ו', 'ב', 'ל', 'מ', 'ש', 'כ'],
};

/** The word, and what is left when a glued-on beginning is taken off (at least three letters stay). */
export function stems(norm: string, lang: string): string[] {
  const out = [norm];
  for (const p of BEGINNINGS[lang] ?? []) if (norm.startsWith(p) && norm.length - p.length >= 3) out.push(norm.slice(p.length));
  return [...new Set(out)];
}
