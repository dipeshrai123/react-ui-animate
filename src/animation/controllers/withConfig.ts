import type { UseAnimatedValueConfig } from '../useAnimatedValue';

export interface WithOnCallbacks
  extends Pick<UseAnimatedValueConfig, 'onRest' | 'onStart' | 'onChange'> {}

export const withConfig = (
  toValue: number,
  config?: UseAnimatedValueConfig
) => ({
  toValue,
  config,
});
