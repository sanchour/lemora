import { describe, expect, it } from 'vitest';
import { greek, GREEK_SCHEMES } from './greek';
import { selectedReadingScheme, translitFor } from '../reading';

// Literal table cells, independent of the engine; editions/pages in docs/review/6-23-el.md.
const TABLE = [
  ['α', 'a', 'a'], ['β', 'v', 'v'], ['γ', 'g', 'g'], ['δ', 'd', 'd'], ['ε', 'e', 'e'], ['ζ', 'z', 'z'],
  ['η', 'i', 'ī'], ['θ', 'th', 'th'], ['ι', 'i', 'i'], ['κ', 'k', 'k'], ['λ', 'l', 'l'], ['μ', 'm', 'm'],
  ['ν', 'n', 'n'], ['ξ', 'x', 'x'], ['ο', 'o', 'o'], ['π', 'p', 'p'], ['ρ', 'r', 'r'], ['σ', 's', 's'],
  ['ς', 's', 's'], ['τ', 't', 't'], ['υ', 'y', 'y'], ['φ', 'f', 'f'], ['χ', 'ch', 'ch'], ['ψ', 'ps', 'ps'], ['ω', 'o', 'ō'],
];
describe('Greek primary-source tables', () => {
  it.each(TABLE)('maps %s in ELOT 743 and ISO 843 Type 1', (source, elot, iso) => {
    expect(greek(source, 'elot-743')).toBe(elot);
    expect(greek(source, 'iso-843-1997-1')).toBe(iso);
    expect(greek(source.toUpperCase(), 'elot-743')).toBe(elot.toUpperCase());
    expect(greek(source.toUpperCase(), 'iso-843-1997-1')).toBe(iso.toUpperCase());
  });
  it.each([
    ['αι', 'ai'], ['άι', 'ái'], ['αϊ', 'aï'], ['γκ', 'gk'], ['ει', 'ei'], ['έι', 'éi'], ['εϊ', 'eï'],
    ['ντ', 'nt'], ['οι', 'oi'], ['όι', 'ói'], ['οϊ', 'oï'], ['υι', 'yi'],
    ['γγ', 'ng'], ['γξ', 'nx'], ['γχ', 'nch'], ['μπ', 'b'], ['ου', 'ou'],
    ['αυ', 'af'], ['ευ', 'ef'], ['ηυ', 'if'], ['αύ', 'áf'], ['εύ', 'éf'], ['ηύ', 'íf'],
  ])('matches ELOT table and UNGEGN note example %s', (source, expected) => {
    expect(greek(source, 'elot-743')).toBe(expected);
  });
  it.each([['αυ', 'au'], ['ευ', 'eu'], ['ου', 'ou']])('matches ISO table 1 note 1 pair %s', (source, expected) => {
    expect(greek(source, 'iso-843-1997-1')).toBe(expected);
  });
  it('uses the standard note 11 title-case examples', () => {
    for (const scheme of GREEK_SCHEMES) {
      expect(greek('Χαρα Θαλασσα Ψαρι', scheme)).toBe('Chara Thalassa Psari');
      expect(greek('ΧΑΡΑ ΘΑΛΑΣΣΑ ΨΑΡΙ', scheme)).toBe('CHARA THALASSA PSARI');
    }
  });
});

describe('synthetic Greek edge regressions (not published word examples)', () => {
  it('uses every voiced/voiceless context and word boundaries', () => {
    for (const c of [...'αεηιουωβγδζλμνρ']) expect(greek('αυ' + c, 'elot-743')).toBe('av' + greek(c, 'elot-743'));
    for (const c of [...'θκξπστφχψ']) expect(greek('ευ' + c, 'elot-743')).toBe('ef' + greek(c, 'elot-743'));
    expect(greek('αυ, ευ! ηυ.', 'elot-743')).toBe('af, ef! if.');
    expect(greek('αύριο εύρος ηύρα', 'elot-743')).toBe('ávrio évros ívra');
    expect(greek('ΑΥΓΗ αυγή ευχή', 'elot-743')).toBe('AVGI avgí efchí');
  });
  it('keeps boundary-sensitive μπ distinct from ντ and γκ', () => {
    expect(greek('μπα αμπα αμπ, ντα γκα', 'elot-743')).toBe('ba ampa ab, nta gka');
    expect(greek('μπα αμπα αμπ, ντα γκα', 'iso-843-1997-1')).toBe('mpa ampa amp, nta gka');
  });
  it('preserves explicit accents and diaeresis without inventing stress', () => {
    for (const scheme of GREEK_SCHEMES) {
      expect(greek('άυ αϋ έυ εϋ όυ οϋ ού', scheme)).toBe('áy aÿ éy eÿ óy oÿ oú');
      expect(greek('Ϊ Ϋ ΐ ΰ', scheme)).toBe('Ï Ÿ ḯ ÿ́');
      expect(greek('Σούδα'.normalize('NFD'), scheme)).toBe('Soúda');
    }
    expect(greek('ή ώ', 'iso-843-1997-1')).toBe('ī́ ṓ');
    expect(greek('Η Ω', 'iso-843-1997-1')).toBe('Ī Ō');
  });
  it('preserves non-Greek text and declines polytonic, archaic and invalid marks', () => {
    for (const scheme of GREEK_SCHEMES) {
      expect(greek('a! Ω, 1.', scheme)).toBe(scheme === 'elot-743' ? 'a! O, 1.' : 'a! Ō, 1.');
      for (const source of ['ἀλφα', 'ᾠδή', 'ϝ', 'β́', 'α̈', '\u0301α']) expect(greek(source, scheme)).toBeUndefined();
      expect(greek('Latin', scheme)).toBeUndefined();
    }
  });
  it('resolves stale settings once for the selector and reader, keeping other language choices independent', () => {
    expect(selectedReadingScheme('el')).toBe('elot-743');
    expect(selectedReadingScheme('el', 'iso-9-1995')).toBe('elot-743');
    expect(selectedReadingScheme('ru', 'iso-9-1995')).toBe('iso-9-1995');
    expect(selectedReadingScheme('es', 'elot-743')).toBeUndefined();
    for (const scheme of GREEK_SCHEMES) {
      expect(selectedReadingScheme('el', scheme)).toBe(scheme);
      expect(translitFor('el', 'Ωρα', scheme)).toBe(scheme === 'elot-743' ? 'Ora' : 'Ōra');
    }
    expect(translitFor('el', 'Ωρα', 'not-a-scheme')).toBeUndefined();
  });
});
