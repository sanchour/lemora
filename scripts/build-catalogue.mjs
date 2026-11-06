// Writes src/core/explora/data/<lang>.json, Explora's free reading catalogue (src/core/explora/catalogue.ts), from the specs in
// scripts/catalogue-spec.json. Every entry is checked against its source before it is kept:
//   Gutenberg   the book is in the official catalogue (pg_catalog.csv), a single-language text whose author died before 1956,
//               with an HTML edition (what the app reads);
//   Wikisource  the page exists and has text (the words are counted for the minutes);
//   StoryWeaver the picture books with most reads at each level, with cover, authors and illustrators (CC BY 4.0, credited on its page);
//   LibriVox    a recording on archive.org whose title matches the classic's (for reading along).
// Run:  node scripts/build-catalogue.mjs [lang ...]     (needs the network; polite: one request a second, answers cached in scripts/.cache)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const UA = 'LemoraCatalogueBuild/1.0';
const CACHE = new URL('./.cache/catalogue/', import.meta.url).pathname;
mkdirSync(CACHE, { recursive: true });
const spec = JSON.parse(readFileSync(new URL('./catalogue-spec.json', import.meta.url), 'utf8'));
const langs = process.argv.slice(2).length ? process.argv.slice(2) : ['fr', 'es', 'de', 'ru', 'zh', 'ar'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, { json = false, method = 'GET', tries = 5 } = {}) {
  const key = CACHE + createHash('sha1').update(method + url).digest('hex');
  if (existsSync(key)) { const text = readFileSync(key, 'utf8'); return json ? JSON.parse(text) : text; }
  for (let i = 0; i < tries; i++) {
    await sleep(1100);
    try {
      const res = await fetch(url, { method, headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(40_000) });
      if (res.status === 429 || res.status >= 500) { await sleep(5000 * (i + 1)); continue; }
      const text = method === 'HEAD' ? String(res.status) : await res.text();
      if (res.ok || method === 'HEAD') { if (!(json && !text.startsWith('{') && !text.startsWith('['))) { writeFileSync(key, text); return json ? JSON.parse(text) : text; } }
      return json ? null : text;
    } catch { await sleep(3000); }
  }
  return null;
}

