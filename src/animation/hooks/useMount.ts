import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimateValue } from '../../core';

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
  fn: (value: AnimateValue<T>, mounted: boolean) => React.ReactNode
) => React.ReactNode;

export function useMount<I extends Record<string, Primitive>>(
  isOpen: boolean,
  config: ConfigMulti<I>
): (
  fn: (
    values: { [K in keyof I]: AnimateValue<I[K]> },
    mounted: boolean
  ) => React.ReactNode
) => React.ReactNode;

export function useMount(
  isOpen: boolean,
  config: any = {}
): (fn: (values: any, mounted: boolean) => React.ReactNode) => React.ReactNode {
  const { from = 0, enter = 1, exit = 0 } = config as any;

  const [mounted, setMounted] = useState(isOpen);
  const initial = useRef(true);
  const [values, setValues] = useValue(from);

  const enterDesc = useMemo(
    () => (isDescriptor(enter) ? enter : withSpring(enter)),
    [enter]
  );

  const exitDesc = useMemo(() => {
    if (isDescriptor(exit)) {
      return {
        ...exit,
        options: {
          ...exit.options,
          onComplete: () => {
            exit.options?.onComplete?.();
            setMounted(false);
          },
        },
      };
    }
    return withSpring(exit, { onComplete: () => setMounted(false) });
  }, [exit]);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      if (isOpen) {
        setMounted(true);
        queueMicrotask(() => setValues(enterDesc));
      }
      return;
    }

    if (isOpen) {
      setMounted(true);
      queueMicrotask(() => setValues(enterDesc));
    } else {
      queueMicrotask(() => setValues(exitDesc));
    }
  }, [isOpen]);

  return (fn) => fn(values as any, mounted);
}
