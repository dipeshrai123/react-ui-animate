import { UseValueConfig } from '../hooks/useValue';

export const withDelay = (
  delay: number,
  animation: { toValue: number; config?: UseValueConfig }
) => ({
  ...animation,
  config: {
    ...animation.config,
    delay,
  },
});
