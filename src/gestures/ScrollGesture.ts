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

  private movement = { x: 0, y: 0 };
  private offset = { x: 0, y: 0 };
  private velocity = { x: 0, y: 0 };

  private prevScroll = { x: 0, y: 0 };
  private lastTime = 0;
  private endTimeout?: number;

  attach(element: HTMLElement): () => void {
    this.attachedEl = element;
    const scroll = this.onScroll.bind(this);

    element.addEventListener('scroll', scroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', scroll);
      if (this.endTimeout != null) clearTimeout(this.endTimeout);
    };
  }

  private onScroll(e: Event) {
    if (!this.attachedEl) return;

    const now = Date.now();
    const dt = Math.max((now - this.lastTime) / 1000, 1e-6);
    this.lastTime = now;

    const x = this.attachedEl.scrollLeft;
    const y = this.attachedEl.scrollTop;

    const dx = x - this.prevScroll.x;
    const dy = y - this.prevScroll.y;
    this.prevScroll = { x, y };

    this.movement = { x: dx, y: dy };
    this.offset = { x, y };

    const rawX = dx / dt / 1000;
    const rawY = dy / dt / 1000;
    this.velocity = {
      x: clamp(rawX, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
      y: clamp(rawY, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
    };

    this.emitChange({
      movement: { ...this.movement },
      offset: { ...this.offset },
      velocity: { ...this.velocity },
      event: e,
      cancel: () => {
        if (this.endTimeout != null) clearTimeout(this.endTimeout);
      },
    });

    if (this.endTimeout != null) clearTimeout(this.endTimeout);
    this.endTimeout = window.setTimeout(() => {
      this.emitEnd({
        movement: { ...this.movement },
        offset: { ...this.offset },
        velocity: { ...this.velocity },
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
