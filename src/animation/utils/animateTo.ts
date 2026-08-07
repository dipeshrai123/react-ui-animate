import type { Descriptor } from '../types';

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
