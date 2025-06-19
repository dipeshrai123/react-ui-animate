import { useMemo, useRef } from 'react';
import { delay, sequence, loop, MotionValue } from '@raidipesh78/re-motion';

import { buildAnimation, buildParallel } from './drivers';
import { filterCallbackOptions, isDescriptor } from './helpers';
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
  const activeCtrl = useRef<ReturnType<typeof sequence> | null>(null);

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
  }, []) as ValueReturn<T>;

  function set(to: Base | Descriptor) {
    activeCtrl.current?.cancel?.();
    activeCtrl.current = null;

    let ctrl: any = null;

    if (Array.isArray(initial)) {
      ctrl = handleArray(
        value as Array<MotionValue<Primitive>>,
        to as Primitive[] | Descriptor
      );
    } else if (typeof initial === 'object') {
      ctrl = handleObject(
        value as Record<string, MotionValue<Primitive>>,
        to as Record<string, Primitive> | Descriptor
      );
    } else {
      ctrl = handlePrimitive(
        value as MotionValue<Primitive>,
        to as Primitive | Descriptor
      );
    }

    if (ctrl) {
      activeCtrl.current = ctrl;
      ctrl.start();
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
    return sequence(ctrls, to.options);
  }

  if (to.type === 'loop') {
    const animation = to.options?.animation;
    if (!animation) return;

    if (animation.type === 'sequence') {
      const animations = animation.options?.animations ?? [];
      const ctrls = animations.map((step) => buildAnimation(mv, step));
      return loop(sequence(ctrls), to.options?.iterations ?? 0, to.options);
    }

    return loop(
      buildAnimation(mv, animation),
      to.options?.iterations ?? 0,
      to.options
    );
  }

  return buildAnimation(mv, to);
}

function handleArray(
  mvs: Array<MotionValue<Primitive>>,
  to: Primitive[] | Descriptor
) {
  if (!isDescriptor(to)) {
    (to as Primitive[]).forEach((val, i) => {
      mvs[i]?.set(val);
    });
    return null;
  }

  const desc = to as Descriptor;

  const mvsRecord = Object.fromEntries(
    mvs.map((mv, idx) => [idx.toString(), mv])
  ) as Record<string, MotionValue<Primitive>>;

  switch (desc.type) {
    case 'sequence': {
      const ctrls = desc.options!.animations!.map((step) =>
        step.type === 'delay'
          ? delay(step.options?.delay ?? 0)
          : buildParallel(mvsRecord, {
              ...step,
              to: Array.isArray(step.to)
                ? Object.fromEntries(
                    (step.to as Primitive[]).map((v, i) => [i.toString(), v])
                  )
                : step.to,
            })
      );

      return sequence(ctrls, desc.options);
    }

    case 'loop': {
      const inner = desc.options!.animation!;

      if (inner.type === 'sequence') {
        const seqCtrls = inner.options!.animations!.map((step) =>
          buildParallel(mvsRecord, {
            ...step,
            to: Array.isArray(step.to)
              ? Object.fromEntries(
                  (step.to as Primitive[]).map((v, i) => [i.toString(), v])
                )
              : step.to,
          })
        );

        const seq = sequence(
          seqCtrls,
          filterCallbackOptions(inner.options, true)
        );

        return loop(
          seq,
          desc.options!.iterations ?? 0,
          filterCallbackOptions(desc.options, true)
        );
      }

      const par = buildParallel(mvsRecord, inner);
      return loop(
        par,
        desc.options!.iterations ?? 0,
        filterCallbackOptions(desc.options, true)
      );
    }

    case 'decay':
      return buildParallel(mvsRecord, desc);

    default:
      return buildParallel(mvsRecord, desc);
  }
}

function handleObject(
  mvs: Record<string, MotionValue<Primitive>>,
  to: Record<string, Primitive> | Descriptor
) {
  if (isDescriptor(to)) {
    switch (to.type) {
      case 'sequence': {
        const ctrls = to.options!.animations!.map((step) =>
          step.type === 'delay'
            ? delay(step.options!.delay ?? 0)
            : buildParallel(mvs, step)
        );
        return sequence(ctrls, to.options);
      }

      case 'loop': {
        const inner = to.options!.animation!;
        if (inner.type === 'sequence') {
          const ctrls = inner.options!.animations!.map((s) =>
            buildParallel(mvs, s)
          );
          return loop(
            sequence(ctrls, filterCallbackOptions(inner.options, true)),
            to.options!.iterations ?? 0,
            filterCallbackOptions(to.options, true)
          );
        }
        return loop(
          buildParallel(mvs, inner),
          to.options!.iterations ?? 0,
          filterCallbackOptions(to.options, true)
        );
      }

      case 'decay':
        return buildParallel(mvs, to);

      default:
        return buildParallel(mvs, to);
    }
  }

  Object.entries(to).forEach(([k, v]) => {
    mvs[k]?.set(v);
  });

  return null;
}
