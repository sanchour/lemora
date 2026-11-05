// Explora › Ludus (Lemora U4): the games, each in its drawn circle, opening in Ludus.
import { Link } from 'react-router';
import { GAME_GROUPS, GAMES } from '@/core/games/defs';
import { UiText, useUi } from '@/design/i18n/UiText';
import { GameArt } from '@/features/games/gameArt';


export function LudusShelf() {
  const translateUi = useUi();
  const groups = (['today', 'word'] as const).map((g) => ({ g, games: GAMES.filter((x) => x.group === g) })).filter((x) => x.games.length);
  return (
    <div className="space-y-8">
      {groups.map(({ g, games }) => (
        <section key={g} aria-label={translateUi(GAME_GROUPS[g].title)}>
          <h2 className="mb-3 font-serif text-[17px] font-semibold text-ink sm:text-[19px]"><UiText source={GAME_GROUPS[g].title} /></h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {games.map((game) => (
              <Link key={game.id} to={`/thesaurus/games/${game.id}`} className="group flex flex-col items-center rounded-[24px] border border-line bg-surface/40 px-4 pt-5 pb-5 text-center transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-1 hover:border-accent/60 hover:shadow-elev-2">
                <span className="relative grid size-[104px] place-items-center transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                  <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 size-full"><path d="M24 3C35 2 46 11 45 23C46 36 37 46 25 45C12 46 2 36 3 24C2 12 12 4 24 3Z" style={{ fill: 'color-mix(in oklab, var(--accent) 12%, transparent)' }} /></svg>
                  <GameArt id={game.id} size={84} className="relative" />
                </span>
                <span className="mt-3 font-serif text-[17px] leading-snug font-bold text-ink transition-colors group-hover:text-accent-text"><UiText source={game.title} /></span>
                <span className="mt-1.5 text-[12.5px] leading-snug text-ink-faint"><UiText source={game.detail} /></span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
