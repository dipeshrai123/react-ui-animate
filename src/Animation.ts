import * as React from "react";
import { useSpring, config as springConfig, useTransition } from "react-spring";

type InitialValueType = number | boolean;
type InitialConfigType = "ease" | "elastic" | undefined;
type TargetObjectType = { value: any; immediate: boolean };

// Boolean to binary
const bin = (booleanValue: boolean) => {
  return booleanValue ? 1 : 0;
};

const getInitialValue = (initialValue: InitialValueType) => {
  return typeof initialValue === "boolean" ? bin(initialValue) : initialValue;
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
  initialValue: InitialValueType,
  config?: UseAnimatedValueConfig
) => {
  const _initialValue: number = getInitialValue(initialValue);
  const _prevValue = React.useRef<number>(_initialValue); // Get track previous value
  const _isImmediate = React.useRef<boolean>(!!config?.immediate); // Immediate actions

  const animationType = config?.animationType; // Defines default animation
  const initialConfig = getInitialConfig(animationType);
  const onAnimationEnd = config?.onAnimationEnd;
  const listener = config?.listener;

  const [props, set] = useSpring(() => ({
    value: _initialValue,
    config: {
      ...initialConfig,
      duration: config?.duration,
      velocity: config?.veloctiy,
      mass: config?.mass,
      friction: config?.friction,
      tension: config?.tension,
    },
    immediate: _isImmediate.current,
  }));

  const _update = (updatedValue: number) => {
    set({
      value: updatedValue,
      onRest: ({ value }: { value: any }) => {
        onAnimationEnd && onAnimationEnd(value);
      },
      onChange: function ({ value }: { value: number }) {
        listener && listener(value);
      },
      immediate: _isImmediate.current,
    });
  };

  React.useEffect(() => {
    if (initialValue !== _prevValue.current) {
      _update(_initialValue);
      _prevValue.current = _initialValue;
    }
  }, [initialValue]);

  const _targetObject: TargetObjectType = {
    value: props.value,
    immediate: false,
  };
  return new Proxy(_targetObject, {
    set: function (target: TargetObjectType, key, value) {
      if (key === "value") {
        target.value = value;
        _update(value);
        return true;
      }

      if (key === "immediate") {
        _isImmediate.current = value;
        return true;
      }

      return false;
    },
    get: function (_target, key) {
      if (key === "value") {
        return props.value;
      }

      if (key === "immediate") {
        return _isImmediate.current;
      }

      return false;
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

  const animationType = config?.animationType;
  const initialConfig = getInitialConfig(animationType);

  const enterDuration = config?.enterDuration;
  const exitDuration = config?.exitDuration;
  const onAnimationEnd = config?.onAnimationEnd;
  const listener = config?.listener;

  const transition = useTransition(initialState, {
    from: { value: from },
    enter: { value: enter, config: { duration: enterDuration } },
    leave: { value: leave, config: { duration: exitDuration } },
    config: {
      ...initialConfig,
      duration: config?.duration,
      velocity: config?.veloctiy,
      mass: config?.mass,
      friction: config?.friction,
      tension: config?.tension,
    },
    onRest: ({ value }: { value: any }) => {
      onAnimationEnd && onAnimationEnd(value);
    },
    onChange: function ({ value }: { value: number }) {
      listener && listener(value);
    },
    immediate: config?.immediate,
  });

  return transition;
};
