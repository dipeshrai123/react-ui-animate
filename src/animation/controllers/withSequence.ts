import { getToValue } from '../helpers';
import { type UpdateValue } from '../core/FluidController';

export const withSequence = (
  animations: Array<UpdateValue | number>
): UpdateValue[] => {
  return animations.map((a) => getToValue(a) as UpdateValue);
};
