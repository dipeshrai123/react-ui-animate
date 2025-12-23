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

      let innerController: ReturnType<typeof timing>;

      // For loops, we use the AnimateValue's initial value as the starting point
      // This ensures loops always animate from the initial value to the target,
      // regardless of the current value
      const loopFromValue = value.initial as number;

      if (innerDesc.type === 'sequence') {
        // For sequences, build each step with `from` support for the first animation
        const animations = innerDesc.options?.animations ?? [];
        const controllers = animations.map((step, index) => {
          // For the first animation in a sequence within a loop,
          // use initial value if no explicit `from` is specified
          if (index === 0 && (step.type === 'spring' || step.type === 'timing')) {
            const explicitFrom = step.options?.from;
            return buildAnimation(value, {
              ...step,
              options: { ...step.options, from: explicitFrom ?? loopFromValue },
            });
          }
          return buildAnimation(value, step);
        });
        innerController = sequence(controllers, innerDesc.options);
      } else if (innerDesc.type === 'spring' || innerDesc.type === 'timing') {
        // For single spring/timing animations in a loop,
        // use initial value if no explicit `from` is specified
        const explicitFrom = innerDesc.options?.from;
        innerController = buildAnimation(value, {
          ...innerDesc,
          options: { ...innerDesc.options, from: explicitFrom ?? loopFromValue },
        });
      } else {
        innerController = buildAnimation(value, innerDesc);
      }

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
