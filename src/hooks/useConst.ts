import * as React from "react";

export function useConst<T>(initialValue: T): T {
  const ref = React.useRef<any>();

  if (ref.current === undefined) {
    ref.current = initialValue;
  }
  
  return ref.current;
}