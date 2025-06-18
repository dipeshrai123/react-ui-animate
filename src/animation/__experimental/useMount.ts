import { useLayoutEffect, useState } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { useValue } from './useValue';
import { isDescriptor } from './helpers';
import { withSpring, type Descriptor } from './descriptors';
import type { Primitive } from '../types';

type Base = Primitive | Primitive[] | Record<string, Primitive>;

export function useMount(
  isOpen: boolean,
  config?: { from?: Base; enter?: Base; exit?: Base }
): (
  fn: (value: MotionValue<number>, mounted: boolean) => React.ReactNode
) => React.ReactNode;

export function useMount<I extends Record<string, number>>(
  isOpen: boolean,
  config: {
    from: I;
    enter?: Base | Descriptor;
    exit?: Base | Descriptor;
  }
): (
  fn: (
    values: Record<keyof I, MotionValue<number>>,
    mounted: boolean
  ) => React.ReactNode
) => React.ReactNode;

export function useMount(isOpen: boolean, config: any = {}) {
  const [mounted, setMounted] = useState(isOpen);

  const from = config.from;
  const enter = config.enter;
  const exit = config.exit;
  const isMulti = typeof config.from === 'object';

  const [values, setValues] = useValue(from);

  useLayoutEffect(() => {
    if (isOpen) {
      setMounted(true);
      queueMicrotask(() => {
        setValues(isDescriptor(enter) ? enter : withSpring(enter));
      });
    } else {
      queueMicrotask(() => {
        setValues(
          isDescriptor(exit)
            ? {
                ...exit,
                options: {
                  ...exit.options,
                  onComplete: () => {
                    exit.options?.onComplete?.();
                    setMounted(false);
                  },
                },
              }
            : withSpring(exit, {
                onComplete() {
                  setMounted(false);
                },
              })
        );
      });
    }
  }, [isOpen, JSON.stringify(enter), JSON.stringify(exit)]);

  if (!isMulti) {
    const single = (values as any).value as MotionValue<number>;
    return (fn: (v: MotionValue<number>, m: boolean) => React.ReactNode) =>
      fn(single, mounted);
  }

  return (
    fn: (
      vals: Record<string, MotionValue<number>>,
      m: boolean
    ) => React.ReactNode
  ) => fn(values as any, mounted);
}
