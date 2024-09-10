import { useCallback, useMemo, useRef } from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import {
  UpdateValue,
  FluidController,
  UseFluidValueConfig,
} from './FluidController';

export const useFluidValue = <T extends number>(
  value: T,
  config?: UseFluidValueConfig
): [
  FluidValue,
  (updateValue: UpdateValue | UpdateValue[], callback?: () => void) => void,
] => {
  const fluidController = useRef(new FluidController(value, config)).current;

  const onUpdate = useCallback(
    (updateValue: UpdateValue | UpdateValue[], callback?: () => void) => {
      fluidController.setFluid(updateValue, callback);
    },
    []
  );

  const fluidValue = useMemo(() => fluidController.getFluid(), []);

  return [fluidValue, onUpdate];
};
