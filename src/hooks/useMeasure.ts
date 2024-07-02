import { useRef, useEffect, DependencyList, createRef } from 'react';

type MeasurementValue = number | Array<number>;

type MeasurementType = {
  left: MeasurementValue;
  top: MeasurementValue;
  width: MeasurementValue;
  height: MeasurementValue;
  vLeft: MeasurementValue;
  vTop: MeasurementValue;
};

export function useMeasure(
  callback: (event: MeasurementType) => void,
  deps?: DependencyList
) {
  const ref = useRef(null);
  const elementRefs = useRef([]);
  const callbackRef = useRef<(event: MeasurementType) => void>(callback);

  // Reinitiate callback when dependency change
  useEffect(() => {
    callbackRef.current = callback;

    return () => {
      callbackRef.current = () => false;
    };
  }, deps);

  useEffect(() => {
    const _refElement = ref.current || document.documentElement;
    const _refElementsMultiple = elementRefs.current;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { left, top, width, height } = entry.target.getBoundingClientRect();
      const { pageXOffset, pageYOffset } = window;

      if (callbackRef) {
        if (_refElement === document.documentElement) {
          return; // no-op for document
        } else {
          callbackRef.current({
            left: left + pageXOffset,
            top: top + pageYOffset,
            width,
            height,
            vLeft: left,
            vTop: top,
          });
        }
      }
    });

    const resizeObserverMultiple = new ResizeObserver((entries) => {
      const left: Array<number> = [];
      const top: Array<number> = [];
      const width: Array<number> = [];
      const height: Array<number> = [];
      const vLeft: Array<number> = [];
      const vTop: Array<number> = [];

      entries.forEach((entry) => {
        const {
          left: _left,
          top: _top,
          width: _width,
          height: _height,
        } = entry.target.getBoundingClientRect();
        const { pageXOffset, pageYOffset } = window;
        const _pageLeft = _left + pageXOffset;
        const _pageTop = _top + pageYOffset;

        left.push(_pageLeft);
        top.push(_pageTop);
        width.push(_width);
        height.push(_height);
        vLeft.push(_left);
        vTop.push(_top);
      });

      if (callbackRef) {
        callbackRef.current({
          left,
          top,
          width,
          height,
          vLeft,
          vTop,
        });
      }
    });

    if (_refElement) {
      if (
        _refElement === document.documentElement &&
        _refElementsMultiple.length > 0
      ) {
        _refElementsMultiple.forEach((element: any) => {
          resizeObserverMultiple.observe(element.current);
        });
      } else {
        resizeObserver.observe(_refElement);
      }
    }

    return () => {
      if (_refElement) {
        if (
          _refElement === document.documentElement &&
          _refElementsMultiple.length > 0
        ) {
          _refElementsMultiple.forEach((element: any) => {
            resizeObserverMultiple.unobserve(element.current);
          });
        } else {
          resizeObserver.unobserve(_refElement);
        }
      }
    };
  }, []);

  return (index?: number) => {
    if (index === null || index === undefined) {
      return { ref };
    } else {
      elementRefs.current[index] = elementRefs.current[index] || createRef();

      return { ref: elementRefs.current[index] };
    }
  }; // ...bind() or ...bind(index) for multiple
}
