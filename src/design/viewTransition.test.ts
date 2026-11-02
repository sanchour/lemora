import { afterEach, expect, it, vi } from 'vitest';
import { startVisualTransition } from './viewTransition';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function browserTransition(reason?: unknown) {
  let native: { ready: Promise<void>; updateCallbackDone: Promise<void>; finished: Promise<void> };
  const start = vi.fn((update: () => void | Promise<void>) => {
    const updateCallbackDone = Promise.resolve().then(update);
    native = { ready: reason ? Promise.reject(reason) : Promise.resolve(), updateCallbackDone, finished: updateCallbackDone };
    return native;
  });
  vi.stubGlobal('document', { startViewTransition: start });
  return { start, native: () => native! };
}

it('handles replaced-animation cancellation while keeping the native update and result', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const browser = browserTransition(new DOMException('Transition was skipped. New ViewTransition started', 'AbortError'));
  const update = vi.fn();
  const transition = startVisualTransition(update);
  expect(transition).toBe(browser.native());
  await transition.finished;
  expect(update).toHaveBeenCalledTimes(1);
  expect(browser.start).toHaveBeenCalledWith(update);
  expect(error).not.toHaveBeenCalled();
});

it('reports unexpected animation failures instead of treating every rejection as cancellation', async () => {
  const report = vi.spyOn(console, 'error').mockImplementation(() => {});
  const failure = new DOMException('Duplicate view-transition-name', 'InvalidStateError');
  browserTransition(failure);
  await startVisualTransition(() => {}).finished;
  expect(report).toHaveBeenCalledExactlyOnceWith(failure);
});

it('does not convert a failed state update into success', async () => {
  browserTransition();
  const failure = new Error('The language could not be saved');
  const transition = startVisualTransition(() => { throw failure; });
  await expect(transition.updateCallbackDone).rejects.toBe(failure);
  await expect(transition.finished).rejects.toBe(failure);
});
