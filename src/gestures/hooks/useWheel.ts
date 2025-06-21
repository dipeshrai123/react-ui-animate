import { RefObject, useEffect } from 'react';

import { type WheelEvent, WheelGesture } from '../controllers/WheelGesture';

export function useWheel(
  refs: Window,
  onWheel: (e: WheelEvent & { index: 0 }) => void
): void;

export function useWheel<T extends HTMLElement>(
  refs: RefObject<T> | Array<RefObject<T>>,
  onWheel: (e: WheelEvent & { index: number }) => void
): void;

export function useWheel<T extends HTMLElement>(refs: any, onWheel: any): void {
  if (refs === window) {
    useEffect(() => {
      const g = new WheelGesture();
      const handler = (e: WheelEvent) => onWheel({ ...e, index: 0 });
      g.onChange(handler).onEnd(handler);
      const cleanup = g.attach(window);
      return cleanup;
    }, [onWheel]);
    return;
  }

  const list: Array<RefObject<T>> = Array.isArray(refs) ? refs : [refs];

  useEffect(() => {
    const list: Array<RefObject<T>> = Array.isArray(refs) ? refs : [refs];
    const cleanups = list
      .map((r, i) => {
        if (!r.current) return null;
        const g = new WheelGesture();
        const handler = (e: WheelEvent) => onWheel({ ...e, index: i });
        g.onChange(handler).onEnd(handler);
        return g.attach(r.current);
      })
      .filter((fn): fn is () => void => !!fn);

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [...list.map((r) => r.current), onWheel]);
}
