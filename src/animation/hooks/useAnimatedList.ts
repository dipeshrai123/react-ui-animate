import { useLayoutEffect, useRef, useState } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';
import { Value } from '../Value';
import { withSpring } from '../controllers';
import type { DriverConfig } from '../types';

/**
 * Configuration for mount/unmount animations
 */
export interface UseAnimatedListConfig {
  /** Initial value for each item's animation */
  from?: number;
  /** Animation to apply when an item enters */
  enter?: DriverConfig;
  /** Animation to apply when an item exits */
  exit?: DriverConfig;
}

/**
 * An animated list item with direct animation prop
 */
export type AnimatedListItem<T> = {
  /** Unique key for the item */
  key: string;
  /** The original item */
  item: T;
  /**
   * The MotionValue driving this item's animation.
   * - For enter: animates from `from` to `enter`
   * - For exit: animates from current to `exit` then item is removed
   */
  animation: MotionValue<number>;
};

/**
 * Hook that animates a list of items on enter/exit.
 * New items play the 'enter' animation immediately,
 * removed items play the 'exit' animation before being removed.
 */
export function useAnimatedList<T>(
  items: T[],
  getKey: (item: T) => string,
  config?: UseAnimatedListConfig
): AnimatedListItem<T>[] {
  // Defaults for from, enter, exit
  const fromVal = config?.from ?? 0;
  const enterCfg = config?.enter ?? withSpring(1);
  const exitCfg = config?.exit ?? withSpring(0);

  // Store map of key -> { value, item }
  const itemsRef = useRef(new Map<string, { value: Value<number>; item: T }>());
  const [, forceUpdate] = useState(0);

  useLayoutEffect(() => {
    const nextKeys = new Set(items.map(getKey));

    // 1. Add and animate new items
    for (const item of items) {
      const key = getKey(item);
      if (!itemsRef.current.has(key)) {
        const val = new Value<number>(fromVal);
        val.set(enterCfg);
        itemsRef.current.set(key, { value: val, item });
        forceUpdate((c) => c + 1);
      } else {
        // Update the stored item data
        itemsRef.current.get(key)!.item = item;
      }
    }

    // 2. Animate and remove old items
    itemsRef.current.forEach(({ value }, key) => {
      if (!nextKeys.has(key)) {
        value.set({
          ...exitCfg,
          options: {
            ...exitCfg.options,
            onComplete: () => {
              itemsRef.current.delete(key);
              forceUpdate((c) => c + 1);
              exitCfg.options?.onComplete?.();
              value.destroy();
            },
          },
        });
      }
    });
  }, [items, getKey, config?.from, config?.enter, config?.exit]);

  // Return array of AnimatedListItem
  return Array.from(itemsRef.current.entries()).map(
    ([key, { value, item }]) => ({
      key,
      item,
      animation: value.value,
    })
  );
}
