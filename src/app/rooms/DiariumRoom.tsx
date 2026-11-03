import { interpolate } from '@/core/i18n/messages';
import { useUi } from '@/design/i18n/UiText';
import { getLanguage } from '@/core/lang/languages';
import { useApp } from '@/app/context';
import { PageHeader } from '@/app/PageHeader';
import { InRoom } from '@/app/room';
import { DiariumHome, NewEntryButton } from '@/features/codex/diarium/DiariumHome';

/** Diarium, a room of its own in Lemora (in Lingua it's Mentis › Diarium). */
export default function DiariumRoom() {
  const translateUi = useUi();
  const { language } = useApp();
  const name = getLanguage(language.id)?.name ?? language.id;
  return (
    <>
      <PageHeader title={translateUi('Diarium')} englishTitle={'Diarium'} eyebrow={translateUi('{0} · Write', [translateUi(name)])} englishEyebrow={interpolate('{0} · Write', [name])} actions={<NewEntryButton />} />
      <InRoom.Provider value>
        <DiariumHome />
      </InRoom.Provider>
    </>
  );
}
