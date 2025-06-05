import { AnimationConfig } from './AnimationConfig';
import { DriverConfig, Primitive } from './types';

interface WithSpringOptions {
  mass?: number;
  tension?: number;
  friction?: number;
  onStart?: () => void;
  onChange?: (v: number | string) => void;
  onRest?: () => void;
}

export const withSpring = (
  to: Primitive,
  options?: WithSpringOptions
): DriverConfig => {
  return {
    type: 'spring',
    to,
    options: {
      stiffness: options?.tension ?? AnimationConfig.Spring.ELASTIC.tension,
      damping: options?.friction ?? AnimationConfig.Spring.ELASTIC.friction,
      mass: options?.mass ?? AnimationConfig.Spring.ELASTIC.mass,
      onStart: options?.onStart,
      onChange: options?.onChange,
      onComplete: options?.onRest,
    },
  };
};

export const withEase = (
  to: Primitive,
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
  to: Primitive,
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
  clamp?: [number, number];
}

export const withDecay = (options: WithDecayOptions): DriverConfig => ({
  type: 'decay',
  options: {
    velocity: options.velocity,
    onStart: options?.onStart,
    onChange: options?.onChange,
    onComplete: options?.onRest,
    clamp: options?.clamp,
  },
});

interface WithSequenceOptions {
  onStart?: () => void;
  onChange?: (v: number | string) => void;
  onRest?: () => void;
}

export const withSequence = (
  steps: DriverConfig[],
  options?: WithSequenceOptions
): DriverConfig => ({
  type: 'sequence',
  options: {
    steps,
    onStart: options?.onStart,
    onChange: options?.onChange,
    onComplete: options?.onRest,
  },
});

export const withDelay = (delay: number): DriverConfig => ({
  type: 'delay',
  options: {
    delay,
  },
});

interface WithLoopOptions {
  onStart?: () => void;
  onChange?: (v: number | string) => void;
  onRest?: () => void;
}

export const withLoop = (
  controller: DriverConfig,
  iterations: number,
  options?: WithLoopOptions
): DriverConfig => ({
  type: 'loop',
  options: {
    controller,
    iterations,
    onStart: options?.onStart,
    onChange: options?.onChange,
    onComplete: options?.onRest,
  },
});
