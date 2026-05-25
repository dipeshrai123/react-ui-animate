import type { ExtrapolateConfig } from './types';
import { to as interpolate } from './utils/to';

export function to(
  input: number,
  inRange: number[],
  outRange: (number | string)[],
  config?: ExtrapolateConfig
): number | string {
  return interpolate(inRange, outRange, config)(input);
}
