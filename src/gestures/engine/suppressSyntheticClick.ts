interface ArmedSuppressor {
  handler: (e: MouseEvent) => void;
  timeoutId: number;
}

const armed = new WeakMap<HTMLElement, ArmedSuppressor>();

// Arm only at pointerup of a qualifying drag — arming earlier lets the macrotask fallback clear it before the real click arrives.
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
