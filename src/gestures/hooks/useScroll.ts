import { RefObject, useEffect } from 'react';

import { type ScrollEvent, ScrollGesture } from '../controllers/ScrollGesture';
import { useLatest } from './useLatest';

export function useScroll(
  refs: Window,
  onScroll: (e: ScrollEvent & { index: 0 }) => void
): void;

export function useScroll<T extends HTMLElement>(
  refs: RefObject<T> | Array<RefObject<T>>,
  onScroll: (e: ScrollEvent & { index: number }) => void
): void;

export function useScroll<T extends HTMLElement>(
  refs: any,
  onScroll: any
): void {
  const handlerRef = useLatest(onScroll);

  if (refs === window) {
    useEffect(() => {
      const g = new ScrollGesture();
      const handler = (e: ScrollEvent) =>
        handlerRef.current({ ...e, index: 0 });
      g.onChange(handler).onEnd(handler);
      const cleanup = g.attach(window);
      return cleanup;
    }, [onScroll]);
    return;
  }

  const list: Array<RefObject<T>> = Array.isArray(refs) ? refs : [refs];

  useEffect(() => {
    const cleanups = list
      .map((r, i) => {
        if (!r.current) return null;
        const g = new ScrollGesture();
        const handler = (e: ScrollEvent) =>
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
