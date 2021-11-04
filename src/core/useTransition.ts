import * as React from "react";

import { ResultType } from "./Animation";

/**
 * UseTransitionConfig for useTransition config
 */
export interface UseTransitionConfig {
  mass?: number;
  tension?: number;
  friction?: number;
  duration?: number;
  easing?: (t: number) => number;
  immediate?: boolean;
  delay?: number;
  onChange?: (value: number) => void;
  onRest?: (value: any) => void;
}

export type SubscriptionValue = (
  updatedValue: AssignValue,
  callback?: (result: ResultType) => void
) => void;

/**
 * useTransition returns TransitionValue object
 */
export type TransitionValue = {
  _subscribe: (onUpdate: SubscriptionValue) => void;
  _value: number | string;
  _currentValue: React.MutableRefObject<number | string>;
  get: () => number | string;
  _config?: UseTransitionConfig;
};

/**
 * Assign value object to set animation
 */
export type AssignValue = {
  toValue: number | string;
  immediate?: boolean;
  duration?: number; // only for time-based animation
};

/**
 * useTransition return type
 */
export type UseTransitionReturn = [TransitionValue, SubscriptionValue];

/**
 * useTransition() hook for time and spring based animations
 * @param initialValue numbers are animatable and strings are non-animatable
 * @param config
 * @returns [value, setValue]
 */
export const useTransition = (
  initialValue: number | string,
  config?: UseTransitionConfig
): UseTransitionReturn => {
  const subscriptions = React.useRef<Array<SubscriptionValue>>([]);
  const _currentValue = React.useRef<number | string>(initialValue);

  return [
    React.useMemo(() => {
      return {
        _subscribe: function (onUpdate: SubscriptionValue) {
          subscriptions.current.push(onUpdate);

          return () => {
            subscriptions.current = subscriptions.current.filter(
              (x) => x !== onUpdate
            );
          };
        },
        _value: initialValue,
        _config: config,
        _currentValue,
        get: function () {
          return _currentValue.current;
        },
      };
    }, [initialValue, config]),
    (updatedValue: AssignValue, callback?: (result: ResultType) => void) => {
      subscriptions.current.forEach((updater) =>
        updater(updatedValue, callback)
      );
    },
  ];
};
