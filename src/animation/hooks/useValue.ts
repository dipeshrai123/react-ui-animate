import {
  decay,
  delay,
  loop,
  MotionValue,
  sequence,
  spring,
  timing,
  useMotionValue,
} from '@raidipesh78/re-motion';
import { useCallback, useEffect, useRef } from 'react';

import { DriverConfig, ToValue } from '../types';

export function useValue<V extends number | string>(initialValue: V) {
  const animation = useMotionValue<V>(initialValue);
  const unsubscribeRef = useRef<() => void>();

  const doSet = useCallback(
    (u: ToValue<V>) => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = undefined;

      if (u && typeof u === 'object') {
        const { type, to, options } = u;

        if (options?.onChange) {
          unsubscribeRef.current = animation.subscribe(options.onChange);
        }

        if (type === 'sequence') {
          const steps = options?.steps ?? [];

          const controllers = steps.map((step) => {
            if (step.type === 'decay') {
              return decay(
                animation as MotionValue<number>,
                step?.options?.velocity!,
                step.options
              );
            }

            if (step.type === 'delay') {
              return delay(step?.options?.delay!);
            }

            const driver = step.type === 'spring' ? spring : timing;
            return driver(
              animation as MotionValue<number>,
              step.to!,
              step.options
            );
          });

          const seqCtrl = sequence(controllers);
          seqCtrl.start();

          return;
        }

        if (type === 'loop') {
          const buildInner: any = (cfg: DriverConfig) => {
            if (cfg.type === 'decay') {
              return decay(
                animation as MotionValue<number>,
                cfg.options?.velocity!,
                cfg.options
              );
            }

            if (cfg.type === 'spring') {
              return spring(
                animation as MotionValue<number>,
                cfg?.to!,
                cfg.options
              );
            }

            if (cfg.type === 'timing') {
              return timing(
                animation as MotionValue<number>,
                cfg?.to!,
                cfg.options
              );
            }

            if (cfg.type === 'sequence') {
              return sequence(cfg.options?.steps!.map(buildInner)!);
            }

            if (cfg.type === 'delay') {
              return delay(cfg.options?.delay!);
            }

            throw new Error(`Unsupported driver type "${cfg.type}" in loop()`);
          };

          const innerCtrl = buildInner(options?.controller!);
          const loopCtrl = loop(innerCtrl, options?.iterations!);
          loopCtrl.start();

          return;
        }

        if (type === 'spring') {
          spring(animation as MotionValue<number>, to!, options).start();
        } else if (type === 'timing') {
          timing(animation as MotionValue<number>, to!, options).start();
        } else if (type === 'decay') {
          decay(
            animation as MotionValue<number>,
            options?.velocity!,
            options
          ).start();
        }
        return;
      } else {
        animation.set(u as V);
      }
    },
    [animation]
  );

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = undefined;
    };
  }, []);

  return {
    get value(): MotionValue<V> {
      return animation;
    },
    set value(u: MotionValue<V> | ToValue<V>) {
      if (u instanceof MotionValue) return;
      doSet(u);
    },
    get currentValue(): V {
      return animation.current;
    },
  };
}
