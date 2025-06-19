import { AnimationConfig } from './AnimationConfig';
import {
  Callbacks,
  DecayOptions,
  Descriptor,
  SpringOptions,
  TimingOptions,
} from './types';

export const withSpring = (
  to: Descriptor['to'],
  opts?: SpringOptions & Callbacks
): Descriptor => ({
  type: 'spring',
  to,
  options: {
    stiffness: opts?.stiffness ?? AnimationConfig.Spring.NATURAL.stiffness,
    damping: opts?.damping ?? AnimationConfig.Spring.NATURAL.damping,
    mass: opts?.mass ?? AnimationConfig.Spring.NATURAL.mass,
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
  opts?: Callbacks
): Descriptor => ({
  type: 'sequence',
  options: {
    animations,
    onStart: opts?.onStart,
    onChange: opts?.onChange,
    onComplete: opts?.onComplete,
  },
});

export const withLoop = (
  animation: Descriptor,
  iterations = Infinity,
  opts?: Callbacks
): Descriptor => ({
  type: 'loop',
  options: {
    animation,
    iterations,
    onStart: opts?.onStart,
    onChange: opts?.onChange,
    onComplete: opts?.onComplete,
  },
});
