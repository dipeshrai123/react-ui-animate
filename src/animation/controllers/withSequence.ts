import { FluidValue, sequence } from '@raidipesh78/re-motion';

export const withSequence =
  (
    animations: Array<(value: FluidValue) => ReturnType<typeof sequence>>,
    callback?: (result: any) => void
  ) =>
  (value: FluidValue) => ({
    controller: sequence(animations.map((a) => a(value))),
    callback,
  });
