// Explora › Ludus (Lemora U4): the games, each in its drawn circle, opening in Ludus.
import { Link } from 'react-router';
import { GAME_GROUPS, GAMES } from '@/core/games/defs';
import { UiText, useUi } from '@/design/i18n/UiText';
import { Hand } from '@/design/drawings';
import { GAME_HAND as HAND } from '@/features/games/hands';


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
              <Link key={game.id} to={`/thesaurus/games/${game.id}`} className="group flex items-center gap-3.5 rounded-[20px] border border-line p-3.5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft transition-transform group-hover:-rotate-6"><Hand name={HAND[game.id] ?? 'play'} size={26} /></span>
                <span className="min-w-0 font-serif text-[15.5px] font-semibold text-ink group-hover:text-accent-text"><UiText source={game.title} /></span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
