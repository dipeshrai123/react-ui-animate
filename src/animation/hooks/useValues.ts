import { useEffect, useRef } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { Value } from '../Value';
import { ToValue } from '../types';

export function useValues<V extends number | string>(initialValues: V[]) {
  const ref = useRef<Value<V>[] | null>(null);

  if (ref.current === null) {
    ref.current = initialValues.map((v) => new Value(v));
  }

  useEffect(() => {
    return () => {
      ref.current?.forEach((v) => v.destroy());
    };
  }, []);

  return {
    get values(): MotionValue<V>[] {
      return ref.current!.map((v) => v.value);
    },
    set values(newValues: (MotionValue<V> | ToValue<V>)[]) {
      newValues.forEach((v, i) => {
        ref.current?.[i]?.set(v);
      });
    },
    get currentValues(): V[] {
      return ref.current!.map((v) => v.current);
    },
  };
}
