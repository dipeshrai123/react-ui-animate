import { type UseValueConfig } from '../hooks';
import { withConfig, type WithOnCallbacks } from './withConfig';

interface WithTimingConfig
  extends Pick<UseValueConfig, 'duration' | 'easing'>,
    WithOnCallbacks {}

export const withTiming = (toValue: number, config?: WithTimingConfig) =>
  withConfig(toValue, { duration: 250, ...config });
