import { AnimationConfig } from '../animationType';
import { type UseValueConfig } from '../hooks';
import { withConfig, type WithOnCallbacks } from './withConfig';

interface WithSpringConfig
  extends Pick<UseValueConfig, 'mass' | 'friction' | 'tension'>,
    WithOnCallbacks {}

export const withSpring = (toValue: number, config?: WithSpringConfig) =>
  withConfig(toValue, { ...AnimationConfig.ELASTIC, ...config });
