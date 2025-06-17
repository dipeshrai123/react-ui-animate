import { useMemo } from 'react';
import {
  decay,
  MotionValue,
  sequence,
  spring,
  timing,
  parallel,
  loop,
} from '@raidipesh78/re-motion';

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

  const buildAnimation = (
    mv: MotionValue<Primitive>,
    type: 'spring' | 'timing' | 'decay',
    target: any,
    options: any
  ) => {
    if (type === 'spring') {
      return spring(mv, target, options);
    } else if (type === 'timing') {
      return timing(mv, target, options);
    } else if (type === 'decay') {
      return decay(mv as MotionValue<number>, options.velocity ?? 0, options);
    } else {
      console.warn(`Unsupported animation type: ${type}`);
      return {
        start() {},
        pause() {},
        resume() {},
        cancel() {},
        reset() {},
      };
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
          if (to.type === 'sequence') {
            const animations = to.animations.map((a: any) => {
              return buildAnimation(
                mv,
                a.type,
                a.type === 'decay' ? null : a.to[index],
                a.options
              );
            });
            sequence(animations).start();
          } else if (to.type === 'loop') {
            const inner = to.animation;

            if (inner.type === 'sequence') {
              const steps = inner.animations.map((step: any) =>
                buildAnimation(
                  mv,
                  step.type,
                  step.type === 'decay' ? null : step.to[index],
                  filterCallbackOptions(step.options, index === arr.length - 1)
                )
              );
              loop(sequence(steps), to.options.iterations).start();
            } else {
              loop(
                buildAnimation(
                  mv,
                  inner.type,
                  inner.type === 'decay'
                    ? null
                    : Array.isArray(inner.to)
                    ? inner.to[index]
                    : inner.to,
                  filterCallbackOptions(inner.options, index === arr.length - 1)
                ),
                to.options.iterations
              ).start();
            }

            return;
          } else {
            buildAnimation(
              mv,
              to.type,
              to.type === 'decay' ? null : to.to[index],
              filterCallbackOptions(to.options, index === arr.length - 1)
            ).start();
          }
        }
      });
    } else if (typeof initial === 'object') {
      const mvObject = value as Record<string, MotionValue<Primitive>>;

      Object.entries(mvObject).forEach(([key, mv], index, arr) => {
        if (typeof to !== 'object') return;

        if (to.hasOwnProperty(key)) {
          mv.set(to[key]);
          return;
        }

        if (to.type === 'sequence') {
          const steps = to.animations.map((step: any) => {
            const ctrls = Object.entries(mvObject)
              .map(([k, m], idx, arr) => {
                if (
                  step.type === 'decay' ||
                  (step.to && step.to[k] !== undefined)
                ) {
                  return buildAnimation(
                    m,
                    step.type,
                    step.type === 'decay' ? null : step.to[k],
                    filterCallbackOptions(step.options, idx === arr.length - 1)
                  );
                }
                return null;
              })
              .filter(Boolean) as any[];

            return parallel(ctrls);
          });

          sequence(steps).start();
          return;
        }

        if (to.type === 'loop') {
          const inner = to.animation;

          let ctl;
          if (inner.type === 'sequence') {
            const steps = inner.animations.map((step: any) => {
              const ctrls = Object.entries(mvObject)
                .map(([k, m], i, arr) => {
                  const hasKey = step.to?.[k] !== undefined;
                  if (step.type === 'decay' || hasKey) {
                    return buildAnimation(
                      m,
                      step.type,
                      step.type === 'decay' ? null : step.to[k],
                      filterCallbackOptions(step.options, i === arr.length - 1)
                    );
                  }

                  return null;
                })
                .filter(Boolean) as any[];
              return parallel(ctrls);
            });
            ctl = sequence(steps);
          } else {
            const ctrls = Object.entries(mvObject).map(([k, m], i, arr) => {
              return buildAnimation(
                m,
                inner.type,
                inner.type === 'decay' ? null : inner.to?.[k] ?? inner.to,
                filterCallbackOptions(inner.options, i === arr.length - 1)
              );
            });
            ctl = parallel(ctrls as any);
          }

          loop(ctl, to.options.iterations).start();
          return;
          return;
        }

        if (to.type === 'decay') {
          buildAnimation(
            mv,
            'decay',
            null,
            filterCallbackOptions(to.options, index === arr.length - 1)
          ).start();
          return;
        }

        const target = (to.to as any)[key];
        buildAnimation(
          mv,
          to.type,
          target,
          filterCallbackOptions(to.options, index === arr.length - 1)
        ).start();
      });
    } else {
      const mv = value as MotionValue<Primitive>;

      if (typeof to === 'object') {
        if (to.type === 'sequence') {
          const animations = to.animations.map((a: any) => {
            return buildAnimation(mv, a.type, a.to, a.options);
          });
          sequence(animations).start();
        } else if (to.type === 'loop') {
          const inner = to.animation;

          let ctl;
          if (inner.type === 'sequence') {
            const steps = inner.animations.map((step: any) => {
              return buildAnimation(
                mv,
                step.type,
                step.to,
                filterCallbackOptions(step.options, true)
              );
            });
            ctl = sequence(steps);
          } else {
            ctl = buildAnimation(
              mv,
              inner.type,
              inner.to,
              filterCallbackOptions(inner.options, true)
            );
          }

          loop(ctl as any, to.options.iterations).start();
        } else {
          buildAnimation(mv, to.type, to.to, to.options).start();
        }
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

export const withSequence = (animations: any[]) => ({
  type: 'sequence',
  animations,
});

export const withLoop = (animation: any, iterations: number) => ({
  type: 'loop',
  animation,
  options: {
    iterations: iterations ?? 1,
  },
});
