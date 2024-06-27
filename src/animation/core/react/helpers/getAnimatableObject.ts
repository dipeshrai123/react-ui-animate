import { isFluidValue } from './isFluidValue';
import type { ExtrapolateConfig } from '../../interpolation/Interpolation';
import { FluidValue } from '../../animation/FluidValue';

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

    if (isFluidValue(value)) {
      return [
        ...acc,
        {
          propertyType,
          property: styleProp,
          ...value,
        },
      ];
    }

    return acc;
  }, []) as Array<AnimationObject>;
}
