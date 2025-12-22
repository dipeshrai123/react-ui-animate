import {
  decay,
  AnimateValue,
  spring,
  timing,
  parallel,
  delay,
  sequence,
  loop,
} from '../core';

import { filterCallbackOptions } from './helpers';
import type { Primitive, Descriptor } from './types';

export function buildAnimation(
  value: AnimateValue<Primitive>,
  { type, to, options = {} }: Descriptor
): ReturnType<typeof timing> {
  switch (type) {
    case 'spring':
      return spring(value, to as Primitive, options);
    case 'timing':
      return timing(value, to as Primitive, options);
    case 'decay':
      return decay(value as AnimateValue<number>, options.velocity ?? 0, options);
    case 'delay':
      return delay(options.delay ?? 0);
    case 'sequence': {
      const animations = options.animations ?? [];
      const controllers = animations.map((step) => buildAnimation(value, step));
      return sequence(controllers, options);
    }
    case 'loop': {
      const innerDesc = options.animation;

      if (!innerDesc) {
        console.warn('[buildAnimation] loop missing `animation` descriptor');
        return { start() {}, pause() {}, resume() {}, cancel() {}, reset() {} };
      }

      const innerController =
        innerDesc.type === 'sequence'
          ? sequence(
              (innerDesc.options?.animations ?? []).map((step) =>
                buildAnimation(value, step)
              ),
              innerDesc.options
            )
          : buildAnimation(value, innerDesc);

      return loop(innerController, options.iterations ?? 0, options);
    }

    default:
      console.warn(`Unsupported animation type: ${type}`);
      return { start() {}, pause() {}, resume() {}, cancel() {}, reset() {} };
  }
}

export function buildParallel(
  valueMap: Record<string, AnimateValue<Primitive>>,
  step: Descriptor
) {
  const entries = Object.entries(valueMap).filter(([key]) => {
    return (
      step.type === 'decay' ||
      step.type === 'delay' ||
      (step.to as Record<string, Primitive>)[key] !== undefined
    );
  });

  const controllers = entries.map(([key, value], idx) =>
    buildAnimation(value, {
      type: step.type,
      to:
        step.type === 'decay' || step.type === 'delay'
          ? (step.to as any)
          : (step.to as Record<string, Primitive>)[key],
      options: filterCallbackOptions(step.options, idx === 0),
    })
  );

  return parallel(controllers);
}
