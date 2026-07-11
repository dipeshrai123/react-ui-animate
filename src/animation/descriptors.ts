import {
  Callbacks,
  DecayOptions,
  Descriptor,
  SpringOptions,
  StaggerOptions,
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

// Wraps `descriptor` with a delay proportional to `index`, so animating a
// list of items with increasing `index` makes them start one after another
// instead of all at once. `each` is the delay step between consecutive
// items (default 50ms); `delay` is a base delay applied before staggering
// starts (default 0).
export const withStagger = (
  index: number,
  descriptor: Descriptor,
  opts?: StaggerOptions
): Descriptor => {
  const each = opts?.each ?? 50;
  const baseDelay = opts?.delay ?? 0;
  const totalDelay = baseDelay + index * each;

  if (totalDelay <= 0) return descriptor;

  return withSequence([withDelay(totalDelay), descriptor]);
};

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
