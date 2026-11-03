// The games Ludus has (6-21), the shelf's data. Each later push (G2 to G7) adds its games here and its screen in features/games.
export type GameGroup = 'today' | 'word' | 'story' | 'project';

export interface GameDef {
  id: string;
  group: GameGroup;
  title: string;
  detail: string;
  /** What the learner's words must be: how many, with a meaning, spelled in letters (at most `maxLetters`). `texts`: a text in Codex to find them in; `list`: that many words of the language's own list (a ladder is not made of the learner's words). */
  needs: { count: number; meaning?: true; letters?: true; maxLetters?: number; texts?: true; list?: number; synonyms?: number; antonyms?: number; related?: number; categories?: true; image?: true; parts?: true; tasks?: number; sentences?: number; stories?: number; completions?: number };
  /** Words in one round. */
  round: number;
}

export const GAME_GROUPS: Record<GameGroup, { title: string; detail: string }> = {
  today: { title: 'Today', detail: 'The same puzzle for everyone learning this language today.' },
  word: { title: 'Word games', detail: 'Played on your own words.' },
  story: { title: 'Story games', detail: 'Stories you play through, with Max or ready-made.' },
  project: { title: 'Projects', detail: 'Small chains across rooms.' },
};

export const GAMES: GameDef[] = [
  { id: 'daily', group: 'today', title: 'Daily puzzle', detail: 'One word puzzle a day, the same for everyone learning the language.', needs: { count: 0, list: 300 }, round: 1 },
  { id: 'weekly', group: 'today', title: 'Weekly challenge', detail: 'Five words on this week’s theme, the same all week.', needs: { count: 0, list: 300 }, round: 5 },
  { id: 'tournament', group: 'today', title: 'Mini tournament', detail: 'Three quick games in a row with one score, against your own last one.', needs: { count: 8, meaning: true }, round: 3 },
  { id: 'hangman', group: 'word', title: 'Hangman', detail: 'Name the letters of the word from its meaning. Six wrong letters and it is lost.', needs: { count: 5, meaning: true, letters: true }, round: 5 },
  { id: 'anagram', group: 'word', title: 'Anagrams', detail: 'The letters of the word are mixed up. Put them back in order, from its meaning.', needs: { count: 5, meaning: true, letters: true }, round: 5 },
  { id: 'missing', group: 'word', title: 'Missing letters', detail: 'The word with some of its letters left out. Fill them in from its meaning.', needs: { count: 5, meaning: true, letters: true }, round: 5 },
  { id: 'clues', group: 'word', title: 'Guess from clues', detail: 'Clues come one at a time, the hardest first. The fewer you need, the more stars.', needs: { count: 5, meaning: true }, round: 5 },
  { id: 'wordsearch', group: 'word', title: 'Word search', detail: 'Find your words in a grid of letters, across, down and slanting.', needs: { count: 6, letters: true, maxLetters: 10 }, round: 1 },
  { id: 'hunt', group: 'word', title: 'Word hunt', detail: 'Find your words in a passage from a text you have in Codex.', needs: { count: 5, texts: true }, round: 3 },
  { id: 'crossword', group: 'word', title: 'Crossword', detail: 'Your words crossed on a grid, clued by their meanings.', needs: { count: 6, meaning: true, letters: true }, round: 1 },
  { id: 'synonyms', group: 'word', title: 'Synonym race', detail: 'Name as many synonyms of a word as you can before the time runs out.', needs: { count: 3, synonyms: 2 }, round: 3 },
  { id: 'antonyms', group: 'word', title: 'Antonym race', detail: 'Name the opposites of a word before the time runs out.', needs: { count: 3, antonyms: 1 }, round: 3 },
  { id: 'association', group: 'word', title: 'Word association', detail: 'Name words that go with a word, its synonyms or its opposites, before the time runs out.', needs: { count: 3, related: 2 }, round: 3 },
  { id: 'sorting', group: 'word', title: 'Category sorting', detail: 'Sort words into the decks, tags or kinds of word they belong to.', needs: { count: 0, categories: true }, round: 2 },
  { id: 'odd', group: 'word', title: 'Odd one out', detail: 'Three of the four words belong together. Find the one that does not.', needs: { count: 0, categories: true }, round: 5 },
  { id: 'definition', group: 'word', title: 'Guess the definition', detail: 'A word of yours, four meanings. Pick the right one.', needs: { count: 5, meaning: true }, round: 5 },
  { id: 'picture', group: 'word', title: 'Picture vocabulary', detail: 'A picture from your cards, four words. Pick the one it shows.', needs: { count: 5, image: true }, round: 5 },
  { id: 'memory', group: 'word', title: 'Memory', detail: 'Turn cards over to find each word and its meaning, or its picture.', needs: { count: 6, meaning: true }, round: 1 },
  { id: 'bingo', group: 'word', title: 'Vocabulary bingo', detail: 'Meanings are called. Mark the word on your card until you have a line.', needs: { count: 9, meaning: true }, round: 1 },
  { id: 'parts', group: 'word', title: 'Build from parts', detail: 'A word split into its parts, mixed up. Put the parts back in order from the meaning.', needs: { count: 4, meaning: true, parts: true }, round: 5 },
  { id: 'translate', group: 'word', title: 'Timed translation', detail: 'Translate as many sentences as you can before the time runs out.', needs: { count: 0, tasks: 8 }, round: 1 },
  { id: 'dictation', group: 'word', title: 'Dictation race', detail: 'Hear a line and type it, as many as you can before the time runs out.', needs: { count: 0, sentences: 6 }, round: 1 },
  { id: 'story', group: 'story', title: 'Escape and adventure stories', detail: 'A story to play through: choose what to do, find things, use them.', needs: { count: 0, stories: 1 }, round: 1 },
  { id: 'complete', group: 'story', title: 'Finish it', detail: 'A dialogue with a line missing, or a story without its ending: pick what fits.', needs: { count: 0, completions: 1 }, round: 5 },
  { id: 'projects', group: 'project', title: 'Project chains', detail: 'Read, talk and write in a chain, each step opening the room that does it.', needs: { count: 0 }, round: 1 },
  { id: 'ladder', group: 'word', title: 'Word ladder', detail: 'Change one letter at a time to get from one word to another, every step a real word.', needs: { count: 0, letters: true, list: 300 }, round: 3 },
];

export const gameById = (id: string | undefined): GameDef | undefined => GAMES.find((g) => g.id === id);
