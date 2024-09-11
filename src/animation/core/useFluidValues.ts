import { useCallback, useMemo, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { UpdateValue, UseFluidValueConfig } from './FluidController';
import { FluidArrayController } from './FluidArrayController';

export const useFluidValues = <T extends number[] | string[]>(
  value: T,
  config?: UseFluidValueConfig
): [
  FluidValue[],
  (
    updateValue: Array<UpdateValue | UpdateValue[]>,
    callback?: () => void
  ) => void,
] => {
  const fluidController = useRef(
    new FluidArrayController(value, config)
  ).current;

  const onUpdate = useCallback(
    (
      updateValue: UpdateValue[] | Array<UpdateValue[]>,
      callback?: () => void
    ) => {
      fluidController.setFluid(updateValue, callback);
    },
    []
  );

  const fluidValue = useMemo(() => fluidController.getFluid(), []);

  return [fluidValue, onUpdate];
};
