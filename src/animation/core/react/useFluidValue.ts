import { useMemo, useCallback } from 'react';

import { FluidValue } from '../controllers/FluidValue';
import type {
  FluidValueConfig,
  Length,
  AssignValue,
  OnUpdateCallback,
} from '../types/animation';

/**
 * useFluidValue
 *
 * @param value - initial value
 * @param config - the config object for `FluidValue`
 */
export const useFluidValue = (
  value: Length,
  config?: FluidValueConfig
): [
  FluidValue,
  (
    updateValue: AssignValue,
    config?: FluidValueConfig,
    callback?: OnUpdateCallback
  ) => void
] => {
  const fluid = useMemo(() => new FluidValue(value, config), []);

  const setFluid = useCallback(
    (
      updateValue: AssignValue,
      config?: FluidValueConfig,
      callback?: OnUpdateCallback
    ) => {
      fluid.setValue(updateValue, config, callback);
    },
    []
  );

  return [fluid, setFluid];
};
