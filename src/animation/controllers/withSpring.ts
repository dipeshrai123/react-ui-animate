import { AnimationConfig } from '../helpers';
import { type UseValueConfig } from '../hooks';
import { withConfig, type WithOnCallbacks } from './withConfig';
import { UpdateValue } from '../core/FluidController';

interface WithSpringConfig
  extends Pick<UseValueConfig, 'mass' | 'friction' | 'tension'>,
    WithOnCallbacks {}

export const withSpring = (
  toValue: number,
  config?: WithSpringConfig
): UpdateValue =>
  withConfig(toValue, { ...AnimationConfig.ELASTIC, ...config });
