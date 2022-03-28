import * as React from 'react';
import {
  useTransition,
  TransitionValue,
  UseMountConfig,
} from '@raidipesh78/re-motion';

export interface UseMountedValueConfig extends UseMountConfig {}

/**
 * useMountedValue handles mounting and unmounting of a component
 * @param state - boolean
 * @param config - useTransitionConfig
 * @returns mountedValueFunction with a callback with argument ( { value: animationNode }, mounted )
 */
export function useMountedValue(state: boolean, config: UseMountedValueConfig) {
  const initial = React.useRef(true);
  const [mounted, setMounted] = React.useState(state);
  const {
    from,
    enter,
    exit,
    config: innerConfig,
    enterConfig,
    exitConfig,
  } = React.useRef(config).current;
  const [animation, setAnimation] = useTransition(from, innerConfig);

  React.useEffect(() => {
    if (state) {
      initial.current = true;
      setMounted(true);
    } else {
      initial.current = false;
      setAnimation(
        {
          toValue: exit,
          config: exitConfig,
        },
        function ({ finished }) {
          if (finished) {
            setMounted(false);
          }
        }
      );
    }
  }, [state]);

  React.useEffect(() => {
    if (mounted && initial.current) {
      setAnimation({
        toValue: enter,
        config: enterConfig,
      });
    }
  }, [mounted, initial.current]);

  return function (
    callback: (
      { value: animation }: { value: TransitionValue },
      mounted: boolean
    ) => React.ReactNode
  ) {
    return callback({ value: animation }, mounted);
  };
}
