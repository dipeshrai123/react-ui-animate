import { RefObject, useEffect } from 'react';

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
  const list: Array<RefObject<T>> = Array.isArray(refs) ? refs : [refs];
  const handlerRef = useLatest(onDrag);
  const configRef = useLatest(config);

  useEffect(() => {
    const cleanups = list
      .map((r, i) => {
        if (!r.current) return null;
        const g = new DragGesture(configRef.current);
        const handler = (e: DragEvent) =>
          handlerRef.current({ ...e, index: i });
        g.onChange(handler).onEnd(handler);
        return g.attach(r.current);
      })
      .filter((fn): fn is () => void => !!fn);

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);
}
