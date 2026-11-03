import { describe, expect, it } from 'vitest';
import type { FullDictRow, FullEntry } from '@/core/dictionary/format';
import { normalizeWord } from '@/core/text/normalize';
import ar from './fixtures/ar.json';
import de from './fixtures/de.json';
import es from './fixtures/es.json';
import ru from './fixtures/ru.json';
import zh from './fixtures/zh.json';
import { arabicRoot } from './langs';
import { buildWeb, HUB_MAX, neighbourhood, type WebInput } from './model';
import { LITTLE, regionsOf } from './regions';
import { wordTree } from './tree';

// The fixtures are real rows of the v3 dictionaries (and four of the Spanish pack's themes), cut by a script; keyed as
// dict.worker.ts keys them.
type Fixture = { lang: string; words: Array<{ w: string; r?: number; c?: string[]; e: unknown[] }>; themes?: Record<string, string[][]> };
const dictOf = (f: Fixture) => new Map(f.words.map((w): [string, FullDictRow] => { const key = normalizeWord(w.w, f.lang); return [key, { lang: f.lang, key, fold: key, word: w.w, rank: w.r, confused: w.c, entries: w.e as FullEntry[] }]; }));
const input = (f: Fixture, words: string[], extra: Partial<WebInput> = {}): WebInput => ({ lang: f.lang, words: words.map((w, i) => ({ key: normalizeWord(w, f.lang), state: i % 2 ? 2 : 1 })), dict: dictOf(f), themes: f.themes, ...extra });
const threadOf = (web: ReturnType<typeof buildWeb>, a: string, b: string) => web.threads.filter((t) => [t.a, t.b].sort().join() === [web.byKey.get(a), web.byKey.get(b)].sort().join());
const row = (word: string, e: Partial<FullEntry>): FullEntry & { w: string } => ({ w: word, pos: 'noun', senses: [{ g: [word] }], ...e });
const synthetic = (lang: string, rows: Array<FullEntry & { w: string }>): Fixture => ({ lang, words: rows.map(({ w, ...e }) => ({ w, r: 100, e: [e] })) });

describe('joining words', () => {
  it('goes through normalizeWord: Russian stress folds, Spanish accents stay, Arabic vowel marks fold', () => {
    // сказать's pair is written сказа́ть → говори́ть, with stress: raw strings would lose it (measured: four threads in five).
    const web = buildWeb(input(ru as Fixture, ['сказать', 'говорить']));
    expect(threadOf(web, 'сказать', 'говорить').map((t) => t.kind)).toContain('pair');
    const es2 = buildWeb(input(es as Fixture, ['si', 'sí']));
    expect(es2.nodes).toHaveLength(2);
    expect(normalizeWord('كِتَاب', 'ar')).toBe('كتاب');
  });

  it('makes threads of meaning and family, but never of look-alikes or set phrases', () => {
    const web = buildWeb(input(es as Fixture, ['perro', 'perra', 'can', 'pero', 'mar', 'marina']));
    expect(threadOf(web, 'perro', 'can').map((t) => t.kind)).toContain('syn');
    expect(threadOf(web, 'perro', 'perra').map((t) => t.kind)).toContain('pair');
    expect(threadOf(web, 'mar', 'marina').map((t) => t.kind)).toEqual(['family']);
    expect(threadOf(web, 'perro', 'pero')).toEqual([]); // pero is only perro's look-alike
    expect(web.nodes.every((n) => !n.label.includes(' '))).toBe(true);
  });

  it('keeps only gender and aspect pairs: a plural is the same word', () => {
    const f = synthetic('es', [row('casa', { pair: [['plural', 'casas']] }), row('casas', {})]);
    expect(buildWeb(input(f, ['casa', 'casas'])).threads).toEqual([]);
  });
});

describe('hubs and lenses', () => {
  const theme = (n: number) => ({ lang: 'es', words: Array.from({ length: n }, (_, i) => ({ key: `w${i}`, state: 1 as const })), dict: new Map(), themes: { sea: Array.from({ length: n }, (_, i) => [`w${i}`]) } });

  it('makes a hub of 2 to 60 of your words, a lens of more, and nothing of one', () => {
    expect(buildWeb(theme(1)).nodes.filter((n) => n.kind === 'theme')).toHaveLength(0);
    const two = buildWeb(theme(2));
    expect(two.nodes.filter((n) => n.kind === 'theme').map((n) => n.label)).toEqual(['The sea']);
    expect(two.threads).toHaveLength(2);
    const big = buildWeb(theme(HUB_MAX + 1));
    expect(big.nodes.filter((n) => n.kind === 'theme')).toHaveLength(0);
    expect(big.lenses.map((l) => [l.id, l.members.length])).toEqual([['theme:sea', HUB_MAX + 1]]);
  });

  it('makes lenses of lists shaped by grammar and of endings that only make a part of speech', () => {
    const f = synthetic('es', [row('rápido', {}), row('rápidamente', { parts: ['rápido', '-mente'] }), row('lentamente', { parts: ['lento', '-mente'] }), row('deshacer', { parts: ['des-', 'hacer'] }), row('desatar', { parts: ['des-', 'atar'] })]);
    const web = buildWeb({ ...input(f, ['rápido', 'rápidamente', 'lentamente', 'deshacer', 'desatar']), themes: { verbs: [['deshacer'], ['desatar']] } });
    expect(web.nodes.filter((n) => n.kind === 'affix').map((n) => n.label)).toEqual(['des-']);
    expect(web.lenses.map((l) => l.id).sort()).toEqual(['affix:-mente', 'theme:verbs']);
    expect(threadOf(web, 'rápido', 'rápidamente').map((t) => t.kind)).toEqual(['family']);
  });

  it('lets a Chinese character that is one of your words be the hub of the words written with it', () => {
    const web = buildWeb(input(zh as Fixture, ['人', '女人', '男人', '人们']));
    expect(web.nodes.filter((n) => n.kind === 'char').map((n) => n.label)).toEqual([]); // 女 and 男 hold one word each
    expect(web.threads.filter((t) => t.kind === 'member' && t.a === web.byKey.get('人')).length).toBe(3);
  });

  it('reads Arabic roots from the etymology text', () => {
    const ety = (ar as Fixture).words.find((w) => w.w === 'وجد')!.e.map((e) => (e as FullEntry).ety).find(Boolean);
    expect(arabicRoot(ety)).toBe('و ج د');
    const f: Fixture = { lang: 'ar', words: [...(ar as Fixture).words, { w: 'وجود', r: 900, e: [row('', { ety: 'From the root و ج د (w j d).' })] }] };
    const web = buildWeb(input(f, ['وجد', 'وجود']));
    expect(web.nodes.filter((n) => n.kind === 'root').map((n) => n.label)).toEqual(['و ج د']);
  });
});

