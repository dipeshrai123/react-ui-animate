import { useMemo, useRef } from 'react';
import { delay, sequence, loop, parallel } from '../drivers';
import { AnimateValue, isAnimateValue } from '../values/AnimateValue';

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

// The tuple return here is a grandfathered exception, not the pattern to
// copy — new hooks should return an object (see CONTRIBUTING.md).
export function useValue<T extends Base>(
  initial: T
): [
  ValueReturn<T>,
  (to: Base | Descriptor | AnimateValue<Primitive>) => void,
  Controls,
] {
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

  function set(to: Base | Descriptor | AnimateValue<Primitive>) {
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
        to as Primitive | Descriptor | AnimateValue<Primitive>
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
  to: Primitive | Descriptor | AnimateValue<Primitive>
) {
  // `setValue(otherAnimatedValue)` — snap-follow another AnimateValue with
  // no easing, mirroring its updates as they happen.
  if (isAnimateValue(to)) {
    return followValue(value, to);
  }

  if (typeof to === 'number' || typeof to === 'string') {
    value.set(to);
    return null;
  }

  // `setValue(withSpring(otherAnimatedValue))` / `withTiming(...)` — re-run
  // the driver toward the source's latest value every time it changes,
  // instead of animating to a single fixed target.
  if (isAnimateValue(to.to)) {
    return followValue(value, to.to as AnimateValue<Primitive>, to);
  }

  if (to.type === 'sequence') {
    const animations = to.options?.animations ?? [];
    const controllers = animations.map((step) => buildAnimation(value, step));
    return sequence(controllers, to.options);
  }

  if (to.type === 'loop') {
    return buildAnimation(value, to);
  }

  return buildAnimation(value, to);
}

// Drives `value` off of `source` for as long as the returned controls are
// active: every time `source` changes, either snap `value` to it directly
// (no `descriptor`) or restart the described animation (spring/timing, ...)
// toward the new target. Springs/timings inherit velocity/progress from
// their own previous run (see SpringController/TimingController), so
// re-triggering on each change reads as a smooth, continuous follow rather
// than a series of separate animations.
function followValue(
  value: AnimateValue<Primitive>,
  source: AnimateValue<Primitive>,
  descriptor?: Descriptor
): Controls {
  let unsubscribe: (() => void) | undefined;
  let inner: Controls | null = null;

  const runFor = (current: Primitive) => {
    if (!descriptor) {
      value.set(current);
      return;
    }

    inner = buildAnimation(value, { ...descriptor, to: current }) as Controls;
    inner.start();
  };

  return {
    start() {
      unsubscribe?.();
      unsubscribe = source.subscribe(runFor);
    },
    pause() {
      inner?.pause();
    },
    resume() {
      inner?.resume();
    },
    cancel() {
      unsubscribe?.();
      unsubscribe = undefined;
      inner?.cancel();
    },
    reset() {
      inner?.reset();
    },
  };
}

function buildParallelFromMap(
  values: Record<string, AnimateValue<Primitive>>,
  animations: Record<string, Descriptor> | Descriptor[]
) {
  const entries = Array.isArray(animations)
    ? animations.map((d, i) => [i.toString(), d] as const)
    : Object.entries(animations);

  return entries
    .filter(([key, desc]) => desc && values[key])
    .map(([key, desc]) => buildAnimation(values[key], desc));
}

function buildParallelStep(
  values: Record<string, AnimateValue<Primitive>>,
  step: Descriptor
) {
  return parallel(
    buildParallelFromMap(values, step.options?.parallel ?? {}),
    step.options
  );
}

function resolveMultiStep(
  values: Record<string, AnimateValue<Primitive>>,
  step: Descriptor
) {
  if (step.type === 'delay') return delay(step.options?.delay ?? 0);
  if (step.type === 'parallel') return buildParallelStep(values, step);
  return buildParallel(values, step);
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

  const resolveArrayStep = (step: Descriptor) => {
    if (step.type === 'delay') return delay(step.options?.delay ?? 0);
    if (step.type === 'parallel') return buildParallelStep(valuesRecord, step);
    return buildParallel(valuesRecord, {
      ...step,
      to: Array.isArray(step.to)
        ? Object.fromEntries(
            (step.to as Primitive[]).map((v, i) => [i.toString(), v])
          )
        : step.to,
    });
  };

  switch (desc.type) {
    case 'sequence': {
      const controllers = desc.options!.animations!.map(resolveArrayStep);
      return sequence(controllers, desc.options);
    }

    case 'loop': {
      const inner = desc.options!.animation!;

      if (inner.type === 'sequence') {
        const seqControllers = inner.options!.animations!.map(resolveArrayStep);

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

      const innerController =
        inner.type === 'parallel'
          ? buildParallelStep(valuesRecord, inner)
          : buildParallel(valuesRecord, inner);

      return loop(
        innerController,
        desc.options!.iterations ?? 0,
        filterCallbackOptions(desc.options, true)
      );
    }

    case 'parallel':
      return buildParallelStep(valuesRecord, desc);

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
          resolveMultiStep(values, step)
        );
        return sequence(controllers, to.options);
      }

      case 'loop': {
        const inner = to.options!.animation!;
        if (inner.type === 'sequence') {
          const controllers = inner.options!.animations!.map((step) =>
            resolveMultiStep(values, step)
          );
          return loop(
            sequence(controllers, filterCallbackOptions(inner.options, true)),
            to.options!.iterations ?? 0,
            filterCallbackOptions(to.options, true)
          );
        }
        return loop(
          resolveMultiStep(values, inner),
          to.options!.iterations ?? 0,
          filterCallbackOptions(to.options, true)
        );
      }

      case 'parallel':
        return buildParallelStep(values, to);

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
