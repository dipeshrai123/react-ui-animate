import { useCallback, useEffect, useMemo, useRef } from 'react';

import { TransitionValue } from '../animation/TransitionValue';
import type {
  TransitionValueConfig,
  Length,
  AssignValue,
  OnUpdateCallback,
} from '../types';

/**
 * useTransitions hook for multiple values transition
 *
 * @param values - object with different keys
 * @param config - the config object for `TransitionValue`
 */
export const useTransitions = <T extends { [key: string]: Length }>(
  values: T,
  config?: TransitionValueConfig
): [
  { [key in keyof T]?: TransitionValue },
  (
    updateValues: Partial<{ [key in keyof T]?: AssignValue }>,
    config?: TransitionValueConfig,
    callback?: OnUpdateCallback
  ) => void
] => {
  const isInitialRender = useRef<boolean>(true);
  const transitions: { [key in keyof T]?: TransitionValue } = useMemo(
    () =>
      Object.keys(values).reduce(
        (acc, curr) => ({
          ...acc,
          [curr]: new TransitionValue(values[curr], config),
        }),
        {}
      ),
    []
  );

  const setTransitions = useCallback(
    (
      updateValues: Partial<{ [key in keyof T]?: AssignValue }>,
      config?: TransitionValueConfig,
      callback?: OnUpdateCallback
    ) => {
      Object.keys(updateValues).forEach((transitionKey) => {
        const updateValue = updateValues[transitionKey];
        if (updateValue !== null && updateValue !== undefined) {
          transitions[transitionKey]?.setValue(updateValue, config, callback);
        }
      });
    },
    []
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
    } else {
      setTransitions(values);
    }
  }, [values]);

  return [transitions, setTransitions];
};
