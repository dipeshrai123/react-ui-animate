import { UpdateValue, UseFluidValueConfig } from '../core/FluidController';

export function getToValue(
  value: number | string | UpdateValue,
  config?: UseFluidValueConfig
): UpdateValue {
  return typeof value === 'number' || typeof value === 'string'
    ? { toValue: value, config }
    : value;
}
