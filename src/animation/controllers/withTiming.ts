import { type UseValueConfig } from '../hooks';
import { withConfig, type WithOnCallbacks } from './withConfig';
import { UpdateValue } from '../core/FluidController';

interface WithTimingConfig
  extends Pick<UseValueConfig, 'duration' | 'easing'>,
    WithOnCallbacks {}

export const withTiming = (
  toValue: number,
  config?: WithTimingConfig
): UpdateValue => withConfig(toValue, { duration: 250, ...config });
