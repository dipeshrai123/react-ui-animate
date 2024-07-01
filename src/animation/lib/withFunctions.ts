import { AnimationConfigUtils } from './animationType';

import type { FluidValueConfig, Length } from '../core/types/animation';

interface WithSpringConfig
  extends Pick<FluidValueConfig, 'mass' | 'friction' | 'tension'> {}

export const withSpring = (
  toValue: Length,
  config: WithSpringConfig = AnimationConfigUtils.ELASTIC
) => {
  return {
    toValue,
    config,
  };
};

interface WithTimingConfig
  extends Pick<FluidValueConfig, 'duration' | 'easing'> {}

export const withTiming = (
  toValue: Length,
  config: WithTimingConfig = { duration: 250 }
) => {
  return {
    toValue,
    config,
  };
};

export const withSequence = ([...configs]: Array<{
  toValue: Length;
  config?: FluidValueConfig;
}>): any => {
  return async (
    next: (arg: { toValue: Length; config?: FluidValueConfig }) => void
  ) => {
    for (const c of configs) {
      await next(c);
    }
  };
};

export const withDelay = (
  delay: number,
  animation: { toValue: Length; config?: FluidValueConfig }
) => {
  return {
    ...animation,
    config: {
      ...animation.config,
      delay,
    },
  };
};
