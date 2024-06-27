import type { Fn } from './common';

/**
 * Base unit which is accepted by `FluidValue`
 */
export type Length = number | string;

/**
 * Object passed as an argument on `onRest` function
 */
export type ResultType = { finished: boolean; value: number };

/**
 * Function read by `animated` hoc to determine whether it
 * can be animated or not
 */
export type SubscribeFn = (
  onUpdate: OnUpdateFn,
  property: string,
  uuid: number
) => void;

/**
 * Configuration object for `FluidValue`
 */
export interface FluidValueConfig {
  mass?: number;
  tension?: number;
  friction?: number;
  duration?: number;
  easing?: Fn<number, number>;
  immediate?: boolean;
  delay?: number;
  restDistance?: number;
  onChange?: Fn<number, void>;
  onRest?: Fn<ResultType, void>;
  onStart?: Fn<number, void>;
}

/**
 * Object which can be assigned to animate
 */
export type AssignValue =
  | Length
  | Fn<(next: Length, config?: FluidValueConfig) => Promise<any>, void>;

export type OnUpdateCallback = Fn<ResultType, void>;

/**
 * Function to start the animation (it starts the already subscribed animation)
 */
export type OnUpdateFn = (
  updatedValue: AssignValue,
  config?: FluidValueConfig,
  callback?: OnUpdateCallback
) => void;
