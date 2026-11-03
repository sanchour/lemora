import { useApp } from '@/app/context';
import { HomeClassic } from './HomeClassic';
import { HomeTopline } from './HomeTopline';
import { HomeRightRail } from './HomeRightRail';
import { HomeBottomShelf } from './HomeBottomShelf';

/**
 * HomePage router:
 * - 'topline': Tools small top on 1 line, center hero where you left off, next in cursus
 * - 'rail': Tools to the right of the screen, one per row, atelier 2-column layout
 * - 'shelf': Tools at the bottom as a workbench shelf
 * - 'classic': Legacy layout
 */
export default function HomePage() {
  const { settings } = useApp();
  const layout = settings.ui.homeLayout;

  if (layout === 'classic') return <HomeClassic />;
  if (layout === 'topline') return <HomeTopline />;
  if (layout === 'shelf') return <HomeBottomShelf />;
  return <HomeRightRail />;
}
