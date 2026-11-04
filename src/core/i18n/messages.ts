import type { UiMessage } from './types';
import { PRODUCT } from '@/product';
export const UI_LANGUAGES = ['es', 'fr', 'de', 'ru', 'zh', 'ar'] as const;
// Each catalogue is its own chunk, fetched only when that interface language is on (Lemora 4.3: they were all loaded at
// start, about 3 MB, for learners who read the interface in English). Until it has arrived the interface shows English.
const catalogues: Record<string, Record<string, string>> = {};
const loaders: Record<string, () => Promise<{ default: Record<string, string> }>> = {
  es: () => import('./es.json'),
  fr: () => import('./fr.json'),
  de: () => import('./de.json'),
  ru: () => import('./ru.json'),
  zh: () => import('./zh.json'),
  ar: () => import('./ar.json'),
};
export const catalogueLoaded = (lang: string) => Object.hasOwn(catalogues, lang);
export async function loadCatalogue(lang: string): Promise<void> {
  if (catalogueLoaded(lang) || !Object.hasOwn(loaders, lang)) return;
  catalogues[lang] = (await loaders[lang]()).default;
}
export const uiLanguage = (lang: string): string => UI_LANGUAGES.includes(lang as typeof UI_LANGUAGES[number]) ? lang : 'en';
const brands = new Set(['Lingua', 'Lingua+', 'Max', 'Codex', 'Thesaurus', 'Cursus', 'Ludus', 'Lux', 'Nox', 'Sermo', 'Sonus', 'Visio', 'Cantus', 'Mundus', 'Mentis', 'Ordo', 'Ratio', 'Diarium', 'Grammatica', 'Atlas', 'Explora', 'Bibliotheca']);
// The app's own name in its interface (src/product.ts), applied before any values fill in, so a book called "Lingua …" keeps its name.
// "Lingua" followed by a capital is someone else's name (Lingua Libre, Lingua Latina).
const branded = (text: string): string => text.replace(/\bLingua\b(?! [A-Z])/g, PRODUCT.name);
export const message = (lang: string, source: string): string => branded(brands.has(source.replace(/\{\d+\}/g, '').trim()) || !Object.hasOwn(catalogues, lang) || !Object.hasOwn(catalogues[lang], source) ? source : catalogues[lang][source]);
const reverse = new Map<string, Map<string, string>>();
export function englishSource(lang: string, source: string): string {
  if (!Object.hasOwn(catalogues, lang) || Object.hasOwn(catalogues[lang], source)) return source;
  if (!reverse.has(lang)) reverse.set(lang, new Map(Object.entries(catalogues[lang]).map(([en, local]) => [local, en])));
  return reverse.get(lang)?.get(source) ?? source;
}
export const interpolate = (source: string, values: readonly unknown[] = []): string => source.replace(/\{(\d+)\}/g, (token, index: string) => Number(index) < values.length ? String(values[Number(index)] ?? '') : token);

export function formatUiMessage(locale: string, value: string | UiMessage): string {
  return typeof value === 'string' ? message(locale, value) : interpolate(message(locale, value.source), value.values?.map((part) => typeof part === 'string' ? part : formatUiMessage(locale, part)));
}
export function englishUiMessage(value: string | UiMessage): string {
  return typeof value === 'string' ? value : interpolate(value.source, value.values?.map(englishUiMessage));
}
