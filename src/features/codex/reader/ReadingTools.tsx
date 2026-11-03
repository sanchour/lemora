import { UiText, useUi } from '@/design/i18n/UiText';
import { ReferenceButton } from '@/features/culture/ReferenceHelp';
import { Link } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { BookOpenCheck, Columns2, SlidersHorizontal } from 'lucide-react';
import type { ReadingAids, ReadingMark } from '@/core/reading/aids';
import type { Text } from '@/data/types';
import { removeReadingMark, saveReadingMark } from '@/data/readingMarks';
import { useLayout } from '@/design/hooks/useLayout';
import { Button, Drawer, IconButton, Popover, Slider, Switch } from '@/design/primitives';
import { cx } from '@/lib/cx';
import { toast } from '@/state/ui';
import { AddToDeck } from './AddToDeck';

interface ReadingToolsProps {
  chapterIndex?: number;
  text: Text;
  aids: ReadingAids;
  onChange: (next: ReadingAids) => void;
  onOpenChange: (open: boolean) => void;
  sideBySide?: boolean;
  onToggleSideBySide?: () => void;
}

export function ReadingTools({
  text,
  aids,
  onChange,
  onOpenChange,
  chapterIndex = 0,
  sideBySide = false,
  onToggleSideBySide,
}: ReadingToolsProps) {
  const translateUi = useUi();
  const { layout } = useLayout();
  const [open, setOpen] = useState(false);
  const changeOpen = (value: boolean) => {
    setOpen(value);
    onOpenChange(value);
  };

  const hasActiveTool =
    sideBySide || aids.pos || aids.endings || aids.glosses || aids.hideGlosses || aids.ruler;

  return (
    <>
      {layout === 'wide' ? (
        <Popover
          label={translateUi('Reading tools')}
          placement="bottom-end"
          onOpenChange={changeOpen}
          trigger={(props) => (
            <button
              {...props}
              type="button"
              aria-label={translateUi('Reading tools')}
              title={translateUi('Reading tools')}
              className={cx(
                'grid size-10 place-items-center rounded-xl transition-colors hover:bg-surface hover:text-ink',
                hasActiveTool ? 'bg-accent-soft/70 text-accent-text' : 'text-ink-soft',
              )}
            >
              <SlidersHorizontal size={18} aria-hidden />
            </button>
          )}
        >
          {(close) => (
            <ReadingToolsPanel
              text={text}
              aids={aids}
              onChange={onChange}
              chapterIndex={chapterIndex}
              sideBySide={sideBySide}
              onToggleSideBySide={() => {
                onToggleSideBySide?.();
                close();
              }}
              onNavigate={close}
            />
          )}
        </Popover>
      ) : (
        <>
          <IconButton
            icon={SlidersHorizontal}
            label={translateUi('Reading tools')}
            onClick={() => changeOpen(true)}
            showTooltip={false}
            className={hasActiveTool ? 'bg-accent-soft/70 text-accent-text' : undefined}
          />
          <Drawer open={open} onClose={() => changeOpen(false)} title={translateUi('Reading tools')}>
            <div className="flex justify-center">
              <ReadingToolsPanel
                text={text}
                aids={aids}
                onChange={onChange}
                chapterIndex={chapterIndex}
                sideBySide={sideBySide}
                onToggleSideBySide={() => {
                  onToggleSideBySide?.();
                  changeOpen(false);
                }}
                onNavigate={() => changeOpen(false)}
              />
            </div>
          </Drawer>
        </>
      )}
    </>
  );
}

