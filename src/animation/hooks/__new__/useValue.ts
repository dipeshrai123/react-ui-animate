import { useRef } from 'react';
import { FluidValue, spring } from '@raidipesh78/re-motion';

export function useValue(initialValue: number | string) {
  const animation = useRef(new FluidValue(initialValue)).current;

  return {
    set value(
      to: (animation: FluidValue) => {
        controller: ReturnType<typeof spring>;
        callback?: (result: {
          finished: boolean;
          value?: number | string;
        }) => void;
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
