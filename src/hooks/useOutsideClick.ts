import * as React from "react";
import { useConst } from ".";

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
    document.addEventListener("click", handleOutsideClick, true);

    return () => {
      document.addEventListener("click", handleOutsideClick, true);
    };
  }, []);
};
