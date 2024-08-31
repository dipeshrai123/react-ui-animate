import { AnimationConfigUtils } from '../animationType';
import { withConfig, type WithOnCallbacks } from './withConfig';
import { type UseAnimatedValueConfig } from '../hooks/useValue';

interface WithSpringConfig
  extends Pick<UseAnimatedValueConfig, 'mass' | 'friction' | 'tension'>,
    WithOnCallbacks {}

export const withSpring = (toValue: number, config?: WithSpringConfig) =>
  withConfig(toValue, { ...AnimationConfigUtils.ELASTIC, ...config });
