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
  const entries = Object.entries(mvMap).filter(([key]) => {
    return (
      step.type === 'decay' ||
      step.type === 'delay' ||
      (step.to as Record<string, Primitive>)[key] !== undefined
    );
  });

  const ctrls = entries.map(([key, mv], idx) =>
    buildAnimation(mv, {
      type: step.type,
      to:
        step.type === 'decay' || step.type === 'delay'
          ? (step.to as any)
          : (step.to as Record<string, Primitive>)[key],
      options: filterCallbackOptions(step.options, idx === 0),
    })
  );

  return parallel(ctrls);
}
