import { RefObject, useEffect } from 'react';

import { clamp } from '../utils';
import { Gesture } from './Gesture';

interface MoveEvent {
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: PointerEvent;
  cancel?: () => void;
}

class MoveGesture extends Gesture<MoveEvent> {
  private prev = { x: 0, y: 0 };
  private lastTime = 0;
  private attachedEl: HTMLElement | null = null;
  private startPos: { x: number; y: number } | null = null;

  attach(element: HTMLElement): () => void {
    this.attachedEl = element;
    const moveHandler = this.handlePointerMove.bind(this);
    const leaveHandler = this.handlePointerLeave.bind(this);

    element.addEventListener('pointermove', moveHandler, { passive: false });
    element.addEventListener('pointerleave', leaveHandler);

    return () => {
      element.removeEventListener('pointermove', moveHandler);
      element.removeEventListener('pointerleave', leaveHandler);
    };
  }

  private handlePointerMove(e: PointerEvent) {
    if (!this.attachedEl) return;
    const now = e.timeStamp;

    if (this.startPos === null) {
      this.startPos = { x: e.clientX, y: e.clientY };
      this.prev = { x: e.clientX, y: e.clientY };
      this.lastTime = now;
    }

    const dt = Math.max((now - this.lastTime) / 1000, 1e-6);
    const dx = e.clientX - this.prev.x;
    const dy = e.clientY - this.prev.y;
    this.prev = { x: e.clientX, y: e.clientY };
    this.lastTime = now;

    const movement = {
      x: e.clientX - this.startPos.x,
      y: e.clientY - this.startPos.y,
    };

    const rect = this.attachedEl.getBoundingClientRect();
    const offset = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const rawX = dx / dt / 1000;
    const rawY = dy / dt / 1000;
    const velocity = {
      x: clamp(rawX, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
      y: clamp(rawY, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
    };

    this.emitChange({
      movement,
      offset,
      velocity,
      event: e,
      cancel: () => {},
    });
  }

  private handlePointerLeave(e: PointerEvent) {
    this.emitEnd({
      movement: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      event: e,
      cancel: () => {},
    });
  }
}

export function useMove<T extends HTMLElement>(
  ref: RefObject<T>,
  onMove: (e: MoveEvent) => void
): void {
  useEffect(() => {
    if (!ref.current) return;
    const gesture = new MoveGesture();
    gesture.onChange(onMove).onEnd(onMove);
    const cleanup = gesture.attach(ref.current);
    return cleanup;
  }, [ref, onMove]);
}
