// Two languages that are one language in two places (6-1, F0124 and F0125): British and American English, European and Brazilian Portuguese.
// The same table and screen as the language pairs, hand-made; the columns are the varieties (EN-GB, EN-US, PT-PT, PT-BR).
import type { ContrastItem, LanguagePairContrast } from './contrastData';

type Side = ContrastItem['lang1'];
const item = (id: string, dimension: ContrastItem['dimension'], title: string, summary: string, lang1: Side, lang2: Side, more: Partial<ContrastItem> = {}): ContrastItem => ({ id, dimension, title, summary, lang1, lang2, ...more });
const gb = (description: string, example?: string): Side => ({ lang: 'en-GB', description, example });
const us = (description: string, example?: string): Side => ({ lang: 'en-US', description, example });
const pt = (description: string, example?: string): Side => ({ lang: 'pt-PT', description, example });
const br = (description: string, example?: string): Side => ({ lang: 'pt-BR', description, example });
const word = (term: string, correctTerm: string, actualMeaning: string, note?: string) => ({ term, looksLike: correctTerm, actualMeaning, correctTerm, note });

export const VARIETY_PAIRS: LanguagePairContrast[] = [
  {
    pairKey: 'en-gb-us',
    fromLang: 'en-GB',
    toLang: 'en-US',
    title: 'British & American English',
    overview: 'The two are fully understood by each other. They differ in a set of everyday words, in some spellings, in a few small points of grammar and in how some sounds are made. Learn one variety and recognise the other.',
    items: [
      item('engb-v-1', 'false-friends', 'Everyday words that differ', 'The same thing has two names; a few words mean something else on the other side.', gb('lift, flat, boot (of a car), bonnet, pavement, petrol, lorry, holiday, biscuit, crisps, jumper, rubbish bin', 'Take the lift to the flat.'), us('elevator, apartment, trunk, hood, sidewalk, gas (gasoline), truck, vacation, cookie, chips, sweater, trash can', 'Take the elevator to the apartment.'), {
        falseFriends: [
          word('pants', 'trousers', 'In British English “pants” are underpants.', 'Say “trousers” in Britain; “pants” in the US means trousers.'),
          word('chips', 'crisps', 'In British English “chips” are thick fried potato sticks (US: fries).', 'US “chips” are British “crisps”.'),
          word('rubber', 'eraser', 'In British English a “rubber” rubs out pencil; in the US it also means a condom.', 'In the US say “eraser”.'),
          word('football', 'soccer', 'In the US “football” is American football; the British game is “soccer”.'),
        ],
      }),
      item('engb-s-1', 'roots-formation', 'Spelling', 'A few regular patterns decide most of the difference.', gb('-our, -re, -ise (or -ize), -ence, double l: colour, centre, organise, defence, travelled, programme', 'My favourite colour.'), us('-or, -er, -ize, -ense, single l: color, center, organize, defense, traveled, program', 'My favorite color.')),
      item('engb-p-1', 'pronunciation', 'The r after a vowel, and t between vowels', 'American English says every r; British (southern) does not, and the two differ in t and in some vowels.', gb('The r after a vowel is not said unless a vowel follows: “car” is “cah”. The t in “water” is a clear t. “Bath” has the long vowel of “father”.', 'car park, water, bath'), us('Every r is said: “car” has a clear r. The t between vowels is a quick tap, close to d: “water”. “Bath” has the short vowel of “cat”.', 'car park, water, bath')),
      item('engb-g-1', 'tense-aspect', 'Present perfect and “got”', 'British speakers use the present perfect more; the past participle of “get” differs.', gb('Present perfect for a recent event with a present result: “Have you eaten yet?” “I’ve lost my keys.” The participle is “got”: “It has got worse.”', 'Have you eaten yet?'), us('The simple past is common there too: “Did you eat yet?” “I lost my keys.” The participle is “gotten”: “It has gotten worse.”', 'Did you eat yet?')),
      item('engb-g-2', 'prepositions', 'Small prepositions and “different”', 'Little words that change.', gb('at the weekend · Monday to Friday · in a team · write to me · different from or to', 'I’ll see you at the weekend.'), us('on the weekend · Monday through Friday · on a team · write me · different from or than', 'I’ll see you on the weekend.')),
      item('engb-g-3', 'articles', 'Hospital, university, and a team that is or are', 'Where the article goes, and whether a group takes a singular or plural verb.', gb('“in hospital”, “at university” (as a patient or a student). A group may take a plural verb: “The team are playing well.”', 'He is in hospital. The team are ready.'), us('“in the hospital”, “at the university”. A group takes a singular verb: “The team is playing well.”', 'He is in the hospital. The team is ready.')),
      item('engb-c-1', 'culture-semantics', 'Dates and numbers', 'The order of day and month decides what a date means.', gb('Day, month, year: 3/4/2026 is the third of April. Billion has meant a million million, but today it means a thousand million.', '3 April 2026'), us('Month, day, year: 3/4/2026 is the fourth of March. Billion is a thousand million.', 'April 3, 2026'), { alert: 'On a form or a ticket, write the month in words so that no one can read it the other way.' }),
    ],
  },
  {
    pairKey: 'pt-pt-br',
    fromLang: 'pt-PT',
    toLang: 'pt-BR',
    title: 'European & Brazilian Portuguese',
    overview: 'Portuguese speakers from both sides understand each other, but they differ in the sounds, in the pronoun used for “you”, in where small pronouns go, in the progressive, and in a good number of everyday words. Learn one and recognise the other.',
    items: [
      item('ptbr-v-1', 'false-friends', 'Everyday words that differ', 'The same thing has two names, and a few words mean something else (or are rude) on the other side.', pt('autocarro, comboio, pequeno-almoço, casa de banho, telemóvel, ecrã, frigorífico, sumo, ementa, equipa', 'Apanho o comboio e o autocarro.'), br('ônibus, trem, café da manhã, banheiro, celular, tela, geladeira, suco, cardápio, equipe', 'Pego o trem e o ônibus.'), {
        falseFriends: [
          word('bicha', 'fila', 'In Portugal “bicha” is a queue; in Brazil it can be an insult to a gay man.', 'In Brazil say “fila”.'),
          word('rapariga', 'moça', 'In Portugal “rapariga” is a girl; in parts of Brazil it is a rude word for a woman.', 'In Brazil say “menina” or “moça”.'),
          word('fato', 'terno', 'In Portugal “fato” is a suit; in Brazil “fato” is a fact, and a suit is a “terno”.'),
          word('camisola', 'blusa', 'In Portugal “camisola” is a jumper; in Brazil it is a nightdress.', 'In Brazil say “blusa” or “suéter”.'),
          word('puto', 'garoto', 'In Portugal “puto” is a boy, said warmly; in Brazil it is a strong swear word.', 'In Brazil say “garoto” or “menino”.'),
        ],
      }),
      item('ptbr-g-1', 'pronouns', 'Saying “you”', 'The pronoun for a friend is not the same.', pt('“tu” for a friend, with its own verb form (tu falas). “Você” is polite but can sound cool; “o senhor / a senhora” is formal.', 'Tu falas inglês?'), br('“Você” for nearly everyone, with the verb of “he” (você fala). “Tu” is used in some regions, often with “he” verb forms; “o senhor / a senhora” is formal.', 'Você fala inglês?')),
      item('ptbr-g-2', 'tense-aspect', 'Being in the middle of doing something', 'Two ways to make the progressive.', pt('estar a + infinitive: “Estou a falar.”', 'Estou a trabalhar.'), br('estar + gerund (-ndo): “Estou falando.”', 'Estou trabalhando.')),
      item('ptbr-g-3', 'pronouns', 'Where me, te, o and a go', 'The small object pronoun comes after the verb in Portugal, and often before it in Brazil.', pt('After the verb in a plain statement: “Diz-me.” “Vi-o ontem.” Before it after “não”, “que”, “já”: “Não me disse.”', 'Diz-me a verdade.'), br('Before the verb, even at the start: “Me diz.” In speech “o / a” are often replaced by “ele / ela”: “Vi ele ontem.”', 'Me diz a verdade.')),
      item('ptbr-g-4', 'articles', 'The article before “my”', 'Possessives are used with an article in Portugal.', pt('“o meu livro”, “a minha casa”.', 'O meu irmão chegou.'), br('Often without it: “meu livro”, “minha casa”.', 'Meu irmão chegou.')),
      item('ptbr-p-1', 'pronunciation', 'Vowels and the sound of t and d', 'Portugal reduces unstressed vowels; Brazil keeps them open and softens t and d before i.', pt('Unstressed vowels are weak or nearly lost: “falar” is close to “f’lar”. Final and pre-consonant s is “sh”.', 'falar, mesmo'), br('Unstressed vowels stay open. T and d before i (and a final e) sound like “ch” and “j”: “dia” is “jia”, “tarde” is “tarj(i)”. A word-initial r is a breathy “h”.', 'falar, dia')),
      item('ptbr-s-1', 'roots-formation', 'Spelling after the 1990 agreement', 'Most words are now spelled the same; a few still follow the pronunciation of each side.', pt('Some silent consonants are kept: facto, receção, contacto, equipa.', 'o facto de a receção'), br('They are dropped: fato (fact), recepção, contato, equipe.', 'o fato de a recepção')),
    ],
  },
];
