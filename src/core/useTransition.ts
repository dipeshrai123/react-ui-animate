import * as React from "react";

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
  _config: UseTransitionConfig;
};

export type UseTransitionReturn = [
  TransitionValue,
  (value: number | string, callback?: (result: any) => void) => void
];

/**
 * useTransition() hook for time and spring based animations
 * @param initialValue numbers are animatable and strings are non-animatable
 * @param config
 * @returns [value, setValue]
 */
export const useTransition = (
  initialValue: number | string,
  config?: UseTransitionConfig
): any => {
  const subscriptions = React.useRef<
    Array<(value: number, callback?: (result: any) => void) => void>
  >([]);

  return [
    React.useMemo(() => {
      return {
        _subscribe: function (onUpdate: () => void) {
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
    (value: number, callback?: (result: any) => void) => {
      subscriptions.current.forEach((updater) => updater(value, callback));
    },
  ];
};
