import { RefObject, useEffect } from 'react';

import { clamp } from '../utils';
import { Gesture } from './Gesture';

interface ScrollEvent {
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: Event;
  cancel?: () => void;
}

class ScrollGesture extends Gesture<ScrollEvent> {
  private attachedEl: HTMLElement | null = null;

  private prevScroll = { x: 0, y: 0 };
  private lastTime = 0;
  private endTimeout?: number;

  attach(element: HTMLElement): () => void {
    this.attachedEl = element;
    const handler = this.handleScroll.bind(this);
    element.addEventListener('scroll', handler, { passive: true });
    return () => {
      element.removeEventListener('scroll', handler);
      if (this.endTimeout != null) clearTimeout(this.endTimeout);
    };
  }

  private handleScroll(e: Event) {
    if (!this.attachedEl) return;

    const now = Date.now();
    const dt = Math.max((now - this.lastTime) / 1000, 1e-6);
    this.lastTime = now;

    const x = this.attachedEl.scrollLeft;
    const y = this.attachedEl.scrollTop;

    const dx = x - this.prevScroll.x;
    const dy = y - this.prevScroll.y;

    const rawX = dx / dt / 1000;
    const rawY = dy / dt / 1000;
    const velocity = {
      x: clamp(rawX, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
      y: clamp(rawY, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
    };

    this.prevScroll = { x, y };

    this.emitChange({
      movement: { x: dx, y: dy },
      offset: { x, y },
      velocity,
      event: e,
      cancel: () => {},
    });

    if (this.endTimeout != null) clearTimeout(this.endTimeout);
    this.endTimeout = window.setTimeout(() => {
      this.emitEnd({
        movement: { x: 0, y: 0 },
        offset: { x, y },
        velocity: { x: 0, y: 0 },
        event: e,
        cancel: () => {},
      });
    }, 150);
  }
}

export function useScroll<T extends HTMLElement>(
  ref: RefObject<T>,
  onScroll: (e: ScrollEvent) => void
): void {
  useEffect(() => {
    if (!ref.current) return;
    const gesture = new ScrollGesture();
    gesture.onChange(onScroll).onEnd(onScroll);
    const cleanup = gesture.attach(ref.current);
    return cleanup;
  }, [ref, onScroll]);
}
