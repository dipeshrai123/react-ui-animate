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
  interpolateNumbers,
} from '../interpolation/Interpolation';
import { tags } from './Tags';
import { ResultType, FluidValueConfig, Length } from '../types/animation';
import { getTransform, isTransformKey } from './transforms';
import {
  isDefined,
  getCleanProps,
  getCssValue,
  camelToDash,
  canInterpolate,
  isFluidValue,
} from '../helpers';
import { FluidProps, WrappedComponentOrTag } from '../types/fluid';
import { FluidValue } from '../controllers/FluidValue';

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

        const generateAnimation = animationObjectGenerator(_config);
        let animation: any = null;

        const onFrame = (value: number) => {
          _currentValue.current = value;

          const updatedValue: number = fluidValue.isInterpolation
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
                fluidValue.isInterpolation = true;
                fluidValue.interpolationConfig = {
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

type InterpolationValue = {
  isInterpolation: boolean;
  interpolationConfig: {
    inputRange: Array<number>;
    outputRange: Array<number | string>;
    extrapolateConfig?: ExtrapolateConfig;
  };
};

type Fluid = {
  isTransform: boolean;
  property: string;
  propertyType: 'style' | 'props';
  value: FluidValue & InterpolationValue;
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
