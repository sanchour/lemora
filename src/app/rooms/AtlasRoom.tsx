import { lazy, Suspense } from 'react';
import { useUi } from '@/design/i18n/UiText';
import { useApp } from '@/app/context';

const AtlasTab = lazy(() => import('@/features/thesaurus/atlas/AtlasTab'));

/** Atlas, a room of its own in Lemora (in Lingua it's Thesaurus › Atlas): every word you have, as a map, full screen (U7). */
export default function AtlasRoom() {
  const translateUi = useUi();
  const { language } = useApp();
  return (
    <>
      <h1 className="sr-only">{translateUi('Atlas')}</h1>
      <Suspense fallback={null}>
        <AtlasTab key={language.id} lang={language.id} immersive />
      </Suspense>
    </>
  );
}
