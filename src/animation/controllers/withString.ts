import { FluidValue, native } from '@raidipesh78/re-motion';

export const withString =
  (toValue: string, callback?: (result: any) => void) =>
  (value: FluidValue) => ({
    controller: native(value, {
      toValue,
    }),
    callback,
  });
