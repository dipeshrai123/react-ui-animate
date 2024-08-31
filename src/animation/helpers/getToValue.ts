import { UpdateValue, UseFluidValueConfig } from '../core/FluidController';

export function getToValue(
  value: number | UpdateValue,
  config?: UseFluidValueConfig
): UpdateValue {
  return typeof value === 'number' ? { toValue: value, config } : value;
}
