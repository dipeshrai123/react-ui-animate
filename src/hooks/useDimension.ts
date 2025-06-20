import { useRef, useEffect, DependencyList } from 'react';

type DimensionType = {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
};

export function useDimension(
  callback: (event: DimensionType) => void,
  deps: DependencyList = []
) {
  const cbRef = useRef(callback);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback, ...deps]);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { clientWidth, clientHeight } = entry.target;
      const { innerWidth, innerHeight } = window;

      cbRef.current({
        width: clientWidth,
        height: clientHeight,
        innerWidth,
        innerHeight,
      });
    });

    observer.observe(document.documentElement);

    return () => observer.unobserve(document.documentElement);
  }, []);
}