function ReadingToolsPanel({
  text,
  aids,
  onChange,
  chapterIndex,
  sideBySide,
  onToggleSideBySide,
  onNavigate,
}: {
  text: Text;
  aids: ReadingAids;
  onChange: (next: ReadingAids) => void;
  chapterIndex: number;
  sideBySide: boolean;
  onToggleSideBySide: () => void;
  onNavigate: () => void;
}) {
  const translateUi = useUi();

  return (
    <div className="w-[min(340px,calc(100vw-32px))] space-y-4 p-1 text-sm">
      {/* Side-by-side & Chapter comprehension actions */}
      <div className="grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={onToggleSideBySide}
          aria-pressed={sideBySide}
          className={cx(
            'flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left font-semibold transition-colors',
            sideBySide
              ? 'border-accent bg-accent-soft text-accent-text'
              : 'border-line bg-surface/60 text-ink hover:border-line-strong hover:bg-surface',
          )}
        >
          <Columns2 size={17} className="shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 truncate">
            <UiText source={'Read side by side'} />
          </span>
          <span
            className={cx(
              'size-2 rounded-full',
              sideBySide ? 'bg-accent' : 'bg-line-strong',
            )}
            aria-hidden
          />
        </button>

        <Link
          to={`/codex/comprehension/${text.id}/${chapterIndex}`}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface/60 px-3.5 py-2.5 font-semibold text-ink transition-colors hover:border-line-strong hover:bg-surface"
        >
          <BookOpenCheck size={17} className="shrink-0 text-ink-soft" aria-hidden />
          <span className="min-w-0 flex-1 truncate">
            <UiText source={'Check understanding of this chapter'} />
          </span>
        </Link>
      </div>

      {/* Reading aids switches */}
      <div className="space-y-2.5 rounded-2xl border border-line bg-surface/40 p-3">
        {(
          [
            ['pos', 'Colour parts of speech'],
            ['endings', 'Mark changed endings'],
            ['glosses', 'Interlinear glosses'],
            ['hideGlosses', 'Hide glosses until revealed'],
            ['ruler', 'Reading ruler'],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between gap-3 py-0.5">
            <span className="text-[13.5px] font-semibold text-ink">
              <UiText source={label} />
            </span>
            <Switch
              label={translateUi(label)}
              checked={aids[key]}
              onChange={(checked) => onChange({ ...aids, [key]: checked })}
            />
          </div>
        ))}

        {aids.pos && (
          <p className="pt-1 text-[11.5px] leading-relaxed text-ink-faint">
            <UiText source={'Noun: blue · Verb: terracotta · Adjective: sage · Adverb: amber. Other or missing categories keep their usual ink.'} />
          </p>
        )}

        {aids.ruler && (
          <div className="pt-1">
            <Slider
              label={translateUi('Ruler position{0}', [''])}
              value={aids.rulerY}
              min={10}
              max={90}
              step={1}
              onChange={(rulerY) => onChange({ ...aids, rulerY })}
              format={(v) => `${v}%`}
            />
          </div>
        )}
      </div>

      <p className="text-[11.5px] leading-relaxed text-ink-faint">
        <UiText source={'Dictionary categories can differ in context. Endings mark only a changed suffix shared with the dictionary form. No syntax is inferred.'} />
      </p>

      <div className="flex items-center justify-between">
        <ReferenceButton />
      </div>

      {/* Highlights & margin notes */}
      <div className="border-t border-line pt-3">
        <h3 className="text-[12px] font-bold tracking-[0.1em] text-ink-faint uppercase">
          <UiText source={'Highlights and margin notes'} />
        </h3>
        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-faint">
          <UiText source={'Drag across words, then choose Highlight in the selection bubble. These tools reset when you leave; highlights and notes stay with the text.'} />
        </p>
        {(text.readingMarks ?? []).map((mark) => (
          <SavedMark key={mark.id} mark={mark} text={text} />
        ))}
        {!text.readingMarks?.length && (
          <p className="mt-2 text-xs text-ink-faint">
            <UiText source={'No highlights yet.'} />
          </p>
        )}
      </div>
    </div>
  );
}
function SavedMark({ mark, text }: { mark: ReadingMark; text: Text }) {
  const [note, setNote] = useState(mark.note);
  const [meaning, setMeaning] = useState('');
  const latest = useRef(note);
  const stored = useRef(mark.note);
  const removed = useRef(false);
  const pending = useRef<number | undefined>(undefined);
  latest.current = note;
  stored.current = mark.note;
  useEffect(() => () => {
    window.clearTimeout(pending.current);
    if (!removed.current && latest.current !== stored.current) void saveReadingMark(text.id, { ...mark, note: latest.current }).catch(fail);
  }, [text.id, mark.id]);
  const saveNote = (value: string) => {
    window.clearTimeout(pending.current);
    if (value !== stored.current) void saveReadingMark(text.id, { ...mark, note: value }).catch(fail);
  };
  const fail = (error: unknown) => toast(error instanceof Error ? error.message : 'Could not save the note.', { tone: 'error' });
  return <section className="mt-4 space-y-2 border-t border-line pt-3">
    <p className="text-xs text-ink-faint"><UiText source={'Chapter {0} · paragraph {1} · {2}'} values={[mark.chapterIndex + 1, mark.blockIndex + 1, mark.colour]} /></p>
    <blockquote lang={text.lang} className="font-serif">{mark.quote}</blockquote>
    <label className="block"><UiText source={'Margin note{0}'} values={[<textarea rows={2} maxLength={4000} value={note} onChange={(e) => { const value = e.target.value; setNote(value); latest.current = value; window.clearTimeout(pending.current); pending.current = window.setTimeout(() => saveNote(value), 500); }} onBlur={() => saveNote(note)} className="mt-1 w-full rounded-lg border border-line bg-raised p-2" />]} /></label>
    <label className="block"><UiText source={'Meaning for a card{0}'} values={[<input value={meaning} onChange={(e) => setMeaning(e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-raised p-2" />]} /></label>
    {meaning.trim() && <AddToDeck lang={text.lang} note={{ term: mark.quote, meaning: meaning.trim(), source: 'codex', context: { sentence: mark.quote, textId: text.id, chapterIndex: mark.chapterIndex, blockIndex: mark.blockIndex } }} />}
    <Button size="sm" variant="ghost" onClick={() => { window.clearTimeout(pending.current); removed.current = true; void removeReadingMark(text.id, mark.id).then(() => toast('Highlight removed.', { action: { label: 'Undo', onClick: () => void saveReadingMark(text.id, mark).catch(fail) } })).catch((error: unknown) => { removed.current = false; fail(error); }); }}><UiText source={'Remove highlight'} /></Button>
  </section>;
}