describe('one word’s neighbourhood', () => {
  it('lists yours first, then at most three words to discover, the most common first, never an unranked one', () => {
    const f = input(es as Fixture, ['mar', 'marina']);
    const form = neighbourhood(f, buildWeb(f), 'mar').filter((n) => n.quarter === 'form' && n.kind === 'family');
    // marear, maremoto and marisma have no rank in the dictionary.
    expect(form.map((n) => [n.label, Boolean(n.ghost)])).toEqual([['marina', false], ['marino', true], ['marea', true], ['mareo', true]]);
  });

  it('puts the ancestor in another language only when it is a different word, and look-alikes behind a switch', () => {
    const f = input(es as Fixture, ['mar', 'hacer']);
    const web = buildWeb(f);
    expect(neighbourhood(f, web, 'mar').filter((n) => n.kind === 'ancestor')).toEqual([]); // Old Spanish mar
    expect(neighbourhood(f, web, 'hacer').find((n) => n.kind === 'ancestor')?.label).toBe('fazer');
    expect(neighbourhood(f, web, 'hacer').filter((n) => n.kind === 'lookalike').every((n) => n.optional)).toBe(true);
    expect(neighbourhood(f, web, 'mar').filter((n) => n.kind === 'phrase').length).toBeLessThanOrEqual(5);
  });
});

describe('regions', () => {
  const f = input(es as Fixture, ['mar', 'playa', 'barco', 'costa', 'isla', 'marina', 'se', 'de', 'el', 'perro', 'perra']);

  it('gives the little words a region of their own and each word its theme', () => {
    const web = buildWeb(f);
    const { of } = regionsOf(web);
    for (const w of ['se', 'de', 'el']) expect(of[web.byKey.get(w)!]).toBe(LITTLE);
    expect(of[web.byKey.get('playa')!]).toBe('theme:sea');
    // marina is in no theme here: it joins the region its threads go to.
    expect(of[web.byKey.get('marina')!]).toBe(of[web.byKey.get('mar')!]);
  });

  it('is the same for the same seed', () => {
    expect(regionsOf(buildWeb(f), 7)).toEqual(regionsOf(buildWeb(f), 7));
  });

  it('keeps small groups joined only to each other as loose threads', () => {
    const web = buildWeb(input(es as Fixture, ['perro', 'perra', 'can']));
    expect(regionsOf(web).loose.map((g) => g.map((i) => web.nodes[i].label))).toEqual([['perro', 'perra', 'can']]);
  });
});

describe('the tree', () => {
  it('climbs from a word to what it is made from, then branches down, with the ancestor above', () => {
    const f = input(es as Fixture, ['hacer', 'deshacer']);
    const tree = wordTree(f, buildWeb(f), 'deshacer')!;
    expect(tree.roots[0].label).toBe('hacer');
    expect(tree.roots[0].children.find((c) => c.focus)?.label).toBe('deshacer');
    expect(tree.ancestor).toEqual({ lang: 'osp', word: 'fazer' });
    // contrahacer and quehacer have no rank: they are never branches unless they are yours.
    expect(tree.roots[0].children.map((c) => c.label)).not.toContain('contrahacer');
  });

  it('grows German compounds from their parts', () => {
    const f = input(de as Fixture, ['Hand', 'Handschuh']);
    const tree = wordTree(f, buildWeb(f), 'Handschuh')!;
    expect(tree.roots[0].children.some((c) => c.label === 'Handschuh' && c.focus)).toBe(true);
  });

  it('grows one tree per character in Chinese, with your words written with it', () => {
    const f = input(zh as Fixture, ['人', '女人', '男人', '人们']);
    const tree = wordTree(f, buildWeb(f), '女人')!;
    expect(tree.roots.map((r) => r.label)).toEqual(['女', '人']);
    expect(tree.roots[1].children.map((c) => c.label).sort()).toEqual(['人们', '女人', '男人'].sort());
  });
});
