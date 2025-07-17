import {
  decay,
  MotionValue,
  spring,
  timing,
  parallel,
  delay,
  sequence,
  loop,
} from '@raidipesh78/re-motion';

import { filterCallbackOptions } from './helpers';
import type { Primitive, Descriptor } from './types';

export function buildAnimation(
  mv: MotionValue<Primitive>,
  { type, to, options = {} }: Descriptor
): ReturnType<typeof timing> {
  switch (type) {
    case 'spring':
      return spring(mv, to as Primitive, options);
    case 'timing':
      return timing(mv, to as Primitive, options);
    case 'decay':
      return decay(mv as MotionValue<number>, options.velocity ?? 0, options);
    case 'delay':
      return delay(options.delay ?? 0);
    case 'sequence': {
      const animations = options.animations ?? [];
      const ctrls = animations.map((step) => buildAnimation(mv, step));
      return sequence(ctrls, options);
    }
    case 'loop': {
      const innerDesc = options.animation;

      if (!innerDesc) {
        console.warn('[buildAnimation] loop missing `animation` descriptor');
        return { start() {}, pause() {}, resume() {}, cancel() {}, reset() {} };
      }

      const innerCtrl =
        innerDesc.type === 'sequence'
          ? sequence(
              (innerDesc.options?.animations ?? []).map((s) =>
                buildAnimation(mv, s)
              ),
              innerDesc.options
            )
          : buildAnimation(mv, innerDesc);

      return loop(innerCtrl, options.iterations ?? 0, options);
    }

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
