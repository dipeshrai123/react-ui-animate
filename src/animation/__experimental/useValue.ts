import { useMemo } from 'react';
import { delay, sequence, loop, MotionValue } from '@raidipesh78/re-motion';

import { buildAnimation, buildParallel } from './drivers';
import { filterCallbackOptions } from './helpers';
import type { Primitive } from '../types';
import type { Descriptor } from './descriptors';

type Widen<T> = T extends number ? number : T extends string ? string : T;

type ValueReturn<T> = T extends Primitive
  ? MotionValue<Widen<T>>
  : T extends Primitive[]
  ? MotionValue<Widen<Primitive>>[]
  : { [K in keyof T]: MotionValue<Widen<T[K]>> };

type Base = Primitive | Primitive[] | Record<string, Primitive>;

export function useValue<T extends Base>(
  initial: T
): [ValueReturn<T>, (to: Base | Descriptor) => void] {
  const value = useMemo(() => {
    if (Array.isArray(initial)) {
      return initial.map((v) => new MotionValue(v));
    }

    if (typeof initial === 'object') {
      return Object.fromEntries(
        Object.entries(initial).map(([k, v]) => [k, new MotionValue(v)])
      );
    }

    return new MotionValue(initial);
  }, [initial]) as ValueReturn<T>;

  function set(to: Base | Descriptor) {
    if (Array.isArray(initial)) {
      handleArray(
        value as Array<MotionValue<Primitive>>,
        to as Primitive[] | Descriptor
      );
    } else if (typeof initial === 'object') {
      handleObject(
        value as Record<string, MotionValue<Primitive>>,
        to as Record<string, Primitive> | Descriptor
      );
    } else {
      handlePrimitive(
        value as MotionValue<Primitive>,
        to as Primitive | Descriptor
      );
    }
  }

  return [value, set] as const;
}

function handlePrimitive(
  mv: MotionValue<Primitive>,
  to: Primitive | Descriptor
) {
  if (typeof to === 'number' || typeof to === 'string') {
    mv.set(to);
    return;
  }

  if (to.type === 'sequence') {
    const animations = to.options?.animations ?? [];
    const ctrls = animations.map((step) => buildAnimation(mv, step));
    sequence(ctrls).start();
    return;
  }

  if (to.type === 'loop') {
    const animation = to.options?.animation;
    if (!animation) return;

    if (animation.type === 'sequence') {
      const animations = animation.options?.animations ?? [];
      const ctrls = animations.map((step) => buildAnimation(mv, step));
      loop(sequence(ctrls), to.options?.iterations ?? 0).start();
      return;
    }

    loop(buildAnimation(mv, animation), to.options?.iterations ?? 0).start();
    return;
  }

  buildAnimation(mv, to).start();
}

function handleArray(
  mvs: Array<MotionValue<Primitive>>,
  to: Primitive[] | Descriptor
) {
  mvs.forEach((mv, i) => {
    if (Array.isArray(to)) {
      mv.set(to[i]);
      return;
    }

    if (to.type === 'sequence') {
      const animations = to.options?.animations ?? [];
      const ctrls = animations.map((step) =>
        buildAnimation(mv, {
          ...step,
          to:
            step.type !== 'decay' && Array.isArray(step.to)
              ? step.to[i]
              : step.to,
        })
      );
      sequence(ctrls).start();
      return;
    }

    if (to.type === 'loop') {
      const inner = to.options?.animation;
      if (!inner) return;

      if (inner.type === 'sequence') {
        const animations = inner.options?.animations ?? [];
        const ctrls = animations.map((step) =>
          buildAnimation(mv, {
            ...step,
            to:
              step.type !== 'decay' && Array.isArray(step.to)
                ? step.to[i]
                : step.to,
          })
        );

        loop(sequence(ctrls), to.options?.iterations ?? 0).start();
        return;
      }

      const ctrl = buildAnimation(mv, {
        ...inner,
        to:
          inner.type !== 'decay' && Array.isArray(inner.to)
            ? inner.to[i]
            : inner.to,
      });
      loop(ctrl, to.options?.iterations ?? 0).start();
      return;
    }

    buildAnimation(mv, {
      ...to,
      to: to.type !== 'decay' && Array.isArray(to.to) ? to.to[i] : to.to,
    }).start();
  });
}

function isDescriptor(x: unknown): x is Descriptor {
  return (
    typeof x === 'object' &&
    x !== null &&
    'type' in x &&
    typeof (x as any).type === 'string'
  );
}

function handleObject(
  mvs: Record<string, MotionValue<Primitive>>,
  to: Record<string, Primitive> | Descriptor
) {
  if ('type' in to && to.type === 'sequence' && isDescriptor(to)) {
    const animations = to.options?.animations ?? [];
    const ctrls = animations.map((step) => {
      if (step.type === 'delay') {
        return delay(step.options?.delay ?? 0);
      }

      return buildParallel(mvs, step);
    });

    sequence(ctrls).start();
    return;
  }

  Object.entries(mvs).forEach(([key, mv], idx) => {
    if (!('type' in to) && to.hasOwnProperty(key)) {
      mv.set(to[key]);
      return;
    }

    if (!isDescriptor(to)) {
      return;
    }

    if (to.type === 'loop') {
      const inner = to.options?.animation;
      if (!inner) return;

      if (inner.type === 'sequence') {
        const animations = inner.options?.animations ?? [];
        const ctrls = animations.map((s) =>
          buildParallel(mvs, {
            ...s,
            to: s.to,
          })
        );
        loop(sequence(ctrls), to.options?.iterations ?? 0).start();
        return;
      }

      loop(
        buildAnimation(mv, {
          ...inner,
          to: (inner.to as Record<string, Primitive>)[key] ?? inner.to,
        }),
        to.options?.iterations ?? 0
      ).start();
      return;
    }

    if (to.type === 'decay') {
      buildAnimation(mv, {
        ...to,
        options: filterCallbackOptions(to.options, idx === 0),
      }).start();
      return;
    }

    buildAnimation(mv, {
      ...to,
      options: filterCallbackOptions(to.options, idx === 0),
      to: (to.to as Record<string, Primitive>)[key] ?? to.to,
    }).start();
  });
}
