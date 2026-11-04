import { describe, expect, it } from 'vitest';
import { suggestLanguages } from './SpeakStep';

const none = () => false;

describe('languages you speak: suggestions (Lemora 3.6)', () => {
  it('suggests nothing until something is typed, then at most two', () => {
    expect(suggestLanguages('', none)).toEqual([]);
    expect(suggestLanguages('   ', none)).toEqual([]);
    expect(suggestLanguages('a', none).length).toBeLessThanOrEqual(2);
  });

  it('puts the languages the app teaches first, and names that start with the search before others', () => {
    expect(suggestLanguages('span', none)[0]).toEqual({ code: 'es', name: 'Spanish' });
    expect(suggestLanguages('fil', none).map((l) => l.code)).toContain('fil');
  });

  it('leaves out languages already chosen and ones that aren’t living', () => {
    expect(suggestLanguages('span', (code) => code === 'es').map((l) => l.code)).not.toContain('es');
    expect(suggestLanguages('volap', none)).toEqual([]);
    expect(suggestLanguages('church slavic', none)).toEqual([]);
  });
});
