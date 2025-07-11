import { RefObject, useEffect, useRef } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';
import { type ScrollEvent, ScrollGesture } from '../controllers/ScrollGesture';
import { useRecognizer } from './useRecognizer';
import { useValue, withSpring } from '../../animation';

type SupportedEdgeUnit = 'px' | 'vw' | 'vh' | '%';
type EdgeUnit = `${number}${SupportedEdgeUnit}`;
type NamedEdges = 'start' | 'end' | 'center';
type EdgeString = NamedEdges | EdgeUnit | `${number}`;
type Edge = EdgeString | number;
type ProgressIntersection = [number, number];
type Intersection = `${Edge} ${Edge}`;
type ScrollOffset = Array<Edge | Intersection | ProgressIntersection>;

interface ScrollInfoOptions {
  target?: RefObject<HTMLElement>;
  axis?: 'x' | 'y';
  offset?: ScrollOffset;
}

// Raw-callback overload
export function useScroll<T extends HTMLElement>(
  refs: Window | RefObject<T> | RefObject<T>[],
  onScroll: (e: ScrollEvent & { index: number }) => void
): void;

// Trigger-mode overload
export function useScroll<T extends HTMLElement>(
  refs: Window | RefObject<T> | RefObject<T>[],
  options?: ScrollInfoOptions
): {
  scrollYProgress: MotionValue<number>;
  scrollXProgress: MotionValue<number>;
};

export function useScroll(
  refs: any,
  arg: any
): void | {
  scrollYProgress: MotionValue<number>;
  scrollXProgress: MotionValue<number>;
} {
  // Raw-callback mode
  if (typeof arg === 'function') {
    return useRecognizer(ScrollGesture, refs, arg);
  }

  // Trigger mode: axis-based progress
  const [scrollYProgress, setScrollYProgress] = useValue(0);
  const [scrollXProgress, setScrollXProgress] = useValue(0);

  const {
    target: targetRef,
    axis = 'y',
    offset = ['start start', 'end end'],
  } = (arg as ScrollInfoOptions) || {};

  const rangesRef = useRef<[number, number][]>([]);

  // Parse numeric/px/vw/vh/%/named edges
  const parseEdge = (e: string | number): number => {
    const raw = `${e}`.trim();
    const vw = window.innerWidth,
      vh = window.innerHeight;
    if (/^[0-9.]+$/.test(raw)) return +raw;
    if (raw.endsWith('px')) return parseFloat(raw);
    if (raw.endsWith('vw')) return (parseFloat(raw) / 100) * vw;
    if (raw.endsWith('vh')) return (parseFloat(raw) / 100) * vh;
    if (raw.endsWith('%')) {
      const pct = parseFloat(raw) / 100;
      const dim =
        axis === 'y'
          ? (targetRef?.current ?? document.documentElement).clientHeight
          : (targetRef?.current ?? document.documentElement).clientWidth;
      return pct * dim;
    }
    if (raw === 'start') return 0;
    if (raw === 'end') {
      const dim =
        axis === 'y'
          ? (targetRef?.current ?? document.documentElement).clientHeight
          : (targetRef?.current ?? document.documentElement).clientWidth;
      return dim;
    }
    if (raw === 'center') {
      const dim =
        axis === 'y'
          ? (targetRef?.current ?? document.documentElement).clientHeight
          : (targetRef?.current ?? document.documentElement).clientWidth;
      return dim / 2;
    }
    throw new Error(`Invalid edge value: ${raw}`);
  };

  // Compute ranges once when dependencies change
  useEffect(() => {
    const targetEl = targetRef?.current ?? document.documentElement;
    const contEl =
      refs === window
        ? document.documentElement
        : // @ts-ignore
          refs.current;

    // Full scrollable distance
    const totalScroll =
      axis === 'y'
        ? contEl.scrollHeight - contEl.clientHeight
        : contEl.scrollWidth - contEl.clientWidth;

    // Element position & metrics
    const rect = targetEl.getBoundingClientRect();
    const scrollOff =
      axis === 'y'
        ? window.pageYOffset || window.scrollY
        : window.pageXOffset || window.scrollX;
    const elemStartAbs = (axis === 'y' ? rect.top : rect.left) + scrollOff;
    const elemSize = axis === 'y' ? rect.height : rect.width;
    const viewportSize = axis === 'y' ? window.innerHeight : window.innerWidth;

    // Build a single continuous range from first two offsets
    if (
      offset.length === 2 &&
      typeof offset[0] === 'string' &&
      typeof offset[1] === 'string'
    ) {
      const [startMarker, endMarker] = offset as [string, string];
      const calcThreshold = (marker: string) => {
        const [A, B] = marker.split(/\s+/) as Array<'start' | 'end'>;
        const elemCoord =
          A === 'start' ? elemStartAbs : elemStartAbs + elemSize;
        return B === 'start' ? elemCoord : elemCoord - viewportSize;
      };
      const startPx = calcThreshold(startMarker);
      const endPx = calcThreshold(endMarker);
      rangesRef.current = [[startPx, endPx]];
    } else {
      // Fallback: use first offset entry only
      const o = offset[0];
      let range: [number, number];
      if (
        Array.isArray(o) &&
        typeof o[0] === 'number' &&
        typeof o[1] === 'number'
      ) {
        const [p0, p1] = o as ProgressIntersection;
        const dist = axis === 'y' ? totalScroll : totalScroll;
        range = [p0 * dist, p1 * dist];
      } else if (typeof o === 'string' && o.includes(' ')) {
        const [e0, e1] = (o as Intersection).split(/\s+/);
        range = [parseEdge(e0), parseEdge(e1)];
      } else {
        const px = parseEdge(o as Edge);
        range = [0, px];
      }
      rangesRef.current = [range];
    }
  }, [refs, targetRef, axis, offset]);

  // Subscribe and update progress
  useRecognizer(ScrollGesture, refs, (e: ScrollEvent) => {
    if (Array.isArray(refs)) {
      throw new Error('useScroll does not support multiple refs directly.');
    }
    const pos = axis === 'y' ? e.offset.y : e.offset.x;
    const [[startPx, endPx]] = rangesRef.current;
    const raw = (pos - startPx) / (endPx - startPx);
    const t = Math.min(Math.max(raw, 0), 1);

    if (axis === 'y') {
      setScrollYProgress(withSpring(t));
      setScrollXProgress(withSpring(0));
    } else {
      setScrollXProgress(withSpring(t));
      setScrollYProgress(withSpring(0));
    }
  });

  return { scrollYProgress, scrollXProgress };
}
