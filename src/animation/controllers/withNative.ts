import { FluidValue, native } from '@raidipesh78/re-motion';

export const withNative =
  (toValue: number | string, callback?: (result: any) => void) =>
  (value: FluidValue) => ({
    controller: native(value, {
      toValue,
    }),
    callback,
  });
