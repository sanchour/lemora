import { UiText, useUi } from '@/design/i18n/UiText';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { WRITING_TASKS, writingTaskPrompt } from '@/core/journal/tasks';
import { createEntry } from '@/data/journal';
import { Button, Card, Select } from '@/design/primitives';
import { toast } from '@/state/ui';

export function WritingTasks({ lang }: { lang: string }) {
  const translateUi = useUi();
  const [id, setId] = useState(WRITING_TASKS[0].id);
  const [details, setDetails] = useState('');
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();
  const task = WRITING_TASKS.find((t) => t.id === id)!;
  const start = async () => {
    setStarting(true);
    try {
      const entryId = await createEntry(lang, { text: writingTaskPrompt(task, details), taskId: task.id });
      navigate(`/mentis/diarium/${entryId}`);
    } catch {
      toast('Could not start the task. Please try again.', { tone: 'error' });
    } finally {
      setStarting(false);
    }
  };
  return (
    <Card className="space-y-3.5 rounded-3xl border-line/75 p-5 sm:p-6">
      <header className="border-b border-line/60 pb-2">
        <h2 className="font-serif text-lg font-semibold"><UiText source={'Writing tasks'} /></h2>
      </header>
      <Select label={translateUi('Choose a task')} value={id} onChange={setId} options={WRITING_TASKS.map((t) => ({ value: t.id, label: translateUi(t.title) }))} />
      <p className="text-[13.5px] leading-relaxed text-ink-soft">{task.brief}</p>
      <p className="text-[12px] text-ink-faint"><UiText source={'Aim for {0}–{1} words. A guide, not a limit.'} values={[task.minWords, task.maxWords]} /></p>
      <label className="block text-[12.5px] font-semibold text-ink-soft"><UiText source={'Your material (optional){0}'} values={[<textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={2} placeholder={translateUi('Words, notes, an article or a paragraph to work from…')} className="mt-1.5 w-full resize-y rounded-xl border border-line bg-raised p-2.5 text-[13px] font-normal text-ink" />]} /></label>
      <Button size="sm" onClick={() => void start()} loading={starting}><UiText source={'Start this task'} /></Button>
    </Card>
  );
}
