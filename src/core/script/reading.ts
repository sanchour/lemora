// Reading aids over words (6-23): the Latin-letter reading of a word in a script the learner is still
// learning, and the code points of a letter. Pure, so the reader and the letter sheet share it.
import { ROMANIZE } from './romanize';
import { russian, RUSSIAN_SCHEMES, RUSSIAN_SCHEME_NAMES } from './translit/russian';
import { greek, GREEK_SCHEMES, GREEK_SCHEME_NAMES } from './translit/greek';

export const NAMED_READING_SCHEMES: Record<string, { value: string; label: string }[]> = {
  ru: RUSSIAN_SCHEMES.map((value) => ({ value, label: RUSSIAN_SCHEME_NAMES[value] })),
  el: GREEK_SCHEMES.map((value) => ({ value, label: GREEK_SCHEME_NAMES[value] })),
};
export const selectedReadingScheme = (lang: string, saved?: string): string | undefined => NAMED_READING_SCHEMES[lang]?.find((s) => s.value === saved)?.value ?? NAMED_READING_SCHEMES[lang]?.[0].value;

/** Languages whose words get a transliteration over them (Mandarin, Cantonese and Japanese have readings of their own). */
export const TRANSLIT_LANGS = new Set(['ru', 'el', 'ar', 'ko', 'ka']);

/** A word's transliteration, or undefined when the scheme can't read it (Arabic without vowel marks) or it would only repeat the word. */
export function translitFor(lang: string, text: string, scheme?: string): string | undefined {
  if (lang === 'ru' && scheme) return RUSSIAN_SCHEMES.includes(scheme as typeof RUSSIAN_SCHEMES[number]) ? russian(text, scheme as typeof RUSSIAN_SCHEMES[number]) : undefined;
  if (lang === 'el' && scheme) return GREEK_SCHEMES.includes(scheme as typeof GREEK_SCHEMES[number]) ? greek(text, scheme as typeof GREEK_SCHEMES[number]) : undefined;
  if (!TRANSLIT_LANGS.has(lang)) return undefined;
  const out = ROMANIZE[lang]?.(text);
  return out && out !== text.toLowerCase() ? out : undefined;
}

/** `U+0416` for each code point of a letter, so lookalikes (Latin a, Cyrillic а) can be told apart. */
export const codePoints = (s: string) => [...s].map((c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`).join(' ');
