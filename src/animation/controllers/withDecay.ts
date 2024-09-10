import type { UseValueConfig } from '../hooks';
import type { WithOnCallbacks } from './withConfig';
import type { UpdateValue } from '../core/FluidController';

interface WithDecayConfig
  extends Pick<UseValueConfig, 'velocity' | 'deceleration'>,
    WithOnCallbacks {}

export const withDecay = (config?: WithDecayConfig): UpdateValue => ({
  config: {
    decay: true,
    ...config,
  },
});
