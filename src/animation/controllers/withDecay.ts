import type { UseValueConfig } from '../hooks';
import type { WithOnCallbacks } from './withConfig';

interface WithDecayConfig
  extends Pick<UseValueConfig, 'velocity' | 'deceleration'>,
    WithOnCallbacks {}

export const withDecay = (config?: WithDecayConfig) => ({
  config: {
    decay: true,
    ...config,
  },
});
