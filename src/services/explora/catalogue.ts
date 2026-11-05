// Opening an item of Explora's catalogue (src/core/explora/catalogue.ts): a Gutenberg classic and a Wikisource short read are put on the
// shelf (once) and read in Codex, every word a tap away; a StoryWeaver picture book opens on StoryWeaver, which does not let apps read it.
import { db } from '@/data/db';
import { updateText } from '@/data/library';
import { importGutenberg, importWikisource } from '@/services/discover/discover';
import { gutenbergCover, gutenbergUrl, itemUrl, wikisourceUrl } from '@/core/explora/catalogue';
import type { CatalogueItem } from '@/core/explora/catalogue';
import { openLibrivoxBook } from '@/services/sonus/librivox';

/** Where the learner goes: a Codex page (after adding the text), or an outside page for a picture book. */
export type Opened = { to: string } | { external: string };

/** The shelf's copy of an item, if it is already there. */
export async function shelved(lang: string, item: CatalogueItem): Promise<string | undefined> {
  const url = itemUrl(lang, item);
  const there = await db.texts.where('lang').equals(lang).filter((t) => !t.deletedAt && t.sourceUrl === url).first();
  return there ? (there.kind === 'article' ? `/codex/read/${there.id}` : `/codex/book/${there.id}`) : undefined;
}

export async function openCatalogueItem(lang: string, item: CatalogueItem): Promise<Opened> {
  if (item.from.type === 'storyweaver') return { external: itemUrl(lang, item) };
  const there = await shelved(lang, item);
  if (there) return { to: there };
  if (item.from.type === 'gutenberg') {
    const id = item.from.id;
    const text = await importGutenberg(lang, { id, title: item.title, author: item.author, cover: gutenbergCover(id), html: `https://www.gutenberg.org/ebooks/${id}.html.images`, url: gutenbergUrl(id) });
    return { to: `/codex/book/${text}?new=1` };
  }
  const id = await importWikisource(lang, { title: item.from.title, snippet: '', url: wikisourceUrl(lang, item.from.title) }, undefined, true);
  // The page's own name (a subpage of a collection) becomes the learner's title.
  await updateText(id, { title: item.title, ...(item.author ? { author: item.author } : {}) });
  const row = await db.texts.get(id);
  return { to: row?.kind === 'book' ? `/codex/book/${id}?new=1` : `/codex/read/${id}` };
}

/** The recording of a classic, put in Sonus: gives the page to go to. */
export async function openRecording(lang: string, item: CatalogueItem, sonus: string): Promise<string | undefined> {
  if (!item.audio) return undefined;
  return `${sonus}/book/${await openLibrivoxBook(lang, item.audio)}`;
}
