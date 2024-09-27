import { FluidValue, timing } from '@raidipesh78/re-motion';

import { withConfig, type WithConfig } from '../helpers';

interface WithTimingConfig extends WithConfig {
  duration?: number;
  easing?: (t: number) => number;
}

export const withTiming =
  (toValue: number, config?: WithTimingConfig): any =>
  (value: FluidValue) =>
    withConfig({
      value,
      animationController: timing(value, {
        toValue,
        duration: config?.duration,
        easing: config?.easing,
      }),
      config,
    });
