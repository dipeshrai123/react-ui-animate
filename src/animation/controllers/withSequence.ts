import { getToValue } from '../helpers';
import { type AssignValue } from '../core/FluidController';

export const withSequence = (
  animations: Array<AssignValue | number>
): AssignValue => {
  return async (next: (arg: AssignValue) => void) => {
    for (const a of animations) {
      await next(getToValue(a) as AssignValue);
    }
  };
};
