import { useEffect, useRef } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { Value } from '../Value';
import { Primitive, ToValue } from '../types';

type Input<V extends Primitive> = V | V[] | Record<string, V>;

type Output<V extends Primitive, I extends Input<V>> = I extends V
  ? MotionValue<V>
  : I extends V[]
  ? { [K in keyof I]: MotionValue<V> }
  : I extends Record<string, V>
  ? { [K in keyof I]: MotionValue<V> }
  : never;

type SetterParam<V extends Primitive, I extends Input<V>> = I extends V
  ? MotionValue<V> | ToValue<V>
  : I extends V[]
  ? { [K in keyof I]: MotionValue<V> | ToValue<V> }
  : I extends Record<string, V>
  ? { [K in keyof I]: MotionValue<V> | ToValue<V> }
  : never;

export function useValue<V extends Primitive, I extends Input<V>>(
  initial: I
): [Output<V, I>, (to: SetterParam<V, I>) => void] {
  const storeRef = useRef<Array<[string, Value<V>]> | null>(null);
  if (storeRef.current === null) {
    const entries: Array<[string, Value<V>]> = [];

    if (Array.isArray(initial)) {
      (initial as V[]).forEach((v, i) => {
        entries.push([String(i), new Value(v)]);
      });
    } else if (typeof initial === 'object') {
      for (const [k, v] of Object.entries(initial as Record<string, V>)) {
        entries.push([k, new Value(v)]);
      }
    } else {
      entries.push(['__0', new Value(initial as V)]);
    }

    storeRef.current = entries;
  }

  useEffect(() => {
    return () => {
      storeRef.current!.forEach(([, val]) => val.destroy());
      storeRef.current = null;
    };
  }, []);

  const values = (() => {
    const entries = storeRef.current!;
    if (Array.isArray(initial)) {
      return entries.map(([, val]) => val.value) as Output<V, I>;
    }
    if (typeof initial === 'object') {
      const out: Record<string, MotionValue<V>> = {};
      for (const [k, val] of entries) out[k] = val.value;
      return out as Output<V, I>;
    }
    return entries[0][1].value as Output<V, I>;
  })();

  const set = ((
    to:
      | MotionValue<V>
      | ToValue<V>
      | Array<MotionValue<V> | ToValue<V>>
      | Record<string, MotionValue<V> | ToValue<V>>
  ) => {
    const entries = storeRef.current!;
    if (Array.isArray(initial)) {
      const arr = to as Array<MotionValue<V> | ToValue<V>>;
      arr.forEach((u, i) => {
        entries[i][1].set(u);
      });
    } else if (typeof initial === 'object') {
      const obj = to as Record<string, MotionValue<V> | ToValue<V>>;
      for (const [k, u] of Object.entries(obj)) {
        const pair = entries.find(([ek]) => ek === k)!;
        pair[1].set(u);
      }
    } else {
      entries[0][1].set(to as MotionValue<V> | ToValue<V>);
    }
  }) as (to: SetterParam<V, I>) => void;

  return [values, set];
}
