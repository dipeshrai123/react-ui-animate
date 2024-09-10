import type { UseValueConfig } from '../hooks';
import type { UpdateValue } from '../core/FluidController';

export interface WithOnCallbacks
  extends Pick<UseValueConfig, 'onRest' | 'onStart' | 'onChange'> {}

export const withConfig = (toValue: number, config?: UseValueConfig): UpdateValue => ({
  toValue,
  config,
});
