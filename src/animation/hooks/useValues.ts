import { useCallback, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import type { ToValue } from '../types';
import { getToValue } from '../helpers';

export function useValues(initialValue: number[] | string[]) {
  const animations = useRef(
    initialValue.map((val) => new FluidValue(val))
  ).current;

  const updateValue = useCallback((to: number[] | string[] | ToValue[]) => {
    to.forEach((fn, index) => {
      const { controller, callback } = getToValue(fn)(animations[index]);
      controller.start(callback);
    });
  }, []);

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
