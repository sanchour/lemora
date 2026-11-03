// Story games (6-21 G6, F0313, F0314, F1205 to F1214): scenes to move through by choices, with things to find and use. Ready-made, or made by Max.
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { Best } from '@/core/games/bests';
import type { GameDef } from '@/core/games/defs';
import type { GameItem } from '@/core/games/source';
import { checkStory, choose, startStory, storyStars, visible } from '@/core/games/story';
import type { StoryGame } from '@/core/games/story';
import { isRtl } from '@/core/lang/languages';
import { storiesOf } from '@/data/games';
import { Kbd } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { SpeakButton } from '@/features/speech/SpeakButton';
import { RoundRunner, useSettleOnce } from './RoundRunner';
import type { BoardProps } from './RoundRunner';

interface Entry {
  story: StoryGame;
  shortest: number;
}

function Board({ entry, lang, settle }: BoardProps<Entry>) {
  const t = useUi();
  const rtl = isRtl(lang);
  const { story } = entry;
  const [s, setS] = useState(() => startStory(story));
  const choices = visible(story, s);
  const over = s.status !== 'playing';
  useSettleOnce(over, () => settle({ won: s.status === 'won', stars: storyStars(s, entry.shortest), hints: 0, message: s.status === 'won' ? t('You made it in {0} choices.', [s.moves]) : t('You are stuck here.') }));
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!over && n >= 1 && n <= choices.length && !e.ctrlKey && !e.metaKey && !e.altKey) setS((x) => choose(story, x, n - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const held = s.items.map((i) => story.items?.[i] ?? i);
  return (
    <div className="max-w-2xl">
      <div className="rounded-3xl border border-line/70 bg-surface p-6">
        <p className="font-serif text-2xl leading-relaxed" lang={lang} dir={rtl ? 'rtl' : undefined}>{story.scenes[s.at].text}</p>
        <div className="mt-3"><SpeakButton lang={lang} text={story.scenes[s.at].text} size={20} label="Hear it" className="size-10 rounded-full bg-sunken text-ink" /></div>
      </div>
      <p className="mt-3 text-[14px] text-ink-soft">{held.length ? <UiText source={'You have: {0}'} values={[<bdi lang={lang}>{held.join(', ')}</bdi>]} /> : <UiText source={'You have nothing yet.'} />}</p>
      {!over && (
        <div className="mt-4 grid gap-2">
          {choices.map((c, i) => (
            <button key={`${s.at}-${i}`} type="button" onClick={() => setS((x) => choose(story, x, i))} className="flex items-center gap-3 rounded-2xl border border-line bg-raised px-4 py-3 text-start transition-colors hover:border-line-strong hover:bg-surface">
              <Kbd>{i + 1}</Kbd>
              <span className="text-[17px]" lang={lang} dir={rtl ? 'rtl' : undefined}>{c.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Story({ lang, def, best }: { lang: string; def: GameDef; items: GameItem[]; best?: Best }) {
  const t = useUi();
  const [stories, setStories] = useState<StoryGame[]>([]);
  const [chosen, setChosen] = useState(0);
  useEffect(() => {
    let alive = true;
    void storiesOf(lang).then((s) => alive && setStories(s));
    return () => {
      alive = false;
    };
  }, [lang]);
  return (
    <RoundRunner<Entry>
      lang={lang}
      def={def}
      best={best}
      unit={t('Story')}
      rtl={isRtl(lang)}
      intro={<UiText source={'A story to play through. Choose what to do; look for things you can use later.'} />}
      options={
        <div className="space-y-3">
          {stories.length > 1 && (
            <select value={chosen} onChange={(e) => setChosen(Number(e.target.value))} aria-label={t('Story')} className="h-10 w-full rounded-xl border border-line bg-raised px-3 text-[15px]">
              {stories.map((s, i) => (
                <option key={s.id} value={i}>{s.title}{s.level ? ` · ${s.level}` : ''}</option>
              ))}
            </select>
          )}
          <p className="text-[13px] text-ink-soft">
            <UiText source={'More stories come from Max.'} /> <Link to="/thesaurus/make" className="font-semibold text-ink underline decoration-line-strong underline-offset-4"><UiText source={'Make one'} /></Link>
          </p>
        </div>
      }
      make={() => {
        const story = stories[chosen];
        if (!story) return [];
        const check = checkStory(story);
        return check.ok ? [{ story, shortest: check.shortest }] : [];
      }}
      empty={t('This could not be made from what you have yet.')}
      terms={() => []}
      label={(e) => ({ title: e.story.title })}
      Board={Board}
      rules={<UiText source={'Click a choice or press its number. A choice that needs something stays hidden until you have found it. Three stars for finishing in a few more choices than the shortest way.'} />}
    />
  );
}

