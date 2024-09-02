import type { UseValueConfig } from '../hooks/useValue';

export interface WithOnCallbacks
  extends Pick<UseValueConfig, 'onRest' | 'onStart' | 'onChange'> {}

export const withConfig = (toValue: number, config?: UseValueConfig) => ({
  toValue,
  config,
});
