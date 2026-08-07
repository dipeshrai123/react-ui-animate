import type { ExtrapolateConfig } from './types';
import { to as mapRange } from './interpolation';

// For a reactive AnimateValue, use its .to(inRange, outRange, config) instance method instead.
export function interpolate(
  input: number,
  inRange: number[],
  outRange: (number | string)[],
  config?: ExtrapolateConfig
): number | string {
  return mapRange(inRange, outRange, config)(input);
}
