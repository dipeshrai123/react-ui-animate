import { UseAnimatedValueConfig } from '../hooks/useAnimatedValue';

export const withDelay = (
  delay: number,
  animation: { toValue: number; config?: UseAnimatedValueConfig }
) => ({
  ...animation,
  config: {
    ...animation.config,
    delay,
  },
});
