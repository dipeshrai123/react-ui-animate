import { useRef, useState, useEffect } from 'react';

import { useTransitions } from './useTransitions';
import { TransitionValue } from '../animation/TransitionValue';
import type { AssignValue, Length, TransitionValueConfig } from '../types';

export interface UseMountsConfig<T> {
  from: T;
  enter: Partial<{ [key in keyof T]: AssignValue }>;
  exit: Partial<{ [key in keyof T]: AssignValue }>;
  enterConfig?: TransitionValueConfig;
  exitConfig?: TransitionValueConfig;
  config?: TransitionValueConfig;
}

/**
 * `useMounts`
 *
 * applies mounting and unmounting of a component according to state change
 * applying transitions for multiple keys
 *
 * @param state - boolean indicating mount state of a component
 * @param config - the config object `UseMountsConfig`
 */
export const useMounts = <T extends { [key: string]: Length }>(
  state: boolean,
  config: UseMountsConfig<T>
) => {
  const initial = useRef(true);
  const [mounted, setMounted] = useState(false);
  const {
    from,
    enter,
    exit,
    config: innerConfig,
    enterConfig,
    exitConfig,
  } = useRef(config).current;
  const [animation, setAnimation] = useTransitions(from, innerConfig);

  useEffect(() => {
    if (state) {
      initial.current = true;
      setMounted(true);
    } else {
      initial.current = false;
      setAnimation(exit, exitConfig, function ({ finished }) {
        if (finished) {
          setMounted(false);
        }
      });
    }
  }, [state]);

  useEffect(() => {
    if (mounted && initial.current) {
      setAnimation(enter, enterConfig);
    }
  }, [mounted, initial.current]);

  return (
    callback: (
      animation: { [key in keyof T]?: TransitionValue },
      mounted: boolean
    ) => React.ReactNode
  ) => callback(animation, mounted);
};
