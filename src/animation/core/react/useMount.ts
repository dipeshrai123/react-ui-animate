import { useState, useRef, useEffect } from 'react';

import { useFluidValue } from './useFluidValue';
import type { AssignValue, FluidValueConfig } from '../types/animation';
import { FluidValue } from '../controllers/FluidValue';

export interface UseMountConfig {
  from: number;
  enter: number | AssignValue;
  exit: number | AssignValue;
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
  const [animation, setAnimation] = useFluidValue(from, innerConfig);

  useEffect(() => {
    if (state) {
      initial.current = true;
      setMounted(true);
    } else {
      initial.current = false;
      setAnimation(
        exit,
        exitConfig,
        function ({ finished }: { finished: boolean }) {
          if (finished) {
            setMounted(false);
          }
        }
      );
    }
  }, [state]);

  useEffect(() => {
    if (mounted && initial.current) {
      setAnimation(enter, enterConfig);
    }
  }, [mounted, initial.current]);

  return (
    callback: (animation: FluidValue, mounted: boolean) => React.ReactNode
  ) => callback(animation, mounted);
};
