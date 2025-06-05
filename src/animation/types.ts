export type Primitive = number | string;

export interface WithCallbacks {
  onStart?: (value: number | string) => void;
  onChange?: (value: number | string) => void;
  onRest?: (value: number | string) => void;
}

export type DriverConfig = {
  type: 'spring' | 'timing' | 'decay' | 'sequence' | 'delay' | 'loop';
  to?: Primitive;
  options?: {
    controller?: DriverConfig;
    iterations?: number;
    delay?: number;
    duration?: number;
    easing?: (t: number) => number;
    stiffness?: number;
    damping?: number;
    mass?: number;
    velocity?: number;
    clamp?: [number, number];
    steps?: DriverConfig[];
    onStart?: () => void;
    onChange?: (v: string | number) => void;
    onComplete?: () => void;
  };
};

export type ToValue<V> = DriverConfig | V;
