// Unicode 17.0.0, UAX #44 and UTS #39. Inputs pinned by T0; no downloads or runtime migrations.
//   node scripts/script/unicode.ts       (regenerate public/chars/unicode)
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { inRange } from '../../src/core/script/unicode.ts';
import type { UnicodeIndex, UnicodeRange, UnicodeRow, UnicodeShard } from '../../src/core/script/unicode.ts';

const root = new URL('../../', import.meta.url);
const read = (name: string) => readFileSync(new URL(`scripts/.cache/6-23/${name}`, root), 'utf8');
const sources = JSON.parse(readFileSync(new URL('docs/6-23-SOURCES.json', root), 'utf8')) as Array<{ name: string; url: string; sha256: string }>;
for (const name of ['unicode-data.txt', 'blocks.txt', 'scripts.txt', 'confusables.txt', 'unicode-license.txt']) {
  if (createHash('sha256').update(read(name)).digest('hex') !== sources.find((s) => s.name === name)?.sha256) throw new Error(`Source hash mismatch: ${name}`);
}
function properties(text: string): UnicodeRange[] {
  return text.split('\n').map((s) => s.split('#')[0].trim()).filter(Boolean).map((s) => {
    const [span, value] = s.split(';').map((v) => v.trim());
    const [start, end = start] = span.split('..');
    return [parseInt(start, 16), parseInt(end, 16), value] as UnicodeRange;
  }).sort((a, b) => a[0] - b[0]);
}
const scripts = properties(read('scripts.txt'));
const index: UnicodeIndex = { version: '17.0.0', blocks: properties(read('blocks.txt')), scripts, ranges: [], names: [], confusables: [], files: [] };
const shards = new Map<string, UnicodeShard>();
const shardOf = (script: string) => {
  let shard = shards.get(script);
  if (!shard) { shard = { version: index.version, script, characters: [] }; shards.set(script, shard); }
  return shard;
};
let first: string[] | undefined;
for (const line of read('unicode-data.txt').trim().split('\n')) {
  const row = line.split(';');
  const cp = parseInt(row[0], 16), script = inRange(scripts, cp)?.[2] ?? 'Unknown';
  shardOf(script);
  if (row[1].endsWith(', First>')) { first = row; continue; }
  if (row[1].endsWith(', Last>')) {
    if (!first || first[1].replace(', First>', '') !== row[1].replace(', Last>', '')) throw new Error('Unpaired Unicode range');
    index.ranges.push([parseInt(first[0], 16), cp, first[1], first[2]]); first = undefined; continue;
  }
  const record: UnicodeRow = [cp, row[1], row[2], parseInt(row[12], 16) || 0, parseInt(row[13], 16) || 0, row[10]];
  shardOf(script).characters.push(record);
  if (!row[1].startsWith('<')) index.names.push([cp, row[1]]);
}
if (first) throw new Error('Unclosed Unicode range');
const decode = (text: string) => text.trim().split(/\s+/).map((s) => String.fromCodePoint(parseInt(s, 16))).join('');
for (const line of read('confusables.txt').split('\n')) {
  const body = line.split('#')[0].trim();
  if (!body) continue;
  const [from, to] = body.split(';');
  index.confusables.push([decode(from), decode(to)]);
}
for (const [, , script] of scripts) shardOf(script);
index.files = [...shards.keys()].sort();
const dir = new URL('public/chars/unicode/', root);
mkdirSync(dir, { recursive: true });
let raw = 0, gzip = 0;
for (const [name, value] of [['index', index], ...shards] as Array<[string, unknown]>) {
  const text = JSON.stringify(value);
  raw += Buffer.byteLength(text); gzip += gzipSync(text, { level: 9 }).byteLength;
  writeFileSync(new URL(`${name}.json`, dir), text);
}
writeFileSync(new URL('LICENSE.txt', dir), read('unicode-license.txt'));
writeFileSync(new URL('SOURCES.json', dir), JSON.stringify({ version: index.version, licence: 'Unicode-3.0', sources: sources.filter((s) => ['unicode-data.txt', 'blocks.txt', 'scripts.txt', 'confusables.txt', 'unicode-license.txt'].includes(s.name)), rawBytes: raw, gzipBytes: gzip }, null, 2) + '\n');
// The immutable upstream fixture makes alphabet-wide source comparisons work in CI, without downloading.
writeFileSync(new URL('src/core/script/UnicodeData-17.0.0.txt.gz', root), gzipSync(read('unicode-data.txt'), { level: 9 }));
console.log(fileURLToPath(dir), index.files.length, 'scripts;', raw, 'JSON bytes;', gzip, 'gzip bytes');
