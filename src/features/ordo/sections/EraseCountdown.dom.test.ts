// @vitest-environment happy-dom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
vi.mock('@/design/primitives', () => ({ Dialog: ({ children, actions }: { children: ReactNode; actions: ReactNode }) => createElement('section', {}, children, actions), Button: ({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) => createElement('button', { onClick, disabled }, children) }));
import { EraseCountdown } from './EraseCountdown';
const container = document.createElement('div'); document.body.append(container); const root = createRoot(container);
afterEach(async () => { await act(async () => root.render(null)); vi.useRealTimers(); });
it('waits thirty seconds, and unmount/navigation cancels the pending erase', async () => {
  vi.useFakeTimers(); const erase = vi.fn(async () => {}), onCancel = vi.fn();
  await act(async () => root.render(createElement(EraseCountdown, { erase, onCancel })));
  await act(async () => vi.advanceTimersByTime(29_000)); expect(erase).not.toHaveBeenCalled();
  await act(async () => root.render(null)); await act(async () => vi.advanceTimersByTime(40_000)); expect(erase).not.toHaveBeenCalled();
  await act(async () => root.render(createElement(EraseCountdown, { erase, onCancel })));
  await act(async () => vi.advanceTimersByTime(30_000)); expect(erase).toHaveBeenCalledOnce();
});
