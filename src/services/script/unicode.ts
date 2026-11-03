import type { UnicodeIndex, UnicodeShard } from '@/core/script/unicode';
import type { CharReadings } from '@/core/script/hanzi';
import { PRODUCT } from '@/product';

export const UNICODE_CACHE = `${PRODUCT.prefix}-unicode-17`;
export interface UnicodeAsset<T> { data: T; offline: boolean }
const VERSION = '17.0.0';
const pending = new Map<string, Promise<UnicodeAsset<unknown>>>();

async function asset<T>(path: string, valid: (data: unknown) => boolean): Promise<UnicodeAsset<T>> {
  const url = `${import.meta.env.BASE_URL}${path}?v=${VERSION}`;
  let cache: Cache | undefined;
  try { if (typeof caches !== 'undefined') cache = await caches.open(UNICODE_CACHE); } catch { /* Online use still works when storage is unavailable. */ }
  const saved = await cache?.match(url).catch(() => undefined);
  if (saved) {
    try { const data: unknown = await saved.json(); if (valid(data)) return { data: data as T, offline: true }; } catch { /* Retry an incomplete cache entry online. */ }
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error('Character data could not be loaded. Connect once and try again.');
  const data: unknown = await response.clone().json();
  if (!valid(data)) throw new Error('Character data has an unexpected format. Please try again.');
  let offline = false;
  try { if (cache) { await cache.put(url, response); offline = true; } } catch { /* The page reports that this data was not saved offline. */ }
  return { data: data as T, offline };
}
function once<T>(path: string, valid: (data: unknown) => boolean): Promise<UnicodeAsset<T>> {
  let task = pending.get(path);
  if (!task) { task = asset<T>(path, valid); pending.set(path, task); task.catch(() => pending.delete(path)); }
  return task as Promise<UnicodeAsset<T>>;
}
const object = (data: unknown): data is Record<string, unknown> => Boolean(data && typeof data === 'object' && !Array.isArray(data));
const point = (n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 0x10FFFF;
const range = (row: unknown) => Array.isArray(row) && point(row[0]) && point(row[1]) && row[0] <= row[1] && typeof row[2] === 'string';
export const loadUnicodeIndex = () => once<UnicodeIndex>('chars/unicode/index.json', (d) => object(d) && d.version === VERSION
  && Array.isArray(d.blocks) && d.blocks.length > 0 && d.blocks.every(range)
  && Array.isArray(d.scripts) && d.scripts.every(range)
  && Array.isArray(d.ranges) && d.ranges.every((r) => range(r) && Array.isArray(r) && typeof r[3] === 'string')
  && Array.isArray(d.names) && d.names.every((r) => Array.isArray(r) && point(r[0]) && typeof r[1] === 'string')
  && Array.isArray(d.confusables) && d.confusables.every((r) => Array.isArray(r) && typeof r[0] === 'string' && typeof r[1] === 'string')
  && Array.isArray(d.files) && d.files.includes('Latin') && d.files.includes('Unknown') && d.files.every((s) => typeof s === 'string' && /^[A-Za-z_]+$/.test(s)));
export function loadUnicodeScript(script: string): Promise<UnicodeAsset<UnicodeShard>> {
  if (!/^[A-Za-z_]+$/.test(script)) return Promise.reject(new Error('Invalid script'));
  return once<UnicodeShard>(`chars/unicode/${script}.json`, (d) => object(d) && d.version === VERSION && d.script === script && Array.isArray(d.characters) && d.characters.every((r) => Array.isArray(r) && point(r[0]) && typeof r[1] === 'string' && typeof r[2] === 'string' && point(r[3]) && point(r[4]) && typeof r[5] === 'string'));
}
export const loadUnicodeReadings = () => once<Record<string, CharReadings>>('chars/readings.json', (d) => object(d) && Object.values(d).every((v) => object(v) && (v.d === undefined || typeof v.d === 'string') && ['on', 'kun', 'ko'].every((key) => v[key] === undefined || (Array.isArray(v[key]) && v[key].every((s: unknown) => typeof s === 'string')))));
