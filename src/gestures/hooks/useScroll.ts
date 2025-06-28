import { RefObject, useEffect, useRef } from 'react';

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
    const gestureRef = useRef<ScrollGesture>();
    if (!gestureRef.current) {
      const g = new ScrollGesture();
      const handler = (e: ScrollEvent) =>
        handlerRef.current({ ...e, index: 0 });
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

  const gesturesRef = useRef<ScrollGesture[]>([]);
  if (gesturesRef.current.length !== list.length) {
    gesturesRef.current = list.map((_, i) => {
      const g = new ScrollGesture();
      const handler = (e: ScrollEvent) =>
        handlerRef.current({ ...e, index: i });
      g.onChange(handler).onEnd(handler);
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
