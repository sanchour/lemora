import { describe, expect, it } from 'vitest';
import { russian } from './russian';

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
