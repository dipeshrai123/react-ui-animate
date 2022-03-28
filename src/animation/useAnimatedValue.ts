import { useTransition, UseTransitionConfig } from '@raidipesh78/re-motion';
import { InitialConfigType, getInitialConfig } from './getInitialConfig';

// useAnimatedValue value type
type AnimatedValueType = number | string;
export interface UseAnimatedValueConfig extends UseTransitionConfig {
  animationType?: InitialConfigType;
}

type Length = number | string;
type AssignValue = {
  toValue: Length;
  config?: UseAnimatedValueConfig;
};
export type ValueType =
  | Length
  | AssignValue
  | ((next: (next: AssignValue) => Promise<any>) => void);

const getConfig = (config?: UseAnimatedValueConfig) => {
  const animationType = config?.animationType ?? 'ease'; // Defines default animation

  return {
    ...getInitialConfig(animationType),
    ...config,
  };
};

/**
 * useAnimatedValue for animated transitions
 */
export function useAnimatedValue(
  initialValue: AnimatedValueType,
  config?: UseAnimatedValueConfig
) {
  const [animation, setAnimation] = useTransition(
    initialValue,
    getConfig(config)
  );

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
        } else if (typeof value === 'object') {
          setAnimation({
            toValue: value.toValue,
            config: getConfig(value.config),
          });
        } else if (typeof value === 'function') {
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
