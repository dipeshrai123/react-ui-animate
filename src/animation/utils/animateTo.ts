import type { Descriptor } from '../types';

// Every descriptor already supports `onComplete`; this just turns that
// callback into a Promise so animations (which may live on different
// AnimateValues, unlike withSequence) can be awaited/sequenced with
// ordinary async/await, and so tests can await settling instead of hand
// -rolling `jest.advanceTimersByTime` + manual assertions.
export function animateTo(
  setValue: (to: Descriptor) => void,
  descriptor: Descriptor
): Promise<void> {
  return new Promise((resolve) => {
    const userOnComplete = descriptor.options?.onComplete;
    setValue({
      ...descriptor,
      options: {
        ...descriptor.options,
        onComplete: () => {
          userOnComplete?.();
          resolve();
        },
      },
    });
  });
}
