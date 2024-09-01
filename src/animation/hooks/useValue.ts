import { useCallback, useLayoutEffect, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { useFluidValue } from '../core/useFluidValue';
import { AnimationConfig } from '../animationType';

import type { UpdateValue, UseFluidValueConfig } from '../core/FluidController';
import { getToValue } from '../helpers';

export interface UseAnimatedValueConfig extends UseFluidValueConfig {}

/**
 * `useAnimatedValue` returns an animation value with `.value` and `.currentValue` property which is
 * initialized when passed to argument (`initialValue`). The returned value persist until the lifetime of
 * a component. It doesn't cast any re-renders which can is very good for performance optimization.
 *
 * @param { number } initialValue - Initial value
 * @param { UseAnimatedValueConfig } config - Animation configuration object.
 */
export function useAnimatedValue<T extends number>(
  initialValue: T,
  config?: UseAnimatedValueConfig
) {
  const isInitialRender = useRef(true);
  const [animation, setAnimation] = useFluidValue(initialValue, {
    ...AnimationConfig.EASE,
    ...config,
  });

  const updateAnimation = useCallback((value: number | UpdateValue) => {
    queueMicrotask(() => setAnimation(getToValue(value)));
  }, []);

  useLayoutEffect(() => {
    if (!isInitialRender.current) {
      updateAnimation(initialValue);
    }

    isInitialRender.current = false;
  }, [initialValue, config]);

  return {
    set value(to: number | UpdateValue) {
      updateAnimation(to);
    },
    get value(): FluidValue {
      return animation;
    },
    get currentValue() {
      return animation.get();
    },
  };
}
