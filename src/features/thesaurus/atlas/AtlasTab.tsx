// Thesaurus › Atlas (6-29 G2, docs/WORD-GRAPH-PLAN.md): one word's compass, or its family as a tree, with the word's own
// page beside it. The whole atlas of all your words comes with G4; until then the tab opens on the last word looked at.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { Maximize, Minus, Network, Orbit, Plus } from 'lucide-react';
import { hasFullDictionary } from '@/core/dictionary/format';
import type { Neighbour, Quarter } from '@/core/graph/model';
import { compassScene, treeScene, type SceneNode } from '@/core/graph/scene';
import { loadAtlasWord } from '@/data/atlas';
import { UiText, useUi } from '@/design/i18n/UiText';
import { useHotkeys } from '@/design/hooks/useHotkeys';
import { IconButton, SearchInput, Segmented, Switch } from '@/design/primitives';
import { EntryView } from '../dictionary/Entry';
import { etymonName } from '../dictionary/WordOrigin';
import { AtlasCanvas, nodeTowards, type AtlasCanvasHandle } from './AtlasCanvas';

const lastKey = (lang: string) => `lingua.atlas.${lang}`;
const QUARTERS: Quarter[] = ['meaning', 'form', 'origin', 'use'];
const idOf = (n: Neighbour) => `${n.kind}:${n.lang ?? ''}:${n.key ?? n.label}`;

function remembered(lang: string): string | null {
  try {
    return localStorage.getItem(lastKey(lang));
  } catch {
    return null;
  }
}

