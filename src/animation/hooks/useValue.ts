import { useCallback, useLayoutEffect, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { useFluidValue } from '../core/useFluidValue';
import { getToValue, AnimationConfig } from '../helpers';

import type { UpdateValue, UseFluidValueConfig } from '../core/FluidController';

export interface UseValueConfig extends UseFluidValueConfig {}

/**
 * `useValue` returns an animation value with `.value` and `.currentValue` property which is
 * initialized when passed to argument (`initialValue`). The returned value persist until the lifetime of
 * a component. It doesn't cast any re-renders which can is very good for performance optimization.
 *
 * @param { number } initialValue - Initial value
 * @param { UseValueConfig } config - Animation configuration object.
 */
export function useValue<T extends number>(
  initialValue: T,
  config?: UseValueConfig
) {
  const isInitialRender = useRef(true);
  const [animation, setAnimation] = useFluidValue(initialValue, {
    ...AnimationConfig.EASE,
    ...config,
  });

  const updateAnimation = useCallback(
    (value: number | UpdateValue | number[] | UpdateValue[]) => {
      if (Array.isArray(value)) {
        queueMicrotask(() => setAnimation(value.map((v) => getToValue(v))));
      } else {
        queueMicrotask(() => setAnimation(getToValue(value)));
      }
    },
    []
  );

  useLayoutEffect(() => {
    if (!isInitialRender.current) {
      updateAnimation(initialValue);
    }

    isInitialRender.current = false;
  }, [initialValue, config]);

  return {
    set value(to: number | UpdateValue | number[] | UpdateValue[]) {
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
