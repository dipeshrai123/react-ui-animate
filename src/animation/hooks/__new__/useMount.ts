import { useState, useLayoutEffect, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { withSpring } from '../../controllers';
import { AnimationConfig } from '../../helpers';
import { useValue } from './useValue';

export interface UseMountConfig {
  from?: number;
  enter?: number;
  exit?: number;
}

export const useMount = (state: boolean, config?: UseMountConfig) => {
  const [mounted, setMounted] = useState(state);
  const animationConfig = useRef({
    from: config?.from ?? 0,
    enter: config?.enter ?? 1,
    exit: config?.exit ?? 0,
  }).current;
  const animation = useValue(animationConfig.from);

  useLayoutEffect(() => {
    if (state) {
      setMounted(true);
      queueMicrotask(() => {
        animation.value = withSpring(animationConfig.enter);
      });
    } else {
      queueMicrotask(() => {
        animation.value = withSpring(
          animationConfig.exit,
          AnimationConfig.Spring.EASE,
          ({ finished }) => {
            if (finished) {
              setMounted(false);
            }
          }
        );
      });
    }
  }, [state]);

  return function (
    fn: (animation: { value: FluidValue }, mounted: boolean) => React.ReactNode
  ) {
    return fn({ value: animation.value }, mounted);
  };
};
