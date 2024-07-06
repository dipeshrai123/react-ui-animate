import type { FluidValueConfig, Length } from '@raidipesh78/re-motion';

import { AnimationConfigUtils } from './animationType';

interface WithConfig
  extends Pick<FluidValueConfig, 'onRest' | 'onStart' | 'onChange'> {}

interface WithEaseConfig extends WithConfig {}

/**
 * Creates a ease animation configuration.
 * @param {Length} toValue - The target value of the animation.
 * @param {WithEaseConfig} [config=AnimationConfigUtils.EASE] - Optional ease configuration.
 * @returns {{ toValue: Length; config: WithEaseConfig }}
 */
export const withEase = (toValue: Length, config?: WithEaseConfig) => {
  return {
    toValue,
    config,
  };
};

interface WithSpringConfig
  extends Pick<FluidValueConfig, 'mass' | 'friction' | 'tension'>,
    WithConfig {}

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
  extends Pick<FluidValueConfig, 'duration' | 'easing'>,
    WithConfig {}

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
export const withSequence = ([...configs]: Array<
  | {
      toValue: Length;
      config?: FluidValueConfig;
    }
  | number
>) => {
  return async (
    next: (arg: { toValue: Length; config?: FluidValueConfig }) => void
  ) => {
    for (const c of configs) {
      await next(typeof c === 'number' ? { toValue: c } : c);
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
