// Source tables and limits: docs/review/6-23-el.md. Display spelling, not predicted pronunciation.
export const GREEK_SCHEMES = ['elot-743', 'iso-843-1997-1'] as const;
export type GreekScheme = (typeof GREEK_SCHEMES)[number];
export const GREEK_SCHEME_NAMES: Record<GreekScheme, string> = { 'elot-743': 'ELOT 743 · Type 2', 'iso-843-1997-1': 'ISO 843:1997 · Type 1' };
const LETTERS: Record<string, string> = { α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o' };
const VOWELS = 'αεηιουω';

/** Modern monotonic Greek only; refuse unsupported Greek/marks rather than silently inventing a reading. */
export function greek(text: string, scheme: GreekScheme): string | undefined {
  if (!GREEK_SCHEMES.includes(scheme)) return undefined;
  const normalized = text.normalize('NFD');
  const units = [...normalized.matchAll(/([^\p{M}])(\p{M}*)/gu)].map(([source, base, marks]) => ({ source, base, lower: base.toLowerCase(), marks }));
  if (units.map((u) => u.source).join('') !== normalized) return undefined;
  // shortcut: polytonic/archaic Greek is not supported; add independently reviewed rules before accepting those words.
  if (units.some((u) => /\p{Script=Greek}/u.test(u.base) && (!LETTERS[u.lower] || /[^\u0301\u0308]/u.test(u.marks) || (u.marks && !VOWELS.includes(u.lower)) || (u.marks.includes('\u0308') && !'ιυ'.includes(u.lower))))) return undefined;
  const letter = (at: number) => units[at] && /\p{L}/u.test(units[at].base);
  const upper = (at: number) => units[at].base !== units[at].lower;
  const spell = (latin: string, at: number) => !upper(at) ? latin : letter(at + 1) && !upper(at + 1) ? latin[0].toUpperCase() + latin.slice(1) : latin.toUpperCase();
  let out = '';
  let changed = false;
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    let latin = LETTERS[u.lower];
    if (!latin) { out += u.source; continue; }
    changed = true;
    const next = units[i + 1];
    const pair = u.lower + (next?.lower ?? '');
    const vowels = next?.lower === 'υ' && 'αεο'.includes(u.lower) && !u.marks && !next.marks.includes('\u0308');
    if (scheme === 'iso-843-1997-1') {
      if (u.lower === 'η') latin = 'ī';
      if (u.lower === 'ω') latin = 'ō';
      if (vowels) {
        out += spell(latin, i) + spell('u' + next.marks, i + 1);
        i++;
        continue;
      }
    } else if (vowels || (pair === 'ηυ' && !u.marks && !next.marks.includes('\u0308'))) {
      if (pair === 'ου') out += spell('o', i) + spell('u' + next.marks, i + 1);
      else {
        const after = units[i + 2]?.lower ?? '';
        const voiced = after && (VOWELS + 'βγδζλμνρ').includes(after);
        out += spell(latin + next.marks, i) + spell(voiced ? 'v' : 'f', i + 1);
      }
      i++;
      continue;
    } else if (pair === 'γγ' || pair === 'γξ' || pair === 'γχ') {
      out += spell('n', i) + spell(LETTERS[next.lower], i + 1);
      i++;
      continue;
    } else if (pair === 'μπ' && (!letter(i - 1) || !letter(i + 2))) {
      out += spell('b', i);
      i++;
      continue;
    }
    out += spell(latin + u.marks, i);
  }
  return changed ? out.normalize('NFC') : undefined;
}
