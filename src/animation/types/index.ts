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
  elastic?: boolean | number; // If true, uses default elastic constant (0.15). If number, uses that as the elastic constant.
  /** Deceleration constant per frame (lower = more friction, stops sooner). Default 0.998. */
  decay?: number;
  /**
   * Reflects velocity off `clamp`'s bounds instead of stopping or resisting
   * at them — a real bounce. `true` uses a default restitution of 0.5
   * (loses half its speed each bounce); a number sets a custom restitution
   * (0 = absorbs on contact, no bounce; 1 = perfectly elastic, no energy
   * loss). Takes priority over `elastic` when both are set.
   */
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
  /** Milliseconds elapsed since this run started (pauses excluded). */
  elapsed: number;
  /** Milliseconds since the previous frame (0 on the first frame). */
  dt: number;
  /** The value this run started from. */
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
