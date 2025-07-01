import { RefObject, useEffect } from 'react';

import {
  type DragConfig,
  type DragEvent,
  DragGesture,
} from '../controllers/DragGesture';

export function useDrag<T extends HTMLElement>(
  refs: RefObject<T> | Array<RefObject<T>>,
  onDrag: (e: DragEvent & { index: number }) => void,
  config?: DragConfig
): void {
  useEffect(() => {
    const list: Array<RefObject<T>> = Array.isArray(refs) ? refs : [refs];
    const cleanups = list
      .map((r, i) => {
        if (!r.current) return null;
        const g = new DragGesture(config);
        const handler = (e: DragEvent) => onDrag({ ...e, index: i });
        g.onChange(handler).onEnd(handler);
        return g.attach(r.current);
      })
      .filter((fn): fn is () => void => !!fn);

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [
    ...(Array.isArray(refs) ? refs.map((r) => r.current) : [refs.current]),
    onDrag,
    config,
  ]);
}
