import * as React from "react";
import {
  useTransition,
  TransitionValue,
  ResultType,
} from "@raidipesh78/re-motion";
import { bin } from "../gestures/math";
import { InitialConfigType, getInitialConfig } from "./getInitialConfig";

// useAnimatedValue value type
type AnimatedValueType = number | boolean | string;

/**
 * getValue checks for type of initialValue and throws error
 * for type other than AnimatedValueType
 */
const getValue = (value: AnimatedValueType) => {
  if (typeof value === "number" || typeof value === "string") {
    return value;
  } else if (typeof value === "boolean") {
    return bin(value);
  } else {
    throw new Error(
      "Invalid Value! Animated value only accepts string, boolean or number."
    );
  }
};

// General config type
export interface GenericAnimationConfig {
  duration?: number;
  mass?: number;
  friction?: number;
  tension?: number;
  easing?: (t: number) => number;
  delay?: number;
}

export interface UseAnimatedValueConfig extends GenericAnimationConfig {
  animationType?: InitialConfigType;
  onAnimationEnd?: (value: ResultType) => void;
  listener?: (value: number) => void;
  immediate?: boolean;
}

export type ValueReturnType =
  | TransitionValue
  | number
  | string
  | { toValue: number | string; immediate?: boolean };

interface UseAnimatedValueReturn {
  value: ValueReturnType;
  currentValue: number | string;
}

/**
 * useAnimatedValue for animated transitions
 */
export function useAnimatedValue(
  initialValue: AnimatedValueType,
  config?: UseAnimatedValueConfig
): UseAnimatedValueReturn {
  const _isInitial = React.useRef(true);
  const _initialValue: number | string = getValue(initialValue);

  const animationType = config?.animationType ?? "ease"; // Defines default animation
  const onAnimationEnd = config?.onAnimationEnd;
  const listener = config?.listener;

  const [animation, setAnimation] = useTransition(_initialValue, {
    ...getInitialConfig(animationType),
    ...config,
    onRest: function (result: any) {
      onAnimationEnd && onAnimationEnd(result);
    },
    onChange: function (value: number) {
      listener && listener(value);
    },
  });

  // doesn't fire on initial render
  React.useEffect(() => {
    if (!_isInitial.current) {
      setAnimation({ toValue: _initialValue });
    }
    _isInitial.current = false;
  }, [_initialValue]);

  const targetObject: {
    value: any;
    currentValue: string | number;
  } = {
    value: animation,
    currentValue: animation.get(),
  };

  return new Proxy(targetObject, {
    set: function (
      _,
      key,
      value: number | string | { toValue: number | string; immediate?: boolean }
    ) {
      if (key === "value") {
        if (typeof value === "number" || typeof value === "string") {
          setAnimation({ toValue: value });
        } else if (typeof value === "object") {
          setAnimation({ toValue: value.toValue, immediate: value?.immediate });
        }

        return true;
      }

      throw new Error("You cannot set any other property to animation node.");
    },
    get: function (_, key) {
      if (key === "value") {
        return animation;
      }

      if (key === "currentValue") {
        return animation.get();
      }

      throw new Error(
        "You cannot access any other property from animation node."
      );
    },
  });
}
