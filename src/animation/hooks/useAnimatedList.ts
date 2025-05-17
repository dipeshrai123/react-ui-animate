import { useRef, useState, useLayoutEffect } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { UseMountConfig } from './useMount';
import { Value } from '../Value';

export type AnimatedItem<T> = {
  key: string;
  item: T;
  animation: MotionValue<number>;
};

export function useAnimatedList<T>(
  items: T[],
  getKey: (item: T) => string,
  config?: UseMountConfig
): AnimatedItem<T>[] {
  const from = config?.from ?? 0;
  const enter = config?.enter ?? { type: 'spring', to: 1 };
  const exit = config?.exit ?? { type: 'spring', to: 0 };

  const itemsRef = useRef<Map<string, { value: Value<number>; item: T }>>(
    new Map()
  );
  const [, forceUpdate] = useState(0);

  useLayoutEffect(() => {
    const nextKeys = new Set(items.map(getKey));
    const newItems: AnimatedItem<T>[] = [];

    items.forEach((item) => {
      const key = getKey(item);
      if (!itemsRef.current.has(key)) {
        const value = new Value(from);
        value.set(enter);
        itemsRef.current.set(key, { value, item });
        newItems.push({ key, item, animation: value.value });
      } else {
        itemsRef.current.get(key)!.item = item;
      }
    });

    if (newItems.length > 0) {
      forceUpdate((c) => c + 1);
    }

    itemsRef.current.forEach(({ value }, key) => {
      if (!nextKeys.has(key)) {
        value.set({
          ...exit,
          options: {
            ...exit.options,
            onComplete: () => {
              itemsRef.current.delete(key);
              forceUpdate((c) => c + 1);
              exit.options?.onComplete?.();
            },
          },
        });
      }
    });
  }, [items, getKey, from, enter, exit]);

  return Array.from(itemsRef.current.entries()).map(
    ([key, { value, item }]) => ({
      key,
      item,
      animation: value.value,
    })
  );
}
