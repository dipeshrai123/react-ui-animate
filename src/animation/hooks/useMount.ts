import { useLayoutEffect, useState } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { withSpring } from '../descriptors';
import { isDescriptor } from '../helpers';
import type { Primitive, Descriptor } from '../types';
import { useValue } from './useValue';

export type ConfigSingle<T extends Primitive> = {
  from?: T;
  enter?: T | Descriptor;
  exit?: T | Descriptor;
};

export type ConfigMulti<I extends Record<string, Primitive>> = {
  from: I;
  enter?: I | Descriptor;
  exit?: I | Descriptor;
};

export function useMount<T extends Primitive = number>(
  isOpen: boolean,
  config?: ConfigSingle<T>
): (
  fn: (value: MotionValue<T>, mounted: boolean) => React.ReactNode
) => React.ReactNode;

export function useMount<I extends Record<string, Primitive>>(
  isOpen: boolean,
  config: ConfigMulti<I>
): (
  fn: (
    values: { [K in keyof I]: MotionValue<I[K]> },
    mounted: boolean
  ) => React.ReactNode
) => React.ReactNode;

export function useMount(
  isOpen: boolean,
  config: any = {}
): (fn: (values: any, mounted: boolean) => React.ReactNode) => React.ReactNode {
  const [mounted, setMounted] = useState(isOpen);

  const from = config.from ?? 0;
  const enter = config.enter ?? 1;
  const exit = config.exit ?? 0;

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

  return (fn: (vals: any, m: boolean) => React.ReactNode) =>
    fn(values as any, mounted);
}
