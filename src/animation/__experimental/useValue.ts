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

type To = Primitive | Primitive[] | Record<string, Primitive>;

export function useValue<T extends To>(
  initial: T
): [ValueReturn<T>, (to: To | Descriptor) => void] {
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

  function set(to: To | Descriptor) {
    if (Array.isArray(initial)) {
      handleArray(value as MotionValue<Primitive>[], to);
    } else if (typeof initial === 'object') {
      handleObject(value as Record<string, MotionValue<Primitive>>, to);
    } else {
      handlePrimitive(value as MotionValue<Primitive>, to);
    }
  }

  return [value, set] as const;
}

function handlePrimitive(mv: MotionValue<Primitive>, to: any) {
  if (typeof to === 'number' || typeof to === 'string') {
    mv.set(to);
    return;
  }

  if (to.type === 'sequence') {
    const ctrls = to.animations.map((step: any) => buildAnimation(mv, step));
    sequence(ctrls).start();
  } else if (to.type === 'loop') {
    // build inner once, then wrap in loop
    const innerCtrl =
      to.animation.type === 'sequence'
        ? sequence(
            to.animation.animations.map((s: any) => buildAnimation(mv, s))
          )
        : buildAnimation(mv, to.animation);
    loop(innerCtrl, to.options.iterations).start();
  } else {
    // spring / timing / decay / delay
    buildAnimation(mv, to).start();
  }
}

function handleArray(mvs: MotionValue<Primitive>[], to: any) {
  mvs.forEach((mv, i) => {
    if (Array.isArray(to)) {
      mv.set(to[i]);
    } else if (to.type === 'sequence') {
      const ctrls = to.animations.map((step: any) =>
        buildAnimation(mv, {
          ...step,
          to:
            step.type !== 'decay' && Array.isArray(step.to)
              ? step.to[i]
              : step.to,
        })
      );
      sequence(ctrls).start();
    } else if (to.type === 'loop') {
      const inner = to.animation;
      const innerCtrl =
        inner.type === 'sequence'
          ? sequence(
              inner.animations.map((step: any) =>
                buildAnimation(mv, {
                  ...step,
                  to:
                    step.type !== 'decay' && Array.isArray(step.to)
                      ? step.to[i]
                      : step.to,
                })
              )
            )
          : buildAnimation(mv, {
              ...inner,
              to:
                inner.type !== 'decay' && Array.isArray(inner.to)
                  ? inner.to[i]
                  : inner.to,
            });
      loop(innerCtrl, to.options.iterations).start();
    } else {
      // single spring/timing/decay/delay
      buildAnimation(mv, {
        ...to,
        to: to.type !== 'decay' && Array.isArray(to.to) ? to.to[i] : to.to,
      }).start();
    }
  });
}

function handleObject(mvs: Record<string, MotionValue<Primitive>>, to: any) {
  if (to.type === 'sequence') {
    const steps = to.animations.map((step: any) => {
      if (step.type === 'delay') {
        return delay(step.options.delay);
      }
      return buildParallel(mvs, step);
    });
    sequence(steps).start();
    return;
  }

  Object.entries(mvs).forEach(([key, mv], idx) => {
    if (to.hasOwnProperty(key)) {
      mv.set(to[key]);
    } else if (to.type === 'loop') {
      const inner = to.animation;
      const innerCtrl =
        inner.type === 'sequence'
          ? sequence(
              inner.animations.map((s: any) =>
                buildParallel(mvs, {
                  ...s,
                  to: s.to,
                })
              )
            )
          : buildAnimation(mv, { ...inner, to: inner.to[key] ?? inner.to });
      loop(innerCtrl, to.options.iterations).start();
    } else {
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
        to: to.to[key] ?? to.to,
      }).start();
    }
  });
}
