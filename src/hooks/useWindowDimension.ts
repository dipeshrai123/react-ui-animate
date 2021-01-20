import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";
import { WindowDimensionType } from "../Types";
import { useConst } from ".";

export const useWindowDimension = (
  callback: (event: WindowDimensionType) => void
) => {
  const windowDimensionsRef = React.useRef<WindowDimensionType>({
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
  });
  const callbackRef = useConst<(event: WindowDimensionType) => void>(callback);

  const handleCallback: () => void = () => {
    if (callbackRef) {
      callbackRef({
        ...windowDimensionsRef.current,
      });
    }
  };

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { clientWidth, clientHeight } = entry.target;
      const { innerWidth, innerHeight } = window;

      windowDimensionsRef.current = {
        width: clientWidth,
        height: clientHeight,
        innerWidth,
        innerHeight,
      };

      handleCallback();
    });

    resizeObserver.observe(document.documentElement);

    return () => resizeObserver.unobserve(document.documentElement);
  }, []);
};
