import * as React from "react";

/**
 * useConst(initialValue)
 * returns memoized value on every render without returning new value.
 */
export function useConst<T>(initialValue: T): T {
  const ref = React.useRef<T>();

  if (ref.current === undefined) {
    ref.current = initialValue;
  }

  return ref.current;
}
