import { RefObject, useEffect, useRef } from 'react';

function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref as React.MutableRefObject<T>;
}

export function useRecognizer<T extends HTMLElement>(
  GestureConstructor: any,
  refs: Window | RefObject<T> | Array<RefObject<T>>,
  onEvent: (e: any & { index: number }) => void,
  config?: Record<string, any>
) {
  const handlerRef = useLatest(onEvent);
  const configRef = useLatest(config);

  if (refs === window) {
    const gestureRef = useRef<any>();

    if (!gestureRef.current) {
      const g = new GestureConstructor(configRef.current);
      const handler = (e: any) => handlerRef.current({ ...e, index: 0 });
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

  const list = Array.isArray(refs) ? refs : ([refs] as RefObject<T>[]);
  const gesturesRef = useRef<any[]>([]);

  if (gesturesRef.current.length !== list.length) {
    gesturesRef.current = list.map((_, i) => {
      const g = configRef.current
        ? new GestureConstructor(configRef.current)
        : new GestureConstructor();
      const handler = (e: any) => handlerRef.current({ ...e, index: i });
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
