import { MotionValue } from '@raidipesh78/re-motion';
import { useEffect, useRef } from 'react';

import { Value } from '../Value';
import { ToValue } from '../types';

export function useValue<V extends number | string>(initialValue: V) {
  const ref = useRef<Value<V> | null>(null);

  if (!ref.current) {
    ref.current = new Value(initialValue);
  }

  useEffect(() => {
    return () => {
      ref.current?.destroy();
      ref.current = null;
    };
  }, []);

  return {
    get value(): MotionValue<V> {
      return ref.current!.value;
    },
    set value(u: MotionValue<V> | ToValue<V>) {
      ref.current!.set(u);
    },
    get currentValue(): V {
      return ref.current!.value.current;
    },
  };
}
