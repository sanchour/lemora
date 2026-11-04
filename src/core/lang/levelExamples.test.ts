import { describe, expect, it } from 'vitest';
import { joinUnits, LEVEL_EXAMPLE_LANGS, levelExample } from './levelExamples';
import { LEVELS } from './levels';

describe('the level step’s example, word by word (Lemora 3.4)', () => {
  it('has all six levels in all six core languages, every unit with a meaning', () => {
    expect(LEVEL_EXAMPLE_LANGS.sort()).toEqual(['ar', 'de', 'es', 'fr', 'ru', 'zh']);
    for (const lang of LEVEL_EXAMPLE_LANGS) {
      for (const { id } of LEVELS) {
        const ex = levelExample(lang, id)!;
        expect(ex, `${lang} ${id}`).toBeTruthy();
        expect(ex.units.every((u) => u.text && u.gloss), `${lang} ${id}`).toBe(true);
        expect(ex.en.length).toBeGreaterThan(5);
      }
    }
  });

  it('puts back together as a sentence whose units have no stray spaces', () => {
    const es = levelExample('es', 'A1')!;
    expect(joinUnits('es', es.units)).toBe('Me llamo Ana y vivo en Madrid.');
    expect(joinUnits('zh', levelExample('zh', 'A1')!.units)).toBe('我叫安娜，我住在北京。');
    for (const lang of LEVEL_EXAMPLE_LANGS) for (const { id } of LEVELS) for (const u of levelExample(lang, id)!.units) expect(u.text).toBe(u.text.trim());
  });

  it('keeps the sentences the step has always shown', () => {
    expect(joinUnits('ru', levelExample('ru', 'A0')!.units)).toBe('Привет, как дела?');
    expect(joinUnits('de', levelExample('de', 'B2')!.units)).toBe('Hätte ich gewusst, wie schwierig es werden würde, hätte ich wohl viel früher angefangen.');
    expect(joinUnits('ar', levelExample('ar', 'A0')!.units)).toBe('مرحبا، كيف حالك؟');
  });
});
