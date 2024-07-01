import { AnimationConfigUtils } from './animationType';

import type { FluidValueConfig, Length } from '../core';

interface WithSpringConfig
  extends Pick<FluidValueConfig, 'mass' | 'friction' | 'tension'> {}

/**
 * Creates a spring animation configuration.
 * @param {Length} toValue - The target value of the animation.
 * @param {WithSpringConfig} [config=AnimationConfigUtils.ELASTIC] - Optional spring configuration.
 * @returns {{ toValue: Length; config: WithSpringConfig }}
 */
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

/**
 * Creates a timing animation configuration.
 * @param {Length} toValue - The target value of the animation.
 * @param {WithTimingConfig} [config={ duration: 250 }] - Optional timing configuration.
 * @returns {{ toValue: Length; config: WithTimingConfig }}
 */
export const withTiming = (
  toValue: Length,
  config: WithTimingConfig = { duration: 250 }
) => {
  return {
    toValue,
    config,
  };
};

/**
 * Creates a sequence of animations that run one after another.
 * @param {Array<{ toValue: Length; config?: FluidValueConfig }>} configs - An array of animation configurations.
 * @returns {Function} An async function that runs the animations in sequence.
 */
export const withSequence = ([...configs]: Array<{
  toValue: Length;
  config?: FluidValueConfig;
}>) => {
  return async (
    next: (arg: { toValue: Length; config?: FluidValueConfig }) => void
  ) => {
    for (const c of configs) {
      await next(c);
    }
  };
};

/**
 * Adds a delay before the given animation.
 * @param {number} delay - The delay in milliseconds.
 * @param {{ toValue: Length; config?: FluidValueConfig }} animation - The animation configuration ( withTiming | withSpring )
 * @returns {{ toValue: Length; config: FluidValueConfig }} The updated animation configuration with delay.
 */
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
