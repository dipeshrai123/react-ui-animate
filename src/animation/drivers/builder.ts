import { decay } from './decay';
import { spring } from './spring';
import { timing } from './timing';
import { parallel, sequence, loop, delay } from './compose';
import { AnimateValue } from '../values/AnimateValue';
import { filterCallbackOptions } from '../helpers';
import type { Primitive, Descriptor } from '../types';

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

      // Each loop iteration restarts from the AnimateValue's initial value
      // (not its current value) unless a step already sets an explicit `from`.
      const loopFromValue = value.initial as number;

      if (innerDesc.type === 'sequence') {
        const animations = innerDesc.options?.animations ?? [];
        const controllers = animations.map((step, index) => {
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
