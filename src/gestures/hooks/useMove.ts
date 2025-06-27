import { RefObject, useEffect } from 'react';

import { type MoveEvent, MoveGesture } from '../controllers/MoveGesture';
import { useLatest } from './useLatest';

export function useMove(
  refs: Window,
  onMove: (e: MoveEvent & { index: 0 }) => void
): void;

export function useMove<T extends HTMLElement>(
  refs: RefObject<T> | Array<RefObject<T>>,
  onMove: (e: MoveEvent & { index: number }) => void
): void;

export function useMove<T extends HTMLElement>(refs: any, onMove: any): void {
  const handlerRef = useLatest(onMove);

  if (refs === window) {
    useEffect(() => {
      const g = new MoveGesture();
      const handler = (e: MoveEvent) => handlerRef.current({ ...e, index: 0 });
      g.onChange(handler).onEnd(handler);
      const cleanup = g.attach(window);
      return cleanup;
    }, [onMove]);
    return;
  }

  const list: Array<RefObject<T>> = Array.isArray(refs) ? refs : [refs];

  useEffect(() => {
    const cleanups = list
      .map((r, i) => {
        if (!r.current) return null;
        const g = new MoveGesture();
        const handler = (e: MoveEvent) =>
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
