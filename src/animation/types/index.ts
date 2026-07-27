import type { AnimateValue } from '../values/AnimateValue';

export type Primitive = number | string;

// ExtrapolateConfig is defined here to avoid circular dependency
export type ExtrapolateType = 'identity' | 'extend' | 'clamp';

export interface ExtrapolateConfig {
  extrapolate?: ExtrapolateType;
  extrapolateRight?: ExtrapolateType;
  extrapolateLeft?: ExtrapolateType;
  easing?: (t: number) => number;
}

export interface Callbacks {
  onStart?: () => void;
  onChange?: (v: number) => void;
  onComplete?: () => void;
}

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
  from?: number;
}

export interface TimingOptions {
  duration?: number;
  easing?: (t: number) => number;
  from?: number;
}

export interface DecayOptions {
  velocity?: number;
  clamp?: [number, number];
  elastic?: boolean | number;
  decay?: number;
  /** Reflects velocity off `clamp`'s bounds instead of stopping — takes priority over `elastic`. */
  bounce?: boolean | number;
}

export interface SequenceOptions {
  animations?: Descriptor[];
}

export interface DelayOptions {
  delay?: number;
}

export interface LoopOptions {
  iterations?: number;
  animation?: Descriptor;
  yoyo?: boolean;
}

export interface StaggerOptions {
  each?: number;
  delay?: number;
}

export interface ParallelOptions {
  parallel?: Record<string, Descriptor> | Descriptor[];
}

export interface CustomTickContext {
  /** Excludes pauses. */
  elapsed: number;
  dt: number;
  from: number;
}

export type CustomTickFn = (ctx: CustomTickContext) => number;

export interface CustomOptions {
  tick?: CustomTickFn;
  duration?: number;
  from?: number;
}

export interface KeyframeStep {
  to: Primitive;
  duration?: number;
  easing?: (t: number) => number;
}

export interface KeyframeOptions {
  duration?: number;
  easing?: (t: number) => number;
}

export type DriverType =
  | 'spring'
  | 'timing'
  | 'decay'
  | 'delay'
  | 'sequence'
  | 'loop'
  | 'parallel'
  | 'custom';

export interface Descriptor {
  type: DriverType;
  to?:
    | Primitive
    | Primitive[]
    | Record<string, Primitive>
    | AnimateValue<Primitive>;
  options?: SpringOptions &
    TimingOptions &
    DecayOptions &
    SequenceOptions &
    DelayOptions &
    LoopOptions &
    ParallelOptions &
    CustomOptions &
    Callbacks;
}

export interface Controls {
  start(): void;
  pause(): void;
  resume(): void;
  cancel(): void;
  reset(): void;
}
