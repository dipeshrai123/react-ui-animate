import { useTransition, UseTransitionConfig } from '@raidipesh78/re-motion';

// useAnimatedValue value type
type AnimatedValueType = number | string;
export interface UseAnimatedValueConfig extends UseTransitionConfig {}

type Length = number | string;
type AssignValue = {
  toValue: Length;
  config?: UseAnimatedValueConfig;
};
export type ValueType =
  | Length
  | AssignValue
  | ((update: (next: AssignValue) => Promise<any>) => void);

/**
 * useAnimatedValue for animated transitions
 */
export function useAnimatedValue(
  initialValue: AnimatedValueType,
  config?: UseAnimatedValueConfig
) {
  const [animation, setAnimation] = useTransition(initialValue, config);

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
