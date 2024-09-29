import { FluidValue, decay } from '@raidipesh78/re-motion';

interface WithDecayConfig {
  velocity?: number;
  deceleration?: number;
}

export const withDecay =
  (config?: WithDecayConfig, callback?: (result: any) => void) =>
  (value: FluidValue) => ({
    controller: decay(value, {
      velocity: config?.velocity,
      deceleration: config?.deceleration,
    }),
    callback,
  });
