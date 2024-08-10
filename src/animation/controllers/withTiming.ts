import { type UseAnimatedValueConfig } from '../useAnimatedValue';
import { withConfig, type WithOnCallbacks } from './withConfig';

interface WithTimingConfig
  extends Pick<UseAnimatedValueConfig, 'duration' | 'easing'>,
    WithOnCallbacks {}

export const withTiming = (toValue: number, config?: WithTimingConfig) =>
  withConfig(toValue, { duration: 250, ...config });
