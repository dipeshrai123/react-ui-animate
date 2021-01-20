import * as React from "react";
import { attachEvents } from "../controllers";

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
  }, deps);

  const handleOutsideClick = React.useCallback(
    (e: MouseEvent) => {
      if (!elementRef?.current?.contains(e.target as Element)) {
        callbackRef.current && callbackRef.current(e);
      }
    },
    [elementRef.current]
  );

  React.useEffect(() => {
    const subscribe = attachEvents(document, [
      ["click", handleOutsideClick, true],
    ]);

    return () => subscribe();
  }, []);
}
