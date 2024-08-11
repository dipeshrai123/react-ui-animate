import { useCallback, useLayoutEffect, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { useFluidValue } from '../core/useFluidValue';
import { AnimationConfigUtils } from '../animationType';

import type { AssignValue, UseFluidValueConfig } from '../core/FluidController';
import { getToValue } from '../helpers';

export interface UseAnimatedValueConfig extends UseFluidValueConfig {}

type UpdateValue = number | AssignValue | number[] | AssignValue[];

/**
 * `useAnimatedValue` returns an animation value with `.value` and `.currentValue` property which is
 * initialized when passed to argument (`initialValue`). The returned value persist until the lifetime of
 * a component. It doesn't cast any re-renders which can is very good for performance optimization.
 *
 * @param { number | number[] } initialValue - Initial value
 * @param { UseAnimatedValueConfig } config - Animation configuration object.
 */
export function useAnimatedValue<T extends number | number[]>(
  initialValue: T,
  config?: UseAnimatedValueConfig
) {
  const isInitialRender = useRef(true);
  const [animation, setAnimation] = useFluidValue(initialValue, {
    ...AnimationConfigUtils.EASE,
    ...config,
  });

  const updateAnimation = useCallback((value: UpdateValue | UpdateValue[]) => {
    type AnimationType = T extends number ? AssignValue : AssignValue[];

    const updatedValue = Array.isArray(value)
      ? (value.map((v) => getToValue(v)) as AnimationType)
      : (getToValue(value) as AnimationType);

    queueMicrotask(() => setAnimation(updatedValue));
  }, []);

  useLayoutEffect(() => {
    if (!isInitialRender.current) {
      updateAnimation(initialValue);
    }

    isInitialRender.current = false;
  }, [initialValue, config]);

  return {
    set value(to: UpdateValue | UpdateValue[]) {
      updateAnimation(to);
    },
    get value(): T extends number ? FluidValue : FluidValue[] {
      return animation;
    },
    get currentValue() {
      return Array.isArray(animation)
        ? animation.map((a) => a.get())
        : animation.get();
    },
  };
}
