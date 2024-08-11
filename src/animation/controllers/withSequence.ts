import { getToValue } from '../helpers';
import { type AssignValue } from '../core/FluidController';

export const withSequence = (
  animations: number[] | AssignValue[]
): AssignValue[] => {
  return animations.map((a) => getToValue(a)) as AssignValue[];
};
