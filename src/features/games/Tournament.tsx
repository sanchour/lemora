// Mini tournaments (6-21, F0190): three of the quick word games in a row with one score, against the learner's own last one. Local only: nobody else plays.
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { GAMES } from '@/core/games/defs';
import type { GameDef } from '@/core/games/defs';
import { canPlay } from '@/core/games/source';
import type { GameSource } from '@/core/games/source';
import { afterTournament, drawTournament } from '@/core/games/tournament';
import { loadTournament, saveTournament } from '@/data/games';
import { buttonClasses } from '@/design/primitives';
import { UiText } from '@/design/i18n/UiText';
import { TournamentContext } from './RoundRunner';
import type { RoundReport } from './RoundRunner';

export function Tournament({ lang, source, render }: { lang: string; def: GameDef; source: GameSource; render: (id: string) => ReactNode }) {
  const playable = useMemo(() => GAMES.filter((g) => canPlay(g, source, lang, (s) => s).ok).map((g) => g.id), [source, lang]);
  const [run, setRun] = useState(0);
  const ids = useMemo(() => drawTournament(playable, (Date.now() + run) % 2 ** 31), [playable, run]);
  const [at, setAt] = useState(0);
  const [reports, setReports] = useState<RoundReport[]>([]);
  const [outcome, setOutcome] = useState<{ last: number; beatLast: boolean; beatBest: boolean } | null>(null);
  const finished = at >= ids.length;
  const stars = reports.reduce((n, r) => n + r.stars, 0);
  const of = reports.reduce((n, r) => n + r.of, 0);

  useEffect(() => {
    if (!finished || outcome) return;
    void loadTournament(lang).then((old) => {
      const r = afterTournament(old, stars);
      setOutcome({ last: old?.last ?? 0, beatLast: r.beatLast, beatBest: r.beatBest });
      return saveTournament(lang, r.record);
    });
  }, [finished, outcome, lang, stars]);

  if (!finished)
    return (
      <TournamentContext.Provider value={{ index: at, count: ids.length, report: (r) => setReports((x) => [...x, r]), advance: () => setAt((n) => n + 1) }}>
        <p className="mx-auto w-full max-w-6xl px-6 pt-4 text-[13px] font-semibold text-ink-soft">
          <UiText source={'Game {0} of {1}'} values={[at + 1, ids.length]} /> · <UiText source={'{0} stars so far'} values={[stars]} />
        </p>
        <div key={at}>{render(ids[at])}</div>
      </TournamentContext.Provider>
    );
  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold"><UiText source={'Mini tournament'} /></h1>
      <p className="mt-4 font-serif text-3xl font-semibold"><UiText source={'{0} of {1} stars'} values={[stars, of]} /></p>
      {outcome && (
        <p className="mt-2 text-ink-soft">
          {outcome.beatBest ? <UiText source={'A new best.'} /> : outcome.beatLast ? <UiText source={'Better than last time.'} /> : outcome.last ? <UiText source={'Last time: {0} stars.'} values={[outcome.last]} /> : <UiText source={'Your first tournament.'} />}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={() => { setRun((n) => n + 1); setAt(0); setReports([]); setOutcome(null); }} className={buttonClasses('primary', 'lg')}><UiText source={'Play another'} /></button>
        <Link to="/thesaurus/games" className={buttonClasses('secondary', 'lg')}><UiText source={'All games'} /></Link>
      </div>
    </div>
  );
}
