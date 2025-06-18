import { Primitive } from '../types';

interface Callbacks {
  onStart?: () => void;
  onChange?: () => void;
  onComplete?: () => void;
}

interface DriverOptions {
  spring: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  } & Callbacks;
  timing: {
    duration?: number;
    easing?: (t: number) => number;
  } & Callbacks;
  decay: Callbacks;
}

interface Descriptor {
  type: 'spring' | 'timing' | 'decay' | 'delay' | 'sequence' | 'loop';
  to?: Primitive | Primitive[] | Record<string, Primitive>;
  options?: any;
  animations?: any;
  animation?: any;
}

export const withSpring = (
  to: Descriptor['to'],
  opts?: DriverOptions['spring']
): Descriptor => ({
  type: 'spring',
  to,
  options: {
    stiffness: opts?.stiffness,
    damping: opts?.damping,
    mass: opts?.mass,
    onStart: opts?.onStart,
    onChange: opts?.onChange,
    onComplete: opts?.onComplete,
  },
});

export const withTiming = (
  to: Descriptor['to'],
  opts?: DriverOptions['timing']
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
  opts?: DriverOptions['decay']
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

export const withSequence = (descriptors: Descriptor[]): Descriptor => ({
  type: 'sequence',
  animations: descriptors,
});

export const withLoop = (
  animation: Descriptor,
  iterations = Infinity
): Descriptor => ({
  type: 'loop',
  animation,
  options: { iterations },
});
