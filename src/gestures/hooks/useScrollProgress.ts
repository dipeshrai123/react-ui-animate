import { RefObject, useEffect, useRef } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { useValue, withSpring } from '../../animation';
import { ScrollGesture } from '../controllers/ScrollGesture';
import { useRecognizer } from './useRecognizer';

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
}

export function useScrollProgress(
  refs: Window | RefObject<HTMLElement>,
  {
    target,
    axis = 'y',
    offset = ['start end', 'end end'],
    animate = true,
  }: UseScrollProgressOptions = {}
): {
  scrollYProgress: MotionValue<number>;
  scrollXProgress: MotionValue<number>;
} {
  const [scrollYProgress, setScrollY] = useValue(0);
  const [scrollXProgress, setScrollX] = useValue(0);
  const rangeRef = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const el = target?.current ?? document.documentElement;
    rangeRef.current = getScrollRange(offset as [any, any], el, axis);
  }, [target, axis, offset]);

  useRecognizer(ScrollGesture, refs, (e) => {
    const pos = axis === 'y' ? e.offset.y : e.offset.x;
    const [startPx, endPx] = rangeRef.current;

    let t: number;
    if (endPx === startPx) {
      t = pos < startPx ? 0 : 1;
    } else {
      const raw = (pos - startPx) / (endPx - startPx);
      t = Math.min(Math.max(raw, 0), 1);
    }

    const update = animate ? (v: number) => withSpring(v) : (v: number) => v;

    if (axis === 'y') {
      setScrollY(update(t));
      setScrollX(0);
    } else {
      setScrollX(update(t));
      setScrollY(0);
    }
  });

  return { scrollYProgress, scrollXProgress };
}

function parseEdgeValue(
  edge: EdgeString,
  axis: 'x' | 'y',
  el: HTMLElement,
  isContainer: boolean
): number {
  if (edge === 'start' || edge === 'center' || edge === 'end') {
    return isContainer
      ? getContainerEdgePos(axis, edge)
      : getElementEdgePos(el, axis, edge);
  }

  const m = edge.match(/^(-?\d+)(px|vw|vh|%)?$/);
  if (!m) throw new Error(`Invalid edge marker “${edge}”`);
  const [, raw, rawUnit] = m;
  const n = +raw;
  const unit = (rawUnit || 'px') as 'px' | '%' | 'vw' | 'vh';

  if (isContainer) {
    const scroll = axis === 'y' ? window.scrollY : window.scrollX;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    switch (unit) {
      case 'px':
        return scroll + n;
      case '%':
        return scroll + (n / 100) * (axis === 'y' ? vh : vw);
      case 'vw':
        return scroll + (n / 100) * vw;
      case 'vh':
        return scroll + (n / 100) * vh;
      default:
        return scroll + n;
    }
  } else {
    const base = getElementEdgePos(el, axis, 'start');
    return base + n;
  }
}

function getElementEdgePos(
  el: HTMLElement,
  axis: 'x' | 'y',
  edge: NamedEdges
): number {
  const rect = el.getBoundingClientRect();
  const scroll =
    axis === 'y'
      ? window.pageYOffset || window.scrollY
      : window.pageXOffset || window.scrollX;
  const base = axis === 'y' ? rect.top : rect.left;
  const size = axis === 'y' ? rect.height : rect.width;
  switch (edge) {
    case 'start':
      return base + scroll;
    case 'center':
      return base + scroll + size / 2;
    case 'end':
      return base + scroll + size;
  }
}

function getContainerEdgePos(axis: 'x' | 'y', edge: NamedEdges): number {
  const scroll =
    axis === 'y'
      ? window.pageYOffset || window.scrollY
      : window.pageXOffset || window.scrollX;
  const viewport = axis === 'y' ? window.innerHeight : window.innerWidth;
  switch (edge) {
    case 'start':
      return scroll;
    case 'center':
      return scroll + viewport / 2;
    case 'end':
      return scroll + viewport;
  }
}

function markerToThreshold(
  marker: Intersection,
  targetEl: HTMLElement,
  axis: 'x' | 'y'
): number {
  const [targetMarker, containerMarker] = marker.split(' ') as [
    EdgeString,
    EdgeString
  ];

  const elemPos = parseEdgeValue(targetMarker, axis, targetEl, false);
  const contPos = parseEdgeValue(containerMarker, axis, targetEl, true);
  const scroll = axis === 'y' ? window.scrollY : window.scrollX;

  return elemPos - (contPos - scroll);
}

function getScrollRange(
  markers: [Intersection, Intersection],
  targetEl: HTMLElement,
  axis: 'x' | 'y'
): [number, number] {
  const [startMarker, endMarker] = markers;
  const startPx = markerToThreshold(startMarker, targetEl, axis);
  const endPx = markerToThreshold(endMarker, targetEl, axis);
  return [startPx, endPx];
}
