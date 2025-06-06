import { useMemo } from 'react';
import { decay, MotionValue, spring, timing } from '@raidipesh78/re-motion';

import { Primitive } from '../types';
import { AnimationConfig } from '../AnimationConfig';

export function useValue(initial: any) {
  const value = useMemo(() => {
    if (Array.isArray(initial)) {
      return initial.map((item) => new MotionValue(item));
    } else if (typeof initial === 'object') {
      const obj: Record<string, MotionValue> = {};
      for (const key in initial) {
        if (initial.hasOwnProperty(key)) {
          obj[key] = new MotionValue(initial[key]);
        }
      }
      return obj;
    } else {
      return new MotionValue(initial);
    }
  }, [initial]);

  const runAnimation = (
    mv: MotionValue<Primitive>,
    type: 'spring' | 'timing' | 'decay',
    target: any,
    options: any
  ) => {
    switch (type) {
      case 'spring':
        spring(mv, target, options).start();
        break;
      case 'timing':
        timing(mv, target, options).start();
        break;
      case 'decay':
        decay(
          mv as MotionValue<number>,
          options.velocity ?? 0,
          options
        ).start();
        break;
      default:
        console.warn(`Unsupported animation type: ${type}`);
        break;
    }
  };

  const filterCallbackOptions = (options: any, condition: boolean) => {
    const { onStart, onChange, onComplete, ...rest } = options;

    if (condition) {
      return {
        ...rest,
        onStart: options?.onStart,
        onChange: options?.onChange,
        onComplete: options?.onComplete,
      };
    }

    return rest;
  };

  const set = (to: any) => {
    if (Array.isArray(initial)) {
      const mvArray = value as MotionValue<Primitive>[];
      mvArray.forEach((mv, index, arr) => {
        if (Array.isArray(to)) {
          mv.set(to[index]);
        } else if (typeof to === 'object') {
          runAnimation(
            mv,
            to.type,
            to.type === 'decay' ? null : to.to[index],
            filterCallbackOptions(to.options, index === arr.length - 1)
          );
        }
      });
    } else if (typeof initial === 'object') {
      const mvObject = value as Record<string, MotionValue<Primitive>>;

      Object.entries(mvObject).forEach(([key, mv], index, arr) => {
        if (typeof to === 'object') {
          if (to.hasOwnProperty(key)) {
            mv.set(to[key]);
          } else if (to.type) {
            runAnimation(
              mv,
              to.type,
              typeof to.to === 'object' ? to.to[key] : null,
              filterCallbackOptions(to.options, index === arr.length - 1)
            );
          }
        }
      });
    } else {
      // if primitive
      const mv = value as MotionValue<Primitive>;

      if (typeof to === 'object') {
        runAnimation(mv, to.type, to.to, to.options);
      } else if (typeof to === 'number' || typeof to === 'string') {
        mv.set(to);
      }
    }
  };

  return [value as any, set as any];
}

export const withSpring = (to: any, options?: any) => {
  return {
    type: 'spring',
    to,
    options: {
      stiffness: options?.tension ?? AnimationConfig.Spring.ELASTIC.tension,
      damping: options?.friction ?? AnimationConfig.Spring.ELASTIC.friction,
      mass: options?.mass ?? AnimationConfig.Spring.ELASTIC.mass,
      onStart: options?.onStart,
      onChange: options?.onChange,
      onComplete: options?.onRest,
    },
  };
};

export const withTiming = (to: any, options?: any) => ({
  type: 'timing',
  to,
  options: {
    duration: options?.duration ?? 300,
    easing: options?.easing,
    onStart: options?.onStart,
    onChange: options?.onChange,
    onComplete: options?.onRest,
  },
});

export const withDecay = (velocity: number, options?: any) => ({
  type: 'decay',
  options: {
    velocity: velocity ?? 0,
    onStart: options?.onStart,
    onChange: options?.onChange,
    onComplete: options?.onRest,
  },
});
