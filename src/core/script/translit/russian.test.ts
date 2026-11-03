import { describe, expect, it } from 'vitest';
import { russian, russianScheme, RUSSIAN_SCHEMES } from './russian';

describe('Russian named schemes (primary-source fixtures in docs/review/6-23-ru.md)', () => {
  it.each([
    ['Екатеринбург', 'Yekaterinburg'], ['Ёлкино', 'Yëlkino'], ['Змеевка', 'Zmeyevka'],
    ['Ульяновск', 'Ul’yanovsk'], ['Лукъяновка', 'Luk”yanovka'], ['Щурово', 'Shchurovo'],
    ['Донское', 'Donskoye'], ['Грозный', 'Groznyy'],
  ])('matches BGN/PCGN published example %s', (source, expected) => {
    expect(russian(source, 'bgn-pcgn-1947')).toBe(expected);
  });
  it.each([
    ['муж', 'muž'], ['нижний', 'nižnij'], ['общество', 'obŝestvo'], ['часы', 'časy'],
    ['щит', 'ŝit'], ['альбом', 'alʹbom'], ['это', 'èto'], ['южный', 'ûžnyj'], ['яма', 'âma'],
  ])('matches ISO 9:1995 Table 1 example %s', (source, expected) => {
    expect(russian(source, 'iso-9-1995')).toBe(expected);
  });
  it('preserves case, boundaries and supplied ё without inventing it for е', () => {
    expect(russian('Ель, ЕЛЬ; ель; мел; мёл; a!', 'bgn-pcgn-1947')).toBe('Yel’, YEL’; yel’; mel; mël; a!');
    expect(russian('Ёлкино'.normalize('NFD'), 'bgn-pcgn-1947')).toBe('Yëlkino');
    expect(russian('ста́рый', 'iso-9-1995')).toBe('staryj');
  });
  it('distinguishes BGN note 3 sequences', () => {
    expect(russian('йа ыа аы бэ тс шч', 'bgn-pcgn-1947')).toBe('y·a y·a a·y b·e t·s sh·ch');
  });
  it('declines unsupported Cyrillic instead of presenting a mixed-script reading', () => {
    expect(russian('їжа', 'iso-9-1995')).toBeUndefined();
    expect(russian('café', 'bgn-pcgn-1947')).toBeUndefined();
  });
});


describe('ALA-LC 2012 complete Russian table (LC primary PDF/Word source)', () => {
  it.each([
    ['А', 'а', 'A', 'a'], ['Б', 'б', 'B', 'b'], ['В', 'в', 'V', 'v'], ['Г', 'г', 'G', 'g'],
    ['Д', 'д', 'D', 'd'], ['Е', 'е', 'E', 'e'], ['Ё', 'ё', 'Ë', 'ë'], ['Ж', 'ж', 'Zh', 'zh'],
    ['З', 'з', 'Z', 'z'], ['И', 'и', 'I', 'i'], ['І', 'і', 'Ī', 'ī'], ['Й', 'й', 'Ĭ', 'ĭ'],
    ['К', 'к', 'K', 'k'], ['Л', 'л', 'L', 'l'], ['М', 'м', 'M', 'm'], ['Н', 'н', 'N', 'n'],
    ['О', 'о', 'O', 'o'], ['П', 'п', 'P', 'p'], ['Р', 'р', 'R', 'r'], ['С', 'с', 'S', 's'],
    ['Т', 'т', 'T', 't'], ['У', 'у', 'U', 'u'], ['Ф', 'ф', 'F', 'f'], ['Х', 'х', 'Kh', 'kh'],
    ['Ц', 'ц', 'T͡S', 't͡s'], ['Ч', 'ч', 'Ch', 'ch'], ['Ш', 'ш', 'Sh', 'sh'], ['Щ', 'щ', 'Shch', 'shch'],
    ['Ъ', 'ъ', 'ʺ', 'ʺ'], ['Ы', 'ы', 'Y', 'y'], ['Ь', 'ь', 'ʹ', 'ʹ'], ['Ѣ', 'ѣ', 'I͡E', 'i͡e'],
    ['Э', 'э', 'Ė', 'ė'], ['Ю', 'ю', 'I͡U', 'i͡u'], ['Я', 'я', 'I͡A', 'i͡a'], ['Ѳ', 'ѳ', 'Ḟ', 'ḟ'], ['Ѵ', 'ѵ', 'Ẏ', 'ẏ'],
  ])('matches both published cells for %s / %s', (upper, lower, up, low) => {
    expect(russian(upper, 'ala-lc-2012')).toBe(up);
    expect(russian(lower, 'ala-lc-2012')).toBe(low);
  });
  it('retains the terminal hard sign in the 2012 edition and the original tied case in words', () => {
    expect(russian('міръ, Юлия, Цель, Яна', 'ala-lc-2012')).toBe('mīrʺ, I͡Ulii͡a, T͡Selʹ, I͡Ana');
    expect(russian('ЖІ', 'ala-lc-2012')).toBe('ZHĪ');
    expect(russian('ѣ́', 'ala-lc-2012')).toBe('i͡e');
    expect(russian('Ѫ', 'ala-lc-2012')).toBeUndefined();
  });
});

describe('ICAO Doc 9303 (2021) Russian cells, §6 B pp.27–28', () => {
  it.each([
    ['А', 'A'], ['Б', 'B'], ['В', 'V'], ['Г', 'G'], ['Д', 'D'], ['Е', 'E'], ['Ё', 'E'], ['Ж', 'ZH'],
    ['З', 'Z'], ['И', 'I'], ['Й', 'I'], ['К', 'K'], ['Л', 'L'], ['М', 'M'], ['Н', 'N'], ['О', 'O'],
    ['П', 'P'], ['Р', 'R'], ['С', 'S'], ['Т', 'T'], ['У', 'U'], ['Ф', 'F'], ['Х', 'KH'], ['Ц', 'TS'],
    ['Ч', 'CH'], ['Ш', 'SH'], ['Щ', 'SHCH'], ['Ъ', 'IE'], ['Ы', 'Y'], ['Э', 'E'], ['Ю', 'IU'], ['Я', 'IA'],
  ])('matches the published Russian cell %s', (source, expected) => {
    expect(russian(source, 'icao-9303-2021')).toBe(expected);
    expect(russian(source.toLowerCase(), 'icao-9303-2021')).toBe(expected);
  });
  it('omits the unrepresented soft sign, preserves punctuation and declines other Cyrillic languages', () => {
    expect(russian('Ёж, Юлия, Яна, Щука, Цель, Объезд.', 'icao-9303-2021')).toBe('EZH, IULIIA, IANA, SHCHUKA, TSEL, OBIEEZD.');
    expect(russian('ь', 'icao-9303-2021')).toBe('');
    expect(russian('їжа', 'icao-9303-2021')).toBeUndefined();
  });
});

it('accepts every saved named scheme and defaults unknown/absent settings safely', () => {
  for (const scheme of RUSSIAN_SCHEMES) expect(russianScheme(scheme)).toBe(scheme);
  expect(russianScheme()).toBe('bgn-pcgn-1947');
  expect(russianScheme('unknown')).toBe('bgn-pcgn-1947');
});
