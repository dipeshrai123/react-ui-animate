import { getToValue } from '../helpers';
import { type AssignValue } from '../core/FluidController';

export const withSequence = (animations: Array<number | AssignValue>) => {
  return animations.map((a) => getToValue(a)) as AssignValue[];
};
