import { getToValue } from '../helpers';
import { type AssignValue } from '../core/FluidController';
import { type UpdateValue } from '../hooks/useAnimatedValue';

export const withSequence = (
  animations: Array<UpdateValue | number>
): AssignValue => {
  return async (next: (arg: UpdateValue) => void) => {
    for (const a of animations) {
      await next(getToValue(a) as UpdateValue);
    }
  };
};
