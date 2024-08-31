import type { UseAnimatedValueConfig } from '../hooks/useValue';
import type { WithOnCallbacks } from './withConfig';

interface WithDecayConfig
  extends Pick<UseAnimatedValueConfig, 'velocity' | 'deceleration'>,
    WithOnCallbacks {}

export const withDecay = (config?: WithDecayConfig) => ({
  config: {
    decay: true,
    ...config,
  },
});
