import { useRef, useEffect, RefObject, DependencyList } from 'react';

import { attachEvents } from '../gestures/helpers/eventAttacher';

export function useOutsideClick(
  elementRef: RefObject<HTMLElement>,
  callback: (event: MouseEvent) => void,
  deps?: DependencyList
) {
  const callbackRef = useRef<(event: MouseEvent) => void>();

  if (!callbackRef.current) {
    callbackRef.current = callback;
  }

  // Reinitiate callback when dependency change
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

    const subscribe = attachEvents(
      [document],
      [['mousedown', handleOutsideClick]]
    );

    return () => subscribe && subscribe();
  }, []);
}
