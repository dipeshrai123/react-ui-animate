import { useLayoutEffect, useRef, useState } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { Value } from '../Value';
import { withSpring } from '../controllers';
import type { DriverConfig } from '../types';

interface UseAnimatedListConfigSingle {
  from?: number;
  enter?: DriverConfig;
  exit?: DriverConfig;
}

interface UseAnimatedListConfigMulti<I extends Record<string, number>> {
  from: I;
  enter?: Partial<Record<keyof I, DriverConfig>>;
  exit?: Partial<Record<keyof I, DriverConfig>>;
}

export function useAnimatedList<T>(
  items: T[],
  getKey: (item: T) => string,
  config?: UseAnimatedListConfigSingle
): Array<{ key: string; item: T; animation: MotionValue<number> }>;

export function useAnimatedList<T, I extends Record<string, number>>(
  items: T[],
  getKey: (item: T) => string,
  config: UseAnimatedListConfigMulti<I>
): Array<{
  key: string;
  item: T;
  animation: Record<keyof I, MotionValue<number>>;
}>;

export function useAnimatedList(
  items: any[],
  getKey: (item: any) => string,
  config: any = {}
) {
  const isMulti = typeof config.from === 'object' && config.from !== null;
  const fromObj: Record<string, number> = isMulti
    ? config.from
    : { value: config.from ?? 0 };

  const enterObj: Record<string, DriverConfig> = {};
  const exitObj: Record<string, DriverConfig> = {};
  Object.keys(fromObj).forEach((key) => {
    enterObj[key] =
      (isMulti ? config.enter?.[key] : config.enter) ?? withSpring(1);
    exitObj[key] =
      (isMulti ? config.exit?.[key] : config.exit) ?? withSpring(0);
  });

  const itemsRef = useRef(
    new Map<string, { values: Record<string, Value<number>>; item: any }>()
  );
  const exitingRef = useRef(new Set<string>());
  const [, forceUpdate] = useState(0);

  useLayoutEffect(() => {
    const nextKeys = new Set(items.map(getKey));

    for (const item of items) {
      const key = getKey(item);
      if (!itemsRef.current.has(key)) {
        const values: Record<string, Value<number>> = {};
        Object.entries(fromObj).forEach(([prop, fromVal]) => {
          const val = new Value<number>(fromVal);
          val.set(enterObj[prop]);
          values[prop] = val;
        });
        itemsRef.current.set(key, { values, item });
        forceUpdate((c) => c + 1);
      } else {
        itemsRef.current.get(key)!.item = item;
      }
    }

    itemsRef.current.forEach(({ values }, key) => {
      if (!nextKeys.has(key) && !exitingRef.current.has(key)) {
        exitingRef.current.add(key);
        const props = Object.keys(values);
        props.forEach((prop, index) => {
          const base = exitObj[prop];
          values[prop].set({
            ...base,
            options: {
              ...base.options,
              onComplete: () => {
                if (index === props.length - 1) {
                  itemsRef.current.delete(key);
                  exitingRef.current.delete(key);
                  forceUpdate((c) => c + 1);
                  base.options?.onComplete?.();
                  values[prop].destroy();
                }
              },
            },
          });
        });
      }
    });
  }, [
    items,
    getKey,
    JSON.stringify(fromObj),
    JSON.stringify(enterObj),
    JSON.stringify(exitObj),
  ]);

  return Array.from(itemsRef.current.entries()).map(
    ([key, { values, item }]) => {
      if (!isMulti) {
        return {
          key,
          item,
          animation: values['value'].value,
        };
      }
      const animMap: Record<string, MotionValue<number>> = {};
      Object.entries(values).forEach(([prop, val]) => {
        animMap[prop] = val.value;
      });
      return {
        key,
        item,
        animation: animMap as Record<keyof any, MotionValue<number>>,
      };
    }
  );
}
