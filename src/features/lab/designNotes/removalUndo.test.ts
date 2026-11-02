import { afterEach, expect, it } from 'vitest';
import { useDesignNotes } from './notes';
import type { NewDesignNote } from './notes';
import { useUI } from '@/state/ui';
afterEach(() => { useDesignNotes.setState({ notes: [] }); useUI.setState({ toasts: [] }); });
it('restores removed local design notes while preserving notes added afterwards', async () => {
  const draft: NewDesignNote = { path: '/', room: 'Home', selector: 'h1', element: 'Title', text: 'Original', rect: { x: 0, y: 0, w: 100, h: 50 }, window: { w: 1280, h: 800 }, light: 'Paper', language: 'es', version: 'test' };
  const first = useDesignNotes.getState().add(draft);
  useDesignNotes.getState().clearAll();
  const second = useDesignNotes.getState().add({ ...draft, text: 'Newer' });
  await useUI.getState().toasts.find((t) => t.duration === 0)?.action?.onClick();
  expect(useDesignNotes.getState().notes.map((n) => n.id)).toEqual(expect.arrayContaining([first.id, second.id]));
});
