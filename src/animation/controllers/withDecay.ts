import type { UseValueConfig } from '../hooks';
import type { WithConfig } from '../helpers';
import type { UpdateValue } from '../core/FluidController';

interface WithDecayConfig
  extends Pick<UseValueConfig, 'velocity' | 'deceleration'>,
    WithConfig {}

export const withDecay = (config?: WithDecayConfig): UpdateValue => ({
  config: {
    decay: true,
    ...config,
  },
});
