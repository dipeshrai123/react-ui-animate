import { UpdateValue } from '../core/FluidController';

export const withLoop = (
  updateValue: UpdateValue | UpdateValue[],
  loop: number
): UpdateValue[] => {
  if (Array.isArray(updateValue)) {
    let loopedValues: UpdateValue[] = [];
    for (let i = 0; i < loop; i++) {
      loopedValues = loopedValues.concat(updateValue);
    }
    return loopedValues;
  } else {
    return Array(loop).fill({
      toValue: updateValue.toValue,
      config: { ...updateValue.config, loop },
    });
  }
};
