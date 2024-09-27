import { useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

/**
 * `useValue` returns an animation value with `.value` and `.currentValue` property which is
 * initialized when passed to argument (`initialValue`). The returned value persist until the lifetime of
 * a component. It doesn't cast any re-renders which can is very good for performance optimization.
 *
 * @param { number | string } initialValue - Initial value
 */

type Callback = (result: { finished: boolean; value: number }) => void;

interface ControllerAnimation {
  start: (callback: Callback) => void;
  stop: () => void;
  reset: () => void;
}

export function useValue(initialValue: number | string) {
  const animation = useRef(new FluidValue(initialValue)).current;

  return {
    set value(
      to: (animation: FluidValue) => {
        controller: ControllerAnimation;
        callback: Callback;
      }
    ) {
      const { controller, callback } = to(animation);
      console.log(callback);
      controller.start(callback);
    },
    get value(): FluidValue {
      return animation;
    },
    get currentValue() {
      return animation.get();
    },
  };
}
