import { FluidValue } from '@raidipesh78/re-motion';

import { interpolateNumbers } from './interpolateNumbers';

type ExtrapolateType = 'identity' | 'extend' | 'clamp';

type ExtrapolateConfig = {
  extrapolate?: ExtrapolateType;
  extrapolateLeft?: ExtrapolateType;
  extrapolateRight?: ExtrapolateType;
};

type InterpolateReturnType<T> = T extends number
  ? number
  : ReturnType<FluidValue['interpolate']>;

export const interpolate = <T extends number | FluidValue>(
  value: T,
  inputRange: number[],
  outputRange: number[] | string[],
  extrapolateConfig?: ExtrapolateConfig
): InterpolateReturnType<T> => {
  if (value instanceof FluidValue) {
    return value.interpolate(
      inputRange,
      outputRange,
      extrapolateConfig
    ) as InterpolateReturnType<T>;
  } else {
    return interpolateNumbers(
      value,
      inputRange,
      outputRange,
      extrapolateConfig
    ) as InterpolateReturnType<T>;
  }
};

export const bInterpolate = (
  value: number | FluidValue,
  minOutput: number | string,
  maxOutput: number | string,
  extrapolateConfig?: ExtrapolateConfig
) =>
  interpolate(
    value,
    [0, 1],
    [minOutput, maxOutput] as number[] | string[],
    extrapolateConfig
  );
