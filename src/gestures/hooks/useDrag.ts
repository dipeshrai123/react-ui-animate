import { RefObject, useRef, useState } from 'react';
import { useValue, withDecay, withSpring, withParallel, AnimateValue } from '../../animation';
import type { Controls, Descriptor } from '../../animation/types';
import { isDescriptor } from '../../animation/helpers';
import { type LayoutOptions } from '../../animation/layout/flip';
import { Gesture, type PanEvent } from '../api/Gesture';
import { useGesture } from './useGesture';
import { clamp, rubberClamp, snapTo } from '../../shared/utils';

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
  /**
   * Snap to the nearest of these positions on release (per axis), projected
   * a little ahead using the release velocity so a fast flick can jump past
   * the nearest point to the next one — the same feel as a carousel or
   * sortable grid. Takes priority over `bounds`/`momentum` on release for
   * whichever axis has points; the other axis (or both, if neither is set)
   * falls back to the usual bounds-clamp/momentum behavior.
   */
  snapPoints?: { x?: number[]; y?: number[] };
  /**
   * Customizes the spring/timing used to settle back within `bounds` or
   * snap to a `snapPoints` target on release. Accepts the same
   * `withSpring(...)` / `withTiming(...)` descriptors (or raw
   * `SpringOptions`) as `Reorder.Group`'s `transition` prop. Defaults to a
   * spring. Has no effect on the momentum fling itself — see `decay`.
   */
  transition?: LayoutOptions;
  /**
   * Deceleration constant for the momentum fling on release (lower = more
   * friction, stops sooner). Default `0.998`, matching `withDecay`'s own
   * default.
   */
  decay?: number;
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

function resolveReleaseTransition(
  transition: LayoutOptions | undefined,
  target: number
): Descriptor {
  if (!transition) return withSpring(target);
  if (isDescriptor(transition)) {
    if (transition.type === 'spring' || transition.type === 'timing') {
      return { ...transition, to: target };
    }
    return withSpring(target);
  }
  return withSpring(target, transition);
}

function releaseDescriptor(
  current: number,
  velocity: number,
  bound: { min: number; max: number } | null,
  momentum: boolean,
  transition: LayoutOptions | undefined,
  decay: number | undefined,
  snapPoints?: number[]
): Descriptor | null {
  if (snapPoints && snapPoints.length > 0) {
    const target = bound
      ? clamp(snapTo(current, velocity, snapPoints), bound.min, bound.max)
      : snapTo(current, velocity, snapPoints);
    return resolveReleaseTransition(transition, target);
  }
  if (bound && (current < bound.min || current > bound.max)) {
    return resolveReleaseTransition(transition, clamp(current, bound.min, bound.max));
  }
  if (momentum) {
    return withDecay(velocity, {
      clamp: bound ? [bound.min, bound.max] : undefined,
      decay,
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
 * (fixed or a container ref), edge rubber-banding, momentum-on-release, and
 * snap points. Position persists across drags instead of resetting each
 * time.
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
    snapPoints,
    transition,
    decay,
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
        momentum,
        transition,
        decay,
        snapPoints?.x
      );
      const yDesc = releaseDescriptor(
        position.y.current,
        e.velocity.y,
        b && { min: b.top, max: b.bottom },
        momentum,
        transition,
        decay,
        snapPoints?.y
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
