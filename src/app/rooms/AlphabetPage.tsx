import { Link, useSearchParams } from 'react-router';
import { AudioLines, Languages } from 'lucide-react';
import { interpolate } from '@/core/i18n/messages';
import { useUi } from '@/design/i18n/UiText';
import { getLanguage } from '@/core/lang/languages';
import { useApp } from '@/app/context';
import { PageHeader } from '@/app/PageHeader';
import { InRoom } from '@/app/room';
import { RoomTabs } from '@/app/RoomTabs';
import type { RoomTab } from '@/app/RoomTabs';
import { ScriptMarksTab } from '@/features/cursus/studio/ScriptMarksTab';
import { SoundsTab } from '@/features/cursus/sounds/SoundsTab';

type Tab = 'letters' | 'sounds';
const TABS: Array<RoomTab<Tab>> = [
  { id: 'letters', label: 'Letters', to: '/cursus/alphabets', icon: Languages },
  { id: 'sounds', label: 'Sounds', to: '/cursus/alphabets?tab=sounds', icon: AudioLines },
];

/** Alphabet, a room of its own in Lemora: Lingua's Cursus › Script (letters, marks, stroke order) and Cursus › Sounds. */
export default function AlphabetPage() {
  const translateUi = useUi();
  const { language } = useApp();
  const name = getLanguage(language.id)?.name ?? language.id;
  const tab: Tab = useSearchParams()[0].get('tab') === 'sounds' ? 'sounds' : 'letters';
  return (
    <>
      <PageHeader
        title={translateUi('Alphabet')}
        englishTitle={'Alphabet'}
        eyebrow={translateUi('The alphabet · {0}', [translateUi(name)])}
        englishEyebrow={interpolate('The alphabet · {0}', [name])}
        actions={
          <Link to="/cursus/characters" className="text-[14px] font-semibold text-accent-text hover:underline">
            {translateUi('Character reference')}
          </Link>
        }
      />
      <RoomTabs label={translateUi('Alphabet')} tabs={TABS} active={tab} />
      <InRoom.Provider value>{tab === 'sounds' ? <SoundsTab /> : <ScriptMarksTab />}</InRoom.Provider>
    </>
  );
}
