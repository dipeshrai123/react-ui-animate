import { RefObject, useEffect } from 'react';

import { type ScrollEvent, ScrollGesture } from '../controllers/ScrollGesture';

export function useScroll(
  refs: Window,
  onScroll: (e: ScrollEvent & { index: 0 }) => void
): void;

export function useScroll<T extends HTMLElement>(
  refs: Window | RefObject<T> | Array<RefObject<T>>,
  onScroll: (e: ScrollEvent & { index: number }) => void
): void;

export function useScroll<T extends HTMLElement>(
  refs: any,
  onScroll: any
): void {
  if (refs === window) {
    useEffect(() => {
      const g = new ScrollGesture();
      const handler = (e: ScrollEvent) => onScroll({ ...e, index: 0 });
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
        const handler = (e: ScrollEvent) => onScroll({ ...e, index: i });
        g.onChange(handler).onEnd(handler);
        return g.attach(r.current);
      })
      .filter((fn): fn is () => void => !!fn);

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [...list.map((r) => r.current), onScroll]);
}
