import { type UseAnimatedValueConfig } from '../useAnimatedValue';

export const withSequence = (
  configs: Array<
    | {
        toValue?: number;
        config?: UseAnimatedValueConfig;
      }
    | number
  >
) => {
  return async (
    next: (arg: { toValue?: number; config?: UseAnimatedValueConfig }) => void
  ) => {
    for (const config of configs) {
      await next(typeof config === 'number' ? { toValue: config } : config);
    }
  };
};
