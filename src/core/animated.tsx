import React from "react";

import { SpringAnimation } from "./SpringAnimation";
import { TimingAnimation } from "./TimingAnimation";
import {
  ExtrapolateConfig,
  interpolate as internalInterpolate,
} from "./Interpolation";
import { tags, unitlessStyleProps } from "./Tags";
import { TransitionValue } from "./useTransition";

const isDefined = (value: any) => {
  return value !== null && value !== undefined;
};

const isSubscriber = (value: any) => {
  return (
    typeof value === "object" &&
    Object.prototype.hasOwnProperty.call(value, "_subscribe")
  );
};

// Get unitless or unit css prop
function getCssValue(property: string, value: number | string) {
  let cssValue;
  if (typeof value === "number") {
    if (unitlessStyleProps.indexOf(property) !== -1) {
      cssValue = value;
    } else {
      cssValue = value + "px";
    }
  } else {
    cssValue = value;
  }

  return cssValue;
}

// Non-animatable styles
function getNonAnimatableStyle(style: React.CSSProperties) {
  return Object.keys(style).reduce((resultObject, styleProp) => {
    const value = style[styleProp as keyof React.CSSProperties];

    // skip subscriber
    if (isSubscriber(value)) {
      return resultObject;
    }

    return { ...resultObject, [styleProp]: value };
  }, {});
}

// Combine multiple refs
function combineRefs(
  ...refs: Array<React.RefObject<any> | ((element: HTMLElement) => void)>
) {
  return function applyRef(element: HTMLElement) {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === "function") {
        ref(element);
        return;
      }

      if ("current" in ref) {
        // @ts-ignore
        ref.current = element;
      }
    });
  };
}

/**
 * interpolate function maps input to output range
 * @param value
 * @param inputRange
 * @param outputRange
 * @param extrapolateConfig
 * @returns TransitionValue
 */
export const interpolate = (
  value: TransitionValue,
  inputRange: Array<number>,
  outputRange: Array<number | string>,
  extrapolateConfig?: ExtrapolateConfig
) => {
  return {
    ...value,
    isInterpolation: true,
    interpolationConfig: {
      inputRange,
      outputRange,
      extrapolateConfig,
    },
  };
};

export const makeAnimatedComponent = (
  WrapperComponent: React.ComponentType | keyof JSX.IntrinsicElements
) => {
  function Wrapper({ style, ...props }: any, forwardRef: any) {
    const ref = React.useRef(null);

    // generates the array of animation object
    const animations = React.useMemo(() => {
      if (!style) {
        return [];
      }

      return Object.keys(style).reduce(function (acc, styleProp) {
        const value = style[styleProp] as TransitionValue;

        if (isSubscriber(value)) {
          const { _value, _config } = value;

          // string cannot be interpolated by default ignore it.
          if (typeof _value === "string") {
            return [
              ...acc,
              {
                property: styleProp,
                animatable: false,
                ...value,
              },
            ];
          }

          let animation: any;

          if (isDefined(_config?.duration)) {
            animation = new TimingAnimation({
              initialPosition: _value,
              config: {
                duration: _config?.duration,
                easing: _config?.easing,
                immediate: _config?.immediate,
                delay: _config?.delay,
                onAnimationEnd: _config?.onAnimationEnd,
              },
            });
          } else {
            animation = new SpringAnimation({
              initialPosition: _value,
              config: {
                mass: _config?.mass,
                tension: _config?.tension,
                friction: _config?.friction,
                immediate: _config?.immediate,
                delay: _config?.delay,
                onAnimationEnd: _config?.onAnimationEnd,
              },
            });
          }

          return [
            ...acc,
            {
              property: styleProp,
              animation,
              animatable: true,
              ...value,
            },
          ];
        }

        return acc;
      }, []);
    }, [style]);

    // Update non-animated style if style changes
    React.useEffect(() => {
      const nonAnimatableStyle = getNonAnimatableStyle(style);

      Object.keys(nonAnimatableStyle).forEach((styleProp) => {
        const value =
          nonAnimatableStyle[styleProp as keyof React.CSSProperties];

        if (ref.current) {
          ref.current.style[styleProp] = getCssValue(styleProp, value);
        }
      });
    }, [style]);

    React.useEffect(() => {
      const subscribers = [];

      // set all subscribers here
      // TODO: check if it can be interpolated or not
      // always give interpolatable strings value from 0 to 1 in animation
      animations.forEach((props) => {
        const { animation, property, _subscribe, _value, animatable, _config } =
          props;

        if (!ref.current) {
          return;
        }

        const onFrame = (value: number) => {
          if (props.isInterpolation) {
            const { interpolationConfig } = props;

            const interpolatedValue = internalInterpolate(
              value,
              interpolationConfig.inputRange,
              interpolationConfig.outputRange,
              interpolationConfig.extrapolateConfig
            );

            if (ref.current) {
              ref.current.style[property] = getCssValue(
                property,
                interpolatedValue
              );
            }

            // call the listener
            if (_config?.listener) {
              _config?.listener(interpolatedValue);
            }
          } else {
            if (ref.current) {
              ref.current.style[property] = getCssValue(property, value);
            }

            // call the listener
            if (_config?.listener) {
              _config?.listener(value);
            }
          }
        };

        const onUpdate = (
          value: number | string,
          callback?: (value: number) => void
        ) => {
          if (animatable) {
            // animatable
            animation.start({
              toValue: value,
              onFrame,
              previousAnimation: animation,
              onEnd: callback,
            });
          } else {
            // non-animatable
            if (typeof value === typeof _value) {
              if (ref.current) {
                ref.current.style[property] = getCssValue(property, value);
              }
            } else {
              throw new Error("Cannot set different types of animation values");
            }
          }
        };

        onFrame(_value); // first initial value paint the frame

        const subscribe = _subscribe(onUpdate);
        subscribers.push(subscribe);
      });

      return () => {
        // cleanup
        subscribers.forEach((subscriber) => subscriber);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return React.createElement(WrapperComponent, {
      ...props,
      ref: combineRefs(ref, forwardRef),
    });
  }

  return React.forwardRef(Wrapper);
};

export const animated: any = {};
tags.forEach((element) => {
  animated[element] = makeAnimatedComponent(
    element as keyof JSX.IntrinsicElements
  );
});
