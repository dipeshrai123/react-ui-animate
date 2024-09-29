import { FluidValue, spring } from '@raidipesh78/re-motion';

interface WithSpringConfig {
  mass?: number;
  friction?: number;
  tension?: number;
  onStart?: (value: number | string) => void;
  onChange?: (value: number | string) => void;
  onRest?: (value: number | string) => void;
}

export const withSpring =
  (
    toValue: number,
    config?: WithSpringConfig,
    callback?: (result: any) => void
  ) =>
  (value: FluidValue) => ({
    controller: spring(value, {
      toValue,
      mass: config?.mass,
      friction: config?.friction,
      tension: config?.tension,
      onStart: config?.onStart,
      onChange: config?.onChange,
      onRest: config?.onRest,
    }),
    callback,
  });
