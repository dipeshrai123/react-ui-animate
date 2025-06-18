import type { Descriptor } from './descriptors';

export function filterCallbackOptions(
  options: Descriptor['options'] = {},
  attach: boolean
) {
  if (attach) return options;
  const { onStart, onChange, onComplete, ...rest } = options;
  return rest;
}
