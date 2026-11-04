// Pepper&Carrot (Lemora U4): David Revoy's webcomic, CC BY 4.0, free to read, share and use commercially with credit
// (https://www.peppercarrot.com). The site's own episode list (0_sources/episodes.json, read 2026-11-04) is kept here, because
// the site doesn't let apps read its files; its pictures can still be shown. Each episode: folder, last page, languages.

export const PEPPER_CREDIT = 'Pepper&Carrot by David Revoy, CC BY 4.0, www.peppercarrot.com';
const BASE = 'https://www.peppercarrot.com/0_sources/';

const EPISODES: Array<[string, number, string]> = [
  ['ep01_Potion-of-Flight', 4, 'ar at bn br ca cn cs da de el en eo es fa fi fr ga gb gd go he hi hr hu id ie io it ja jb jz kh kr kt kw la ld lf ls lt ml ms mx nl nm nn no ns oc ph pl pt rc ro ru sb si sk sl sp sr su sv sz ta tp tr uk vi'],
  ['ep02_Rainbow-potions', 6, 'ar at bn br ca cn cs da de el en eo es fa fi fr ga gb gd go hi hr hu id ie it ja jb kh kr kt kw la ld lf ls lt ml ms mx nl nm nn no ns oc ph pl pt ro ru sb si sk sl sp sr sv sz ta tp tr uk vi'],
  ['ep03_The-secret-ingredients', 8, 'ar at bn br ca cn cs da de el en eo es fa fi fr ga gb gd go hr hu id ie it ja jb kh kr kt kw la ld lf ls lt mx nl nm nn no ns oc ph pl pt ro ru si sk sl sp sr sv sz ta tp tr uk vi'],
  ['ep04_Stroke-of-genius', 8, 'ar at bn br ca cn cs da de el en eo es fa fi fr ga gb gd go hr hu id ie it ja jb kh kr kt kw la ld lf ls lt mx nl nm nn no ns oc ph pl pt ro ru si sk sl sp sr sv ta tp tr uk vi'],
  ['ep05_Special-holiday-episode', 5, 'ar at bn br ca cn cs da de el en eo es fa fi fr ga gb gd go hr hu id it ja jb kh kr kt kw la ld lf ls lt mx nl nm nn no ns oc ph pl pt ro ru si sk sl sp sr sv ta tp uk vi'],
  ['ep06_The-Potion-Contest', 10, 'ar at bn br ca cn cs da de el en eo es fa fi fr ga gb gd go hr hu id it ja jb jz kh kr kw la lf ls lt mx nl nm nn no ns oc ph pl pt ro ru si sk sl sp sr sv ta tp tr uk vi'],
  ['ep07_The-Wish', 6, 'ar at bn br ca cn cs da de el en eo es fa fi fr ga gb gd go hr hu id it ja jb kr kw la lf ls lt mx nl nm nn no ns oc ph pl pt ro ru si sk sl sp sr sv ta tp tr uk vi'],
  ['ep08_Pepper-s-Birthday-Party', 7, 'ar at bn br ca cn cs da de el en eo es fa fi fr ga gb gd go hr hu id it ja jb kr kw la lf ls lt mx nl nm nn no ns oc ph pl pt ro ru sk sl sp sr sv ta tp uk vi'],
  ['ep09_The-Remedy', 8, 'at bn br ca cn cs da de el en eo es fa fi fr ga gb gd go hr hu id it ja jb kr kw la lf ls lt mx nl nm nn no ns oc ph pl pt ro ru sk sl sp sr sv tp uk vi'],
  ['ep10_Summer-Special', 6, 'at bn br ca cn cs da de el en eo es fa fi fr ga gb gd go hr hu id it ja jb kr kw la ld lf ls lt mx nl nm nn no ns oc ph pl pt ro ru sk sl sp sr sv tp uk vi'],
  ['ep11_The-Witches-of-Chaosah', 7, 'at br ca cn cs da de el en eo es fa fi fr gb gd go hr hu id it ja jb kr kw la lf ls lt mx nl nn no oc ph pl pt ro ru sk sl sp sr sv tp uk vi'],
  ['ep12_Autumn-Clearout', 8, 'at br ca cn cs da de el en eo es fa fi fr gb gd go hr hu id it ja jb kr kw la lf lt mx nl nn no oc ph pl pt ro ru sk sl sr sv tp uk vi'],
  ['ep13_The-Pyjama-Party', 7, 'at br ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw la lf lt mx nl nn no oc ph pl pt ro ru sk sl sr sv tp uk vi'],
  ['ep14_The-Dragon-s-Tooth', 7, 'at br ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw la lf lt mx nl nn no oc ph pl pt ro ru sk sl sr sv tp uk vi'],
  ['ep15_The-Crystal-Ball', 9, 'at br ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw la ld lf lt mx nl nn no oc ph pl pt ro ru sk sl sv tp uk vi'],
  ['ep16_The-Sage-of-the-Mountain', 7, 'at br ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw la lf lt mx nl nn no oc ph pl pt ro ru sk sl sv tp uk vi'],
  ['ep17_A-Fresh-Start', 8, 'at br ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw la lf lt mx nl nn no oc ph pl pt ro ru sk sl sv tp uk vi'],
  ['ep18_The-Encounter', 8, 'br ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw lf lt mx nl nn no oc ph pl pt ro ru sk sl sv tp uk vi'],
  ['ep19_Pollution', 8, 'br ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw lf lt mx nl nn no oc ph pl pt ro ru sk sl sv tp uk vi'],
  ['ep20_The-Picnic', 7, 'br ca cn cs da de el en eo es fa fi fr gd go hr hu id io it ja jb kr kw ld lf lt mx nl nn no oc ph pl pt ro ru sk sl sr sv tp uk vi'],
  ['ep21_The-Magic-Contest', 8, 'br ca cn cs da de el en eo es fa fi fr gd go hr hu id io it ja jb kr kw lt mx nl nn no oc ph pl pt ro ru sk sl sv tp uk vi'],
  ['ep22_The-Voting-System', 11, 'br ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw lt mx nl nn no oc ph pl pt ro ru sk sl sv tp uk vi'],
  ['ep23_Take-a-Chance', 8, 'ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw lt mx nl nn no oc ph pl pt ro ru sk sl sv tp uk vi'],
  ['ep24_The-Unity-Tree', 8, 'ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw lt mx nl nn no oc ph pl pt ro ru sk sl tp uk vi'],
  ['ep25_There-are-no-Shortcuts', 10, 'ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw ld lt mx nl nn no oc ph pl pt ro ru sl tp uk vi'],
  ['ep26_Books-Are-Great', 7, 'ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw ld lt mx nl nn no oc ph pl pt ro ru sl tp uk vi'],
  ['ep27_Coriander-s-Invention', 7, 'ca cn cs da de el en eo es fa fi fr gd go hr hu id it ja jb kr kw lt mx nl nn no oc ph pl pt ro ru sl tp uk vi'],
  ['ep28_The-Festivities', 10, 'ca cn cs da de en eo es fa fi fr gd go hr hu id it ja jb kr kw lt mx nl nn no oc ph pl pt ro ru sl tp vi'],
  ['ep29_Destroyer-of-Worlds', 9, 'ca cn cs da de en eo es fa fi fr gd go hr hu id it ja jb kr kw lt mx nl nn no oc ph pl pt ro ru sl tp vi'],
  ['ep30_Need-a-Hug', 7, 'ca cn cs da de en eo es fa fr gd go hr hu id it ja jb kr kw ld lt mx nl nn no oc ph pl pt ro ru sl tp vi'],
  ['ep31_The-Fight', 8, 'ca cn cs da de en eo es fa fi fr gd go hr hu id it ja jb kr kw lt mx nl nn no oc ph pl pt ro ru sl tp vi'],
  ['ep32_The-Battlefield', 8, 'ca cn cs da de en eo es fa fi fr gd go hr hu id it ja jb kr kw lt mx nl nn no oc pl pt ro ru sl tp tr vi'],
  ['ep33_Spell-of-War', 9, 'ca cn cs da de en eo es fa fi fr gd go hr hu id it ja jb kw lt mx nl nn no oc pl pt ro ru sl tp tr vi'],
  ['ep34_The-Knighting-of-Shichimi', 11, 'ca cn da de en eo es fa fi fr gd go hr hu id it ja kw lt mx nl nn no pl pt ro ru sl tp vi'],
  ['ep35_The-Reflection', 13, 'ca cn da de en eo es fa fi fr gd go hr id it ja kw lt mx nl nn no pl pt ro ru sl tp vi'],
  ['ep36_The-Surprise-Attack', 16, 'ca cn da de en eo es fi fr go hr id it ja kw lt mx nl nn pl pt ro sl tp vi'],
  ['ep37_The-Tears-of-the-Phoenix', 9, 'ca cn da de en eo es fi fr go hr id it ja kr kw lt mx nl nn pl pt ro sl tp vi'],
  ['ep38_The-Healer', 9, 'ca cn da de en eo es fi fr go hr id it ja kw lt mx nl nn pl ro sl tp vi'],
  ['ep39_The-Tavern', 12, 'ca cn de en es fi fr hr ja kw lt nl nn sl tp'],
];

