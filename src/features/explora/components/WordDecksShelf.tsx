import { useUi } from '@/design/i18n/UiText';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Layers } from 'lucide-react';
import type { Level } from '@/core/lang/levels';
import type { LevelFilter } from '@/core/mundus/explore';
import { levelIndex, LEVELS } from '@/core/mundus/explore';
import type { PickLevel } from '@/core/mundus/types';
import {
  FREQUENCY_MILESTONES,
  STARTER_THEMES,
  JOURNEY_STAGES,
  frequencyBand,
} from '@/core/lang/starter';
import { starterKey, useStarterList, useThemeStats } from '@/data/starter';
import type { StarterSpec } from '@/data/starter';
import { THEME_HUES, THEME_ICONS } from '@/features/thesaurus/common/DeckIcon';
import { LevelBadge } from './LevelBadge';
import { MediaShelf } from './MediaShelf';

interface DeckItem {
  id: string;
  spec: StarterSpec;
  name: string;
  blurb: string;
  level: PickLevel;
  size: number;
  hue: string;
  iconId: string;
}

const STARTER_LEVELS = [
  { id: 'A1', max: 600 },
  { id: 'A2', max: 1800 },
  { id: 'B1', max: 5000 },
  { id: 'B2', max: Infinity },
] as const;

function levelOf(rank: number): PickLevel {
  const match = STARTER_LEVELS.find((l) => rank <= l.max);
  return (match?.id as PickLevel) ?? 'A1';
}

interface WordDecksShelfProps {
  lang: string;
  learnerLevel: Level;
  levelFilter: LevelFilter;
}

export function WordDecksShelf({ lang, learnerLevel, levelFilter }: WordDecksShelfProps) {
  const translateUi = useUi();
  const navigate = useNavigate();
  const list = useStarterList(lang);
  const stats = useThemeStats(lang);

  // Compile all candidate decks
  const allDecks = useMemo<DeckItem[]>(() => {
    if (!list) return [];
    const out: DeckItem[] = [];

    // Frequency milestones
    for (const m of FREQUENCY_MILESTONES) {
      if (m > list.lemmaFreq.length && m !== 100) continue;
      const [from, to] = frequencyBand(m);
      const size = Math.max(0, Math.min(to, list.lemmaFreq.length) - from + 1);
      const stage = JOURNEY_STAGES[m];
      const rank = Math.round((from + to) / 2);
      out.push({
        id: `freq-${m}`,
        spec: { kind: 'frequency', milestone: m },
        name: stage?.name ?? `Top ${m.toLocaleString('en')}`,
        blurb: stage?.lets ? `Words to ${stage.lets}` : `Top ${m} most common words`,
        level: levelOf(rank),
        size,
        hue: '#5f9a86',
        iconId: 'basics',
      });
    }

    // Themes
    for (const t of STARTER_THEMES) {
      const words = list.themes[t.id];
      if (!words || !words.length) continue;
      const stat = stats?.get(t.id);
      const rank = stat?.rank ?? 800;
      out.push({
        id: `theme-${t.id}`,
        spec: { kind: 'theme', id: t.id },
        name: t.name,
        blurb: t.blurb,
        level: levelOf(rank),
        size: words.length,
        hue: THEME_HUES[t.id] ?? '#c86d51',
        iconId: t.id,
      });
    }

    return out;
  }, [list, stats]);

  // Filter based on learner level or explicit CEFR filter
  const matching = useMemo(() => {
    if (levelFilter === 'any') return allDecks;
    if (levelFilter !== 'mine') {
      return allDecks.filter((d) => d.level === levelFilter);
    }
    // Around learner level
    const me = levelIndex(learnerLevel);
    return allDecks.filter((d) => {
      const idx = LEVELS.indexOf(d.level);
      return idx >= Math.max(0, me - 1) && idx <= Math.min(LEVELS.length - 1, me + 1);
    });
  }, [allDecks, levelFilter, learnerLevel]);

  // Randomize every time on load or filter change
  const [shuffledDecks, setShuffledDecks] = useState<DeckItem[]>([]);
  useEffect(() => {
    if (!matching.length) {
      setShuffledDecks([]);
      return;
    }
    const copy = [...matching];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setShuffledDecks(copy);
  }, [matching]);

  if (!shuffledDecks.length) return null;

  return (
    <MediaShelf
      id="word-decks-shelf"
      title={translateUi('Word Decks')}
      subtitle={translateUi('Vocabulary packs tailored to your level, shuffled each visit.')}
      count={shuffledDecks.length}
    >
      {shuffledDecks.map((deck) => {
        const Icon = THEME_ICONS[deck.iconId] ?? Layers;

        return (
          <div
            key={deck.id}
            onClick={() => navigate('/thesaurus/ready/' + starterKey(deck.spec))}
            className="group relative block w-full text-left transition-all duration-200 cursor-pointer"
          >
            {/* Cute Card Container */}
            <div
              className="relative block w-full overflow-hidden rounded-[18px] sm:rounded-[20px] aspect-[16/10] shadow-elev-1 transition-all duration-250 group-hover:-translate-y-1 group-hover:shadow-elev-2 group-active:scale-[0.96]"
              style={{
                background: `linear-gradient(135deg, ${deck.hue}25 0%, ${deck.hue}48 100%)`,
                border: `1px solid ${deck.hue}40`,
              }}
            >
              {/* Soft decorative blur */}
              <div
                className="absolute -right-6 -bottom-6 size-24 rounded-full opacity-30 blur-xl pointer-events-none"
                style={{ background: deck.hue }}
              />

              {/* Top Bar: Level Badge & Word Count */}
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                <LevelBadge level={deck.level} size="sm" />
              </div>

              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center rounded-full bg-black/45 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-xs tabular-nums">
                  {deck.size > 0 ? `${deck.size} words` : translateUi('Vocabulary')}
                </span>
              </div>

              {/* Center Theme Icon */}
              <div className="flex size-full items-center justify-center p-3">
                <div
                  className="grid size-11 place-items-center rounded-2xl bg-white/20 backdrop-blur-md shadow-xs transition-transform duration-200 group-hover:scale-110"
                >
                  <Icon size={22} className="stroke-[2.2] text-white drop-shadow-sm" />
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="mt-2 px-0.5 min-w-0">
              <h4 className="line-clamp-1 font-serif text-[13.5px] font-semibold text-ink group-hover:text-accent-text transition-colors">
                {deck.name}
              </h4>
              <p className="mt-0.5 truncate text-[11.5px] font-medium text-ink-soft">
                {deck.blurb}
              </p>
            </div>
          </div>
        );
      })}
    </MediaShelf>
  );
}
