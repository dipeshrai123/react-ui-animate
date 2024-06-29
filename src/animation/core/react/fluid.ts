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

/**
 * Higher order component to make any component animatable
 * @param WrapperComponent
 */
export function makeFluidComponent<C extends WrappedComponentOrTag>(
  WrapperComponent: C
) {
  return forwardRef((givenProps: FluidProps<C>, givenRef: any) => {
    const instanceRef = useRef<any>(null);

    const transformStyleRef = useRef<Record<string, Length>>({});

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

    const applyAnimationValues = ({
      isTransform,
      propertyType,
      property,
      value,
    }: {
      isTransform: boolean;
      propertyType: 'style' | 'props';
      property: string;
      value: number;
    }) => {
      if (!instanceRef.current) return;

      if (propertyType === 'style') {
        if (isTransform) {
          transformStyleRef.current[property] = value;
          instanceRef.current.style.transform = getTransform(
            transformStyleRef.current
          );
        } else {
          instanceRef.current.style[property] = getCssValue(property, value);
        }
      } else if (propertyType === 'props') {
        instanceRef.current.setAttribute(camelToDash(property), value);
      }
    };

    useLayoutEffect(() => {
      if (!givenProps.style) {
        return;
      }

      const nonAnimatableStyle = getNonAnimatableStyle(
        givenProps.style as React.CSSProperties,
        transformStyleRef
      );

      console.log(nonAnimatableStyle);

      Object.keys(nonAnimatableStyle).forEach((styleProp) => {
        const value =
          nonAnimatableStyle[styleProp as keyof React.CSSProperties];

        if (instanceRef.current) {
          instanceRef.current.style[styleProp] = getCssValue(styleProp, value);
        }
      });
    }, [givenProps.style]);

    useLayoutEffect(() => {
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

        const generateAnimation = animationObjectGenerator(_config);
        let animation: any = null;

        const isTransform = styleTrasformKeys.indexOf(property as any) !== -1;

        const onFrame = (value: number) => {
          _currentValue.current = value;

          const updatedValue: number = props.isInterpolation
            ? interpolateNumbers(
                value,
                props.interpolationConfig.inputRange,
                props.interpolationConfig.outputRange,
                props.interpolationConfig.extrapolateConfig
              )
            : value;

          applyAnimationValues({
            isTransform,
            propertyType,
            property,
            value: updatedValue,
          });
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
              if (!instanceRef.current) return;

              instanceRef.current.style[property] = getCssValue(
                property,
                value
              );
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
      ref: combineRefs(instanceRef, givenRef),
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

function animationObjectGenerator(defaultConfig?: FluidValueConfig) {
  return (value: number, config?: FluidValueConfig) => {
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
}
