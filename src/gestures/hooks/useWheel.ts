import { RefObject, useEffect, useRef } from 'react';

import { type WheelEvent, WheelGesture } from '../controllers/WheelGesture';
import { useLatest } from './useLatest';

export function useWheel(
  refs: Window,
  onWheel: (e: WheelEvent & { index: 0 }) => void
): void;

export function useWheel<T extends HTMLElement>(
  refs: RefObject<T> | Array<RefObject<T>>,
  onWheel: (e: WheelEvent & { index: number }) => void
): void;

export function useWheel<T extends HTMLElement>(refs: any, onWheel: any): void {
  const handlerRef = useLatest(onWheel);

  if (refs === window) {
    const gestureRef = useRef<WheelGesture>();
    if (!gestureRef.current) {
      const g = new WheelGesture();
      const handler = (e: WheelEvent) => handlerRef.current({ ...e, index: 0 });
      g.onChange(handler).onEnd(handler);
      gestureRef.current = g;
    }

    useEffect(() => {
      const cleanup = gestureRef.current!.attach(window);
      return () => cleanup();
    }, [refs]);

    return;
  }

  const list: Array<RefObject<T>> = Array.isArray(refs) ? refs : [refs];

  const gesturesRef = useRef<WheelGesture[]>([]);
  if (gesturesRef.current.length !== list.length) {
    gesturesRef.current = list.map((_, i) => {
      const g = new WheelGesture();
      g.onChange((e) => handlerRef.current({ ...e, index: i })).onEnd((e) =>
        handlerRef.current({ ...e, index: i })
      );
      return g;
    });
  }

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
}
