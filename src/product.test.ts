import { describe, expect, it } from 'vitest';
import { message } from '@/core/i18n/messages';
import { createDb } from '@/data/db';
import { PRODUCT, reaches, shows } from './product';

describe('the product this build is', () => {
  it('opens its own database', () => {
    expect(createDb().name).toBe(PRODUCT.db);
  });

  it('shows its own name in the interface, but leaves other names that start with Lingua', () => {
    expect(message('en', 'Back to Lingua')).toBe(`Back to ${PRODUCT.name}`);
    expect(message('ru', 'See what Lingua can do')).toContain(PRODUCT.name);
    expect(message('en', 'Find Lingua Libre and Wiktionary clips')).toContain('Lingua Libre');
  });

  it('knows which addresses lead to a room the build has', () => {
    expect(reaches('/codex/read/x')).toBe(true);
    expect(reaches('/mentis/diarium/abc')).toBe(true);
    expect(reaches('/cursus/alphabets/review')).toBe(true);
    expect(reaches('/sonus?tab=radio')).toBe(shows('sonus'));
    expect(reaches('/mentis/sermo?topic=x')).toBe(shows('sermo'));
    expect(reaches('/mentis?kind=games')).toBe(shows('mundus'));
    expect(reaches('/cursus/grammatica/es-ser')).toBe(shows('grammatica'));
    expect(reaches('/cursus/studio?tool=sounds')).toBe(shows('cursus'));
  });
});
