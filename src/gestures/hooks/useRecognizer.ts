import { RefObject, useEffect, useRef } from 'react';

interface GestureInstance<E> {
  onChange(handler: (event: E) => void): this;
  onEnd(handler: (event: E) => void): this;
  attach(target: Window | HTMLElement): () => void;
}

interface GestureConstructor<C, E> {
  new (config?: C): GestureInstance<E>;
}

export function useRecognizer<T extends HTMLElement, C, E>(
  GestureClass: GestureConstructor<C, E>,
  refs: Window | RefObject<T> | Array<RefObject<T>>,
  onEvent: (e: E & { index: number }) => void,
  config?: C
) {
  const handlerRef = useLatest(onEvent);
  const configRef = useLatest(config);

  if (refs === window) {
    const gestureRef = useRef<GestureInstance<E>>();

    if (!gestureRef.current) {
      const g = new GestureClass(configRef.current);
      const handler = (e: E) => handlerRef.current({ ...e, index: 0 });
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
  const gesturesRef = useRef<GestureInstance<E>[]>([]);

  if (gesturesRef.current.length !== list.length) {
    gesturesRef.current = list.map((_, i) => {
      const g = new GestureClass(configRef.current);
      const handler = (e: E) => handlerRef.current({ ...e, index: i });
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
  }, [list.map((r) => r.current)]);
}

function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref as React.MutableRefObject<T>;
}
