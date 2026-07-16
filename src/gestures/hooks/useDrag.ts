import { RefObject, useRef, useState } from 'react';
import { useValue, withDecay, withSpring, withParallel, AnimateValue } from '../../animation';
import type { Controls, Descriptor } from '../../animation/types';
import { Gesture, type PanEvent } from '../api/Gesture';
import { useGesture } from './useGesture';
import { clamp, rubberClamp } from '../../utils';

export interface DragBounds {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export interface UseDragOptions {
  enabled?: boolean;
  axis?: 'x' | 'y';
  minDistance?: number;
  /** Starting position. Only read on mount, like `useValue`'s initial value. */
  initial?: { x?: number; y?: number };
  bounds?: DragBounds | RefObject<HTMLElement>;
  /**
   * Rubber-band past `bounds` while dragging instead of hard-stopping at the
   * edge. `true` uses the default elastic constant (0.15); a number sets a
   * custom one; `false` hard-clamps. Momentum on release always hard-stops
   * at `bounds` regardless of this setting. Default `true`.
   */
  elastic?: boolean | number;
  /** Fling on release using the pointer's release velocity. Default `true`. */
  momentum?: boolean;
  /** Matches `Gesture.Pan()`'s own callback names. */
  onStart?: (e: PanEvent) => void;
  onChange?: (e: PanEvent) => void;
  onEnd?: (e: PanEvent) => void;
}

export interface UseDragResult {
  x: AnimateValue<number>;
  y: AnimateValue<number>;
  isDragging: boolean;
  controls: Controls;
}

function releaseDescriptor(
  current: number,
  velocity: number,
  bound: { min: number; max: number } | null,
  momentum: boolean
): Descriptor | null {
  if (bound && (current < bound.min || current > bound.max)) {
    return withSpring(clamp(current, bound.min, bound.max));
  }
  if (momentum) {
    return withDecay(velocity, {
      clamp: bound ? [bound.min, bound.max] : undefined,
    });
  }
  return null;
}

function isRefObject(
  value: DragBounds | RefObject<HTMLElement>
): value is RefObject<HTMLElement> {
  return 'current' in value;
}

/**
 * Wires up `Gesture.Pan()` with live position tracking, optional bounds
 * (fixed or a container ref), edge rubber-banding, and momentum-on-release.
 * Position persists across drags instead of resetting each time.
 */
export function useDrag<T extends HTMLElement>(
  ref: RefObject<T>,
  options: UseDragOptions = {}
): UseDragResult {
  const {
    enabled = true,
    axis,
    minDistance = 0,
    initial,
    bounds,
    elastic = true,
    momentum = true,
    onStart,
    onChange,
    onEnd,
  } = options;

  const [position, setPosition, controls] = useValue({
    x: initial?.x ?? 0,
    y: initial?.y ?? 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resolvedBoundsRef = useRef<Required<DragBounds> | null>(null);

  const elasticConstant = elastic === false ? 0 : elastic === true ? 0.15 : elastic;

  const resolveBounds = (target: HTMLElement): Required<DragBounds> | null => {
    if (!bounds) return null;

    if (!isRefObject(bounds)) {
      return {
        left: bounds.left ?? -Infinity,
        right: bounds.right ?? Infinity,
        top: bounds.top ?? -Infinity,
        bottom: bounds.bottom ?? Infinity,
      };
    }

    const container = bounds.current;
    if (!container) return null;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const naturalLeft = targetRect.left - position.x.current;
    const naturalTop = targetRect.top - position.y.current;

    return {
      left: containerRect.left - naturalLeft,
      right: containerRect.right - naturalLeft - targetRect.width,
      top: containerRect.top - naturalTop,
      bottom: containerRect.bottom - naturalTop - targetRect.height,
    };
  };

  let gesture = Gesture.Pan().enabled(enabled).minDistance(minDistance);
  if (axis) gesture = gesture.axis(axis);

  gesture = gesture
    .onStart((e) => {
      dragStartRef.current = { x: position.x.current, y: position.y.current };
      resolvedBoundsRef.current = resolveBounds(e.target);
      setIsDragging(true);
      onStart?.(e);
    })
    .onUpdate((e) => {
      const rawX = dragStartRef.current.x + e.movement.x;
      const rawY = dragStartRef.current.y + e.movement.y;
      const b = resolvedBoundsRef.current;

      const nextX = b ? rubberClamp(rawX, b.left, b.right, elasticConstant) : rawX;
      const nextY = b ? rubberClamp(rawY, b.top, b.bottom, elasticConstant) : rawY;

      setPosition({ x: nextX, y: nextY });
      onChange?.(e);
    })
    .onEnd((e) => {
      setIsDragging(false);
      const b = resolvedBoundsRef.current;

      const xDesc = releaseDescriptor(
        position.x.current,
        e.velocity.x,
        b && { min: b.left, max: b.right },
        momentum
      );
      const yDesc = releaseDescriptor(
        position.y.current,
        e.velocity.y,
        b && { min: b.top, max: b.bottom },
        momentum
      );

      if (xDesc || yDesc) {
        setPosition(
          withParallel({
            ...(xDesc ? { x: xDesc } : {}),
            ...(yDesc ? { y: yDesc } : {}),
          })
        );
      }

      onEnd?.(e);
    });

  useGesture(ref, gesture);

  return { x: position.x, y: position.y, isDragging, controls };
}
