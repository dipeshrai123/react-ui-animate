import { FluidValue, timing } from '@raidipesh78/re-motion';

interface WithTimingConfig {
  duration?: number;
  easing?: (t: number) => number;
  onStart?: (value: number | string) => void;
  onChange?: (value: number | string) => void;
  onRest?: (value: number | string) => void;
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
