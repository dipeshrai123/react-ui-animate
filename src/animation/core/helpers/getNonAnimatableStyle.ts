import { styleTrasformKeys, getTransform } from '../react/TransformStyles';
import { isFluidValue } from './isFluidValue';

/**
 * getNonAnimatableStyle function returns the non-animatable style object
 * @param style - CSSProperties
 * @returns - non-animatable CSSProperties
 */
export function getNonAnimatableStyle(
  style: React.CSSProperties,
  transformObjectRef: React.MutableRefObject<any>
) {
  const stylesWithoutTransforms = Object.keys(style).reduce(
    (resultObject, styleProp) => {
      const value = style[styleProp as keyof React.CSSProperties];

      // skips all the subscribers here
      // only get non-animatable styles
      if (isFluidValue(value)) {
        return resultObject;
      } else if (styleTrasformKeys.indexOf(styleProp as any) !== -1) {
        // if not subscriber, then check styleTransformKeys
        // add it to transformPropertiesObjectRef
        transformObjectRef.current[styleProp] = value;
        return resultObject;
      }

      return { ...resultObject, [styleProp]: value };
    },
    {}
  );

  const transformStyle: any = {};
  if (Object.keys(transformObjectRef.current).length > 0) {
    transformStyle.transform = getTransform(transformObjectRef.current);
  }

  // combined transform and non-transform styles
  const combinedStyle = {
    ...transformStyle,
    ...stylesWithoutTransforms,
  };

  return combinedStyle;
}
