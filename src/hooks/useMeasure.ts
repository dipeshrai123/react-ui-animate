import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";
import { MeasurementType } from "../Types";
import { useConst } from ".";

export function useMeasure(callback: (event: MeasurementType) => void) {
  const ref = React.useRef(null);
  const elementRefs = React.useRef([]);
  const callbackRef = useConst<(event: MeasurementType) => void>(callback);

  React.useEffect(() => {
    const _refElement = ref.current || document.documentElement;
    const _refElementsMultiple = elementRefs.current;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { left, top, width, height } = entry.target.getBoundingClientRect();
      const { pageXOffset, pageYOffset } = window;

      if (callbackRef) {
        if (_refElement === document.documentElement) {
          callbackRef({
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            vLeft: 0,
            vTop: 0,
          });
        } else {
          callbackRef({
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
        callbackRef({
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
      elementRefs.current[index] =
        elementRefs.current[index] || React.createRef();

      return { ref: elementRefs.current[index] };
    }
  }; // ...bind() or ...bind(index) for multiple
}
