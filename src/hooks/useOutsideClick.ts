import * as React from "react";

import { attachEvents } from "../gestures/eventAttacher";

export function useOutsideClick(
  elementRef: React.RefObject<HTMLElement>,
  callback: (event: MouseEvent) => void,
  deps?: React.DependencyList
) {
  const callbackRef = React.useRef<(event: MouseEvent) => void>();

  if (!callbackRef.current) {
    callbackRef.current = callback;
  }

  // Reinitiate callback when dependency change
  React.useEffect(() => {
    callbackRef.current = callback;

    return () => {
      callbackRef.current = () => false;
    };
  }, deps);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!elementRef?.current?.contains(e.target as Element)) {
        callbackRef.current && callbackRef.current(e);
      }
    };

    const subscribe = attachEvents([document], [["click", handleOutsideClick]]);

    return () => subscribe && subscribe();
  }, []);
}
