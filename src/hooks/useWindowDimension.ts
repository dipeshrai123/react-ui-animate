import { useRef, useEffect, DependencyList } from 'react';

type WindowDimensionType = {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
};

export function useWindowDimension(
  callback: (event: WindowDimensionType) => void,
  deps?: DependencyList
) {
  const windowDimensionsRef = useRef<WindowDimensionType>({
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
  });
  const callbackRef = useRef<(event: WindowDimensionType) => void>(callback);

  const handleCallback: () => void = () => {
    if (callbackRef) {
      callbackRef.current({
        ...windowDimensionsRef.current,
      });
    }
  };

  // Re-initiate callback when dependency change
  useEffect(() => {
    callbackRef.current = callback;

    return () => {
      callbackRef.current = () => false;
    };
  }, deps);

  useEffect(() => {
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
}
