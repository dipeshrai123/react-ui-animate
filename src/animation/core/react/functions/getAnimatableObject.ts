import { isTransitionValue } from './isTransitionValue';
import type { ExtrapolateConfig } from '../../interpolation/Interpolation';
import type { FluidValue } from '../../types';

type PropertyType = 'style' | 'props';

export type AnimationObject = {
  propertyType: PropertyType;
  property: string;
  animatable: boolean;

  // from interpolateTransitionValue
  isInterpolation: boolean;
  interpolationConfig: {
    inputRange: Array<number>;
    outputRange: Array<number | string>;
    extrapolateConfig?: ExtrapolateConfig;
  };
} & FluidValue;

/**
 * Function to get the array of animatable objects
 * @param propertyType - which property type "props" or "style"
 */
export function getAnimatableObject(
  propertyType: PropertyType,
  propertiesObject: { [key: string]: any }
) {
  return Object.keys(propertiesObject).reduce(function (acc, styleProp) {
    const value = propertiesObject[styleProp] as FluidValue;

    if (isTransitionValue(value)) {
      const { _value } = value;

      return [
        ...acc,
        {
          propertyType,
          property: styleProp,
          animatable: !(typeof _value === 'string'), // strings are non animatable
          ...value,
        },
      ];
    }

    return acc;
  }, []) as Array<AnimationObject>;
}
