import {
  decay,
  MotionValue,
  spring,
  timing,
  parallel,
  delay,
} from '@raidipesh78/re-motion';

import { filterCallbackOptions } from './helpers';
import type { Primitive } from '../types';
import type { Descriptor } from './descriptors';

export function buildAnimation(
  mv: MotionValue<Primitive>,
  { type, to, options = {} }: any
) {
  switch (type) {
    case 'spring':
      return spring(mv, to, options);
    case 'timing':
      return timing(mv, to, options);
    case 'decay':
      return decay(mv as MotionValue<number>, options.velocity ?? 0, options);
    case 'delay':
      return delay(options.delay);
    default:
      console.warn(`Unsupported animation type: ${type}`);
      return { start() {}, pause() {}, resume() {}, cancel() {}, reset() {} };
  }
}

export function buildParallel(
  mvMap: Record<string, MotionValue<Primitive>>,
  step: Descriptor
) {
  return parallel(
    Object.entries(mvMap)
      .map(([key, mv], i) => {
        const shouldRun =
          step.type === 'decay' ||
          step.type === 'delay' ||
          (step.to &&
            (step.to as Record<string, Primitive>)[key] !== undefined);

        if (!shouldRun) return null;

        return buildAnimation(mv, {
          type: step.type,
          to: (step.to as Record<string, Primitive>)?.[key] ?? null,
          options: filterCallbackOptions(step.options, i === 0),
        });
      })
      .filter((c): c is any => !!c)
  );
}
