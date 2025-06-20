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
    const handle = () => {
      const root = document.documentElement;
      const { clientWidth: width, clientHeight: height } = root;
      const { innerWidth, innerHeight } = window;
      cbRef.current({ width, height, innerWidth, innerHeight });
    };

    const observer = new ResizeObserver(handle);
    observer.observe(document.documentElement);

    window.addEventListener('resize', handle);

    handle();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handle);
    };
  }, []);
}
