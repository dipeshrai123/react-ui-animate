import { FluidValue, timing } from '@raidipesh78/re-motion';

import type { WithCallbacks } from '../types';

interface WithTimingConfig extends WithCallbacks {
  duration?: number;
  easing?: (t: number) => number;
}

export const withTiming =
  (
    toValue: number,
    config?: WithTimingConfig,
    callback?: (result: any) => void
  ) =>
  (value: FluidValue) => ({
    controller: timing(value, {
      toValue,
      duration: config?.duration,
      easing: config?.easing,
      onStart: config?.onStart,
      onChange: config?.onChange,
      onRest: config?.onRest,
    }),
    callback,
  });
