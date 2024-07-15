import type { FluidValueConfig, Length } from '@raidipesh78/re-motion';

import { AnimationConfigUtils } from './animationType';

// Base interfaces for callbacks
interface WithOnCallbacks
  extends Pick<FluidValueConfig, 'onRest' | 'onStart' | 'onChange'> {}

// Configuration interfaces
interface WithEaseConfig extends WithOnCallbacks {}
interface WithSpringConfig
  extends Pick<FluidValueConfig, 'mass' | 'friction' | 'tension'>,
    WithOnCallbacks {}
interface WithTimingConfig
  extends Pick<FluidValueConfig, 'duration' | 'easing'>,
    WithOnCallbacks {}
interface WithDecayConfig
  extends Pick<FluidValueConfig, 'decay' | 'velocity' | 'deceleration'>,
    WithOnCallbacks {}

/**
 * Creates a default animation configuration.
 * @param {Length} toValue - The target value of the animation.
 * @param {FluidValueConfig} config - Optional configuration.
 * @returns {{ toValue: Length; config: FluidValueConfig }}
 */
export const withConfig = (toValue: Length, config?: FluidValueConfig) => ({
  toValue,
  config,
});

/**
 * Creates an ease animation configuration.
 * @param {Length} toValue - The target value of the animation.
 * @param {FluidValueConfig} [config=AnimationConfigUtils.EASE] - Optional ease configuration.
 * @returns {{ toValue: Length; config: FluidValueConfig }}
 */
export const withEase = (
  toValue: Length,
  config: WithEaseConfig = AnimationConfigUtils.EASE
) => withConfig(toValue, config);

/**
 * Creates a spring animation configuration.
 * @param {Length} toValue - The target value of the animation.
 * @param {WithSpringConfig} [config=AnimationConfigUtils.ELASTIC] - Optional spring configuration.
 * @returns {{ toValue: Length; config: WithSpringConfig }}
 */
export const withSpring = (
  toValue: Length,
  config: WithSpringConfig = AnimationConfigUtils.ELASTIC
) => withConfig(toValue, config);

/**
 * Creates a timing animation configuration.
 * @param {Length} toValue - The target value of the animation.
 * @param {WithTimingConfig} [config={ duration: 250 }] - Optional timing configuration.
 * @returns {{ toValue: Length; config: WithTimingConfig }}
 */
export const withTiming = (
  toValue: Length,
  config: WithTimingConfig = { duration: 250 }
) => withConfig(toValue, config);

/**
 * Creates a decay animation configuration.
 * @param {WithDecayConfig} config - Optional decay configuration.
 * @returns {{ config: WithDecayConfig }}
 */
export const withDecay = (config: WithDecayConfig) => ({
  config,
});

/**
 * Creates a sequence of animations that run one after another.
 * @param {Array<{ toValue: Length; config?: FluidValueConfig } | number>} configs - An array of animation configurations or delays.
 * @returns {Function} An async function that runs the animations in sequence.
 */
export const withSequence = (
  configs: Array<
    | {
        toValue?: Length;
        config?: FluidValueConfig;
      }
    | number
  >
) => {
  return async (
    next: (arg: { toValue?: Length; config?: FluidValueConfig }) => void
  ) => {
    for (const config of configs) {
      await next(typeof config === 'number' ? { toValue: config } : config);
    }
  };
};

/**
 * Adds a delay before the given animation.
 * @param {number} delay - The delay in milliseconds.
 * @param {{ toValue: Length; config?: FluidValueConfig }} animation - The animation configuration (withTiming | withSpring).
 * @returns {{ toValue: Length; config: FluidValueConfig }} The updated animation configuration with delay.
 */
export const withDelay = (
  delay: number,
  animation: { toValue: Length; config?: FluidValueConfig }
) => ({
  ...animation,
  config: {
    ...animation.config,
    delay,
  },
});
