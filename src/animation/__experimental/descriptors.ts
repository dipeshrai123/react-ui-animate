import { Primitive } from '../types';

interface Callbacks {
  onStart?: () => void;
  onChange?: () => void;
  onComplete?: () => void;
}

interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

interface TimingOptions {
  duration?: number;
  easing?: (t: number) => number;
}

interface DecayOptions {
  velocity?: number;
}

interface SequenceOptions {
  animations?: Descriptor[];
}

interface DelayOptions {
  delay?: number;
}

interface LoopOptions {
  iterations?: number;
  animation?: Descriptor;
}

export type DriverType =
  | 'spring'
  | 'timing'
  | 'decay'
  | 'delay'
  | 'sequence'
  | 'loop';

export interface Descriptor {
  type: DriverType;
  to?: Primitive | Primitive[] | Record<string, Primitive>;
  options?: SpringOptions &
    TimingOptions &
    DecayOptions &
    SequenceOptions &
    DelayOptions &
    LoopOptions &
    Callbacks;
}

export const withSpring = (
  to: Descriptor['to'],
  opts?: SpringOptions & Callbacks
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
