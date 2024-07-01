import { useFluidValue, FluidValueConfig } from '../core';
import { AnimationConfigUtils } from './animationType';

// useAnimatedValue value type
type Length = number | string;

export interface UseAnimatedValueConfig extends FluidValueConfig {}

type AssignValue = {
  toValue: Length;
  config?: UseAnimatedValueConfig;
};

export type ValueType = Length | AssignValue;
/**
 * `useAnimatedValue` returns an animation value with `.value` and `.currentValue` property which is
 * initialized when passed to argument (`initialValue`). The retured value persist until the lifetime of
 * a component. It doesnot cast any re-renders which can is very good for performance optimization.
 *
 * @param { string | number } initialValue - Initial value
 * @param { UseAnimatedValueConfig } config - Animation configuration object.
 */
export function useAnimatedValue(
  initialValue: Length,
  config?: UseAnimatedValueConfig
) {
  const [animation, setAnimation] = useFluidValue(initialValue, {
    ...AnimationConfigUtils.EASE,
    ...config,
  });

  const targetObject: {
    value: ValueType;
    currentValue: number | string;
  } = {
    value: animation as any,
    currentValue: animation.get(),
  };

  return new Proxy(targetObject, {
    set: function (_, key, value: ValueType) {
      if (key === 'value') {
        if (typeof value === 'number' || typeof value === 'string') {
          setAnimation(value);
        } else if (typeof value === 'object' && 'toValue' in value) {
          setAnimation(value.toValue, value.config);
        }

        return true;
      }

      throw new Error('You cannot set any other property to animation node.');
    },
    get: function (_, key) {
      if (key === 'value') {
        return animation;
      }

      if (key === 'currentValue') {
        return animation.get();
      }

      throw new Error(
        'You cannot access any other property from animation node.'
      );
    },
  });
}
