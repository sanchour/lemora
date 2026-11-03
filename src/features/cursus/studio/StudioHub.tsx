import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { AudioLines, BookA, Keyboard, Type } from 'lucide-react';
import { useApp } from '@/app/context';
import { getLanguage } from '@/core/lang/languages';
import { hasScript } from '@/core/script/load';
import { hasMarks } from '../marks/MarksTab';
import { Segmented } from '@/design/primitives';
import { RequirePlan } from '@/features/plans/Locked';
import GrammaticaPage from '@/features/grammatica/GrammaticaPage';
import { SoundsTab } from '../sounds/SoundsTab';
import { TypingTab } from '../TypingTab';
import { ScriptMarksTab } from './ScriptMarksTab';

export type StudioToolId = 'grammar' | 'sounds' | 'script' | 'typing';

interface StudioToolOption {
  value: StudioToolId;
  label: string;
  icon: typeof BookA;
}

/**
 * StudioHub:
 * Houses the four language mechanics & reference workshops (Grammar, Sounds, Script & Marks, Typing)
 * under a clean, unified workspace, tidily tucked away from the main course path.
 */
export function StudioHub() {
  const { language } = useApp();
  const lang = language.id;
  const core = getLanguage(lang)?.tier === 1;
  const [searchParams, setSearchParams] = useSearchParams();

  const toolParam = searchParams.get('tool') as StudioToolId | null;

  const tools = useMemo(() => {
    const list: StudioToolOption[] = [
      { value: 'grammar', label: 'Grammar', icon: BookA },
    ];

    if (core) {
      list.push({ value: 'sounds', label: 'Sounds', icon: AudioLines });
    }

    if (hasScript(lang) || hasMarks(lang)) {
      list.push({ value: 'script', label: 'Special letters', icon: Type });
    }

    if (core) {
      list.push({ value: 'typing', label: 'Typing', icon: Keyboard });
    }

    return list;
  }, [core, lang]);

  const activeTool: StudioToolId = useMemo(() => {
    if (toolParam && tools.some((t) => t.value === toolParam)) {
      return toolParam;
    }
    return tools[0].value;
  }, [toolParam, tools]);

  const handleToolChange = (tool: StudioToolId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tool', tool);
      return next;
    }, { replace: true });
  };

  return (
    <div className="space-y-6 pt-1">
      {/* Sub-workshop navigation strip */}
      <div className="flex justify-center border-b border-line/60 pb-5 sm:justify-start">
        <Segmented<StudioToolId>
          label={'Tools'}
          value={activeTool}
          onChange={handleToolChange}
          options={tools}
        />
      </div>

      {/* Active Workshop View */}
      <div className="min-h-[400px]">
        {activeTool === 'grammar' && (
          <RequirePlan feature="grammatica">
            <GrammaticaPage />
          </RequirePlan>
        )}

        {activeTool === 'sounds' && <SoundsTab />}

        {activeTool === 'script' && <ScriptMarksTab />}

        {activeTool === 'typing' && (
          <RequirePlan feature="typing">
            <TypingTab />
          </RequirePlan>
        )}
      </div>
    </div>
  );
}
