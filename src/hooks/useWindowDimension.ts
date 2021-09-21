import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";
import { WindowDimensionType } from "../Types";

export const useWindowDimension = (
  callback: (event: WindowDimensionType) => void,
  deps?: React.DependencyList
) => {
  const windowDimensionsRef = React.useRef<WindowDimensionType>({
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
  });
  const callbackRef =
    React.useRef<(event: WindowDimensionType) => void>(callback);

  const handleCallback: () => void = () => {
    if (callbackRef) {
      callbackRef.current({
        ...windowDimensionsRef.current,
      });
    }
  };

  // Reinitiate callback when dependency change
  React.useEffect(() => {
    callbackRef.current = callback;

    return () => {
      callbackRef.current = () => false;
    };
  }, deps);

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
