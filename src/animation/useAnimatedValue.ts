import { useFluidValue, UseFluidValueConfig } from '@raidipesh78/re-motion';

import { AnimationConfigUtils } from './animationType';

export interface UseAnimatedValueConfig extends UseFluidValueConfig {}

type AssignValue = {
  toValue?: number;
  config?: UseAnimatedValueConfig;
};

export type UpdateValue =
  | AssignValue
  | ((update: (next: AssignValue) => Promise<any>) => void);

/**
 * `useAnimatedValue` returns an animation value with `.value` and `.currentValue` property which is
 * initialized when passed to argument (`initialValue`). The retured value persist until the lifetime of
 * a component. It doesnot cast any re-renders which can is very good for performance optimization.
 *
 * @param { string | number } initialValue - Initial value
 * @param { UseAnimatedValueConfig } config - Animation configuration object.
 */
export function useAnimatedValue(
  initialValue: number,
  config?: UseAnimatedValueConfig
) {
  const [animation, setAnimation] = useFluidValue(initialValue, {
    ...AnimationConfigUtils.EASE,
    ...config,
  });

  const targetObject: {
    value: any;
    currentValue: number;
  } = {
    value: animation,
    currentValue: animation.get(),
  };

  return new Proxy(targetObject, {
    set: function (_, key, value: number | UpdateValue) {
      if (key === 'value') {
        if (typeof value === 'number') {
          queueMicrotask(() => setAnimation({ toValue: value }));
        } else if (typeof value === 'function') {
          queueMicrotask(() => setAnimation(value));
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
