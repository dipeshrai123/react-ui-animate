import { useCallback, useMemo, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import {
  AssignValue,
  FluidController,
  UseFluidValueConfig,
} from './FluidController';

export const useFluidValue = <T extends number | number[]>(
  value: T,
  config?: UseFluidValueConfig
): [
  T extends number ? FluidValue : FluidValue[],
  (
    updateValue: T extends number ? AssignValue : AssignValue[],
    callback?: () => void
  ) => void
] => {
  const fluidController = useRef(
    Array.isArray(value)
      ? value.map((v) => new FluidController(v, config))
      : new FluidController(value, config)
  ).current;

  const onUpdate = useCallback(
    (
      updateValue: T extends number ? AssignValue : AssignValue[],
      callback?: () => void
    ) => {
      if (Array.isArray(fluidController)) {
        fluidController.map((fc, i) => {
          fc.setFluid((updateValue as AssignValue[])[i], callback);
        });
      } else {
        fluidController.setFluid(updateValue as AssignValue, callback);
      }
    },
    []
  );

  const fluidValue = useMemo(
    () =>
      Array.isArray(fluidController)
        ? (fluidController.map((fc) => fc.getFluid()) as T extends number
            ? FluidValue
            : FluidValue[])
        : (fluidController.getFluid() as T extends number
            ? FluidValue
            : FluidValue[]),
    []
  );

  return [fluidValue, onUpdate];
};
