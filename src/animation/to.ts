import {
  type ExtrapolateConfig,
  to as interpolate,
} from '@raidipesh78/re-motion';

export function to(
  input: number,
  inRange: number[],
  outRange: (number | string)[],
  config?: ExtrapolateConfig
): number | string {
  return interpolate(inRange, outRange, config)(input);
}
