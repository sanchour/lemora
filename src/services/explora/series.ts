// The pages of a comic series: the files of its Wikimedia Commons category (the API lets web pages read it), in page order.
export interface SeriesPage {
  title: string;
  /** A picture sized for reading, and a small one for the grid. */
  src: string;
  thumb: string;
}

const kept = new Map<string, Promise<SeriesPage[]>>();
const natural = (a: string, b: string) => a.localeCompare(b, 'en', { numeric: true });

export function seriesPages(category: string): Promise<SeriesPage[]> {
  let hit = kept.get(category);
  if (!hit) {
    hit = (async () => {
      const base = `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=${encodeURIComponent(`Category:${category}`)}&gcmtype=file&gcmlimit=50&prop=imageinfo&iiprop=url%7Cmime&iiurlwidth=1000&format=json&formatversion=2&origin=*`;
      type Row = { title: string; imageinfo?: Array<{ url: string; thumburl?: string; mime: string }> };
      // The API answers fifty files at a time and says where to go on.
      const rows: Row[] = [];
      let more = '';
      for (let i = 0; i < 12; i++) {
        const res = await fetch(base + more, { signal: AbortSignal.timeout(25_000) });
        if (!res.ok) throw new Error('The pages couldn’t be reached just now.');
        const data = (await res.json()) as { continue?: Record<string, string>; query?: { pages?: Row[] } };
        rows.push(...(data.query?.pages ?? []));
        if (!data.continue) break;
        more = Object.entries(data.continue).map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join('');
      }
      const pages = rows.filter((p) => /^image\/(jpeg|png)/.test(p.imageinfo?.[0]?.mime ?? '')).sort((a, b) => natural(a.title, b.title));
      if (!pages.length) throw new Error('This series has no pages.');
      return pages.map((p) => ({ title: p.title.replace(/^File:/, ''), src: p.imageinfo![0].thumburl ?? p.imageinfo![0].url, thumb: p.imageinfo![0].thumburl ?? p.imageinfo![0].url }));
    })();
    hit.catch(() => kept.delete(category));
    kept.set(category, hit);
  }
  return hit;
}
