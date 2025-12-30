import {
  Callbacks,
  DecayOptions,
  Descriptor,
  SpringOptions,
  TimingOptions,
} from './types';

// Default spring configuration values
const DEFAULT_STIFFNESS = 158;
const DEFAULT_DAMPING = 20;
const DEFAULT_MASS = 1;

export const withSpring = (
  to: Descriptor['to'],
  opts?: SpringOptions & Callbacks
): Descriptor => ({
  type: 'spring',
  to,
  options: {
    stiffness: opts?.stiffness ?? DEFAULT_STIFFNESS,
    damping: opts?.damping ?? DEFAULT_DAMPING,
    mass: opts?.mass ?? DEFAULT_MASS,
    from: opts?.from,
    onStart: opts?.onStart,
    onChange: opts?.onChange,
    onComplete: opts?.onComplete,
  },
});

export const withTiming = (
  to: Descriptor['to'],
  opts?: TimingOptions & Callbacks
): Descriptor => ({
  type: 'timing',
  to,
  options: {
    duration: opts?.duration,
    easing: opts?.easing,
    from: opts?.from,
    onStart: opts?.onStart,
    onChange: opts?.onChange,
    onComplete: opts?.onComplete,
  },
});

export const withDecay = (
  velocity: number,
  opts?: DecayOptions & Callbacks
): Descriptor => ({
  type: 'decay',
  options: {
    velocity,
    clamp: opts?.clamp,
    elastic: opts?.elastic,
    onStart: opts?.onStart,
    onChange: opts?.onChange,
    onComplete: opts?.onComplete,
  },
});

export const withDelay = (ms: number): Descriptor => ({
  type: 'delay',
  options: { delay: ms },
});

export const withSequence = (
  animations: Descriptor[],
  opts?: Omit<Callbacks, 'onChange'>
): Descriptor => ({
  type: 'sequence',
  options: {
    animations,
    onStart: opts?.onStart,
    onComplete: opts?.onComplete,
  },
});

export const withLoop = (
  animation: Descriptor,
  iterations = Infinity,
  opts?: Omit<Callbacks, 'onChange'>
): Descriptor => ({
  type: 'loop',
  options: {
    animation,
    iterations,
    onStart: opts?.onStart,
    onComplete: opts?.onComplete,
  },
});
