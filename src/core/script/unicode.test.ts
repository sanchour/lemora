import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { characterInfo, codeQuery, findCharacters, inRange, lookalikes, rangeName, scriptOf } from './unicode';
import type { UnicodeIndex, UnicodeShard } from './unicode';
import { lettersOf } from './types';
import type { Script } from './types';

const index = JSON.parse(readFileSync('public/chars/unicode/index.json', 'utf8')) as UnicodeIndex;
const shards = new Map(index.files.map((s) => [s, JSON.parse(readFileSync(`public/chars/unicode/${s}.json`, 'utf8')) as UnicodeShard]));
const info = (cp: number) => characterInfo(index, shards.get(scriptOf(index, cp))!, cp);
// Original Unicode 17 fixture, Unicode-3.0 notice: public/chars/unicode/LICENSE.txt.
const source = gunzipSync(readFileSync('src/core/script/UnicodeData-17.0.0.txt.gz'));
const rows = source.toString().trim().split('\n').map((s) => s.split(';'));
const raw = new Map(rows.map((r) => [parseInt(r[0], 16), r]));

describe('Unicode character reference', () => {
  it('pins the full source and compares every explicit generated record to UnicodeData', () => {
    const manifest = JSON.parse(readFileSync('public/chars/unicode/SOURCES.json', 'utf8')) as { sources: Array<{ name: string; sha256: string }> };
    expect(createHash('sha256').update(source).digest('hex')).toBe(manifest.sources.find((s) => s.name === 'unicode-data.txt')!.sha256);
    let count = 0;
    for (const shard of shards.values()) for (const row of shard.characters) {
      const original = raw.get(row[0])!;
      expect([row[1], row[2], row[3], row[4], row[5]]).toEqual([original[1], original[2], parseInt(original[12], 16) || 0, parseInt(original[13], 16) || 0, original[10]]);
      expect(scriptOf(index, row[0])).toBe(shard.script);
      count++;
    }
    expect(count).toBe(rows.filter((r) => !/,(?: First| Last)>$/.test(r[1])).length);
  });

  it('checks every alphabet glyph and lowercase character against its upstream name or algorithmic range', () => {
    const alphabets = import.meta.glob<{ default: Script }>('./alphabets/*.ts', { eager: true });
    let count = 0;
    for (const { default: alphabet } of Object.values(alphabets)) for (const letter of lettersOf(alphabet)) for (const char of letter.glyph + (letter.lower ?? '')) {
      const cp = char.codePointAt(0)!;
      const original = raw.get(cp);
      const actual = info(cp);
      if (original && !original[1].endsWith(', First>') && !original[1].endsWith(', Last>')) {
        expect(actual.name, `${alphabet.lang}: ${char}`).toBe(original[1].startsWith('<') ? '' : original[1]);
      } else {
        const range = inRange(index.ranges, cp)!;
        expect(range, `${alphabet.lang}: ${char}`).toBeDefined();
        const upstream = raw.get(range[0])!;
        expect(upstream[1]).toBe(range[2]);
        expect(actual.name).toBe(rangeName(cp, upstream[1]));
        expect(actual.name.length).toBeGreaterThan(0);
      }
      expect(actual.category).not.toBe('Cn');
      count++;
    }
    expect(count).toBeGreaterThan(500);
  });

  it('handles algorithmic names, supplementary planes, control, private-use and invalid code points', () => {
    expect(info(0xAC00).name).toBe('HANGUL SYLLABLE GA');
    expect(info(0xC544).name).toBe('HANGUL SYLLABLE A');
    expect(info(0xD7A3).name).toBe('HANGUL SYLLABLE HIH');
    expect(info(0x20000).name).toBe('CJK UNIFIED IDEOGRAPH-20000');
    expect(info(0x18D00).name).toBe('TANGUT IDEOGRAPH-18D00');
    expect(info(0x1F600)).toMatchObject({ name: 'GRINNING FACE', utf8: 'F0 9F 98 80' });
    expect(info(10)).toMatchObject({ category: 'Cc', name: '', utf8: '0A' });
    expect(info(0xE000)).toMatchObject({ category: 'Co', name: '' });
    expect(info(0x0378)).toMatchObject({ category: 'Cn', name: '' });
    expect(info(0xFFFF).noncharacter).toBe(true);
    expect(info(0xD800)).toMatchObject({ category: 'Cs', utf8: null, name: '' });
    expect(() => info(0x110000)).toThrow('Invalid code point');
  });

  it('shows canonical decomposition, simple case mappings and precise UTF-8 bytes', () => {
    expect(info(0xE9)).toMatchObject({ lower: 'é', upper: 'É', nfc: 'é', nfd: 'e\u0301', utf8: 'C3 A9' });
    expect(info(0xDF)).toMatchObject({ lower: 'ß', upper: 'ß' });
    expect(info(0x3C2).upper).toBe('Σ');
    expect(info(0x430).script).toBe('Cyrillic');
  });

  it('searches names, literal characters and code points; browsing stays bounded by script and block', () => {
    const block = index.blocks[0];
    expect(findCharacters(index, 'latin small letter a', 'Greek', block)).toContain(0x61);
    expect(findCharacters(index, 'U+20000', 'Latin', block)).toEqual([0x20000]);
    expect(findCharacters(index, '0x10ffff', 'Latin', block)).toEqual([0x10FFFF]);
    expect(findCharacters(index, 'U+110000', 'Latin', block)).toEqual([]);
    expect(findCharacters(index, '😀', 'Latin', block)).toEqual([0x1F600]);
    expect(findCharacters(index, 'HANGUL SYLLABLE HIH', 'Latin', block)).toContain(0xD7A3);
    const first = findCharacters(index, '', 'Latin', block, 0, 10), second = findCharacters(index, '', 'Latin', block, 1, 10);
    expect(first.length).toBe(10);
    expect(second.some((cp) => first.includes(cp))).toBe(false);
    expect([...first, ...second].every((cp) => scriptOf(index, cp) === 'Latin' && cp <= block[1])).toBe(true);
    expect(codeQuery('U+0000')).toBe(0);
  });

  it('finds reverse lookalikes as well as sequences without conflating their code points', () => {
    expect(lookalikes(index, 'a')).toEqual(expect.arrayContaining(['а', 'α']));
    expect(lookalikes(index, 'm')).toContain('rn');
    expect(lookalikes(index, 'а')).toContain('a');
    expect(lookalikes(index, 'а')).not.toContain('а');
  });
});
