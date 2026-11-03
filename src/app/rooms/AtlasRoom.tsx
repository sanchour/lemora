import { lazy, Suspense } from 'react';
import { interpolate } from '@/core/i18n/messages';
import { getLanguage } from '@/core/lang/languages';
import { useUi } from '@/design/i18n/UiText';
import { useApp } from '@/app/context';
import { PageHeader } from '@/app/PageHeader';

const AtlasTab = lazy(() => import('@/features/thesaurus/atlas/AtlasTab'));

/** Atlas, a room of its own in Lemora (in Lingua it's Thesaurus › Atlas): every word you have, as a map. */
export default function AtlasRoom() {
  const translateUi = useUi();
  const { language } = useApp();
  const name = getLanguage(language.id)?.name ?? language.id;
  return (
    <>
      <PageHeader title={translateUi('Atlas')} englishTitle={'Atlas'} eyebrow={translateUi('{0} · Word map', [translateUi(name)])} englishEyebrow={interpolate('{0} · Word map', [name])} />
      <Suspense fallback={null}>
        <AtlasTab key={language.id} lang={language.id} />
      </Suspense>
    </>
  );
}
