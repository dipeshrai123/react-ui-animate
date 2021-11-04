import * as React from "react";
import {
  useTransition,
  TransitionValue,
  UseTransitionConfig,
} from "./useTransition";

interface InternalUseMountedValueConfig extends UseTransitionConfig {
  enterDuration?: number;
  exitDuration?: number;
}

interface UseMountedValueConfig {
  from: number;
  enter: number;
  exit: number;
  config?: InternalUseMountedValueConfig;
}

export const useMountedValue = (
  state: boolean,
  config: UseMountedValueConfig
) => {
  const [initialAnimation, setInitialAnimation] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [isExit, setIsExit] = React.useState(false);
  const [animation, setAnimation] = useTransition(config.from, config?.config);

  const enterDuration =
    config?.config?.enterDuration ?? config?.config?.duration;
  const exitDuration = config?.config?.exitDuration ?? config?.config?.duration;

  React.useEffect(() => {
    if (state) {
      // If state becomes true mount the node
      setInitialAnimation(true); // is initial animation
      setMounted(true);
    } else {
      setIsExit(true);
      setInitialAnimation(false);
    }
  }, [state, setAnimation, config, mounted]);

  React.useEffect(() => {
    if (initialAnimation && mounted) {
      setAnimation({ toValue: config.enter, duration: enterDuration });
    }
  }, [
    mounted,
    initialAnimation,
    setAnimation,
    config,
    setInitialAnimation,
    enterDuration,
  ]);

  React.useEffect(() => {
    if (!initialAnimation && isExit) {
      setAnimation(
        { toValue: config.exit, duration: exitDuration },
        ({ finished }: { finished: boolean }) => {
          if (finished) {
            if (mounted) {
              setMounted(false);
            }
          }
        }
      );
    }
  }, [initialAnimation, isExit, setAnimation, config, mounted, exitDuration]);

  return function (
    callback: (animation: TransitionValue, mounted: boolean) => React.ReactNode
  ) {
    return callback(animation, mounted);
  };
};
