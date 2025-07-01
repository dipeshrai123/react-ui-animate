import { useRef, useEffect, RefObject, DependencyList } from 'react';

type MeasurementValue = number | number[];
interface MeasurementType {
  left: MeasurementValue;
  top: MeasurementValue;
  width: MeasurementValue;
  height: MeasurementValue;
  vLeft: MeasurementValue;
  vTop: MeasurementValue;
}

export function useMeasure(
  refs: RefObject<HTMLElement>[],
  callback: (m: MeasurementType) => void,
  deps: DependencyList = []
) {
  const cbRef = useRef(callback);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback, ...deps]);

  useEffect(() => {
    const els = refs
      .map((r) => r.current)
      .filter((el): el is HTMLElement => el !== null);

    if (els.length === 0) return;

    const observer = new ResizeObserver((entries) => {
      const left: number[] = [];
      const top: number[] = [];
      const width: number[] = [];
      const height: number[] = [];
      const vLeft: number[] = [];
      const vTop: number[] = [];

      els.forEach((el) => {
        const entry = entries.find((en) => en.target === el);
        if (!entry) {
          left.push(0);
          top.push(0);
          width.push(0);
          height.push(0);
          vLeft.push(0);
          vTop.push(0);
        } else {
          const {
            left: lx,
            top: ty,
            width: w,
            height: h,
          } = entry.target.getBoundingClientRect();
          const pageX = lx + window.scrollX;
          const pageY = ty + window.scrollY;

          left.push(pageX);
          top.push(pageY);
          width.push(w);
          height.push(h);
          vLeft.push(lx);
          vTop.push(ty);
        }
      });

      cbRef.current({ left, top, width, height, vLeft, vTop });
    });

    els.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [refs]);
}
