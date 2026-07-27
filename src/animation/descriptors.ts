import {
  Callbacks,
  CustomTickFn,
  DecayOptions,
  Descriptor,
  KeyframeOptions,
  KeyframeStep,
  Primitive,
  SpringOptions,
  StaggerOptions,
  TimingOptions,
} from './types';

const DEFAULT_STIFFNESS = 158;
const DEFAULT_DAMPING = 20;
const DEFAULT_MASS = 1;

const SPRING_OPTION_KEYS = new Set([
  'stiffness',
  'damping',
  'mass',
  'from',
  'onStart',
  'onChange',
  'onComplete',
]);

const TIMING_OPTION_KEYS = new Set([
  'duration',
  'easing',
  'from',
  'onStart',
  'onChange',
  'onComplete',
]);

// Distinguishes withSpring({stiffness:400}) (options-only, no target) from withSpring({x:10,y:20})
// (object target) — load-bearing for flipOptions, which has no target value to pass.
function isOptionsOnly(
  value: unknown,
  optionKeys: Set<string>
): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return Object.keys(value).every((key) => optionKeys.has(key));
}

export function withSpring(opts: SpringOptions & Callbacks): Descriptor;
export function withSpring(
  to: Descriptor['to'],
  opts?: SpringOptions & Callbacks
): Descriptor;
export function withSpring(
  toOrOpts: Descriptor['to'] | (SpringOptions & Callbacks),
  opts?: SpringOptions & Callbacks
): Descriptor {
  if (opts === undefined && isOptionsOnly(toOrOpts, SPRING_OPTION_KEYS)) {
    const options = toOrOpts as SpringOptions & Callbacks;
    return {
      type: 'spring',
      options: {
        stiffness: options.stiffness ?? DEFAULT_STIFFNESS,
        damping: options.damping ?? DEFAULT_DAMPING,
        mass: options.mass ?? DEFAULT_MASS,
        from: options.from,
        onStart: options.onStart,
        onChange: options.onChange,
        onComplete: options.onComplete,
      },
    };
  }

  const to = toOrOpts as Descriptor['to'];
  return {
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
  };
}

export function withTiming(opts: TimingOptions & Callbacks): Descriptor;
export function withTiming(
  to: Descriptor['to'],
  opts?: TimingOptions & Callbacks
): Descriptor;
export function withTiming(
  toOrOpts: Descriptor['to'] | (TimingOptions & Callbacks),
  opts?: TimingOptions & Callbacks
): Descriptor {
  if (opts === undefined && isOptionsOnly(toOrOpts, TIMING_OPTION_KEYS)) {
    const options = toOrOpts as TimingOptions & Callbacks;
    return {
      type: 'timing',
      options: {
        duration: options.duration,
        easing: options.easing,
        from: options.from,
        onStart: options.onStart,
        onChange: options.onChange,
        onComplete: options.onComplete,
      },
    };
  }

  const to = toOrOpts as Descriptor['to'];
  return {
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
  };
}

export const withDecay = (
  velocity: number,
  opts?: DecayOptions & Callbacks
): Descriptor => ({
  type: 'decay',
  options: {
    velocity,
    clamp: opts?.clamp,
    elastic: opts?.elastic,
    decay: opts?.decay,
    bounce: opts?.bounce,
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

// Each stop starts from wherever the previous one left off (from-chaining via withSequence).
export const withKeyframes = (
  steps: Array<Primitive | KeyframeStep>,
  opts?: KeyframeOptions & Callbacks
): Descriptor => {
  const totalDuration = opts?.duration ?? 300;
  const perStepDuration = steps.length > 0 ? totalDuration / steps.length : 0;

  const animations = steps.map((step) => {
    const normalized: KeyframeStep =
      typeof step === 'object' && step !== null && 'to' in step
        ? (step as KeyframeStep)
        : { to: step as Primitive };

    return withTiming(normalized.to, {
      duration: normalized.duration ?? perStepDuration,
      easing: normalized.easing ?? opts?.easing,
      onChange: opts?.onChange,
    });
  });

  return withSequence(animations, {
    onStart: opts?.onStart,
    onComplete: opts?.onComplete,
  });
};

// Omit `duration` for an indefinite driver that only stops via cancel()/pause().
export const withCustom = (
  tick: CustomTickFn,
  opts?: { duration?: number; from?: number } & Callbacks
): Descriptor => ({
  type: 'custom',
  options: {
    tick,
    duration: opts?.duration,
    from: opts?.from,
    onStart: opts?.onStart,
    onChange: opts?.onChange,
    onComplete: opts?.onComplete,
  },
});

export const withLoop = (
  animation: Descriptor,
  iterations = Infinity,
  opts?: Omit<Callbacks, 'onChange'> & { yoyo?: boolean }
): Descriptor => ({
  type: 'loop',
  options: {
    animation,
    iterations,
    yoyo: opts?.yoyo,
    onStart: opts?.onStart,
    onComplete: opts?.onComplete,
  },
});

// Unlike a plain descriptor (one driver/options shared across all keys), this lets each key use a different one.
export const withParallel = (
  animations: Record<string, Descriptor> | Descriptor[],
  opts?: Omit<Callbacks, 'onChange'>
): Descriptor => ({
  type: 'parallel',
  options: {
    parallel: animations,
    onStart: opts?.onStart,
    onComplete: opts?.onComplete,
  },
});
