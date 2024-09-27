import { useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

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
