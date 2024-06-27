import {
  useRef,
  useMemo,
  useLayoutEffect,
  createElement,
  forwardRef,
} from 'react';

import { SpringAnimation } from '../controllers/SpringAnimation';
import { TimingAnimation } from '../controllers/TimingAnimation';
import { interpolateNumbers } from '../interpolation/Interpolation';
import { tags } from './Tags';
import { ResultType, FluidValueConfig, Length } from '../types/animation';
import { styleTrasformKeys, getTransform } from './TransformStyles';
import { combineRefs } from './combineRefs';
import {
  isDefined,
  getCleanProps,
  getAnimatableObject,
  AnimationObject,
  getNonAnimatableStyle,
  getCssValue,
  camelToDash,
} from './helpers';
import { FluidProps, FluidTypes, WrappedComponentOrTag } from '../types/fluid';
import { canInterpolate } from './helpers/canInterpolate';

/**
 * Higher order component to make any component animatable
 * @param WrapperComponent
 */
export function makeFluidComponent<C extends WrappedComponentOrTag>(
  WrapperComponent: C
) {
  function Wrapper(props: FluidProps<C>, forwardRef: any) {
    const ref = useRef<any>(null);

    // for transforms, we add all the transform keys in transformPropertiesObjectRef and
    // use getTransform() function to get transform string.
    // we make sure that the non-animatable transforms to be present in
    // transformPropertiesObjectRef , non-animatable transform from first paint
    // are overridden if it is not added.
    const transformPropertiesObjectRef = useRef<{
      [property: string]: any;
    }>({});

    // generates the array of animation object
    const animations = useMemo(() => {
      const animatableStyles = getAnimatableObject(
        'style',
        props.style ?? Object.create({})
      );
      const animatableProps = getAnimatableObject(
        'props',
        props ?? Object.create({})
      );

      return [...animatableStyles, ...animatableProps];
    }, [props]);

    /**
     * Update non-animated style if style changes...
     * here useLayoutEffect is used so that the changes is reflected
     * as soon as possible
     */
    useLayoutEffect(() => {
      if (!props.style) {
        return;
      }

      const nonAnimatableStyle = getNonAnimatableStyle(
        props.style as React.CSSProperties,
        transformPropertiesObjectRef
      );

      Object.keys(nonAnimatableStyle).forEach((styleProp) => {
        const value =
          nonAnimatableStyle[styleProp as keyof React.CSSProperties];

        if (ref.current) {
          ref.current.style[styleProp] = getCssValue(styleProp, value);
        }
      });
    }, [props.style]);

    useLayoutEffect(() => {
      if (!ref.current) return;

      const subscribers: any = [];

      animations.forEach((props: AnimationObject) => {
        const {
          _subscribe,
          _value,
          _config,
          _currentValue,
          propertyType,
          property,
        } = props;

        // store animations here
        let animation: any = null;

        if (!ref.current) {
          return;
        }

        // whether or not the property is one of transform keys
        const isTransform = styleTrasformKeys.indexOf(property as any) !== -1;

        // called every frame to update new transform values
        // getTransform function returns the valid transform string
        const getTransformValue = (value: any) => {
          transformPropertiesObjectRef.current[property] = value;
          return getTransform(transformPropertiesObjectRef.current);
        };

        // to apply animation values to a ref node
        const applyAnimationValues = (value: any) => {
          if (ref.current) {
            if (propertyType === 'style') {
              // set animation to style
              if (isTransform) {
                ref.current.style.transform = getTransformValue(value);
              } else {
                ref.current.style[property] = getCssValue(property, value);
              }
            } else if (propertyType === 'props') {
              // set animation to property
              ref.current.setAttribute(camelToDash(property), value);
            }
          }
        };

        const onFrame = (value: number) => {
          _currentValue.current = value;

          // for interpolation we check isInterpolation boolean
          // which is injected from interpolate function
          if (props.isInterpolation) {
            const { interpolationConfig } = props;

            const interpolatedValue = interpolateNumbers(
              value,
              interpolationConfig.inputRange,
              interpolationConfig.outputRange,
              interpolationConfig.extrapolateConfig
            );

            // interpolate it first and
            // apply animation to ref node
            applyAnimationValues(interpolatedValue);
          } else {
            // if it is FluidValue, we dont have to interpolate it
            // just apply animation value
            applyAnimationValues(value);
          }
        };

        /**
         * Function to initialize dynamic animations according to config
         * "spring" or "timing" based animations are
         * determined by the config duration
         */
        const defineAnimation = (value: number, config?: FluidValueConfig) => {
          const animationConfig: FluidValueConfig | undefined = {
            ..._config,
            ...config,
          };

          let type: FluidTypes;
          /**
           * Here duration key determines the type of animation
           * spring config are overridden by duration
           */
          if (
            isDefined(animationConfig?.duration) ||
            animationConfig?.immediate
          ) {
            type = 'timing';
          } else {
            type = 'spring';
          }

          if (type === 'spring') {
            animation = new SpringAnimation({
              initialPosition: value,
              config: animationConfig,
            });
          } else if (type === 'timing') {
            animation = new TimingAnimation({
              initialPosition: value,
              config: animationConfig,
            });
          }
        };

        const onUpdate = (
          value: Length,
          config?: FluidValueConfig,
          callback?: (value: ResultType) => void
        ) => {
          if (canInterpolate(_value, value)) {
            const previousAnimation = animation;

            // animatable
            if (previousAnimation._value !== value) {
              /**
               * stopping animation here would affect in whole
               * animation pattern, requestAnimationFrame instance
               * is created on frequent calls like mousemove
               * it flushes current running requestAnimationFrame
               */
              animation.stop();

              // re-define animation here with different configuration
              // used for dynamic animation
              defineAnimation(previousAnimation._position, config);

              // invoke onStart function
              config?.onStart && config.onStart(previousAnimation._position);

              if (typeof value === 'string') {
                props.isInterpolation = true;
                props.interpolationConfig = {
                  inputRange: [0, 1],
                  outputRange: [_value, value],
                };
              }

              // start animations here by start api
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
        defineAnimation(initialValue);

        const subscribe = _subscribe(onUpdate, property, Date.now());
        subscribers.push(subscribe);
      });

      return () => {
        subscribers.forEach((subscriber: () => void) => subscriber());
      };
    }, []);

    return createElement(WrapperComponent, {
      ...getCleanProps(props),
      ref: combineRefs(ref, forwardRef),
    });
  }

  return forwardRef(Wrapper);
}

export const fluid = {} as {
  [k in keyof JSX.IntrinsicElements]: React.ComponentType<
    FluidProps<HTMLElement>
  >;
};

tags.forEach((tag) => {
  fluid[tag] = makeFluidComponent(tag);
});
