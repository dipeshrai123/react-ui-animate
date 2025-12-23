import { useMemo, useRef } from 'react';
import { delay, sequence, loop } from '../drivers';
import { AnimateValue } from '../values/AnimateValue';

import { buildAnimation, buildParallel } from '../drivers/builder';
import { filterCallbackOptions, isDescriptor } from '../helpers';
import type { Primitive, Descriptor, Controls } from '../types';

type Widen<T> = T extends number ? number : T extends string ? string : T;

type ValueReturn<T> = T extends Primitive
  ? AnimateValue<Widen<T>>
  : T extends Primitive[]
  ? AnimateValue<Widen<Primitive>>[]
  : { [K in keyof T]: AnimateValue<Widen<T[K]>> };

type Base = Primitive | Primitive[] | Record<string, Primitive>;

export function useValue<T extends Base>(
  initial: T
): [ValueReturn<T>, (to: Base | Descriptor) => void, Controls] {
  const controllerRef = useRef<Controls | null>(null);

  const value = useMemo(() => {
    if (Array.isArray(initial)) {
      return initial.map((v) => new AnimateValue(v));
    }

    if (typeof initial === 'object') {
      return Object.fromEntries(
        Object.entries(initial).map(([k, v]) => [k, new AnimateValue(v)])
      );
    }

    return new AnimateValue(initial);
  }, []) as ValueReturn<T>;

  function set(to: Base | Descriptor) {
    let ctrl: Controls | null = null;

    if (Array.isArray(initial)) {
      ctrl = handleArray(
        value as Array<AnimateValue<Primitive>>,
        to as Primitive[] | Descriptor
      );
    } else if (typeof initial === 'object') {
      ctrl = handleObject(
        value as Record<string, AnimateValue<Primitive>>,
        to as Record<string, Primitive> | Descriptor
      );
    } else {
      ctrl = handlePrimitive(
        value as AnimateValue<Primitive>,
        to as Primitive | Descriptor
      );
    }

    controllerRef.current = ctrl;
    if (ctrl) ctrl.start();
  }

  const controls = {
    start: () => controllerRef.current?.start(),
    pause: () => controllerRef.current?.pause(),
    resume: () => controllerRef.current?.resume(),
    cancel: () => controllerRef.current?.cancel(),
    reset: () => controllerRef.current?.reset(),
  };

  return [value, set, controls] as const;
}

function handlePrimitive(
  value: AnimateValue<Primitive>,
  to: Primitive | Descriptor
) {
  if (typeof to === 'number' || typeof to === 'string') {
    value.set(to);
    return null;
  }

  if (to.type === 'sequence') {
    const animations = to.options?.animations ?? [];
    const controllers = animations.map((step) => buildAnimation(value, step));
    return sequence(controllers, to.options);
  }

  if (to.type === 'loop') {
    const animation = to.options?.animation;
    if (!animation) return null;

    if (animation.type === 'sequence') {
      const animations = animation.options?.animations ?? [];
      const controllers = animations.map((step) => buildAnimation(value, step));
      return loop(sequence(controllers), to.options?.iterations ?? 0, to.options);
    }

    return loop(
      buildAnimation(value, animation),
      to.options?.iterations ?? 0,
      to.options
    );
  }

  return buildAnimation(value, to);
}

function handleArray(
  values: Array<AnimateValue<Primitive>>,
  to: Primitive[] | Descriptor
) {
  if (!isDescriptor(to)) {
    (to as Primitive[]).forEach((val, i) => {
      values[i]?.set(val);
    });
    return null;
  }

  const desc = to as Descriptor;

  const valuesRecord = Object.fromEntries(
    values.map((value, idx) => [idx.toString(), value])
  ) as Record<string, AnimateValue<Primitive>>;

  switch (desc.type) {
    case 'sequence': {
      const controllers = desc.options!.animations!.map((step) =>
        step.type === 'delay'
          ? delay(step.options?.delay ?? 0)
          : buildParallel(valuesRecord, {
              ...step,
              to: Array.isArray(step.to)
                ? Object.fromEntries(
                    (step.to as Primitive[]).map((v, i) => [i.toString(), v])
                  )
                : step.to,
            })
      );

      return sequence(controllers, desc.options);
    }

    case 'loop': {
      const inner = desc.options!.animation!;

      if (inner.type === 'sequence') {
        const seqControllers = inner.options!.animations!.map((step) =>
          buildParallel(valuesRecord, {
            ...step,
            to: Array.isArray(step.to)
              ? Object.fromEntries(
                  (step.to as Primitive[]).map((v, i) => [i.toString(), v])
                )
              : step.to,
          })
        );

        const seq = sequence(
          seqControllers,
          filterCallbackOptions(inner.options, true)
        );

        return loop(
          seq,
          desc.options!.iterations ?? 0,
          filterCallbackOptions(desc.options, true)
        );
      }

      const parallel = buildParallel(valuesRecord, inner);
      return loop(
        parallel,
        desc.options!.iterations ?? 0,
        filterCallbackOptions(desc.options, true)
      );
    }

    case 'decay':
      return buildParallel(valuesRecord, desc);

    default:
      return buildParallel(valuesRecord, desc);
  }
}

function handleObject(
  values: Record<string, AnimateValue<Primitive>>,
  to: Record<string, Primitive> | Descriptor
) {
  if (isDescriptor(to)) {
    switch (to.type) {
      case 'sequence': {
        const controllers = to.options!.animations!.map((step) =>
          step.type === 'delay'
            ? delay(step.options!.delay ?? 0)
            : buildParallel(values, step)
        );
        return sequence(controllers, to.options);
      }

      case 'loop': {
        const inner = to.options!.animation!;
        if (inner.type === 'sequence') {
          const controllers = inner.options!.animations!.map((step) =>
            buildParallel(values, step)
          );
          return loop(
            sequence(controllers, filterCallbackOptions(inner.options, true)),
            to.options!.iterations ?? 0,
            filterCallbackOptions(to.options, true)
          );
        }
        return loop(
          buildParallel(values, inner),
          to.options!.iterations ?? 0,
          filterCallbackOptions(to.options, true)
        );
      }

      case 'decay':
        return buildParallel(values, to);

      default:
        return buildParallel(values, to);
    }
  }

  Object.entries(to).forEach(([key, val]) => {
    values[key]?.set(val);
  });

  return null;
}
