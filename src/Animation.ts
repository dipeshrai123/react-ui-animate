import * as React from "react";
import { useSpring, config as springConfig, useTransition } from "react-spring";

type AnimatedValueType = number | boolean;
type InitialConfigType = "ease" | "elastic" | undefined;
type AnimationConfigType = {
  duration?: number;
  velocity?: number;
  mass?: number;
  friction?: number;
  tension?: number;
};

// Boolean to binary
const bin = (booleanValue: boolean) => {
  return booleanValue ? 1 : 0;
};

const getValue = (value: AnimatedValueType) => {
  if (typeof value === "number") {
    return value;
  } else if (typeof value === "boolean") {
    return bin(value);
  } else {
    throw new Error(
      "Invalid Value! Animated value only accepts boolean or number."
    );
  }
};

const getInitialConfig = (animationType: InitialConfigType) => {
  return animationType === "ease"
    ? springConfig.default
    : { mass: 1, friction: 18, tension: 250 };
};

interface UseAnimatedValueConfig {
  animationType?: InitialConfigType;
  duration?: number;
  veloctiy?: number;
  mass?: number;
  friction?: number;
  tension?: number;
  onAnimationEnd?: (value: number) => void;
  listener?: (value: number) => void;
  immediate?: boolean;
}

export const useAnimatedValue = (
  initialValue: AnimatedValueType,
  config?: UseAnimatedValueConfig
) => {
  const _initialValue: number = getValue(initialValue);
  const _prevValue = React.useRef<number>(_initialValue); // Get track previous value

  const animationType = config?.animationType || "ease"; // Defines default animation
  const onAnimationEnd = config?.onAnimationEnd;
  const listener = config?.listener;
  const duration = config?.duration;
  const velocity = config?.veloctiy;
  const mass = config?.mass;
  const friction = config?.friction;
  const tension = config?.tension;

  const initialConfig = getInitialConfig(animationType);
  const restConfig: AnimationConfigType = {};

  if (duration) restConfig.duration = duration;
  if (velocity) restConfig.velocity = velocity;
  if (mass) restConfig.mass = mass;
  if (friction) restConfig.friction = friction;
  if (tension) restConfig.tension = tension;

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
  }: {
    updatedValue?: AnimatedValueType;
    immediate?: boolean;
  }) => {
    if (immediate !== undefined) {
      set({ immediate });
    } else if (updatedValue !== undefined) {
      set({
        value: getValue(updatedValue),
        onRest: ({ value }: { value: any }) => {
          onAnimationEnd && onAnimationEnd(value);
        },
        onChange: function ({ value }: { value: number }) {
          listener && listener(value);
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

  const targetObject: { value: any; immediate: boolean } = {
    value: props.value,
    immediate: false,
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

      throw new Error("You cannot set any other property to animation node.");
    },
    get: function (_, key) {
      if (key === "value") {
        return props.value;
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
  if (enterDuration) {
    _enterConfig.config = { duration: enterDuration };
  }

  const _exitConfig: any = {};
  if (exitDuration) {
    _exitConfig.config = { duration: exitDuration };
  }

  const animationType = config?.animationType || "ease"; // Defines default animation
  const onAnimationEnd = config?.onAnimationEnd;
  const listener = config?.listener;
  const duration = config?.duration;
  const velocity = config?.veloctiy;
  const mass = config?.mass;
  const friction = config?.friction;
  const tension = config?.tension;

  const initialConfig = getInitialConfig(animationType);
  const restConfig: AnimationConfigType = {};

  if (duration) restConfig.duration = duration;
  if (velocity) restConfig.velocity = velocity;
  if (mass) restConfig.mass = mass;
  if (friction) restConfig.friction = friction;
  if (tension) restConfig.tension = tension;

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
    onChange: function ({ value }: { value: number }) {
      listener && listener(value);
    },
    immediate: !!config?.immediate,
  });

  return transition;
};
