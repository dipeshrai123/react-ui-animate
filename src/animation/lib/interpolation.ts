import { ExtrapolateConfig, FluidValue } from '../core';
import { interpolate as internalInterpolate } from '../core';

/**
 * interpolate functions maps input range to given output range
 * @param value - number | TransitionValue
 * @param inputRange - Array<number>
 * @param outputRange - Array<number | string>
 * @param extrapolateConfig - "clamp" | "identity" | "extend"
 * @returns - number | TransitionValue
 */
export function interpolate(
  value: number | FluidValue,
  inputRange: Array<number>,
  outputRange: Array<number | string>,
  extrapolateConfig?: ExtrapolateConfig
) {
  return internalInterpolate(
    value as any,
    inputRange,
    outputRange,
    extrapolateConfig
  );
}

/**
 * bInterpolate functions maps input range [0, 1] to given [minOutput, maxOutput]
 * sorthand function to interpolate input range [0, 1]
 * @param value - number | TransitionValue
 * @param minOutput - number | string
 * @param maxOutput - number | string
 * @param extrapolateConfig - "clamp" | "identity" | "extend"
 * @returns - number | TransitionValue
 */
export function bInterpolate(
  value: number | FluidValue,
  minOutput: number | string,
  maxOutput: number | string,
  extrapolateConfig?: ExtrapolateConfig
) {
  return internalInterpolate(
    value as any,
    [0, 1],
    [minOutput, maxOutput],
    extrapolateConfig
  );
}
