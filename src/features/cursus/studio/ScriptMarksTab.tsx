import { useMemo, useState } from 'react';
import { useApp } from '@/app/context';
import { hasScript } from '@/core/script/load';
import { hasMarks, MarksTab } from '../marks/MarksTab';
import LettersPage from '@/features/grammatica/letters/LettersPage';
import { Segmented } from '@/design/primitives';
import { useUi } from '@/design/i18n/UiText';
import { Languages, Type } from 'lucide-react';

type SubView = 'alphabet' | 'marks';

/**
 * Script & Marks unified workshop:
 * Merges Alphabet/Letters and Diacritics/Stroke Order/Conversion into one coherent space.
 */
export function ScriptMarksTab() {
  const translateUi = useUi();
  const { language } = useApp();
  const lang = language.id;
  const scriptAvailable = hasScript(lang);
  const marksAvailable = hasMarks(lang);

  const [activeView, setActiveView] = useState<SubView>(scriptAvailable ? 'alphabet' : 'marks');

  const options = useMemo(() => {
    const list = [];
    if (scriptAvailable) {
      list.push({ value: 'alphabet' as const, label: 'Alphabet', icon: Languages });
    }
    if (marksAvailable) {
      list.push({ value: 'marks' as const, label: 'Special letters', icon: Type });
    }
    return list;
  }, [scriptAvailable, marksAvailable]);

  if (!scriptAvailable && !marksAvailable) {
    return (
      <div className="py-8 text-center text-ink-soft">
        <p>{translateUi('No alphabet to learn here')}</p>
      </div>
    );
  }

  // If only one is available, render it directly without an unnecessary segmented bar
  if (options.length === 1) {
    return options[0].value === 'alphabet' ? <LettersPage /> : <MarksTab />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center sm:justify-start">
        <Segmented<SubView>
          label={'Script & Marks'}
          value={activeView}
          onChange={setActiveView}
          options={options}
        />
      </div>

      {activeView === 'alphabet' && <LettersPage />}
      {activeView === 'marks' && <MarksTab />}
    </div>
  );
}
