import { useLayoutEffect, useRef } from 'react';

import { FluidValue } from '../controllers/FluidValue';

import type { FluidValueConfig, Length, OnUpdateFn } from '../types/animation';

/**
 * useFluidValue
 *
 * @param value - initial value
 * @param config - the config object for `FluidValue`
 */
export const useFluidValue = (
  value: Length,
  config?: FluidValueConfig
): [FluidValue, OnUpdateFn] => {
  const fluid = useRef(new FluidValue(value, config)).current;

  useLayoutEffect(() => {
    fluid.setValue({ toValue: value, config });
  }, [value]);

  return [fluid, fluid.setValue.bind(fluid)];
};
