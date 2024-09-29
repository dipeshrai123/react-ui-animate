import { FluidValue, loop } from '@raidipesh78/re-motion';

export const withLoop =
  (
    animations: (value: FluidValue) => ReturnType<typeof loop>,
    iterations: number,
    callback?: (result: any) => void
  ) =>
  (value: FluidValue) => ({
    controller: loop(animations(value), { iterations }),
    callback,
  });
