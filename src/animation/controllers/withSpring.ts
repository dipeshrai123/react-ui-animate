import { FluidValue, spring } from '@raidipesh78/re-motion';
import { AnimationConfig } from '../helpers';

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
      ...AnimationConfig.Spring.ELASTIC,
      ...config,
    }),
    callback,
  });
