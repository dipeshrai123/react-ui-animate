import { RefObject, useEffect } from 'react';

import { clamp } from '../utils';
import { Gesture } from './Gesture';

export interface WheelGestureEvent {
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: globalThis.WheelEvent;
  cancel?: () => void;
}

export class WheelGesture extends Gesture<WheelGestureEvent> {
  private attachedEl: HTMLElement | null = null;

  private lastTime = 0;
  private offset = { x: 0, y: 0 };
  private endTimeout?: number;

  attach(element: HTMLElement): () => void {
    this.attachedEl = element;
    const handler = this.handleWheel.bind(this);
    element.addEventListener('wheel', handler, { passive: false });

    return () => {
      element.removeEventListener('wheel', handler);
      if (this.endTimeout != null) clearTimeout(this.endTimeout);
    };
  }

  private handleWheel(e: globalThis.WheelEvent) {
    if (!this.attachedEl) return;
    e.preventDefault();

    const now = e.timeStamp;
    const dt = Math.max((now - this.lastTime) / 1000, 1e-6);
    this.lastTime = now;

    const dx = e.deltaX;
    const dy = e.deltaY;

    this.offset.x += dx;
    this.offset.y += dy;

    const rawX = dx / dt / 1000;
    const rawY = dy / dt / 1000;
    const velocity = {
      x: clamp(rawX, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
      y: clamp(rawY, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
    };

    this.emitChange({
      movement: { x: dx, y: dy },
      offset: { ...this.offset },
      velocity,
      event: e,
      cancel: () => {},
    });

    if (this.endTimeout != null) clearTimeout(this.endTimeout);
    this.endTimeout = window.setTimeout(() => {
      this.emitEnd({
        movement: { x: 0, y: 0 },
        offset: { ...this.offset },
        velocity: { x: 0, y: 0 },
        event: e,
        cancel: () => {},
      });
    }, 150);
  }
}

export function useWheel<T extends HTMLElement>(
  ref: RefObject<T>,
  onWheel: (e: WheelGestureEvent) => void
): void {
  useEffect(() => {
    if (!ref.current) return;
    const gesture = new WheelGesture();
    gesture.onChange(onWheel).onEnd(onWheel);
    const cleanup = gesture.attach(ref.current);
    return cleanup;
  }, [ref, onWheel]);
}
