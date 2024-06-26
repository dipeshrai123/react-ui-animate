import { useEffect, useRef, useMemo, useCallback } from 'react';

import { TransitionValue } from '../animation/TransitionValue';
import type {
  TransitionValueConfig,
  Length,
  AssignValue,
  OnUpdateCallback,
} from '../types';

/**
 * useTransition
 *
 * @param value - initial value
 * @param config - the config object for `TransitionValue`
 */
export const useTransition = (
  value: Length,
  config?: TransitionValueConfig
): [
  TransitionValue,
  (
    updateValue: AssignValue,
    config?: TransitionValueConfig,
    callback?: OnUpdateCallback
  ) => void
] => {
  const isInitialRender = useRef<boolean>(true);
  const transition = useMemo(() => new TransitionValue(value, config), []);

  const setTransition = useCallback(
    (
      updateValue: AssignValue,
      config?: TransitionValueConfig,
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
