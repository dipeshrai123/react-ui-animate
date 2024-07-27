import { useCallback, useLayoutEffect, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

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

const getValue = (value: unknown) =>
  typeof value === 'number' ? { toValue: value } : value;

/**
 * `useAnimatedValue` returns an animation value with `.value` and `.currentValue` property which is
 * initialized when passed to argument (`initialValue`). The returned value persist until the lifetime of
 * a component. It doesn't cast any re-renders which can is very good for performance optimization.
 *
 * @param { string | number } initialValue - Initial value
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

  const currentValue = Array.isArray(animation)
    ? animation.map((a) => a.get())
    : (animation as FluidValue).get();

  const targetObject: {
    value: T extends number ? any : any[];
    currentValue: T extends number ? number : number[];
  } = {
    value: animation as T extends number ? FluidValue : FluidValue[],
    currentValue: currentValue as T extends number ? number : number[],
  };

  const updateAnimation = useCallback((value: unknown) => {
    const updateValue = getValue(value);

    if (Array.isArray(value)) {
      setAnimation(value.map((v) => getValue(v)) as any);
    } else {
      queueMicrotask(() => setAnimation(updateValue as any));
    }
  }, []);

  useLayoutEffect(() => {
    if (!isInitialRender.current) {
      updateAnimation(initialValue);
    }

    isInitialRender.current = false;
  }, [initialValue, config]);

  return new Proxy(targetObject, {
    set: function (
      _,
      key,
      value: number | UpdateValue | number[] | UpdateValue[]
    ) {
      if (key === 'value') {
        updateAnimation(value);

        return true;
      }

      throw new Error('You cannot set any other property to animation node.');
    },
    get: function (_, key) {
      if (key === 'value') {
        return animation;
      }

      if (key === 'currentValue') {
        return Array.isArray(animation)
          ? animation.map((a) => a.get())
          : animation.get();
      }

      throw new Error(
        'You cannot access any other property from animation node.'
      );
    },
  });
}
