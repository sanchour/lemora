import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { tokenize } from '@/core/text/tokenizer';
import { READING_AIDS } from '@/core/reading/aids';
import { ChapterBody } from './ChapterBody';
import type { ChapterModel } from './model';

it('keeps source words intact while adding gloss attributes and changed endings', () => {
  const text = 'Hablamos aquí.';
  const model: ChapterModel = { chapter: { id: 'c', textId: 't', index: 0, wordCount: 2, blocks: [{ t: 'p', text }] }, blocks: [{ block: { t: 'p', text }, tokens: tokenize(text, 'es') }], norms: ['hablamos', 'aquí'], states: new Map(), senses: new Map(), glosses: new Map([['hablamos', { text: 'we speak', lemma: 'hablar', source: 'dict' }]]) };
  const html = renderToStaticMarkup(createElement(ChapterBody, { model, lang: 'es', aids: { ...READING_AIDS, endings: true, glosses: true } }));
  expect(html).toContain('data-gloss="we speak"');
  expect(html).toContain('Habla<u');
  expect(html).toContain('>mos</u>');
  const hidden = renderToStaticMarkup(createElement(ChapterBody, { model, lang: 'es', aids: { ...READING_AIDS, glosses: true, hideGlosses: true } }));
  expect(hidden).toContain('data-gloss="…"');
  expect(hidden).toContain('Reveal');
  expect(hidden).not.toContain('we speak');
});

it('uses the selected Russian scheme without putting the reading in selectable word text', () => {
  const text = 'Щит.';
  const model: ChapterModel = { chapter: { id: 'r', textId: 't', index: 0, wordCount: 1, blocks: [{ t: 'p', text }] }, blocks: [{ block: { t: 'p', text }, tokens: tokenize(text, 'ru') }], norms: ['щит'], states: new Map(), senses: new Map(), glosses: new Map([['щит', { text: 'shield', source: 'dict', reading: 'old-default-reading' }]]) };
  const iso = renderToStaticMarkup(createElement(ChapterBody, { model, lang: 'ru', scheme: 'iso-9-1995' }));
  expect(iso).toContain('data-r="Ŝit"');
  expect(iso).toContain('>Щит</span>.');
  const bgn = renderToStaticMarkup(createElement(ChapterBody, { model, lang: 'ru', scheme: 'bgn-pcgn-1947' }));
  expect(bgn).toContain('data-r="Shchit"');
  const lc = renderToStaticMarkup(createElement(ChapterBody, { model, lang: 'ru', scheme: 'ala-lc-2012' }));
  expect(lc).toContain('data-r="Shchit"');
  const passport = renderToStaticMarkup(createElement(ChapterBody, { model, lang: 'ru', scheme: 'icao-9303-2021' }));
  expect(passport).toContain('data-r="SHCHIT"');
  const unknown = renderToStaticMarkup(createElement(ChapterBody, { model, lang: 'ru', scheme: 'unknown-old-setting' }));
  expect(unknown).toContain('data-r="Shchit"');
});

it('honors named Greek spelling ahead of an old reading and keeps unsupported words literal', () => {
  const text = 'Ώρα ἀλφα.';
  const model: ChapterModel = { chapter: { id: 'g', textId: 't', index: 0, wordCount: 2, blocks: [{ t: 'p', text }] }, blocks: [{ block: { t: 'p', text }, tokens: tokenize(text, 'el') }], norms: ['ώρα', 'ἀλφα'], states: new Map(), senses: new Map(), glosses: new Map([['ώρα', { text: 'hour', source: 'dict', reading: 'old-reading' }]]) };
  for (const [scheme, reading] of [['elot-743', 'Óra'], ['iso-843-1997-1', 'Ṓra'], ['stale-setting', 'Óra']]) {
    const html = renderToStaticMarkup(createElement(ChapterBody, { model, lang: 'el', scheme }));
    expect(html).toContain(`data-r="${reading}"`);
    expect(html).toContain('>Ώρα</span>');
    expect(html).toContain('>ἀλφα</span>.');
    expect(html).not.toContain('old-reading');
  }
});
