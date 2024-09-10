import { AnimationConfig } from '../animationType';
import { withConfig, type WithOnCallbacks } from './withConfig';
import type { UpdateValue } from '../core/FluidController';

interface WithEaseConfig extends WithOnCallbacks {}

export const withEase = (toValue: number, config?: WithEaseConfig): UpdateValue =>
  withConfig(toValue, { ...AnimationConfig.EASE, ...config });
