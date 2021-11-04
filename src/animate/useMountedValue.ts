import { useTransition } from "react-spring";
import { isDefined } from "./isDefined";
import { getInitialConfig } from "./getInitialConfig";
import {
  UseAnimatedValueConfig,
  GenericAnimationConfig,
} from "./useAnimatedValue";

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
  const restConfig: GenericAnimationConfig = {};

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
