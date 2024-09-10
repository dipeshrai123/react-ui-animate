import { useCallback, useLayoutEffect, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { useFluidValues } from '../core/useFluidValues';
import { AnimationConfig } from '../animationType';
import { getToValue } from '../helpers';

import { type UpdateValue } from '../core/FluidController';
import { type UseValueConfig } from './useValue';

export function useValues<T extends number[]>(
  initialValue: T,
  config?: UseValueConfig
) {
  const isInitialRender = useRef(true);
  const [animation, setAnimation] = useFluidValues(initialValue, {
    ...AnimationConfig.EASE,
    ...config,
  });

  const updateAnimation = useCallback(
    (values: Array<number | number[] | UpdateValue | UpdateValue[]>) => {
      const update = values.map((value) => {
        if (Array.isArray(value)) {
          return value.map((v) => getToValue(v));
        } else {
          return getToValue(value);
        }
      });
      queueMicrotask(() => setAnimation(update));
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
    set value(to: Array<number | number[] | UpdateValue | UpdateValue[]>) {
      updateAnimation(to);
    },
    get value(): FluidValue[] {
      return animation;
    },
    get currentValue() {
      return animation.map((a) => a.get());
    },
  };
}
