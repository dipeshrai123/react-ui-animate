export type Primitive = number | string;

export interface Callbacks {
  onStart?: () => void;
  onChange?: (v: number) => void;
  onComplete?: () => void;
}

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export interface TimingOptions {
  duration?: number;
  easing?: (t: number) => number;
}

export interface DecayOptions {
  velocity?: number;
  clamp?: [number, number];
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

export interface Controls {
  start(): void;
  pause(): void;
  resume(): void;
  cancel(): void;
  reset(): void;
}
