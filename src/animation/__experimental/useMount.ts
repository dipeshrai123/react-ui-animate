import { useLayoutEffect, useState } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { useValue } from './useValue';
import { withSpring, withTiming } from './descriptors';
import type { Descriptor } from './descriptors';

export function useMount(isOpen: boolean, config: any = {}) {
  const [mounted, setMounted] = useState(isOpen);

  const isMulti = typeof config.from === 'object' && config.from !== null;
  const fromObj: Record<string, number> = isMulti
    ? config.from
    : { value: config.from ?? 0 };

  const enterRaw: Record<string, any> = {};
  const exitRaw: Record<string, any> = {};

  Object.keys(fromObj).forEach((key) => {
    enterRaw[key] = isMulti ? config.enter?.[key] ?? 1 : config.enter ?? 1;
    exitRaw[key] = isMulti ? config.exit?.[key] ?? 0 : config.exit ?? 0;
  });

  const [values, setValues] = useValue(fromObj as any) as [
    Record<string, MotionValue<number>>,
    (to: Descriptor | Record<string, any>) => void
  ];

  useLayoutEffect(() => {
    if (isOpen) {
      setMounted(true);
      queueMicrotask(() => {
        setValues(withSpring(enterRaw));
      });
    } else {
      queueMicrotask(() => {
        setValues(
          withTiming(exitRaw, {
            duration: 5000,
            onComplete: () => {
              setMounted(false);
            },
          })
        );
      });
    }
  }, [isOpen, JSON.stringify(enterRaw), JSON.stringify(exitRaw)]);

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
