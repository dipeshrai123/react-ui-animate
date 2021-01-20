import * as React from "react";
import { useConst } from ".";
import { attachEvents } from "../controllers";

export function useOutsideClick(
  elementRef: React.RefObject<HTMLElement>,
  callback: (event: MouseEvent) => void,
) {
  const callbackRef = useConst(callback);

  const handleOutsideClick = React.useCallback((e: MouseEvent) => {
    if (
      !elementRef?.current?.contains(e.target as Element)
    ) {
      callbackRef && callbackRef(e);
    }
  }, []);

  React.useEffect(() => {
    const subscribe = attachEvents(document, [
      ["click", handleOutsideClick, true]
    ]);

    return () => subscribe();
  }, []);
};
