import { RefObject, useEffect, useRef } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { useValue, withSpring } from '../../animation';
import { ScrollGesture } from '../controllers/ScrollGesture';
import { useRecognizer } from './useRecognizer';
import { type Descriptor } from '../../animation/types';

type SupportedEdgeUnit = 'px' | 'vw' | 'vh' | '%';
type EdgeUnit = `${number}${SupportedEdgeUnit}`;
type NamedEdges = 'start' | 'end' | 'center';
type EdgeString = NamedEdges | EdgeUnit | `${number}`;
type Edge = EdgeString | number;
type ProgressIntersection = [number, number];
type Intersection = `${Edge} ${Edge}`;
type ScrollOffset = Array<Edge | Intersection | ProgressIntersection>;

export interface UseScrollProgressOptions {
  target?: RefObject<HTMLElement>;
  axis?: 'x' | 'y';
  offset?: ScrollOffset;
  animate?: boolean;
  toDescriptor?: (t: number) => Descriptor;
}

export function useScrollProgress(
  refs: Window | RefObject<HTMLElement>,
  {
    target,
    axis = 'y',
    offset = ['start start', 'end end'],
    animate = true,
    toDescriptor = (v: number) => withSpring(v),
  }: UseScrollProgressOptions = {}
): {
  scrollYProgress: MotionValue<number>;
  scrollXProgress: MotionValue<number>;
} {
  const [yProgress, setYProgress] = useValue(0);
  const [xProgress, setXProgress] = useValue(0);
  const rangeRef = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const containerEl =
      refs instanceof Window ? window : (refs.current as HTMLElement);
    const targetEl = target?.current ?? document.documentElement;

    rangeRef.current = getScrollRange(
      offset as [Intersection, Intersection],
      targetEl,
      containerEl,
      axis
    );
  }, [refs, target, axis, offset]);

  useRecognizer(ScrollGesture, refs, (e) => {
    const pos = axis === 'y' ? e.offset.y : e.offset.x;
    const [start, end] = rangeRef.current;

    const raw =
      end === start ? (pos < start ? 0 : 1) : (pos - start) / (end - start);

    const t = Math.min(Math.max(raw, 0), 1);
    const apply = animate ? toDescriptor : (v: number) => v;

    if (axis === 'y') {
      setYProgress(apply(t));
      setXProgress(0);
    } else {
      setXProgress(apply(t));
      setYProgress(0);
    }
  });

  return { scrollYProgress: yProgress, scrollXProgress: xProgress };
}

function getScroll(el: HTMLElement | Window, axis: 'x' | 'y') {
  if (el instanceof HTMLElement) {
    return axis === 'y' ? el.scrollTop : el.scrollLeft;
  }
  return axis === 'y' ? window.scrollY : window.scrollX;
}

function getSize(el: HTMLElement | Window, axis: 'x' | 'y') {
  if (el instanceof HTMLElement) {
    return axis === 'y' ? el.clientHeight : el.clientWidth;
  }
  return axis === 'y' ? window.innerHeight : window.innerWidth;
}

function getScrollRange(
  [startMarker, endMarker]: [Intersection, Intersection],
  targetEl: HTMLElement,
  containerEl: HTMLElement | Window,
  axis: 'x' | 'y'
): [number, number] {
  return [
    resolveMarker(startMarker, targetEl, containerEl, axis),
    resolveMarker(endMarker, targetEl, containerEl, axis),
  ];
}

function resolveMarker(
  marker: Intersection,
  targetEl: HTMLElement,
  containerEl: HTMLElement | Window,
  axis: 'x' | 'y'
): number {
  const [tMark, cMark = tMark] = marker.trim().split(/\s+/) as [
    EdgeString,
    EdgeString
  ];

  if (containerEl instanceof HTMLElement) {
    const tRect = targetEl.getBoundingClientRect();
    const cRect = containerEl.getBoundingClientRect();
    const scroll = getScroll(containerEl, axis);
    const elementStart =
      (axis === 'y' ? tRect.top - cRect.top : tRect.left - cRect.left) + scroll;
    const elementSize = axis === 'y' ? tRect.height : tRect.width;
    const containerSize = getSize(containerEl, axis);

    const elemPos = resolveEdge(
      tMark,
      elementStart,
      elementSize,
      containerSize
    );
    const contPos = resolveEdge(cMark, 0, containerSize, containerSize);
    return elemPos - contPos;
  } else {
    const elemPos = parseEdgeValue(tMark, axis, targetEl, false);
    const contPos = parseEdgeValue(cMark, axis, window, true);
    return elemPos - contPos;
  }
}

function resolveEdge(
  edge: EdgeString,
  base: number,
  size: number,
  containerSize: number
): number {
  if (edge === 'start') return base;
  if (edge === 'center') return base + size / 2;
  if (edge === 'end') return base + size;

  const m = edge.match(/^(-?\d+(?:\.\d+)?)(px|%|vw|vh)?$/);
  if (!m) throw new Error(`Invalid edge marker “${edge}”`);

  const n = parseFloat(m[1]);
  const unit = m[2] as SupportedEdgeUnit | undefined;

  switch (unit) {
    case 'px':
      return base + n;
    case '%':
      return base + (n / 100) * size;
    case 'vw':
      return base + (n / 100) * containerSize;
    case 'vh':
      return base + (n / 100) * containerSize;
    default:
      return base + n * size;
  }
}

function parseEdgeValue(
  edge: EdgeString,
  axis: 'x' | 'y',
  el: HTMLElement | Window,
  isContainer: boolean
): number {
  const scrollTarget = isContainer ? el : (el as HTMLElement);
  const base = isContainer
    ? 0
    : (() => {
        if (!(el instanceof HTMLElement))
          throw new Error('Expected HTMLElement for element-relative edge');
        const rect = el.getBoundingClientRect();
        const pageScroll =
          axis === 'y'
            ? window.pageYOffset || window.scrollY
            : window.pageXOffset || window.scrollX;
        return (axis === 'y' ? rect.top : rect.left) + pageScroll;
      })();

  const size = isContainer
    ? getSize(el, axis)
    : (() => {
        if (!(el instanceof HTMLElement)) throw new Error();
        const rect = el.getBoundingClientRect();
        return axis === 'y' ? rect.height : rect.width;
      })();

  return resolveEdge(edge, base, size, getSize(scrollTarget, axis));
}
