import {
  useRef,
  useMemo,
  useLayoutEffect,
  createElement,
  forwardRef,
  RefObject,
} from 'react';

import { SpringAnimation } from '../controllers/SpringAnimation';
import { TimingAnimation } from '../controllers/TimingAnimation';
import { interpolateNumbers } from '../interpolation/Interpolation';
import { tags } from './Tags';
import { ResultType, FluidValueConfig, Length } from '../types/animation';
import { styleTrasformKeys, getTransform } from './TransformStyles';
import {
  isDefined,
  getCleanProps,
  getAnimatableObject,
  AnimationObject,
  getNonAnimatableStyle,
  getCssValue,
  camelToDash,
  canInterpolate,
} from '../helpers';
import { FluidProps, WrappedComponentOrTag } from '../types/fluid';

const animationObjectGenerator =
  (defaultConfig?: FluidValueConfig) =>
  (value: number, config?: FluidValueConfig) => {
    const animationConfig = { ...defaultConfig, ...config };

    const Animation =
      isDefined(animationConfig?.duration) || animationConfig?.immediate
        ? TimingAnimation
        : SpringAnimation;

    return new Animation({
      initialPosition: value,
      config: animationConfig,
    });
  };

/**
 * Higher order component to make any component animatable
 * @param WrapperComponent
 */
export function makeFluidComponent<C extends WrappedComponentOrTag>(
  WrapperComponent: C
) {
  return forwardRef((givenProps: FluidProps<C>, givenRef: any) => {
    const ref = useRef<any>(null);

    const transformPropertiesObjectRef = useRef<{
      [property: string]: any;
    }>({});

    // generates the array of animation object
    const animations = useMemo(() => {
      const animatableStyles = getAnimatableObject(
        'style',
        givenProps.style ?? Object.create({})
      );
      const animatableProps = getAnimatableObject(
        'props',
        givenProps ?? Object.create({})
      );

      return [...animatableStyles, ...animatableProps];
    }, [givenProps]);

    useLayoutEffect(() => {
      if (!givenProps.style) {
        return;
      }

      const nonAnimatableStyle = getNonAnimatableStyle(
        givenProps.style as React.CSSProperties,
        transformPropertiesObjectRef
      );

      Object.keys(nonAnimatableStyle).forEach((styleProp) => {
        const value =
          nonAnimatableStyle[styleProp as keyof React.CSSProperties];

        if (ref.current) {
          ref.current.style[styleProp] = getCssValue(styleProp, value);
        }
      });
    }, [givenProps.style]);

    useLayoutEffect(() => {
      if (!ref.current) return;

      const subscribers: any = [];

      animations.forEach((props: AnimationObject) => {
        if (!ref.current) return;

        const {
          _subscribe,
          _value,
          _config,
          _currentValue,
          propertyType,
          property,
        } = props;

        const generateAnimation = animationObjectGenerator(_config);
        let animation: any = null;

        const isTransform = styleTrasformKeys.indexOf(property as any) !== -1;

        // to apply animation values to a ref node
        const applyAnimationValues = (value: any) => {
          if (ref.current) {
            if (propertyType === 'style') {
              if (isTransform) {
                transformPropertiesObjectRef.current[property] = value;
                ref.current.style.transform = getTransform(
                  transformPropertiesObjectRef.current
                );
              } else {
                ref.current.style[property] = getCssValue(property, value);
              }
            } else if (propertyType === 'props') {
              ref.current.setAttribute(camelToDash(property), value);
            }
          }
        };

        const onFrame = (value: number) => {
          _currentValue.current = value;

          const updatedValue = props.isInterpolation
            ? interpolateNumbers(
                value,
                props.interpolationConfig.inputRange,
                props.interpolationConfig.outputRange,
                props.interpolationConfig.extrapolateConfig
              )
            : value;

          applyAnimationValues(updatedValue);
        };

        const onUpdate = (
          value: Length,
          config?: FluidValueConfig,
          callback?: (value: ResultType) => void
        ) => {
          if (canInterpolate(_value, value)) {
            const previousAnimation = animation;

            if (previousAnimation._value !== value) {
              animation.stop();

              animation = generateAnimation(
                previousAnimation._position,
                config
              );
              config?.onStart && config.onStart(previousAnimation._position);

              if (typeof value === 'string') {
                props.isInterpolation = true;
                props.interpolationConfig = {
                  inputRange: [0, 1],
                  outputRange: [_value, value],
                };
              }

              animation.start({
                toValue:
                  typeof value === 'string'
                    ? _value !== value
                      ? 1
                      : 0
                    : value,
                onFrame,
                previousAnimation,
                onEnd: callback,
              });
            }
          } else {
            if (typeof value === typeof _value) {
              if (ref.current) {
                ref.current.style[property] = getCssValue(property, value);
              }
            } else {
              throw new Error('Cannot set different types of animation values');
            }
          }
        };

        const initialValue = typeof _value === 'string' ? 0 : _value;
        onFrame(initialValue);
        animation = generateAnimation(initialValue);

        const subscribe = _subscribe(onUpdate, property, Date.now());
        subscribers.push(subscribe);
      });

      return () => {
        subscribers.forEach((subscriber: () => void) => subscriber());
      };
    }, []);

    return createElement(WrapperComponent, {
      ...getCleanProps(givenProps),
      ref: combineRefs(ref, givenRef),
    });
  });
}

export const fluid = {} as {
  [k in keyof JSX.IntrinsicElements]: React.ComponentType<
    FluidProps<HTMLElement>
  >;
};

tags.forEach((tag) => {
  fluid[tag] = makeFluidComponent(tag);
});

function combineRefs(
  ...refs: Array<RefObject<any> | ((element: HTMLElement) => void)>
) {
  return function applyRef(element: HTMLElement) {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(element);
        return;
      }
      if ('current' in ref) (ref.current as HTMLElement) = element;
    });
  };
}
