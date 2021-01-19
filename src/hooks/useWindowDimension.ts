import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";
import { WindowDimensionType } from "../Types";

export const useWindowDimension = (
  callback: (event: WindowDimensionType) => void
) => {
  const windowDimensionsRef = React.useRef<WindowDimensionType>({
    width: 0,
    height: 0,
  });
  const callbackRef = React.useRef<(event: WindowDimensionType) => void>();

  if (!callbackRef.current) {
    callbackRef.current = callback;
  }

  const handleCallback: () => void = () => {
    if (callbackRef.current) {
      callbackRef.current({
        ...windowDimensionsRef.current,
      });
    }
  };

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { clientWidth, clientHeight } = entry.target;

      windowDimensionsRef.current = {
        width: clientWidth,
        height: clientHeight,
      };

      handleCallback();
    });

    resizeObserver.observe(document.documentElement);

    return () => resizeObserver.unobserve(document.documentElement);
  }, []);
};
