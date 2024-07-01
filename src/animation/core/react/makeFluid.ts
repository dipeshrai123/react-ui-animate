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
import {
  ExtrapolateConfig,
  canInterpolate,
  interpolateNumbers,
} from '../interpolation/Interpolation';
import { getTransform, isTransformKey } from './transforms';
import {
  isDefined,
  getCleanProps,
  getCssValue,
  camelCaseToKebabCase,
  isFluidValue,
} from '../helpers';
import { FluidValue } from '../controllers/FluidValue';

import type {
  ResultType,
  FluidValueConfig,
  Length,
  UpdateValue,
} from '../types/animation';
import type { FluidProps, WrappedComponentOrTag } from '../types/fluid';

/**
 * Higher-order component to make any component animatable.
 *
 * This function takes a React component or an HTML tag and returns a new component
 * that can smoothly transition between states using fluid animations. It enhances
 * the user experience by adding dynamic and engaging animations to the wrapped component.
 *
 * @param WrapperComponent - The React component or HTML tag to be wrapped with animation functionality.
 * @returns - A new component with added animation capabilities.
 *
 * The returned component uses fluid animations to smoothly transition between different
 * states. It supports both style and prop animations, handling transforms and other
 * properties seamlessly. The component ensures that animations are efficiently applied
 * and updated based on the current state and configuration of fluid values.
 *
 * @example
 * const AnimatedDiv = makeFluid('div');
 *
 * const MyComponent = () => {
 *  const opacity = useAnimatedValue(1)
 *  return (
 *   <AnimatedDiv style={{ opacity: opacity.value }}>
 *     Hello, world!
 *   </AnimatedDiv>
 * )};
 */
export function makeFluid<C extends WrappedComponentOrTag>(
  WrapperComponent: C
) {
  return forwardRef((givenProps: FluidProps<C>, givenRef: any) => {
    const instanceRef = useRef<any>(null);

    const transformStyleRef = useRef<Record<string, Length>>({});

    const { fluids, nonFluids } = useMemo(() => {
      const { style, ...props } = givenProps;
      const fluidStyle = getFluids('style', style);
      const fluidProps = getFluids('props', props);

      return {
        fluids: [...fluidStyle.fluids, ...fluidProps.fluids],
        nonFluids: [...fluidStyle.nonFluids, ...fluidProps.nonFluids],
      };
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
      value: Length;
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
        instanceRef.current.setAttribute(camelCaseToKebabCase(property), value);
      }
    };

    useLayoutEffect(() => {
      nonFluids.forEach(({ isTransform, property, propertyType, value }) =>
        applyAnimationValues({
          isTransform,
          property,
          propertyType,
          value: value as number,
        })
      );
    }, [nonFluids]);

    useLayoutEffect(() => {
      const subscribers: any = [];

      fluids.forEach((f) => {
        const { value: fluidValue, propertyType, property, isTransform } = f;
        const { _subscribe, _value, _currentValue, _config } = fluidValue;

        const interpolationOutputRange: string[] = [];
        const generateAnimation = animationObjectGenerator(_config);
        let animation: any = null;

        const onFrame = (value: number) => {
          _currentValue.current = value;

          const updatedValue: number =
            fluidValue.isInterpolation && fluidValue.interpolationConfig
              ? interpolateNumbers(
                  value,
                  fluidValue.interpolationConfig.inputRange,
                  fluidValue.interpolationConfig.outputRange,
                  fluidValue.interpolationConfig.extrapolateConfig
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
          updatedValue: UpdateValue,
          callback?: (value: ResultType) => void
        ) => {
          const { toValue, config } = updatedValue;

          if (canInterpolate(_value, toValue)) {
            const previousAnimation = animation;

            if (previousAnimation._value !== toValue) {
              animation.stop();

              animation = generateAnimation(
                previousAnimation._position,
                config
              );
              config?.onStart && config.onStart(previousAnimation._position);

              if (typeof toValue === 'string') {
                if (!interpolationOutputRange.includes(_value as string)) {
                  interpolationOutputRange.push(_value as string);
                }

                if (!interpolationOutputRange.includes(toValue)) {
                  interpolationOutputRange.push(toValue);
                }

                fluidValue.isInterpolation = true;
                fluidValue.interpolationConfig = {
                  inputRange: interpolationOutputRange.map((_, i) => i),
                  outputRange: interpolationOutputRange,
                };
              }

              animation.start({
                toValue:
                  typeof toValue === 'string'
                    ? interpolationOutputRange.indexOf(toValue)
                    : toValue,
                onFrame,
                previousAnimation,
                onEnd: callback,
              });
            }
          } else {
            if (typeof toValue !== typeof _value) {
              throw new Error(
                `Cannot assign ${typeof toValue} to animated ${typeof _value}`
              );
            }

            applyAnimationValues({
              isTransform,
              propertyType,
              property,
              value: toValue,
            });
          }
        };

        animation = generateAnimation(typeof _value === 'string' ? 0 : _value);
        applyAnimationValues({
          isTransform,
          propertyType,
          property,
          value: _value,
        });

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

interface InterpolationValue {
  isInterpolation: boolean;
  interpolationConfig: {
    inputRange: Array<number>;
    outputRange: Array<number | string>;
    extrapolateConfig?: ExtrapolateConfig;
  };
}

type Fluid = {
  isTransform: boolean;
  property: string;
  propertyType: 'style' | 'props';
  value: FluidValue & Partial<InterpolationValue>;
};

type NonFluid = Omit<Fluid, 'value'> & { value: unknown };

function getFluids(
  propertyType: Fluid['propertyType'],
  props: Record<string, any> = {}
) {
  return Object.entries(props).reduce(
    (res, [property, value]) => {
      const isTransform = propertyType === 'style' && isTransformKey(property);

      if (isFluidValue(value)) {
        res.fluids.push({ isTransform, property, propertyType, value });
      } else {
        res.nonFluids.push({ isTransform, property, propertyType, value });
      }

      return res;
    },
    { fluids: [], nonFluids: [] } as { fluids: Fluid[]; nonFluids: NonFluid[] }
  );
}
