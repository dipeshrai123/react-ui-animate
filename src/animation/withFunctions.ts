import { AnimationConfigUtils } from './animationType';

import type { UseAnimatedValueConfig } from './useAnimatedValue';

// Base interfaces for callbacks
interface WithOnCallbacks
  extends Pick<UseAnimatedValueConfig, 'onRest' | 'onStart' | 'onChange'> {}

/**
 * Creates a default animation configuration.
 * @param {number} toValue - The target value of the animation.
 * @param {UseAnimatedValueConfig} config - Optional configuration.
 * @returns {{ toValue: number; config: UseAnimatedValueConfig }}
 */
export const withConfig = (
  toValue: number,
  config?: UseAnimatedValueConfig
) => ({
  toValue,
  config,
});

// Configuration interfaces
interface WithEaseConfig extends WithOnCallbacks {}

/**
 * Creates an ease animation configuration.
 * @param {number} toValue - The target value of the animation.
 * @param {UseAnimatedValueConfig} [config=AnimationConfigUtils.EASE] - Optional ease configuration.
 * @returns {{ toValue: number; config: UseAnimatedValueConfig }}
 */
export const withEase = (toValue: number, config?: WithEaseConfig) =>
  withConfig(toValue, { ...AnimationConfigUtils.EASE, ...config });

interface WithSpringConfig
  extends Pick<UseAnimatedValueConfig, 'mass' | 'friction' | 'tension'>,
    WithOnCallbacks {}

/**
 * Creates a spring animation configuration.
 * @param {number} toValue - The target value of the animation.
 * @param {WithSpringConfig} [config=AnimationConfigUtils.ELASTIC] - Optional spring configuration.
 * @returns {{ toValue: number; config: WithSpringConfig }}
 */
export const withSpring = (toValue: number, config?: WithSpringConfig) =>
  withConfig(toValue, { ...AnimationConfigUtils.ELASTIC, ...config });

interface WithTimingConfig
  extends Pick<UseAnimatedValueConfig, 'duration' | 'easing'>,
    WithOnCallbacks {}

/**
 * Creates a timing animation configuration.
 * @param {number} toValue - The target value of the animation.
 * @param {WithTimingConfig} [config={ duration: 250 }] - Optional timing configuration.
 * @returns {{ toValue: number; config: WithTimingConfig }}
 */
export const withTiming = (toValue: number, config?: WithTimingConfig) =>
  withConfig(toValue, { duration: 250, ...config });

interface WithDecayConfig
  extends Pick<UseAnimatedValueConfig, 'velocity' | 'deceleration'>,
    WithOnCallbacks {}

/**
 * Creates a decay animation configuration.
 * @param {WithDecayConfig} config - Optional decay configuration.
 * @returns {{ config: WithDecayConfig }}
 */
export const withDecay = (config: WithDecayConfig) => ({
  decay: true,
  ...config,
});

/**
 * Creates a sequence of animations that run one after another.
 * @param {Array<{ toValue: number; config?: UseAnimatedValueConfig } | number>} configs - An array of animation configurations or delays.
 * @returns {Function} An async function that runs the animations in sequence.
 */
export const withSequence = (
  configs: Array<
    | {
        toValue?: number;
        config?: UseAnimatedValueConfig;
      }
    | number
  >
) => {
  return async (
    next: (arg: { toValue?: number; config?: UseAnimatedValueConfig }) => void
  ) => {
    for (const config of configs) {
      await next(typeof config === 'number' ? { toValue: config } : config);
    }
  };
};

/**
 * Adds a delay before the given animation.
 * @param {number} delay - The delay in milliseconds.
 * @param {{ toValue: number; config?: UseAnimatedValueConfig }} animation - The animation configuration (withTiming | withSpring).
 * @returns {{ toValue: number; config: UseAnimatedValueConfig }} The updated animation configuration with delay.
 */
export const withDelay = (
  delay: number,
  animation: { toValue: number; config?: UseAnimatedValueConfig }
) => ({
  ...animation,
  config: {
    ...animation.config,
    delay,
  },
});
