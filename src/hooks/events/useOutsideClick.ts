import { useRef, useEffect, RefObject, DependencyList } from 'react';

export function useOutsideClick(
  ref: RefObject<HTMLElement>,
  callback: (event: MouseEvent | TouchEvent) => void,
  deps: DependencyList = []
): void {
  const cbRef = useRef(callback);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback, ...deps]);

  useEffect(() => {
    function onClick(event: MouseEvent | TouchEvent) {
      const el = ref.current;
      const target = event.target as Node | null;

      if (!el || !target || !target.isConnected) return;
      if (!el.contains(target)) {
        cbRef.current(event);
      }
    }

    document.addEventListener('mousedown', onClick);
    document.addEventListener('touchstart', onClick);

    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('touchstart', onClick);
    };
  }, [ref]);
}
