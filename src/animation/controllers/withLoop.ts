import { FluidValue, loop } from '@raidipesh78/re-motion';

export const withLoop =
  (
    animations: (value: FluidValue) => {
      controller: ReturnType<typeof loop>;
      callback?: (result: any) => void;
    },
    iterations: number,
    callback?: (result: any) => void
  ) =>
  (value: FluidValue) => ({
    controller: loop(animations(value).controller, { iterations }),
    callback,
  });
