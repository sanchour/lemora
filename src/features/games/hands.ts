import type { HandName } from '@/design/drawings';

/** Each game's drawn icon (Lemora U14), for Ludus and Explora › Ludus. */
export const GAME_HAND: Partial<Record<string, HandName>> = { daily: 'day', weekly: 'day', tournament: 'seal', hangman: 'letter', anagram: 'repeat', missing: 'search', clues: 'help', wordsearch: 'search', crossword: 'keys', story: 'book', translate: 'talk', dictation: 'sound', memory: 'cards', definition: 'glasses', hunt: 'search', synonyms: 'repeat', antonyms: 'undo', association: 'globe', sorting: 'folder', odd: 'flag', picture: 'leaf', bingo: 'tag', parts: 'add', ladder: 'stack', complete: 'quill', projects: 'diary' };
