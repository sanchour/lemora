// @vitest-environment happy-dom
import { act, createElement, Fragment } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('motion/react', () => ({ AnimatePresence: ({ children }: { children: ReactNode }) => createElement(Fragment, {}, children), motion: { div: ({ children, className, role }: { children: ReactNode; className?: string; role?: string }) => createElement('div', { className, role }, children) } }));
import { Toaster } from './Toaster';
import { toast, useUI } from '@/state/ui';
const container = document.createElement('div'); document.body.append(container); const root = createRoot(container);
afterEach(async () => { await act(async () => root.render(null)); useUI.setState({ toasts: [] }); });
it('keeps failed async Undo available for retry and dismisses it after a successful retry', async () => {
  const restore = vi.fn().mockRejectedValueOnce(new Error('disk is full')).mockResolvedValueOnce(undefined);
  const id = toast('recovery', { duration: 0, action: { label: 'Undo', onClick: restore } });
  await act(async () => root.render(createElement(Toaster)));
  const button = () => [...document.querySelectorAll('button')].find((b) => b.textContent === 'Undo')!;
  await act(async () => button().click());
  expect(useUI.getState().toasts.some((t) => t.id === id)).toBe(true);
  expect(document.body.textContent).toContain('disk is full');
  await act(async () => button().click());
  expect(restore).toHaveBeenCalledTimes(2);
  expect(useUI.getState().toasts.some((t) => t.id === id)).toBe(false);
});
