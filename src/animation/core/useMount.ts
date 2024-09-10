import { useState, useLayoutEffect, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { useFluidValue } from './useFluidValue';

import type { UpdateValue, UseFluidValueConfig } from './FluidController';
import { getToValue } from '../helpers';

export interface UseMountConfig {
  from: number;
  enter: number | UpdateValue | number[] | UpdateValue[];
  exit: number | UpdateValue | number[] | UpdateValue[];
  config?: UseFluidValueConfig;
}

/**
 * `useMount`
 *
 * applies mounting and unmounting of a component according to state change
 * applying transitions
 *
 * @param state - boolean indicating mount state of a component
 * @param config - the config object `UseMountConfig`
 */
export const useMount = (state: boolean, config: UseMountConfig) => {
  const [mounted, setMounted] = useState(false);
  const { from, enter, exit, config: innerConfig } = useRef(config).current;
  const [animation, setAnimation] = useFluidValue(from, innerConfig);

  useLayoutEffect(() => {
    if (state) {
      setMounted(true);
      queueMicrotask(() =>
        setAnimation(
          Array.isArray(enter)
            ? enter.map((e) => getToValue(e, innerConfig))
            : getToValue(enter, innerConfig)
        )
      );
    } else {
      setAnimation(
        Array.isArray(exit)
          ? exit.map((e) => getToValue(e, innerConfig))
          : getToValue(exit, innerConfig),
        () => {
          setMounted(false);
          // cleanup
          animation
            .getSubscriptions()
            .forEach((s) => animation.removeSubscription(s));
        }
      );
    }
  }, [state]);

  return (
    callback: (animation: FluidValue, mounted: boolean) => React.ReactNode
  ) => callback(animation, mounted);
};
