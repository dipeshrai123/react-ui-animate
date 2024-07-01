import { useState, useRef, useLayoutEffect } from 'react';

import { useFluidValue } from './useFluidValue';
import { FluidValue } from '../controllers/FluidValue';

import type { FluidValueConfig } from '../types/animation';

export interface UseMountConfig {
  from: number;
  enter: number;
  exit: number;
  enterConfig?: FluidValueConfig;
  exitConfig?: FluidValueConfig;
  config?: FluidValueConfig;
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
  const {
    from,
    enter,
    exit,
    config: defaultConfig,
    enterConfig,
    exitConfig,
  } = useRef(config).current;
  const [animation, setAnimation] = useFluidValue(from, defaultConfig);

  useLayoutEffect(() => {
    if (state) {
      setMounted(true);
      queueMicrotask(() =>
        setAnimation({
          toValue: enter,
          config: enterConfig,
        })
      );
    } else {
      setAnimation(
        {
          toValue: exit,
          config: exitConfig,
        },
        function ({ finished }: { finished: boolean }) {
          if (finished) {
            setMounted(false);
          }
        }
      );
    }
  }, [state]);

  return (
    callback: (animation: FluidValue, mounted: boolean) => React.ReactNode
  ) => callback(animation, mounted);
};
