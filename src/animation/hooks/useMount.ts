import { useState, useLayoutEffect, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { withEase } from '../controllers';
import { useValue } from './useValue';

import type { ToValue } from '../types';

export interface UseMountConfig {
  from?: number;
  enter?: ToValue;
  exit?: ToValue;
}

export const useMount = (state: boolean, config?: UseMountConfig) => {
  const [mounted, setMounted] = useState(state);
  const animationConfig = useRef({
    from: config?.from ?? 0,
    enter: config?.enter ?? withEase(1),
    exit: config?.exit ?? withEase(0),
  }).current;

  const animation = useValue(animationConfig.from);
  const enterAnimation = animationConfig.enter(animation.value);
  const exitAnimation = animationConfig.exit(animation.value);

  useLayoutEffect(() => {
    if (state) {
      setMounted(true);
      queueMicrotask(() => {
        enterAnimation.controller.start(enterAnimation.callback);
      });
    } else {
      queueMicrotask(() => {
        exitAnimation.controller.start((result: { finished: boolean }) => {
          exitAnimation.callback?.(result);
          if (result.finished) {
            setMounted(false);
          }
        });
      });
    }
  }, [state]);

  return function (
    fn: (animation: { value: FluidValue }, mounted: boolean) => React.ReactNode
  ) {
    return fn({ value: animation.value }, mounted);
  };
};
