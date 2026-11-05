import { useApp } from '@/app/context';
import { HomeClassic } from './HomeClassic';
import { HomeTopline } from './HomeTopline';
import { HomeRightRail } from './HomeRightRail';
import { HomeBottomShelf } from './HomeBottomShelf';
import { HomeBento } from './styles/HomeBento';
import { HomeEditorial } from './styles/HomeEditorial';
import { HomeFocus } from './styles/HomeFocus';
import { HomeJourney } from './styles/HomeJourney';
import { HomeLibrary } from './styles/HomeLibrary';
import { HomeNotebook } from './styles/HomeNotebook';
import { HomeStream } from './styles/HomeStream';
import { HomeStyleMenu } from './styles/HomeStyleMenu';

/**
 * HomePage router:
 * - settings.ui.homeStyle: one of seven other looks (Gazette, Bento, Journey, Reading room, Stream, Notebook, Focus), chosen with the button at the top right
 * - 'topline': Tools small top on 1 line, center hero where you left off, next in cursus
 * - 'rail': Tools to the right of the screen, one per row, atelier 2-column layout
 * - 'shelf': Tools at the bottom as a workbench shelf
 * - 'classic': Legacy layout
 */
function usual(layout: string) {
  if (layout === 'classic') return <HomeClassic />;
  if (layout === 'topline') return <HomeTopline />;
  if (layout === 'shelf') return <HomeBottomShelf />;
  return <HomeRightRail />;
}

export default function HomePage() {
  const { settings } = useApp();
  const style = settings.ui.homeStyle;
  return (
    <div className={style ? 'relative pt-11' : 'relative'}>
      <HomeStyleMenu />
      {style === 'editorial' ? <HomeEditorial /> : style === 'bento' ? <HomeBento /> : style === 'journey' ? <HomeJourney /> : style === 'library' ? <HomeLibrary /> : style === 'focus' ? <HomeFocus /> : style === 'stream' ? <HomeStream /> : style === 'notebook' ? <HomeNotebook /> : usual(settings.ui.homeLayout)}
    </div>
  );
}
