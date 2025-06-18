import { useLayoutEffect, useState } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { useValue } from './useValue';
import { isDescriptor } from './helpers';
import { withSpring, type Descriptor } from './descriptors';
import type { Primitive } from '../types';

type Base = Primitive | Primitive[] | Record<string, Primitive>;

export function useMount<I extends Record<string, number>>(
  isOpen: boolean,
  config: {
    from: I;
    enter?: Base | Descriptor;
    exit?: Base | Descriptor;
  }
): (
  fn: (
    values: Record<keyof I, MotionValue<Primitive>>,
    mounted: boolean
  ) => React.ReactNode
) => React.ReactNode;

export function useMount(isOpen: boolean, config: any = {}) {
  const [mounted, setMounted] = useState(isOpen);

  const from = config.from;
  const enter = config.enter;
  const exit = config.exit;

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

  return (
    fn: (
      vals: Record<string, MotionValue<Primitive>>,
      m: boolean
    ) => React.ReactNode
  ) => fn(values as Record<string, MotionValue<Primitive>>, mounted);
}
