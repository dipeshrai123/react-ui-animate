import * as React from 'react';
import {
  useTransition,
  TransitionValue,
  UseMountConfig,
} from '@raidipesh78/re-motion';

export interface UseMountedValueConfig extends UseMountConfig {}

/**
 * `useMountedValue` handles mounting and unmounting of a component which captures current state
 * passed as an arugment (`state`) and exposes the shadow state which handles the mount and unmount
 * of a component.
 * @param { boolean } state - Boolean indicating the component should mount or unmount.
 * @param { UseMountedValueConfig } config - Animation configuration.
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
