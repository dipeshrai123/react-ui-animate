import { useCallback, useLayoutEffect, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import type { ToValue } from '../types';
import { getToValue } from '../helpers';

export function useValues(initialValue: number[] | string[]) {
  const isInitialRender = useRef(true);
  const animations = useRef(
    initialValue.map((val) => new FluidValue(val))
  ).current;

  const updateValue = useCallback((to: number[] | string[] | ToValue[]) => {
    to.forEach((fn, index) => {
      const { controller, callback } = getToValue(fn)(animations[index]);
      controller.start(callback);
    });
  }, []);

  useLayoutEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    updateValue(initialValue.map((v) => getToValue(v)));
  }, [initialValue]);

  return {
    set value(to: number[] | string[] | ToValue[]) {
      updateValue(to);
    },
    get value(): FluidValue[] {
      return animations;
    },
    get currentValue() {
      return animations.map((animation) => animation.get());
    },
  };
}
