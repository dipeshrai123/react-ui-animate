import { useLayoutEffect, useRef } from 'react';

import { useFluidValue } from './core/useFluidValue';
import { AnimationConfigUtils } from './animationType';

import type { UseFluidValueConfig } from './core/FluidController';

export interface UseAnimatedValueConfig extends UseFluidValueConfig {}

type AssignValue = {
  toValue?: number;
  config?: UseAnimatedValueConfig;
};

export type UpdateValue =
  | AssignValue
  | ((update: (next: AssignValue) => Promise<any>) => void);

/**
 * `useAnimatedValue` returns an animation value with `.value` and `.currentValue` property which is
 * initialized when passed to argument (`initialValue`). The returned value persist until the lifetime of
 * a component. It doesn't cast any re-renders which can is very good for performance optimization.
 *
 * @param { string | number } initialValue - Initial value
 * @param { UseAnimatedValueConfig } config - Animation configuration object.
 */
export function useAnimatedValue(
  initialValue: number,
  config?: UseAnimatedValueConfig
) {
  const isInitialRender = useRef(true);
  const [animation, setAnimation] = useFluidValue(initialValue, {
    ...AnimationConfigUtils.EASE,
    ...config,
  });

  const targetObject: {
    value: any;
    currentValue: number;
  } = {
    value: animation,
    currentValue: animation.get(),
  };

  useLayoutEffect(() => {
    if (!isInitialRender.current) {
      setAnimation(
        typeof initialValue === 'number'
          ? { toValue: initialValue }
          : initialValue
      );
    }

    isInitialRender.current = false;
  }, [initialValue, config]);

  return new Proxy(targetObject, {
    set: function (_, key, value: number | UpdateValue) {
      if (key === 'value') {
        if (typeof value === 'number') {
          queueMicrotask(() => setAnimation({ toValue: value }));
        } else if (typeof value === 'function' || typeof value === 'object') {
          queueMicrotask(() => setAnimation(value));
        }

        return true;
      }

      throw new Error('You cannot set any other property to animation node.');
    },
    get: function (_, key) {
      if (key === 'value') {
        return animation;
      }

      if (key === 'currentValue') {
        return animation.get();
      }

      throw new Error(
        'You cannot access any other property from animation node.'
      );
    },
  });
}
