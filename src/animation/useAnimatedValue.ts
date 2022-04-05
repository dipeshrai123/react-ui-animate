import { useTransition, UseTransitionConfig } from '@raidipesh78/re-motion';
import { AnimationConfigUtils } from './animationType';

// useAnimatedValue value type
type Length = number | string;
type AnimatedValueType = Length;

export interface UseAnimatedValueConfig extends UseTransitionConfig {}

type AssignValue = {
  toValue: Length;
  config?: UseAnimatedValueConfig;
};
export type ValueType =
  | Length
  | AssignValue
  | ((update: (next: AssignValue) => Promise<any>) => void);

/**
 * `useAnimatedValue` returns an animation value with `.value` and `.currentValue` property which is
 * initialized when passed to argument (`initialValue`). The retured value persist until the lifetime of
 * a component. It doesnot cast any re-renders which can is very good for performance optimization.
 * @param { string | number } initialValue - Initial value
 * @param { UseAnimatedValueConfig } config - Animation configuration object.
 */
export function useAnimatedValue(
  initialValue: AnimatedValueType,
  config?: UseAnimatedValueConfig
) {
  const [animation, setAnimation] = useTransition(initialValue, {
    ...AnimationConfigUtils.EASE,
    ...config,
  });

  const targetObject: {
    value: any;
    currentValue: number | string;
  } = {
    value: animation,
    currentValue: animation.get(),
  };

  return new Proxy(targetObject, {
    set: function (_, key, value: ValueType) {
      if (key === 'value') {
        if (typeof value === 'number' || typeof value === 'string') {
          setAnimation({ toValue: value });
        } else if (typeof value === 'object' || typeof value === 'function') {
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
