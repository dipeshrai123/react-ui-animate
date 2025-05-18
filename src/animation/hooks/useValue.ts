import { useCallback, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { getToValue } from '../helpers';

import type { ToValue } from '../types';

export function useValue(initialValue: number | string) {
  const animation = useRef(new FluidValue(initialValue)).current;

  const updateValue = useCallback((to: number | string | ToValue) => {
    const { controller, callback } = getToValue(to)(animation);
    controller.start(callback);
  }, []);

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
