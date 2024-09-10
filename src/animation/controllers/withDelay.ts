import type { UseValueConfig } from '../hooks';
import type { UpdateValue } from '../core/FluidController';

export const withDelay = (
  delay: number,
  animation: { toValue: number; config?: UseValueConfig }
): UpdateValue => ({
  ...animation,
  config: {
    ...animation.config,
    delay,
  },
});
