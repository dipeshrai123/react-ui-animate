import { FluidValue } from '@raidipesh78/re-motion';

import {
  interpolate as _interpolate,
  ExtrapolateConfig,
} from './core/inerpolate';
import { isDefined } from './helpers';

function checkFluidValue(value: unknown): FluidValue {
  if (!isDefined(value) || !(value instanceof FluidValue)) {
    throw new Error(
      `Invalid ${value} type for interpolate function. Expected FluidValue.`
    );
  }
  return value;
}

/**
 * Maps the input range to the given output range using the specified extrapolation configuration.
 * The function ensures that the value is either a number or a FluidValue.
 *
 * @param value - The value to be interpolated, which must be a FluidValue.
 * @param inputRange - An array of numbers defining the input range.
 * @param outputRange - An array of numbers or strings defining the output range.
 * @param extrapolateConfig - The extrapolation configuration, which can be "clamp", "identity", or "extend".
 * @returns - The interpolated value, which will be a number or FluidValue.
 * @throws - Will throw an error if the value is not a number or FluidValue.
 */
export function interpolate(
  value: FluidValue,
  inputRange: number[],
  outputRange: number[] | string[],
  extrapolateConfig?: ExtrapolateConfig
) {
  const checkedValue = checkFluidValue(value);

  return _interpolate(checkedValue, inputRange, outputRange, extrapolateConfig);
}

/**
 * A shorthand function for interpolate that maps the input range [0, 1] to the given [minOutput, maxOutput].
 * The function ensures that the value is either a number or a FluidValue.
 *
 * @param value - The value to be interpolated, which must be a FluidValue.
 * @param minOutput - The minimum value of the output range, which can be a number or string.
 * @param maxOutput - The maximum value of the output range, which can be a number or string.
 * @param extrapolateConfig - The extrapolation configuration, which can be "clamp", "identity", or "extend".
 * @returns - The interpolated value, which will be a number or FluidValue.
 * @throws - Will throw an error if the value is not a number or FluidValue.
 */
export function bInterpolate(
  value: FluidValue,
  minOutput: number | string,
  maxOutput: number | string,
  extrapolateConfig?: ExtrapolateConfig
) {
  const checkedValue = checkFluidValue(value);

  return _interpolate(
    checkedValue,
    [0, 1],
    [minOutput, maxOutput] as number[] | string[],
    extrapolateConfig
  );
}
