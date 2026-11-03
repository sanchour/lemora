import { describe, expect, it } from 'vitest';
import { message } from '@/core/i18n/messages';
import { createDb } from '@/data/db';
import { PRODUCT } from './product';

describe('the product this build is', () => {
  it('opens its own database', () => {
    expect(createDb().name).toBe(PRODUCT.db);
  });

  it('shows its own name in the interface, but leaves other names that start with Lingua', () => {
    expect(message('en', 'Back to Lingua')).toBe(`Back to ${PRODUCT.name}`);
    expect(message('ru', 'See what Lingua can do')).toContain(PRODUCT.name);
    expect(message('en', 'Find Lingua Libre and Wiktionary clips')).toContain('Lingua Libre');
  });
});
