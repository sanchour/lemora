import { afterEach, expect, it } from 'vitest';
import { toast, useUI } from './ui';
afterEach(() => useUI.setState({ toasts: [] }));
it('keeps the latest recovery through ordinary messages and replaces it only at the next removal', () => {
  const first = toast('recovery', { duration: 0, action: { label: 'Undo', onClick: () => {} } });
  for (let i = 0; i < 5; i++) toast('other');
  expect(useUI.getState().toasts.some((t) => t.id === first)).toBe(true);
  const next = toast('next recovery', { duration: 0, action: { label: 'Undo', onClick: () => {} } });
  expect(useUI.getState().toasts.some((t) => t.id === first)).toBe(false);
  expect(useUI.getState().toasts.some((t) => t.id === next)).toBe(true);
});
