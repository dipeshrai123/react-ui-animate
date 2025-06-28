import { RefObject, useEffect, useRef } from 'react';

import {
  type DragConfig,
  type DragEvent,
  DragGesture,
} from '../controllers/DragGesture';
import { useLatest } from './useLatest';

export function useDrag<T extends HTMLElement>(
  refs: RefObject<T> | Array<RefObject<T>>,
  onDrag: (e: DragEvent & { index: number }) => void,
  config?: DragConfig
): void {
  const list = Array.isArray(refs) ? refs : [refs];
  const handlerRef = useLatest(onDrag);
  const configRef = useLatest(config);

  const gesturesRef = useRef<DragGesture[]>(
    list.map((_, i) => {
      const g = new DragGesture(configRef.current);
      const handler = (e: DragEvent) => handlerRef.current({ ...e, index: i });
      g.onChange(handler).onEnd(handler);
      return g;
    })
  );

  useEffect(() => {
    const cleanups = list
      .map((r, i) => {
        const el = r.current;
        if (!el) return null;
        return gesturesRef.current[i].attach(el);
      })
      .filter((fn): fn is () => void => !!fn);

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [list]);

  useEffect(
    () => () => {
      gesturesRef.current.forEach((g) => g.cancel());
    },
    []
  );
}
