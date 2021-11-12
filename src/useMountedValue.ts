import * as React from "react";
import {
  useTransition,
  TransitionValue,
  UseTransitionConfig,
} from "@raidipesh78/re-motion";

export interface InnerUseMountedValueConfig extends UseTransitionConfig {
  enterDuration?: number;
  exitDuration?: number;
}

interface UseMountedValueConfig {
  from: number;
  enter: number;
  exit: number;
  config?: InnerUseMountedValueConfig;
}

/**
 * useMountedValue handles mounting and unmounting of a component
 * @param state - boolean
 * @param config - useTransitionConfig
 * @returns mountedValueFunction with a callback with argument ( animationNode, mounted )
 */
export const useMountedValue = (
  state: boolean,
  config: UseMountedValueConfig
) => {
  const [initial, setInitial] = React.useState(true);
  const [mounted, setMounted] = React.useState(state);
  const { from, enter, exit, config: _config } = React.useRef(config).current;
  const [animation, setAnimation] = useTransition(from, _config);

  const enterDuration = config.config?.enterDuration ?? config.config?.duration;
  const exitDuration =
    config.config?.exitDuration ?? config.config?.exitDuration;

  React.useEffect(() => {
    if (state) {
      setInitial(true);
      setMounted(true);
    } else {
      setInitial(false);
      setAnimation(
        {
          toValue: exit,
          duration: exitDuration,
        },
        function () {
          setMounted(false);
        }
      );
    }
  }, [state]);

  React.useEffect(() => {
    if (mounted && initial) {
      setAnimation(
        {
          toValue: enter,
          duration: enterDuration,
        },
        function () {
          return;
        }
      );
    }
  }, [mounted, initial]);

  return function (
    callback: (
      { value }: { value: TransitionValue },
      mounted: boolean
    ) => React.ReactNode
  ) {
    return callback({ value: animation }, mounted);
  };
};
