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

// True when `value` is a plain options bag (every key is a known option),
// including `{}`. Used to support the target-less overload:
//   withSpring({ stiffness: 400 })
//   withTiming({ duration: 300 })
// without breaking object targets like withSpring({ x: 10, y: 20 }). This is
// load-bearing for `layoutOptions` (see `src/animation/layout/flip.ts`),
// where a FLIP transition computes its own from/to and the descriptor is
// only used for its stiffness/damping/duration — there's no real value to
// pass as a target.
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

// Animates through a list of intermediate values in one call, e.g.
// `withKeyframes([0, 100, 50, 100])`. Each stop gets an equal share of the
// total `duration` (default 300ms) unless a step provides its own
// `{ to, duration, easing }`. Built on top of `withTiming` + `withSequence`,
// so it inherits their `from`-chaining behavior — each stop starts from
// wherever the previous one left off.
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

// Escape hatch for animation shapes the built-in drivers don't model —
// custom physics, magnetic snapping, orbital motion, noise-driven motion,
// etc. `tick` is called every frame with elapsed/dt/from and returns the
// value for that frame; the driver just pipes that into the AnimateValue.
// Omit `duration` for an indefinite driver that only stops via
// `cancel()`/`pause()` (e.g. a continuous loop-until-told-otherwise orbit).
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

// Runs a different descriptor per key of an object/array `useValue`
// concurrently, e.g. `withParallel({ x: withSpring(100), y: withTiming(50) })`.
// A plain descriptor already animates every key at once, but shares one
// driver/options across all of them; use this when keys need different ones.
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
