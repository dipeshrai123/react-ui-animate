import {
  interpolateNumbers,
  interpolateTransitionValue,
  ExtrapolateConfig,
  isSubscriber,
} from "../core";

/**
 * interpolate function maps input range to output range
 * @param value - number | TransitionValue
 * @param inputRange - Array<number>
 * @param outputRange - Array<string | number>
 * @param extrapolateConfig - "clamp" | "identity" | "extend"
 * @returns - number | TransitionValue
 */
export function interpolate(
  value: any,
  inputRange: Array<number>,
  outputRange: Array<number | string>,
  extrapolateConfig?: ExtrapolateConfig
) {
  if (typeof value === "object" && isSubscriber(value)) {
    return interpolateTransitionValue(
      value,
      inputRange,
      outputRange,
      extrapolateConfig
    );
  } else if (typeof value === "number") {
    return interpolateNumbers(
      value,
      inputRange,
      outputRange,
      extrapolateConfig
    );
  } else {
    throw new Error(`Error! ${typeof value} cannot be interpolated`);
  }
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
  value: any,
  minOutput: number | string,
  maxOutput: number | string,
  extrapolateConfig?: ExtrapolateConfig
) {
  return interpolate(value, [0, 1], [minOutput, maxOutput], extrapolateConfig);
}
