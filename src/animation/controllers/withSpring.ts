import { AnimationConfig } from '../animationType';
import { withConfig, type WithOnCallbacks } from './withConfig';
import { type UseValueConfig } from '../hooks/useValue';

interface WithSpringConfig
  extends Pick<UseValueConfig, 'mass' | 'friction' | 'tension'>,
    WithOnCallbacks {}

export const withSpring = (toValue: number, config?: WithSpringConfig) =>
  withConfig(toValue, { ...AnimationConfig.ELASTIC, ...config });
