import * as React from "react";
import { useSpring, useTransition, SpringValue } from "react-spring";
import { bin } from "./Math";

type AnimatedValueType = number | boolean | string | SpringValue;
type InitialConfigType = "ease" | "elastic" | "stiff" | "wooble" | undefined;
interface AnimationConfigType {
  duration?: number;
  velocity?: number;
  mass?: number;
  friction?: number;
  tension?: number;
  easing?: (t: number) => number;
  delay?: number;
  decay?: number | boolean;
}

// check undefined or null
const isDefined = <T>(value: T): boolean => {
  return value !== undefined && value !== null;
};

const getValue = (value: AnimatedValueType) => {
  if (typeof value === "number" || typeof value === "string") {
    return value;
  } else if (typeof value === "boolean") {
    return bin(value);
  } else if (value instanceof SpringValue) {
    return value;
  } else {
    throw new Error(
      "Invalid Value! Animated value only accepts animation value, string, boolean or number."
    );
  }
};

const getInitialConfig = (
  animationType: InitialConfigType
): {
  mass: number;
  friction: number;
  tension: number;
} => {
  switch (animationType) {
    case "elastic":
      return { mass: 1, friction: 18, tension: 250 };

    case "stiff":
      return { mass: 1, friction: 18, tension: 350 };

    case "wooble":
      return { mass: 1, friction: 8, tension: 250 };

    case "ease":
    default:
      return { mass: 1, friction: 26, tension: 170 };
  }
};

export interface UseAnimatedValueConfig extends AnimationConfigType {
  animationType?: InitialConfigType;
  onAnimationEnd?: (value: any) => void;
  listener?: (value: number) => void;
  immediate?: boolean;
}

export const useAnimatedValue = (
  initialValue: AnimatedValueType,
  config?: UseAnimatedValueConfig
) => {
  const _initialValue: number | string | SpringValue = getValue(initialValue);
  const _prevValue = React.useRef<number | string | SpringValue>(_initialValue); // Get track previous value

  const animationType = config?.animationType ?? "ease"; // Defines default animation
  const onAnimationEnd = config?.onAnimationEnd;
  const listener = config?.listener;
  const duration = config?.duration;
  const velocity = config?.velocity;
  const mass = config?.mass;
  const friction = config?.friction;
  const tension = config?.tension;
  const easing = config?.easing ?? ((t: number) => t);
  const delay = config?.delay ?? 0;
  const decay = config?.decay ?? false;

  const initialConfig = getInitialConfig(animationType);
  const restConfig: AnimationConfigType = {};

  if (isDefined(duration)) restConfig.duration = duration;
  if (isDefined(velocity)) restConfig.velocity = velocity;
  if (isDefined(mass)) restConfig.mass = mass;
  if (isDefined(friction)) restConfig.friction = friction;
  if (isDefined(tension)) restConfig.tension = tension;
  if (isDefined(easing)) restConfig.easing = easing;
  if (isDefined(delay)) restConfig.delay = delay;
  if (isDefined(decay)) restConfig.decay = decay;

  const _config = {
    ...initialConfig,
    ...restConfig,
  };

  const [props, set] = useSpring(() => ({
    value: _initialValue,
    config: _config,
    immediate: !!config?.immediate,
  }));

  const _update = ({
    updatedValue,
    immediate,
    decay,
  }: {
    updatedValue?: AnimatedValueType;
    immediate?: boolean;
    decay?: { value: number | boolean; velocity: number };
  }) => {
    if (immediate !== undefined) {
      set.start({ immediate });
    } else if (updatedValue !== undefined) {
      set.start({
        value: getValue(updatedValue),
        onRest: ({ value }: { value: any }) => {
          onAnimationEnd && onAnimationEnd(value.value);
        },
        onChange: function ({ value }: { value: any }) {
          listener && listener(value);
        },
        immediate: !!config?.immediate,
        delay: _config.delay,
      });
    } else if (decay !== undefined) {
      set.start({
        config: {
          decay: decay.value,
          velocity: decay.velocity,
        },
      });
    }
  };

  React.useEffect(() => {
    if (initialValue !== _prevValue.current) {
      _update({ updatedValue: _initialValue });
      _prevValue.current = _initialValue;
    }
  }, [initialValue]);

  const targetObject: {
    value: any;
    immediate: boolean;
    currentValue: string | number;
    decay: { value: number | boolean; velocity: number };
  } = {
    value: props.value,
    immediate: false,
    currentValue: props.value.get(),
    decay: { value: false, velocity: 0 },
  };

  return new Proxy(targetObject, {
    set: function (_, key, value) {
      if (key === "value") {
        _update({
          updatedValue: value,
        });

        return true;
      }

      if (key === "immediate") {
        _update({
          immediate: value,
        });

        return true;
      }

      if (key === "decay") {
        _update({
          decay: value,
        });

        return true;
      }

      throw new Error("You cannot set any other property to animation node.");
    },
    get: function (_, key) {
      if (key === "value") {
        return props.value;
      }

      if (key === "currentValue") {
        return props.value.get();
      }

      throw new Error(
        "You cannot access any other property from animation node."
      );
    },
  });
};

interface UseMountedValueConfig extends UseAnimatedValueConfig {
  enterDuration?: number;
  exitDuration?: number;
}

export const useMountedValue = (
  initialState: boolean,
  phases: [number, number, number],
  config?: UseMountedValueConfig
) => {
  const [from, enter, leave] = phases;

  const enterDuration = config?.enterDuration;
  const exitDuration = config?.exitDuration;

  const _enterConfig: any = {};
  if (isDefined(enterDuration)) {
    _enterConfig.config = { duration: enterDuration };
  }

  const _exitConfig: any = {};
  if (isDefined(exitDuration)) {
    _exitConfig.config = { duration: exitDuration };
  }

  const animationType = config?.animationType ?? "ease"; // Defines default animation
  const onAnimationEnd = config?.onAnimationEnd;
  const duration = config?.duration;
  const listener = config?.listener;
  const velocity = config?.velocity;
  const mass = config?.mass;
  const friction = config?.friction;
  const tension = config?.tension;
  const easing = config?.easing ?? ((t: number) => t);
  const delay = config?.delay ?? 0;

  const initialConfig = getInitialConfig(animationType);
  const restConfig: AnimationConfigType = {};

  if (isDefined(duration)) restConfig.duration = duration;
  if (isDefined(velocity)) restConfig.velocity = velocity;
  if (isDefined(mass)) restConfig.mass = mass;
  if (isDefined(friction)) restConfig.friction = friction;
  if (isDefined(tension)) restConfig.tension = tension;
  if (isDefined(easing)) restConfig.easing = easing;
  if (isDefined(delay)) restConfig.delay = delay;

  const _config = {
    ...initialConfig,
    ...restConfig,
  };

  const transition = useTransition(initialState, {
    from: { value: from },
    enter: {
      value: enter,
      ..._enterConfig,
    },
    leave: {
      value: leave,
      ..._exitConfig,
    },
    config: _config,
    onRest: ({ value }: { value: any }) => {
      onAnimationEnd && onAnimationEnd(value);
    },
    onChange: function ({ value }: { value: any }) {
      listener && listener(value);
    },
    immediate: !!config?.immediate,
    delay: _config.delay,
  });

  return transition;
};
