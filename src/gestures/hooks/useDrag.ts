import { RefObject, useRef, useState } from 'react';
import { useValue, withDecay, withSpring, withParallel, AnimateValue } from '../../animation';
import type { Controls, Descriptor } from '../../animation/types';
import { isDescriptor } from '../../animation/helpers';
import { type FlipOptions } from '../../animation/layout/flip';
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
  initial?: { x?: number; y?: number };
  bounds?: DragBounds | RefObject<HTMLElement>;
  /** Rubber-band past `bounds` while dragging. `true` = elastic 0.15, number = custom, `false` = hard-clamp. Default `true`. */
  elastic?: boolean | number;
  /** Fling on release using release velocity. Default `true`. */
  momentum?: boolean;
  /** Bounce off `bounds` on momentum fling instead of hard-stopping. `true` = restitution 0.5, number = custom (0-1). Default `false`. */
  bounce?: boolean | number;
  /** Snap to nearest position (per axis) on release, projected ahead by velocity. Takes priority over `bounds`/`momentum` per axis. */
  snapPoints?: { x?: number[]; y?: number[] };
  /** Spring/timing used to settle into `bounds`/`snapPoints` on release. Defaults to a spring. No effect on the momentum fling — see `decay`. */
  transition?: FlipOptions;
  /** Deceleration constant for momentum fling (lower = more friction). Default `0.998`. */
  decay?: number;
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
  transition: FlipOptions | undefined,
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
  transition: FlipOptions | undefined,
  decay: number | undefined,
  bounce: boolean | number | undefined,
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
      bounce,
    });
  }
  return null;
}

function isRefObject(
  value: DragBounds | RefObject<HTMLElement>
): value is RefObject<HTMLElement> {
  return 'current' in value;
}

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
    bounce,
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
        bounce,
        snapPoints?.x
      );
      const yDesc = releaseDescriptor(
        position.y.current,
        e.velocity.y,
        b && { min: b.top, max: b.bottom },
        momentum,
        transition,
        decay,
        bounce,
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
