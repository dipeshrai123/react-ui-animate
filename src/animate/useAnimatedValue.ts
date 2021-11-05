import * as React from "react";
import { Easing, useTransition, TransitionValue, ResultType } from "../core";
import { bin } from "./Math";
import { isDefined } from "./isDefined";
import { InitialConfigType, getInitialConfig } from "./getInitialConfig";

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

interface UseAnimatedValueReturn {
  value:
    | TransitionValue
    | number
    | string
    | { toValue: number | string; immediate?: boolean };
  currentValue: number | string;
}

/**
 * useAnimatedValue for animated transitions
 */
export const useAnimatedValue = (
  initialValue: AnimatedValueType,
  config?: UseAnimatedValueConfig
): UseAnimatedValueReturn => {
  const isInitial = React.useRef(true);
  const _initialValue: number | string = getValue(initialValue);

  const animationType = config?.animationType ?? "ease"; // Defines default animation
  const onAnimationEnd = config?.onAnimationEnd;
  const listener = config?.listener;
  const duration = config?.duration;
  const mass = config?.mass;
  const friction = config?.friction;
  const tension = config?.tension;
  const easing = config?.easing ?? Easing.linear;
  const delay = config?.delay ?? 0;

  const initialConfig = getInitialConfig(animationType);
  const restConfig: GenericAnimationConfig = {};

  if (isDefined(duration)) restConfig.duration = duration;
  if (isDefined(mass)) restConfig.mass = mass;
  if (isDefined(friction)) restConfig.friction = friction;
  if (isDefined(tension)) restConfig.tension = tension;
  if (isDefined(easing)) restConfig.easing = easing;
  if (isDefined(delay)) restConfig.delay = delay;

  const _config = {
    ...initialConfig,
    ...restConfig,
  };

  const [animation, setAnimation] = useTransition(_initialValue, {
    ..._config,
    immediate: !!config?.immediate,
    onRest: function (result: any) {
      onAnimationEnd && onAnimationEnd(result);
    },
    onChange: function (value: number) {
      listener && listener(value);
    },
  });

  // doesn't fire on initial render
  React.useEffect(() => {
    if (!isInitial.current) {
      setAnimation({ toValue: _initialValue });
    }
    isInitial.current = false;
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
};
