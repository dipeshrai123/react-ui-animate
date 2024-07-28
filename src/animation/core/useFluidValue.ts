import { useCallback, useMemo, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import {
  AssignValue,
  FluidController,
  UseFluidValueConfig,
} from './FluidController';
import { FluidArrayController } from './FluidArrayController';

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
      ? new FluidArrayController(value, config)
      : new FluidController(value, config)
  ).current;

  const onUpdate = useCallback(
    (
      updateValue: T extends number ? AssignValue : AssignValue[],
      callback?: () => void
    ) => {
      if (fluidController instanceof FluidArrayController) {
        fluidController.setFluid(updateValue as AssignValue[], callback);
      } else {
        fluidController.setFluid(updateValue as AssignValue, callback);
      }
    },
    []
  );

  const fluidValue = useMemo(() => fluidController.getFluid(), []);

  return [fluidValue as T extends number ? FluidValue : FluidValue[], onUpdate];
};
