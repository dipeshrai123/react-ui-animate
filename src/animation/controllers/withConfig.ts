import type { UseAnimatedValueConfig } from '../hooks/useValue';

export interface WithOnCallbacks
  extends Pick<UseAnimatedValueConfig, 'onRest' | 'onStart' | 'onChange'> {}

export const withConfig = (
  toValue: number,
  config?: UseAnimatedValueConfig
) => ({
  toValue,
  config,
});
