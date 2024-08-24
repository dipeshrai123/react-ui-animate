import { getToValue } from '../helpers';
import { type AssignValue } from '../core/FluidController';

export const withSequence = (
  animations: Array<AssignValue | number>
): AssignValue[] => {
  return animations.map((a) => getToValue(a) as AssignValue);
};
