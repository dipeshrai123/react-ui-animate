import type { ExtrapolateConfig } from './types';
import { to as mapRange } from './interpolation';

// Maps a plain number through a range, right now — for a reactive
// AnimateValue, use its `.to(inRange, outRange, config)` instance method
// instead (this is the standalone counterpart for one-off, non-reactive
// values, e.g. inside an event handler).
export function interpolate(
  input: number,
  inRange: number[],
  outRange: (number | string)[],
  config?: ExtrapolateConfig
): number | string {
  return mapRange(inRange, outRange, config)(input);
}
