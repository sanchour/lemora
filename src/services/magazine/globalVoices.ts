// Global Voices (Lemora U4): a world magazine written and translated by volunteers, CC BY 3.0, so it can be read, kept
// and used commercially with credit (https://globalvoices.org). Its WordPress API lets apps read it (checked 2026-11-04),
// so a story comes in whole, with its paragraphs, and is read in Codex like any article.
import { sourceHtmlToBlocks } from '@/services/discover/discover';
import { addText } from '@/data/library';
import { db } from '@/data/db';

export const GLOBAL_VOICES_CREDIT = 'Global Voices, CC BY 3.0, globalvoices.org';
const SITE: Record<string, string> = { es: 'es', fr: 'fr', de: 'de', ru: 'ru', ar: 'ar', zh: 'zhs', it: 'it', pt: 'pt', ko: 'ko', nl: 'nl', pl: 'pl', tr: 'tr', sv: 'sv', el: 'el', hu: 'hu', id: 'id', sw: 'sw', en: 'www' };
export const hasMagazine = (lang: string) => lang in SITE;

export interface Story {
  id: number;
  title: string;
  excerpt: string;
  link: string;
  date: string;
}

const plain = (html: string) => new DOMParser().parseFromString(html, 'text/html').body.textContent?.replace(/\s+/g, ' ').trim() ?? '';
const api = (lang: string, query: string) => `https://${SITE[lang]}.globalvoices.org/wp-json/wp/v2/posts?${query}`;

/** The latest stories in a language. */
export async function latestStories(lang: string, count = 12): Promise<Story[]> {
  if (!hasMagazine(lang)) return [];
  const res = await fetch(api(lang, `per_page=${count}&_fields=id,link,date,title,excerpt`), { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`Global Voices answered ${res.status}.`);
  const rows = (await res.json()) as Array<{ id: number; link: string; date: string; title: { rendered: string }; excerpt: { rendered: string } }>;
  return rows.map((r) => ({ id: r.id, link: r.link, date: r.date, title: plain(r.title.rendered), excerpt: plain(r.excerpt.rendered) }));
}

/** Puts a story on the shelf (once) and gives its id, to open in the reader. */
export async function addStory(lang: string, story: Story): Promise<string> {
  const there = await db.texts.where('lang').equals(lang).filter((t) => !t.deletedAt && t.sourceUrl === story.link).first();
  if (there) return there.id;
  const res = await fetch(api(lang, `include=${story.id}&_fields=content`), { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`Global Voices answered ${res.status}.`);
  const [post] = (await res.json()) as Array<{ content: { rendered: string } }>;
  const blocks = sourceHtmlToBlocks(post?.content.rendered ?? '');
  if (!blocks.length) throw new Error('That story came back empty. Try another one.');
  return addText({ lang, title: story.title, author: 'Global Voices', kind: 'article', source: 'article', sourceUrl: story.link, readingGenre: 'post', chapters: [{ title: story.title, blocks: [{ t: 'h', text: story.title }, ...blocks, { t: 'p', text: GLOBAL_VOICES_CREDIT }] }] });
}
