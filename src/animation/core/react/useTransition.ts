import { useEffect, useRef, useMemo, useCallback } from 'react';

import { FluidValue } from '../controllers/FluidValue';
import type {
  FluidValueConfig,
  Length,
  AssignValue,
  OnUpdateCallback,
} from '../types/animation';

/**
 * useTransition
 *
 * @param value - initial value
 * @param config - the config object for `FluidValue`
 */
export const useTransition = (
  value: Length,
  config?: FluidValueConfig
): [
  FluidValue,
  (
    updateValue: AssignValue,
    config?: FluidValueConfig,
    callback?: OnUpdateCallback
  ) => void
] => {
  const isInitialRender = useRef<boolean>(true);
  const transition = useMemo(() => new FluidValue(value, config), []);

  const setTransition = useCallback(
    (
      updateValue: AssignValue,
      config?: FluidValueConfig,
      callback?: OnUpdateCallback
    ) => {
      transition.setValue(updateValue, config, callback);
    },
    []
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
    } else {
      setTransition(value, config);
    }
  }, [value]);

  return [transition, setTransition];
};