export default function AtlasTab({ lang }: { lang: string }) {
  const translateUi = useUi();
  const [params, setParams] = useSearchParams();
  const word = params.get('word') ?? remembered(lang);
  const view = params.get('view') === 'tree' ? 'tree' : 'compass';
  const [query, setQuery] = useState('');
  const [lookalikes, setLookalikes] = useState(false);
  const [selected, setSelected] = useState('');
  const [said, setSaid] = useState('');
  const search = useRef<HTMLInputElement>(null);
  const canvas = useRef<AtlasCanvasHandle>(null);
  const data = useLiveQuery(async () => (word ? ((await loadAtlasWord(lang, word)) ?? false) : null), [lang, word]);

  useEffect(() => {
    if (!data) return;
    setSelected(`w:${data.key}`);
    try {
      localStorage.setItem(lastKey(lang), data.label);
    } catch {
      // A private window: the tab simply asks again next time.
    }
  }, [data, lang]);

  const scene = useMemo(() => {
    if (!data) return null;
    const self = data.web.byKey.get(data.key);
    if (view === 'tree' && data.tree) return treeScene(data.tree, data.weak);
    return compassScene({ word: { key: data.key, label: data.label, state: self === undefined ? undefined : data.web.nodes[self].state, weak: data.weak.has(data.key) }, neighbours: data.neighbours, members: data.members, weak: data.weak, lookalikes });
  }, [data, view, lookalikes]);

  const open = (w: string, as = view) => setParams({ tab: 'atlas', word: w, ...(as === 'tree' ? { view: 'tree' } : {}) });
  const chosen = scene?.nodes.find((n) => n.id === selected);
  const page = chosen?.key ? chosen.label : data ? data.label : null;
  const select = (n: SceneNode) => {
    setSelected(n.id);
    setSaid(n.note ? `${n.label}, ${etymonName(n.note)}` : n.label);
  };
  const onOpen = (n: SceneNode) => n.key && open(n.label);
  useHotkeys({ '/': () => search.current?.focus(), t: () => data && open(chosen?.key ? chosen.label : data.label, view === 'tree' ? 'compass' : 'tree') }, true);

  const keys = (e: React.KeyboardEvent) => {
    if (!scene) return;
    const arrow = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (arrow) {
      e.preventDefault();
      const next = nodeTowards(scene, selected, arrow[0], arrow[1]);
      if (next) select(next);
    } else if (e.key === 'Enter' && chosen) onOpen(chosen);
    else if (e.key === 'Escape' && data) setSelected(`w:${data.key}`);
    else if (e.key === '+' || e.key === '=') canvas.current?.zoom(1.25);
    else if (e.key === '-') canvas.current?.zoom(0.8);
    else if (e.key === '0') canvas.current?.fit();
  };

  const quarterLabels = useMemo(() => ({ meaning: translateUi('Meaning'), form: translateUi('Form'), origin: translateUi('Origin'), use: translateUi('Use') }), [translateUi]);
  const listed = (data ? data.neighbours : []).filter((n) => lookalikes || !n.optional);

  return (
    <section aria-label={translateUi('Atlas')} className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-6">
      <div className="min-w-0">
        <div className="mb-3 flex items-center gap-3">
          <form
            className="max-w-60 min-w-36 flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) open(query.trim());
              setQuery('');
            }}
          >
            <SearchInput ref={search} value={query} onChange={setQuery} placeholder={translateUi('Which word?')} />
          </form>
          <div className="w-52 shrink-0">
            <Segmented<'compass' | 'tree'>
              label={translateUi('Atlas view')}
              value={view}
              onChange={(v) => data && open(data.label, v)}
              block
              options={[
                { value: 'compass', label: translateUi('Compass'), icon: Orbit },
                { value: 'tree', label: translateUi('Tree'), icon: Network },
              ]}
            />
          </div>
          {view === 'compass' && (
            <div className="flex shrink-0 items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
              <Switch checked={lookalikes} onChange={setLookalikes} label={translateUi('Look-alikes')} />
              <span aria-hidden>
                <UiText source={'Look-alikes'} />
              </span>
            </div>
          )}
        </div>
        <div tabIndex={0} onKeyDown={keys} className="relative h-[calc(100dvh-15.5rem)] min-h-[420px] overflow-hidden rounded-3xl border border-line bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-2xl bg-bg/90">
            <IconButton icon={Minus} label={translateUi('Zoom out')} onClick={() => canvas.current?.zoom(0.8)} />
            <IconButton icon={Plus} label={translateUi('Zoom in')} onClick={() => canvas.current?.zoom(1.25)} />
            <IconButton icon={Maximize} label={translateUi('Fit')} onClick={() => canvas.current?.fit()} />
          </div>
          {scene && data ? (
            <AtlasCanvas
              handle={canvas}
              scene={scene}
              selected={selected}
              onSelect={select}
              onOpen={onOpen}
              quarterLabels={quarterLabels}
              nameOf={etymonName}
              label={view === 'tree' ? translateUi('The tree of {0}', [data.label]) : translateUi('The compass of {0}: {1} things around it', [data.label, String(listed.length)])}
            />
          ) : (
            <div className="grid h-full place-items-center p-8 text-center">
              <p className="max-w-sm text-ink-soft">
                {data === false ? <UiText source={'No word “{0}” here yet. Try another.'} values={[word ?? '']} /> : <UiText source={'Look up a word to see what is around it: its meanings, its family, where it comes from and how it is used.'} />}
              </p>
            </div>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {said}
        </p>
        {!hasFullDictionary(lang) && (
          <p className="mt-2 text-[12.5px] text-ink-soft">
            <UiText source={'Synonyms, families and origins come with a full dictionary, which this language doesn’t have yet.'} />
          </p>
        )}
      </div>
      <aside aria-label={translateUi('Its neighbours, in words')} className="h-[calc(100dvh-12.2rem)] min-h-[460px] overflow-y-auto pr-1">
        {page && <EntryView lang={lang} word={page} />}
        {listed.length > 0 && (
          <div className="mt-8 border-t border-line pt-5">
            <h3 className="text-[11.5px] font-bold tracking-[0.08em] text-ink-faint uppercase">
              <UiText source={'Its neighbours, in words'} />
            </h3>
            {QUARTERS.map((q) => {
              const items = listed.filter((n) => n.quarter === q);
              if (!items.length) return null;
              return (
                <div key={q} className="mt-4">
                  <p className="text-[13px] font-bold">{quarterLabels[q]}</p>
                  <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {items.map((n) => (
                      <li key={idOf(n)}>
                        {n.key ? (
                          <button type="button" lang={lang} onClick={() => open(n.label)} className={`font-serif text-[15px] underline decoration-line-strong underline-offset-4 hover:decoration-ink ${n.ghost ? 'text-ink-soft italic' : ''}`}>
                            {n.label}
                          </button>
                        ) : (
                          <span lang={n.lang ?? lang} className="font-serif text-[15px] text-ink-soft">
                            {n.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </section>
  );
}
