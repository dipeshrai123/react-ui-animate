import { Primitive } from '../types';

interface DriverOptions {
  spring: {
    stiffness?: number;
    damping?: number;
    mass?: number;
    onStart?: () => void;
    onChange?: (v: Primitive) => void;
    onComplete?: () => void;
  };
  timing: {
    duration?: number;
    easing?: (t: number) => number;
    onStart?: () => void;
    onChange?: (v: Primitive) => void;
    onComplete?: () => void;
  };
  decay: {
    velocity?: number;
    onStart?: () => void;
    onChange?: (v: Primitive) => void;
    onComplete?: () => void;
  };
  delay: {
    delay: number;
  };
}

export const withSpring = <
  T extends Primitive | Primitive[] | Record<string, Primitive>
>(
  to: T,
  opts?: DriverOptions['spring']
) => ({
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

export const withTiming = (to: any, opts: any = {}): any => ({
  type: 'timing',
  to,
  options: {
    duration: opts.duration,
    easing: opts.easing,
    onStart: opts.onStart,
    onChange: opts.onChange,
    onComplete: opts.onRest,
  },
});

export const withDecay = (velocity: number, opts: any = {}): any => ({
  type: 'decay',
  options: {
    velocity,
    onStart: opts.onStart,
    onChange: opts.onChange,
    onComplete: opts.onRest,
  },
});

export const withDelay = (ms: number): any => ({
  type: 'delay',
  options: { delay: ms },
});

export const withSequence = (steps: any[]) => ({
  type: 'sequence' as const,
  animations: steps,
});

export const withLoop = (animation: any, iterations = Infinity) => ({
  type: 'loop' as const,
  animation,
  options: { iterations },
});
