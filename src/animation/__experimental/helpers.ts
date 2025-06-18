import type { Descriptor } from './descriptors';

export function filterCallbackOptions(
  options: Record<string, any> = {},
  attach: boolean
) {
  if (attach) return options;
  const { onStart, onChange, onComplete, ...rest } = options;
  return rest;
}

export function isDescriptor(x: unknown): x is Descriptor {
  return (
    typeof x === 'object' &&
    x !== null &&
    'type' in x &&
    typeof (x as any).type === 'string'
  );
}
