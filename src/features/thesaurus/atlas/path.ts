import { shows } from '@/product';

// Where the atlas lives: a room of its own in Lemora, Thesaurus's tab in Lingua.
export const ATLAS = shows('atlas') ? '/atlas' : '/thesaurus?tab=atlas';
export const atlasPath = (word: string) => `${ATLAS}${ATLAS.includes('?') ? '&' : '?'}word=${encodeURIComponent(word)}`;
