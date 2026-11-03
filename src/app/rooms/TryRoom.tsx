import { useUi } from '@/design/i18n/UiText';
import { getLanguage } from '@/core/lang/languages';
import { useApp } from '@/app/context';
import { PageHeader } from '@/app/PageHeader';
import { InRoom } from '@/app/room';
import { TipsView } from '@/features/mundus/TipsView';

/** Things to try, a room of its own in Lemora (in Lingua it's Mentis › Mundus › Things to try). */
export default function TryRoom() {
  const translateUi = useUi();
  const { language } = useApp();
  const name = getLanguage(language.id)?.name ?? language.id;
  return (
    <>
      <PageHeader title={translateUi('Things to try')} englishTitle={'Things to try'} eyebrow={translateUi(name)} englishEyebrow={name} />
      <InRoom.Provider value>
        <TipsView lang={language.id} />
      </InRoom.Provider>
    </>
  );
}
