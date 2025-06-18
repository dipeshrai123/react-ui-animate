import type { DriverOptions } from './descriptors';

export function filterCallbackOptions<K extends keyof DriverOptions>(
  options: DriverOptions[K],
  attach: boolean
): DriverOptions[K] {
  if (attach) {
    return options;
  }

  const { onStart, onChange, onComplete, ...rest } = options;

  return rest;
}
