interface ArmedSuppressor {
  handler: (e: MouseEvent) => void;
  timeoutId: number;
}

const armed = new WeakMap<HTMLElement, ArmedSuppressor>();

/**
 * Arms a one-shot, capture-phase `click` suppressor scoped to `target`. Call
 * this exactly once, at the moment a drag's threshold is crossed (not on
 * every pointerdown) — browsers fire a synthetic `click` on pointerup after
 * a mouse/pen drag regardless of movement distance (unlike touch, which can
 * cancel it), so this swallows exactly that one click before it reaches
 * bubble-phase handlers like `onClick`.
 *
 * Scoped to `target` (not a permanent page-wide listener) and self-cleaning:
 * the listener removes itself once it fires, and a macrotask fallback
 * removes it if no click ever arrives (e.g. some touch-cancel paths), so a
 * later, unrelated click on the same element is never swallowed.
 */
export function suppressNextClick(target: HTMLElement): void {
  const prior = armed.get(target);
  if (prior) {
    target.removeEventListener('click', prior.handler, { capture: true });
    clearTimeout(prior.timeoutId);
  }

  const handler = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    armed.delete(target);
  };

  target.addEventListener('click', handler, { capture: true, once: true });

  const timeoutId = window.setTimeout(() => {
    target.removeEventListener('click', handler, { capture: true });
    armed.delete(target);
  }, 0);

  armed.set(target, { handler, timeoutId });
}
