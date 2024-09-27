import { FluidValue, spring } from '@raidipesh78/re-motion';

import { withConfig, type WithConfig } from '../helpers';

interface WithSpringConfig extends WithConfig {
  mass?: number;
  friction?: number;
  tension?: number;
}

export const withSpring =
  (toValue: number, config?: WithSpringConfig): any =>
  (value: FluidValue) =>
    withConfig({
      value,
      animationController: spring(value, {
        toValue,
        mass: config?.mass,
        friction: config?.friction,
        tension: config?.tension,
      }),
      config,
    });
