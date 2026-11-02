export type UnicodeRange = [start: number, end: number, value: string];
export type UnicodeRow = [code: number, name: string, category: string, upper: number, lower: number, oldName: string];
export interface UnicodeIndex {
  version: string;
  blocks: UnicodeRange[];
  scripts: UnicodeRange[];
  ranges: Array<[number, number, string, string]>;
  names: Array<[number, string]>;
  confusables: Array<[string, string]>;
  files: string[];
}
export interface UnicodeShard { version: string; script: string; characters: UnicodeRow[] }

export function inRange<T extends readonly [number, number, ...unknown[]]>(ranges: readonly T[], cp: number): T | undefined {
  let lo = 0, hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1, row = ranges[mid];
    if (cp < row[0]) hi = mid - 1;
    else if (cp > row[1]) lo = mid + 1;
    else return row;
  }
  return undefined;
}
export const CATEGORY_LABELS: Record<string, string> = { Lu: 'Uppercase letter', Ll: 'Lowercase letter', Lt: 'Titlecase letter', Lm: 'Modifier letter', Lo: 'Other letter', Mn: 'Nonspacing mark', Mc: 'Spacing combining mark', Me: 'Enclosing mark', Nd: 'Decimal digit', Nl: 'Letter number', No: 'Other number', Pc: 'Connector punctuation', Pd: 'Dash punctuation', Ps: 'Opening punctuation', Pe: 'Closing punctuation', Pi: 'Initial quotation mark', Pf: 'Final quotation mark', Po: 'Other punctuation', Sm: 'Math symbol', Sc: 'Currency symbol', Sk: 'Modifier symbol', So: 'Other symbol', Zs: 'Space separator', Zl: 'Line separator', Zp: 'Paragraph separator', Cc: 'Control', Cf: 'Format character', Cs: 'Surrogate', Co: 'Private use', Cn: 'Unassigned' };

export const codeLabel = (cp: number) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
export const scriptOf = (index: UnicodeIndex, cp: number) => inRange(index.scripts, cp)?.[2] ?? 'Unknown';

/** Unicode 17, section 3.12.4; Unihan ranges use the UAX #44 algorithmic name prefix. */
export function rangeName(cp: number, label: string): string {
  if (label.startsWith('<CJK Ideograph')) return `CJK UNIFIED IDEOGRAPH-${codeLabel(cp).slice(2)}`;
  if (label.startsWith('<Tangut Ideograph')) return `TANGUT IDEOGRAPH-${codeLabel(cp).slice(2)}`;
  if (label.startsWith('<Hangul Syllable')) {
    const l = ['G', 'GG', 'N', 'D', 'DD', 'R', 'M', 'B', 'BB', 'S', 'SS', '', 'J', 'JJ', 'C', 'K', 'T', 'P', 'H'];
    const v = ['A', 'AE', 'YA', 'YAE', 'EO', 'E', 'YEO', 'YE', 'O', 'WA', 'WAE', 'OE', 'YO', 'U', 'WEO', 'WE', 'WI', 'YU', 'EU', 'YI', 'I'];
    const t = ['', 'G', 'GG', 'GS', 'N', 'NJ', 'NH', 'D', 'L', 'LG', 'LM', 'LB', 'LS', 'LT', 'LP', 'LH', 'M', 'B', 'BS', 'S', 'SS', 'NG', 'J', 'C', 'K', 'T', 'P', 'H'];
    const n = cp - 0xAC00;
    return `HANGUL SYLLABLE ${l[Math.floor(n / 588)]}${v[Math.floor(n % 588 / 28)]}${t[n % 28]}`;
  }
  return '';
}

export function characterInfo(index: UnicodeIndex, shard: UnicodeShard, cp: number) {
  if (!Number.isInteger(cp) || cp < 0 || cp > 0x10FFFF) throw new Error('Invalid code point');
  const row = shard.characters.find((r) => r[0] === cp);
  const range = inRange(index.ranges, cp);
  const category = row?.[2] ?? range?.[3] ?? 'Cn';
  const name = row?.[1] && !row[1].startsWith('<') ? row[1] : range ? rangeName(cp, range[2]) : '';
  const char = String.fromCodePoint(cp);
  return {
    cp, char, name, category, noncharacter: (cp & 0xFFFF) >= 0xFFFE || (cp >= 0xFDD0 && cp <= 0xFDEF), script: scriptOf(index, cp), block: inRange(index.blocks, cp)?.[2] ?? 'No block',
    upper: row?.[3] ? String.fromCodePoint(row[3]) : char, lower: row?.[4] ? String.fromCodePoint(row[4]) : char,
    controlLabel: row?.[5] ?? '', nfc: char.normalize('NFC'), nfd: char.normalize('NFD'),
    // An isolated UTF-16 surrogate has no UTF-8 encoding; TextEncoder would silently replace it.
    utf8: category === 'Cs' ? null : [...new TextEncoder().encode(char)].map((n) => n.toString(16).toUpperCase().padStart(2, '0')).join(' '),
  };
}
export type CharacterInfo = ReturnType<typeof characterInfo>;

export function codeQuery(query: string): number | undefined {
  const match = /^(?:U\+|0x)([\da-f]{1,6})$/i.exec(query.trim());
  if (!match) return undefined;
  const cp = parseInt(match[1], 16);
  return cp <= 0x10FFFF ? cp : undefined;
}

/** Bounded result lists; name search is global, while browsing stays in one script/block. */
export function findCharacters(index: UnicodeIndex, query: string, script: string, block: UnicodeRange, page = 0, size = 96): number[] {
  const q = query.trim().toUpperCase();
  const direct = codeQuery(query);
  if (direct !== undefined) return [direct];
  if (/^(?:U\+|0x)/i.test(query.trim())) return [];
  if ([...query.trim()].length === 1) return [query.trim().codePointAt(0)!];
  if (q) {
    const named = index.names.filter(([, name]) => name.includes(q)).slice(0, size).map(([cp]) => cp);
    if (named.length >= size) return named;
    for (const [start, end, label] of index.ranges) {
      if (!rangeName(start, label)) continue;
      for (let cp = start; cp <= end && named.length < size; cp++) if (rangeName(cp, label).includes(q)) named.push(cp);
      if (named.length === size) break;
    }
    return named;
  }
  const points: number[] = [];
  let skipped = 0;
  for (let cp = block[0]; cp <= block[1] && points.length < size; cp++) {
    if (scriptOf(index, cp) !== script) continue;
    if (skipped++ < page * size) continue;
    points.push(cp);
  }
  return points;
}

export function lookalikes(index: UnicodeIndex, char: string): string[] {
  const map = new Map(index.confusables);
  const skeleton = (s: string) => [...s.normalize('NFD')].map((c) => map.get(c) ?? c).join('').normalize('NFD');
  const key = skeleton(char);
  return [...new Set(index.confusables.flatMap(([from, to]) => skeleton(from) === key ? [from, to] : []))].filter((s) => s !== char);
}
