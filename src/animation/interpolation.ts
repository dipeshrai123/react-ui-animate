import { interpolate, ExtrapolateConfig } from '@raidipesh78/re-motion';
export { interpolate } from '@raidipesh78/re-motion';

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
