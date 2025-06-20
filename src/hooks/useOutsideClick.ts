import { useRef, useEffect, RefObject, DependencyList } from 'react';

export function useOutsideClick(
  elementRef: RefObject<HTMLElement>,
  callback: (event: MouseEvent) => void,
  deps?: DependencyList
) {
  const callbackRef = useRef<(event: MouseEvent) => void>();

  if (!callbackRef.current) {
    callbackRef.current = callback;
  }

  useEffect(() => {
    callbackRef.current = callback;

    return () => {
      callbackRef.current = () => false;
    };
  }, deps);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;

      if (!target || !target.isConnected) {
        return;
      }

      const isOutside =
        elementRef.current && !elementRef.current.contains(target);

      if (isOutside) {
        callbackRef.current && callbackRef.current(e);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
}
