import { AnimationConfig } from './AnimationConfig';
import { DriverConfig } from './types';

interface WithSpringOptions {
  mass?: number;
  tension?: number;
  friction?: number;
  onStart?: () => void;
  onChange?: (v: number | string) => void;
  onRest?: () => void;
}

export const withSpring = (
  to: number,
  options?: WithSpringOptions
): DriverConfig => {
  return {
    type: 'spring',
    to,
    options: {
      stiffness: options?.tension ?? 100,
      damping: options?.friction ?? 10,
      mass: options?.mass ?? 1,
      onStart: options?.onStart,
      onChange: options?.onChange,
      onComplete: options?.onRest,
    },
  };
};

export const withEase = (
  to: number,
  options?: WithSpringOptions
): DriverConfig =>
  withSpring(to, { ...options, ...AnimationConfig.Spring.EASE });

interface WithTimingOptions {
  duration?: number;
  easing?: (t: number) => number;
  onStart?: () => void;
  onChange?: (v: number | string) => void;
  onRest?: () => void;
}

export const withTiming = (
  to: number,
  options?: WithTimingOptions
): DriverConfig => ({
  type: 'timing',
  to,
  options: {
    duration: options?.duration ?? 300,
    easing: options?.easing,
    onStart: options?.onStart,
    onChange: options?.onChange,
    onComplete: options?.onRest,
  },
});

interface WithDecayOptions {
  velocity: number;
  onStart?: () => void;
  onChange?: (v: number | string) => void;
  onRest?: () => void;
}

export const withDecay = (options: WithDecayOptions): DriverConfig => ({
  type: 'decay',
  options: {
    velocity: options.velocity,
    onStart: options?.onStart,
    onChange: options?.onChange,
    onComplete: options?.onRest,
  },
});

export const withSequence = (steps: DriverConfig[]): DriverConfig => ({
  type: 'sequence',
  options: {
    steps,
  },
});

export const withDelay = (delay: number): DriverConfig => ({
  type: 'delay',
  options: {
    delay,
  },
});

export const withLoop = (
  controller: DriverConfig,
  iterations: number
): DriverConfig => ({
  type: 'loop',
  options: {
    controller,
    iterations,
  },
});
