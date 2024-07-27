import { AnimationConfigUtils } from './animationType';

import type { UseFluidValueConfig } from './core/useFluidValue';

// Base interfaces for callbacks
interface WithOnCallbacks
  extends Pick<UseFluidValueConfig, 'onRest' | 'onStart' | 'onChange'> {}

// Configuration interfaces
interface WithEaseConfig extends WithOnCallbacks {}
interface WithSpringConfig
  extends Pick<UseFluidValueConfig, 'mass' | 'friction' | 'tension'>,
    WithOnCallbacks {}
interface WithTimingConfig
  extends Pick<UseFluidValueConfig, 'duration' | 'easing'>,
    WithOnCallbacks {}
interface WithDecayConfig
  extends Pick<UseFluidValueConfig, 'decay' | 'velocity' | 'deceleration'>,
    WithOnCallbacks {}

/**
 * Creates a default animation configuration.
 * @param {number} toValue - The target value of the animation.
 * @param {UseFluidValueConfig} config - Optional configuration.
 * @returns {{ toValue: number; config: UseFluidValueConfig }}
 */
export const withConfig = (toValue: number, config?: UseFluidValueConfig) => ({
  toValue,
  config,
});

/**
 * Creates an ease animation configuration.
 * @param {number} toValue - The target value of the animation.
 * @param {UseFluidValueConfig} [config=AnimationConfigUtils.EASE] - Optional ease configuration.
 * @returns {{ toValue: number; config: UseFluidValueConfig }}
 */
export const withEase = (
  toValue: number,
  config: WithEaseConfig = AnimationConfigUtils.EASE
) => withConfig(toValue, config);

/**
 * Creates a spring animation configuration.
 * @param {number} toValue - The target value of the animation.
 * @param {WithSpringConfig} [config=AnimationConfigUtils.ELASTIC] - Optional spring configuration.
 * @returns {{ toValue: number; config: WithSpringConfig }}
 */
export const withSpring = (
  toValue: number,
  config: WithSpringConfig = AnimationConfigUtils.ELASTIC
) => withConfig(toValue, config);

/**
 * Creates a timing animation configuration.
 * @param {number} toValue - The target value of the animation.
 * @param {WithTimingConfig} [config={ duration: 250 }] - Optional timing configuration.
 * @returns {{ toValue: number; config: WithTimingConfig }}
 */
export const withTiming = (
  toValue: number,
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
 * @param {Array<{ toValue: number; config?: UseFluidValueConfig } | number>} configs - An array of animation configurations or delays.
 * @returns {Function} An async function that runs the animations in sequence.
 */
export const withSequence = (
  configs: Array<
    | {
        toValue?: number;
        config?: UseFluidValueConfig;
      }
    | number
  >
) => {
  return async (
    next: (arg: { toValue?: number; config?: UseFluidValueConfig }) => void
  ) => {
    for (const config of configs) {
      await next(typeof config === 'number' ? { toValue: config } : config);
    }
  };
};

/**
 * Adds a delay before the given animation.
 * @param {number} delay - The delay in milliseconds.
 * @param {{ toValue: number; config?: UseFluidValueConfig }} animation - The animation configuration (withTiming | withSpring).
 * @returns {{ toValue: number; config: UseFluidValueConfig }} The updated animation configuration with delay.
 */
export const withDelay = (
  delay: number,
  animation: { toValue: number; config?: UseFluidValueConfig }
) => ({
  ...animation,
  config: {
    ...animation.config,
    delay,
  },
});
