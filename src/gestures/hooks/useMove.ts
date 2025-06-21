import { RefObject, useEffect } from 'react';

import { type MoveEvent, MoveGesture } from '../controllers/MoveGesture';

export function useMove<T extends HTMLElement>(
  refs: RefObject<T> | Array<RefObject<T>>,
  onMove: (e: MoveEvent & { index: number }) => void
): void {
  useEffect(() => {
    const list: Array<RefObject<T>> = Array.isArray(refs) ? refs : [refs];
    const cleanups = list
      .map((r, i) => {
        if (!r.current) return null;
        const g = new MoveGesture();
        const handler = (e: MoveEvent) => onMove({ ...e, index: i });
        g.onChange(handler).onEnd(handler);
        return g.attach(r.current);
      })
      .filter((fn): fn is () => void => !!fn);

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [
    ...(Array.isArray(refs) ? refs.map((r) => r.current) : [refs.current]),
    onMove,
  ]);
}
