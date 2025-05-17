import { MotionValue } from '@raidipesh78/re-motion';
import { useLayoutEffect, useRef, useState } from 'react';

import { withSpring } from '../controllers';
import { useValue } from './useValue';
import type { DriverConfig, Primitive } from '../types';

export interface UseMountConfig {
  from?: number;
  enter?: DriverConfig;
  exit?: DriverConfig;
}

export const useMount = (state: boolean, config?: UseMountConfig) => {
  const [mounted, setMounted] = useState(state);
  const animationConfig = useRef({
    from: config?.from ?? 0,
    enter: config?.enter ?? withSpring(1),
    exit: config?.exit ?? withSpring(0),
  }).current;

  const [animation, setAnimation] = useValue(animationConfig.from);
  const enterAnimation = animationConfig.enter;
  const exitAnimation = animationConfig.exit;

  useLayoutEffect(() => {
    if (state) {
      setMounted(true);
      queueMicrotask(() => {
        setAnimation(enterAnimation);
      });
    } else {
      queueMicrotask(() => {
        setAnimation({
          ...exitAnimation,
          options: {
            ...exitAnimation.options,
            onComplete: () => {
              setMounted(false);
              exitAnimation?.options?.onComplete?.();
              animation.destroy(); // HACK - destroy the subscriptions to avoid exponential subscription growth
            },
          },
        });
      });
    }
  }, [state, enterAnimation, exitAnimation]);

  return function (
    fn: (animation: MotionValue<Primitive>, mounted: boolean) => React.ReactNode
  ) {
    return fn(animation, mounted);
  };
};
