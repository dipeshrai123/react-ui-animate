import { useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { ControllerAnimation } from '../../controllers/types';

export function useValue(initialValue: number | string) {
  const animation = useRef(new FluidValue(initialValue)).current;

  return {
    set value(to: (animation: FluidValue) => ControllerAnimation) {
      to(animation).start(() => {});
    },
    get value(): FluidValue {
      return animation;
    },
    get currentValue() {
      return animation.get();
    },
  };
}
