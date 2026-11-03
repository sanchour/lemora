/** A replacement animation rejects ready even when its DOM update succeeds (CSS View Transitions §6.2). */
export function startVisualTransition(update: () => void | Promise<void>): ViewTransition {
  const transition = document.startViewTransition(update);
  void transition.ready.catch((error: unknown) => {
    if (!(error instanceof DOMException && error.name === 'AbortError')) console.error(error);
  });
  return transition;
}
