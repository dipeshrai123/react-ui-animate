import { FluidValue, spring } from '@raidipesh78/re-motion';

import { AnimationConfig } from '../helpers';

import type { WithCallbacks } from '../types';

interface WithSpringConfig extends WithCallbacks {
  mass?: number;
  friction?: number;
  tension?: number;
}

export const withSpring =
  (
    toValue: number,
    config?: WithSpringConfig,
    callback?: (result: any) => void
  ) =>
  (value: FluidValue) => ({
    controller: spring(value, {
      toValue,
      ...AnimationConfig.Spring.ELASTIC,
      ...config,
    }),
    callback,
  });
