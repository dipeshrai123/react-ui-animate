import { RefObject, useEffect, useRef } from 'react';

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
    const gestureRef = useRef<MoveGesture>();
    if (!gestureRef.current) {
      const g = new MoveGesture();
      const handler = (e: MoveEvent) => handlerRef.current({ ...e, index: 0 });
      g.onChange(handler).onEnd(handler);
      gestureRef.current = g;
    }

    useEffect(() => {
      const cleanup = gestureRef.current!.attach(window);
      return () => {
        cleanup();
      };
    }, [refs]);

    return;
  }

  const list: Array<RefObject<T>> = Array.isArray(refs) ? refs : [refs];

  const gesturesRef = useRef<MoveGesture[]>([]);
  if (gesturesRef.current.length !== list.length) {
    gesturesRef.current = list.map((_, i) => {
      const g = new MoveGesture();
      const handler = (e: MoveEvent) => handlerRef.current({ ...e, index: i });
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

    return () => cleanups.forEach((fn) => fn());
  }, [list]);
}
