import { useCallback, useLayoutEffect, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { getToValue } from '../helpers';

import type { ToValue } from '../types';

export function useValue(initialValue: number | string) {
  const isInitialRender = useRef(true);
  const animation = useRef(new FluidValue(initialValue)).current;

  const updateValue = useCallback((to: number | string | ToValue) => {
    const { controller, callback } = getToValue(to)(animation);
    controller.start(callback);
  }, []);

  useLayoutEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    updateValue(getToValue(initialValue));
  }, [initialValue]);

  return {
    set value(to: number | string | ToValue) {
      updateValue(to);
    },
    get value(): FluidValue {
      return animation;
    },
    get currentValue() {
      return animation.get();
    },
  };
}
