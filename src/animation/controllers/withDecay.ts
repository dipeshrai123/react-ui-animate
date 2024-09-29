import { FluidValue, decay } from '@raidipesh78/re-motion';

interface WithDecayConfig {
  velocity?: number;
  deceleration?: number;
  onStart?: (value: number | string) => void;
  onChange?: (value: number | string) => void;
  onRest?: (value: number | string) => void;
}

export const withDecay =
  (config?: WithDecayConfig, callback?: (result: any) => void) =>
  (value: FluidValue) => ({
    controller: decay(value, { ...config }),
    callback,
  });
