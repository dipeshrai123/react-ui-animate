import { FluidValue, decay } from '@raidipesh78/re-motion';

import type { WithCallbacks } from '../types';

interface WithDecayConfig extends WithCallbacks {
  velocity?: number;
  deceleration?: number;
}

export const withDecay =
  (config?: WithDecayConfig, callback?: (result: any) => void) =>
  (value: FluidValue) => ({
    controller: decay(value, { ...config }),
    callback,
  });
