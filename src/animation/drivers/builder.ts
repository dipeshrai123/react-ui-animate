import { decay } from './decay';
import { spring } from './spring';
import { timing } from './timing';
import { custom } from './custom';
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
    case 'custom': {
      if (!options.tick) {
        console.warn('[buildAnimation] custom missing `tick` function');
        return { start() {}, pause() {}, resume() {}, cancel() {}, reset() {} };
      }
      return custom(value as AnimateValue<number>, options.tick, options);
    }
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

      // Each loop iteration restarts from the AnimateValue's initial value
      // (not its current value) unless a step already sets an explicit `from`.
      const loopFromValue = value.initial as number;

      if (innerDesc.type === 'spring' || innerDesc.type === 'timing') {
        const target = innerDesc.to as number;
        const from = innerDesc.options?.from ?? loopFromValue;

        if (options.yoyo) {
          // `iterations` counts legs, so forward+back = 2 (matches GSAP's `yoyo`).
          const factory = (iteration: number) => {
            const reversed = iteration % 2 === 1;
            return buildAnimation(value, {
              ...innerDesc,
              to: reversed ? from : target,
              options: { ...innerDesc.options, from: reversed ? target : from },
            });
          };
          return loop(factory, options.iterations ?? 0, options);
        }

        const innerController = buildAnimation(value, {
          ...innerDesc,
          options: { ...innerDesc.options, from },
        });
        return loop(innerController, options.iterations ?? 0, options);
      }

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
        const innerController = sequence(controllers, innerDesc.options);
        return loop(innerController, options.iterations ?? 0, options);
      }

      return loop(buildAnimation(value, innerDesc), options.iterations ?? 0, options);
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
      step.type === 'custom' ||
      (step.to as Record<string, Primitive>)[key] !== undefined
    );
  });

  const controllers = entries.map(([key, value], idx) =>
    buildAnimation(value, {
      type: step.type,
      to:
        step.type === 'decay' || step.type === 'delay' || step.type === 'custom'
          ? (step.to as any)
          : (step.to as Record<string, Primitive>)[key],
      options: filterCallbackOptions(step.options, idx === 0),
    })
  );

  return parallel(controllers);
}