// ── Gutenberg ────────────────────────────────────────────────────────────────
function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  return rows;
}
let catalog;
async function pgCatalog() {
  if (catalog) return catalog;
  const file = CACHE + 'pg_catalog.csv';
  if (!existsSync(file)) { const res = await fetch('https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv', { headers: { 'User-Agent': UA } }); writeFileSync(file, await res.text()); }
  const [head, ...rows] = parseCsv(readFileSync(file, 'utf8'));
  catalog = rows.filter((r) => r.length >= head.length - 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
  return catalog;
}
const death = (authors) => { const m = /(\d{4})\??-(\d{4})/.exec(authors || ''); return m ? Number(m[2]) : null; };
/** "Verne, Jules, 1828-1905; ..." -> "Jules Verne". */
const person = (authors) => {
  const first = (authors || '').split(';')[0].replace(/,?\s*-?\d{3,4}\??.*$/, '').trim();
  const [last, ...rest] = first.split(',').map((s) => s.trim());
  return rest.length ? `${rest.join(' ')} ${last}`.replace(/\s+\(.*?\)/g, '') : last;
};
const FIRST_YEAR_OK = 1955;

async function gutenberg(lang) {
  const rows = (await pgCatalog()).filter((r) => r.Language === lang && r.Type === 'Text');
  const out = [];
  for (const s of spec.G[lang] ?? []) {
    const t = new RegExp(s.re, 'i'), a = new RegExp(s.author || '.', 'i');
    const row = rows.find((r) => t.test(r.Title) && a.test(r.Authors) && (death(r.Authors) === null || death(r.Authors) <= FIRST_YEAR_OK));
    if (!row) { console.log(`  ✗ ${lang} Gutenberg: ${s.title} (not in the catalogue)`); continue; }
    const id = Number(row['Text#']);
    const status = await get(`https://www.gutenberg.org/ebooks/${id}.html.images`, { method: 'HEAD' });
    if (status !== '200') { console.log(`  ✗ ${lang} Gutenberg: ${s.title} (${id}: no HTML edition, ${status})`); continue; }
    out.push({ id: `pg${id}`, kind: 'classic', title: s.title, author: s.authorName ?? person(row.Authors), level: s.level, from: { type: 'gutenberg', id } });
  }
  return out;
}

// ── Wikisource ───────────────────────────────────────────────────────────────
const words = (html, lang) => {
  const text = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  return lang === 'zh' ? (text.match(/\p{Script=Han}/gu) ?? []).length / 1.6 : (text.match(/[\p{L}\p{N}’']+/gu) ?? []).length;
};
async function wikisource(lang, title) {
  const d = await get(`https://${lang}.wikisource.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=text&redirects=1&disableeditsection=1&format=json&formatversion=2`, { json: true });
  const html = d?.parse?.text;
  if (!html) return null;
  const doc = html.replace(/<div class="(?:ws-noexport|noprint|mw-references-wrap)[\s\S]*?<\/div>/g, '');
  return { words: words(doc, lang), parts: (html.match(/href="\/wiki\/[^"#]*%2F|href="\/wiki\/[^"#]*\//g) ?? []).length };
}
async function shorts(lang) {
  const out = [];
  for (const [title, name, author, genre, level] of spec.W[lang] ?? []) {
    const r = await wikisource(lang, title);
    if (!r || r.words < 15) { console.log(`  ✗ ${lang} Wikisource: ${title} (${r ? `only ${Math.round(r.words)} words` : 'not found'})`); continue; }
    const minutes = Math.max(1, Math.round(r.words / (lang === 'zh' ? 250 : 200)));
    if (minutes > 25) { console.log(`  ✗ ${lang} Wikisource: ${title} (${minutes} min is not a short read)`); continue; }
    out.push({ id: `ws:${title}`, kind: 'short', title: name, author, level, minutes, genre, from: { type: 'wikisource', title } });
  }
  return out;
}
async function wikiClassics(lang) {
  const out = [];
  for (const [title, name, author, level] of spec.C[lang] ?? []) {
    const r = await wikisource(lang, title);
    if (!r || (r.words < 300 && r.parts < 2)) { console.log(`  ✗ ${lang} Wikisource classic: ${title} (${r ? `${Math.round(r.words)} words, ${r.parts} parts` : 'not found'})`); continue; }
    out.push({ id: `ws:${title}`, kind: 'classic', title: name, author, level, from: { type: 'wikisource', title } });
  }
  return out;
}

// ── StoryWeaver ──────────────────────────────────────────────────────────────
const SW = { fr: 'French', es: 'Spanish', de: 'German', ru: 'Russian', zh: 'Chinese (Simplified)', ar: 'Arabic' };
const SW_LEVEL = { 1: 'A1', 2: 'A1', 3: 'A2', 4: 'B1' };
async function picture(lang) {
  const name = SW[lang];
  const books = [];
  for (const page of [1, 2, 3]) {
    const d = await get(`https://storyweaver.org.in/api/v1/books-search?languages%5B%5D=${encodeURIComponent(name)}&per_page=40&page=${page}`, { json: true });
    books.push(...(d?.data ?? []));
  }
  const byLevel = {};
  for (const b of books.filter((b) => !b.isAudio && !b.isGif && SW_LEVEL[b.level] && b.coverImage?.sizes?.length)) (byLevel[b.level] ??= []).push(b);
  const out = [];
  for (const level of [1, 2, 3, 4]) {
    for (const b of (byLevel[level] ?? []).sort((x, y) => y.readsCount - x.readsCount).slice(0, level === 4 ? 3 : 4)) {
      const size = b.coverImage.sizes.find((s) => s.width >= 400) ?? b.coverImage.sizes.at(-1);
      const people = [...(b.authors ?? []).map((p) => p.name), ...(b.illustrators ?? []).map((p) => p.name)];
      out.push({ id: `sw${b.id}`, kind: 'picture', title: b.title, author: [...new Set(people)].slice(0, 3).join(', ') || undefined, level: SW_LEVEL[level], cover: size.url, from: { type: 'storyweaver', slug: b.slug } });
    }
  }
  return out;
}

// ── Comic series (Wikimedia Commons scans) ───────────────────────────────────
const natural = (a, b) => a.localeCompare(b, 'en', { numeric: true });
async function series(lang) {
  const out = [];
  for (const [id, title, author, years, category, level, blurb] of spec.S[lang] ?? []) {
    const base = `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=${encodeURIComponent('Category:' + category)}&gcmtype=file&gcmlimit=50&prop=imageinfo&iiprop=url%7Cmime&iiurlwidth=420&format=json&formatversion=2`;
    const rows = [];
    let more = '';
    for (let i = 0; i < 12; i++) {
      const d = await get(base + more, { json: true });
      rows.push(...(d?.query?.pages ?? []));
      if (!d?.continue) break;
      more = Object.entries(d.continue).map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join('');
    }
    const pages = rows.filter((p) => /^image\/(jpeg|png)/.test(p.imageinfo?.[0]?.mime ?? '')).sort((a, b) => natural(a.title, b.title));
    if (pages.length < 5) { console.log(`  ✗ ${lang} series: ${title} (${pages.length} pages)`); continue; }
    out.push({ id, title, author, years, level, blurb, category, pages: pages.length, cover: pages[0].imageinfo[0].thumburl ?? pages[0].imageinfo[0].url });
  }
  return out;
}

// ── Magazines (old periodicals on Wikisource) ────────────────────────────────
async function magazines(lang) {
  const out = [];
  for (const m of spec.M[lang] ?? []) {
    const titles = [];
    for (const page of m.pages) {
      if (m.mode === 'prefix') {
        const d = await get(`https://${lang}.wikisource.org/w/api.php?action=query&list=allpages&apprefix=${encodeURIComponent(page)}&apnamespace=0&aplimit=60&format=json&formatversion=2`, { json: true });
        titles.push(...(d?.query?.allpages ?? []).map((p) => p.title));
      } else {
        const d = await get(`https://${lang}.wikisource.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&prop=links&redirects=1&format=json&formatversion=2`, { json: true });
        titles.push(...(d?.parse?.links ?? []).filter((l) => l.exists && l.ns === 0).map((l) => l.title));
      }
    }
    const filter = m.filter ? new RegExp(m.filter) : null;
    const kept = [];
    for (const t of [...new Set(titles)]) {
      if (kept.length >= m.take) break;
      if (filter && !filter.test(t)) continue;
      const r = await wikisource(lang, t);
      if (!r || r.words < 350 || r.words > 6000) continue;
      const shown = t.split('/').pop().replace(/\s*\([^)]*\)\s*$/, '');
      kept.push({ id: `mag:${m.id}:${t}`, kind: 'article', title: shown, author: m.name, level: 'C1', minutes: Math.max(1, Math.round(r.words / (lang === 'zh' ? 250 : 200))), magazine: { name: m.name, years: m.years, colour: m.colour }, from: { type: 'wikisource', title: t } });
    }
    console.log(`  ${lang} magazine ${m.name}: ${kept.length} articles`);
    out.push(...kept);
  }
  return out;
}

// ── LibriVox (on archive.org) ────────────────────────────────────────────────
const ARCHIVE = { fr: 'fre OR fra', es: 'spa', de: 'deu OR ger', ru: 'rus', zh: 'zho OR chi', ar: 'ara' };
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim();
async function audio(lang, classics) {
  for (const c of classics) {
    // A volume of a longer work would match another volume's recording.
    if (/\b(tome|tomo|band|volume|vol)\b/i.test(c.title)) continue;
    const key = norm(c.title).split(' ').filter((w) => w.length > 2).slice(0, 3).join(' ');
    if (!key) continue;
    const q = `collection:librivoxaudio AND language:(${ARCHIVE[lang]}) AND title:(${key.split(' ').join(' AND ')})`;
    const d = await get(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl%5B%5D=identifier&fl%5B%5D=title&rows=5&output=json`, { json: true });
    const partial = /\b(volume|vol|tome|tomo|part|parte|band|teil)\b/i;
    const hit = d?.response?.docs?.find((x) => norm(x.title ?? '').includes(key) && !partial.test(x.title ?? ''));
    if (hit) { c.audio = hit.identifier; console.log(`  ♪ ${lang} ${c.title} → ${hit.identifier} (${hit.title})`); }
  }
}

for (const lang of langs) {
  console.log(`\n== ${lang}`);
  const classics = [...(await gutenberg(lang)), ...(await wikiClassics(lang))];
  await audio(lang, classics.filter((c) => c.from.type === 'gutenberg'));
  const items = [...classics, ...(await shorts(lang)), ...(await picture(lang)), ...(await magazines(lang))];
  const comics = await series(lang);
  const seen = new Set();
  const unique = items.filter((i) => !seen.has(i.id) && seen.add(i.id));
  writeFileSync(new URL(`../src/core/explora/data/${lang}.json`, import.meta.url), JSON.stringify({ items: unique, series: comics }, null, 1) + '\n');
  const by = (k) => unique.filter((i) => i.kind === k).length;
  console.log(`  ${lang}: ${comics.length} comic series, ${by('article')} magazine articles, ${by('classic')} classics (${unique.filter((i) => i.audio).length} with a recording), ${by('short')} short reads, ${by('picture')} picture books`);
}
