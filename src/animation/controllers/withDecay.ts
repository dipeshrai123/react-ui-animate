import { FluidValue, decay } from '@raidipesh78/re-motion';

interface WithDecayConfig {
  velocity?: number;
  deceleration?: number;
}

export const withDecay =
  (config?: WithDecayConfig): any =>
  (value: FluidValue) => ({
    controller: decay(value, {
      velocity: config?.velocity,
      deceleration: config?.deceleration,
    }),
  });
