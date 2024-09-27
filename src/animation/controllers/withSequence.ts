import { FluidValue, sequence } from '@raidipesh78/re-motion';

export const withSequence =
  (animations: any[]): any =>
  (value: FluidValue) => ({
    controller: sequence(animations.map((a) => a(value).controller)),
    callback: () => {},
  });
