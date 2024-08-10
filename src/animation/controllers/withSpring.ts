import { AnimationConfigUtils } from '../animationType';
import { withConfig, type WithOnCallbacks } from './withConfig';
import { type UseAnimatedValueConfig } from '../useAnimatedValue';

interface WithSpringConfig
  extends Pick<UseAnimatedValueConfig, 'mass' | 'friction' | 'tension'>,
    WithOnCallbacks {}

export const withSpring = (toValue: number, config?: WithSpringConfig) =>
  withConfig(toValue, { ...AnimationConfigUtils.ELASTIC, ...config });