/** The comic's language codes where they differ from Lingua's. */
const CODE: Record<string, string> = { zh: 'cn', ko: 'kr', nb: 'no' };
export const comicLang = (lang: string) => CODE[lang] ?? lang;

export interface ComicEpisode {
  id: string;
  number: number;
  title: string;
  /** Pages, the title page (0) first. */
  pages: number;
}

const episode = ([id, last]: [string, number, string]): ComicEpisode => ({
  id,
  number: Number(id.slice(2, 4)),
  // The folder's English name; the page itself carries the translated title.
  title: id.slice(5).replace(/-/g, ' '),
  pages: last + 1,
});

/** The episodes translated into a language, first episode first. */
export const comicEpisodes = (lang: string): ComicEpisode[] => EPISODES.filter((e) => e[2].split(' ').includes(comicLang(lang))).map(episode);
export const comicEpisode = (id: string): ComicEpisode | undefined => {
  const e = EPISODES.find((x) => x[0] === id);
  return e && episode(e);
};

const two = (n: number) => String(n).padStart(2, '0');
/** A page's picture (0 is the title page), low resolution, in the language. */
export const comicPage = (lang: string, ep: ComicEpisode, page: number) => `${BASE}${ep.id}/low-res/${comicLang(lang)}_Pepper-and-Carrot_by-David-Revoy_E${two(ep.number)}P${two(page)}.jpg`;
/** The episode's cover, in the language. */
export const comicCover = (lang: string, ep: ComicEpisode) => `${BASE}${ep.id}/low-res/${comicLang(lang)}_Pepper-and-Carrot_by-David-Revoy_E${two(ep.number)}.jpg`;
