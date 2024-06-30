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
      if (!elementRef?.current?.contains(e.target as Element)) {
        callbackRef.current && callbackRef.current(e);
      }
    };

    const subscribe = attachEvents([document], [['click', handleOutsideClick]]);

    return () => subscribe && subscribe();
  }, []);
}
