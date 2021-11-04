import React from "react";
import { useTransition, TransitionValue } from "./useTransition";

interface UseMountedValueConfig {
  from: number;
  enter: number;
  exit: number;
}

export const useMountedValue = (
  state: boolean,
  config: UseMountedValueConfig
) => {
  const [initialAnimation, setInitialAnimation] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [isExit, setIsExit] = React.useState(false);
  const [animation, setAnimation] = useTransition(config.from);

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
      setAnimation(config.enter);
    }
  }, [mounted, initialAnimation, setAnimation, config, setInitialAnimation]);

  React.useEffect(() => {
    if (!initialAnimation && isExit) {
      setAnimation(config.exit, ({ finished }) => {
        if (finished) {
          if (mounted) {
            setMounted(false);
          }
        }
      });
    }
  }, [initialAnimation, isExit, setAnimation, config, mounted]);

  return function (
    callback: (animation: TransitionValue, mounted: boolean) => React.ReactNode
  ) {
    return callback(animation, mounted);
  };
};
