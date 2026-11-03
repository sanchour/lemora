/** Learner words go into messages between bidi isolates, so right-to-left words do not scramble the sentence around them. */
export const iso = (s: string): string => `⁨${s}⁩`;
