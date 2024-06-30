import { useFluidValue, FluidValueConfig, FluidValue } from '../core';
import { AnimationConfigUtils } from './animationType';

// useAnimatedValue value type
type Length = number | string;

export interface UseAnimatedValueConfig extends FluidValueConfig {}

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
    value: FluidValue | string | number | undefined;
    currentValue: number | string;
  } = {
    value: animation,
    currentValue: animation.get(),
  };

  return new Proxy(targetObject, {
    set: function (_, key, value: any) {
      if (key === 'value') {
        if (typeof value === 'number' || typeof value === 'string') {
          setAnimation(value);
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
