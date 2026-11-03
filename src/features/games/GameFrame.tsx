import { UiText } from '@/design/i18n/UiText';
// The frame every game plays in (6-21): a way back, the game's name, the board in the wide column and a side panel for the rules,
// the clock, the hint and the best, so a game never covers the room it is played in.
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { Card } from '@/design/primitives';

export function GameFrame({ title, eyebrow, main, side }: { title: string; eyebrow: string; main: ReactNode; side: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-5 flex items-center justify-between border-b border-line/60 pb-3">
        <Link to="/thesaurus/games" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent-text hover:underline">
          <UiText source={'{0} All games'} values={[<ArrowLeft size={15} aria-hidden />]} />
        </Link>
        <p className="text-[11.5px] font-bold tracking-[0.14em] text-sage-text uppercase">
          <UiText source={eyebrow} />
        </p>
      </div>
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        <UiText source={title} />
      </h1>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">{main}</div>
        <Card className="space-y-4 p-5 lg:sticky lg:top-6">{side}</Card>
      </div>
    </div>
  );
}

/** One line of a side panel: a name and its value. */
export function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[14px]">
      <span className="text-ink-soft"><UiText source={label} /></span>
      <span className="font-semibold tabular-nums">{children}</span>
    </div>
  );
}
