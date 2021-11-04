import * as React from "react";

import { ResultType } from "./Animation";

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

export type TransitionValue = {
  _subscribe: (onUpdate: () => void) => void;
  _value: number | string;
  _config?: UseTransitionConfig;
};

export type AssignValue = { toValue: number | string; immediate?: boolean };
export type SubscriptionValue = (
  updatedValue: AssignValue,
  callback?: (result: ResultType) => void
) => void;

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
      };
    }, [initialValue, config]),
    (updatedValue: AssignValue, callback?: (result: ResultType) => void) => {
      subscriptions.current.forEach((updater) =>
        updater(updatedValue, callback)
      );
    },
  ];
};
