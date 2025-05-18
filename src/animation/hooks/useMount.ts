import { useLayoutEffect, useState } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { withSpring } from '../controllers';
import { useValue } from './useValue';
import type { DriverConfig, ToValue } from '../types';

export function useMount(
  isOpen: boolean,
  config?: { from?: number; enter?: ToValue<number>; exit?: ToValue<number> }
): (
  fn: (value: MotionValue<number>, mounted: boolean) => React.ReactNode
) => React.ReactNode;

export function useMount<I extends Record<string, number>>(
  isOpen: boolean,
  config: {
    from: I;
    enter?: Partial<Record<keyof I, ToValue<number>>>;
    exit?: Partial<Record<keyof I, ToValue<number>>>;
  }
): (
  fn: (
    values: Record<keyof I, MotionValue<number>>,
    mounted: boolean
  ) => React.ReactNode
) => React.ReactNode;

export function useMount(isOpen: boolean, config: any = {}) {
  const [mounted, setMounted] = useState(isOpen);

  const isMulti = typeof config.from === 'object' && config.from !== null;
  const fromObj: Record<string, number> = isMulti
    ? config.from
    : { value: config.from ?? 0 };

  const enterRaw: Record<string, ToValue<number>> = {};
  const exitRaw: Record<string, ToValue<number>> = {};
  Object.keys(fromObj).forEach((key) => {
    enterRaw[key] = isMulti ? config.enter?.[key] : config.enter;
    if (enterRaw[key] == null) enterRaw[key] = 1;

    exitRaw[key] = isMulti ? config.exit?.[key] : config.exit;
    if (exitRaw[key] == null) exitRaw[key] = 0;
  });

  const [values, setValues] = useValue(fromObj) as [
    Record<string, MotionValue<number>>,
    (to: Record<string, ToValue<number> | DriverConfig>) => void
  ];

  useLayoutEffect(() => {
    const keys = Object.keys(fromObj);

    if (isOpen) {
      setMounted(true);
      queueMicrotask(() => {
        const drivers: Record<string, DriverConfig> = {};
        keys.forEach((key) => {
          const param = enterRaw[key]!;
          drivers[key] =
            typeof param === 'object' && 'type' in param
              ? (param as DriverConfig)
              : withSpring(param as number);
        });
        setValues(drivers);
      });
    } else {
      queueMicrotask(() => {
        const drivers: Record<string, DriverConfig> = {};
        keys.forEach((key, i) => {
          const param = exitRaw[key]!;
          const base =
            typeof param === 'object' && 'type' in param
              ? (param as DriverConfig)
              : withSpring(param as number);

          drivers[key] = {
            ...base,
            options: {
              ...base.options,
              onComplete: () => {
                if (i === keys.length - 1) {
                  setMounted(false);
                  base.options?.onComplete?.();
                }
              },
            },
          };
        });
        setValues(drivers);
      });
    }
  }, [isOpen, JSON.stringify(enterRaw), JSON.stringify(exitRaw)]);

  if (!isMulti) {
    const single = values['value'] as MotionValue<number>;
    return (fn: (v: MotionValue<number>, m: boolean) => React.ReactNode) =>
      fn(single, mounted);
  }

  return (
    fn: (
      vals: Record<string, MotionValue<number>>,
      m: boolean
    ) => React.ReactNode
  ) => fn(values, mounted);
}
