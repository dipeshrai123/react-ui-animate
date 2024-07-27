import { FluidValue } from '@raidipesh78/re-motion';

type ExtrapolateType = 'extend' | 'identity' | 'clamp';

export type ExtrapolateConfig = {
  extrapolate?: ExtrapolateType;
  extrapolateLeft?: ExtrapolateType;
  extrapolateRight?: ExtrapolateType;
};

export const interpolate = (
  value: FluidValue,
  inputRange: Array<number>,
  outputRange: Array<number> | Array<string>,
  extrapolateConfig?: ExtrapolateConfig
) => value.interpolate(inputRange, outputRange, extrapolateConfig);
