import { AnimationConfig } from '../animationType';
import { withConfig, type WithOnCallbacks } from './withConfig';

interface WithEaseConfig extends WithOnCallbacks {}

export const withEase = (toValue: number, config?: WithEaseConfig) =>
  withConfig(toValue, { ...AnimationConfig.EASE, ...config });
