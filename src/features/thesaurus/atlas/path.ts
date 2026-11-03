// Kept apart from AtlasTab so a link to the Atlas doesn't pull the canvas's code into the page that links (6-29).
export const atlasPath = (word: string) => `/thesaurus?tab=atlas&word=${encodeURIComponent(word)}`;
