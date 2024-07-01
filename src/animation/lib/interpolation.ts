import { ExtrapolateConfig, FluidValue, isFluidValue } from '../core';
import { interpolate as internalInterpolate } from '../core';
import { isDefined } from '../core/helpers';
import { ValueType } from './useAnimatedValue';

function checkFluidValueOrNumber(value: unknown): number | FluidValue {
  if (
    !isDefined(value) ||
    !(typeof value === 'number' || isFluidValue(value))
  ) {
    console.log(value);
    throw new Error(
      `Invalid ${value} type for interpolate function. Expected number or FluidValue.`
    );
  }
  return value;
}

/**
 * Maps the input range to the given output range using the specified extrapolation configuration.
 * The function ensures that the value is either a number or a FluidValue.
 *
 * @param value - The value to be interpolated, which must be a number or FluidValue.
 * @param inputRange - An array of numbers defining the input range.
 * @param outputRange - An array of numbers or strings defining the output range.
 * @param extrapolateConfig - The extrapolation configuration, which can be "clamp", "identity", or "extend".
 * @returns - The interpolated value, which will be a number or FluidValue.
 * @throws - Will throw an error if the value is not a number or FluidValue.
 */
export function interpolate(
  value: FluidValue | ValueType | number,
  inputRange: Array<number>,
  outputRange: Array<number | string>,
  extrapolateConfig?: ExtrapolateConfig
) {
  const checkedValue = checkFluidValueOrNumber(value);

  return internalInterpolate(
    checkedValue,
    inputRange,
    outputRange,
    extrapolateConfig
  );
}

/**
 * A shorthand function for interpolate that maps the input range [0, 1] to the given [minOutput, maxOutput].
 * The function ensures that the value is either a number or a FluidValue.
 *
 * @param value - The value to be interpolated, which must be a number or FluidValue.
 * @param minOutput - The minimum value of the output range, which can be a number or string.
 * @param maxOutput - The maximum value of the output range, which can be a number or string.
 * @param extrapolateConfig - The extrapolation configuration, which can be "clamp", "identity", or "extend".
 * @returns - The interpolated value, which will be a number or FluidValue.
 * @throws - Will throw an error if the value is not a number or FluidValue.
 */
export function bInterpolate(
  value: FluidValue | ValueType | number,
  minOutput: number | string,
  maxOutput: number | string,
  extrapolateConfig?: ExtrapolateConfig
) {
  const checkedValue = checkFluidValueOrNumber(value);

  return internalInterpolate(
    checkedValue,
    [0, 1],
    [minOutput, maxOutput],
    extrapolateConfig
  );
}
