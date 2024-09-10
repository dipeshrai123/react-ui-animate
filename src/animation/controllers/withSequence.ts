import { getToValue } from '../helpers';
import { type UpdateValue } from '../core/FluidController';

const flattenUpdateValues = (
  animations: Array<UpdateValue | number | Array<UpdateValue | number>>
): UpdateValue[] => {
  return animations.reduce<UpdateValue[]>((acc, value) => {
    if (Array.isArray(value)) {
      acc.push(...flattenUpdateValues(value));
    } else {
      acc.push(getToValue(value));
    }
    return acc;
  }, []);
};

export const withSequence = (
  animations: Array<UpdateValue | number | Array<UpdateValue | number>>
): UpdateValue[] => {
  return flattenUpdateValues(animations);
};
