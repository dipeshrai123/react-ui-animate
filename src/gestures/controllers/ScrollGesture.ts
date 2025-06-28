import { clamp } from '../../utils';
import { Gesture } from './Gesture';

export interface ScrollEvent {
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: Event;
  cancel?: () => void;
}

export class ScrollGesture extends Gesture<ScrollEvent> {
  private attachedEls = new Set<HTMLElement | Window>();

  private movement = { x: 0, y: 0 };
  private offset = { x: 0, y: 0 };
  private velocity = { x: 0, y: 0 };

  private prevScroll = { x: 0, y: 0 };
  private lastTime = 0;
  private endTimeout?: number;

  attach(elements: HTMLElement | HTMLElement[] | Window): () => void {
    const els = Array.isArray(elements) ? elements : [elements];
    const scroll = this.onScroll.bind(this);

    els.forEach((el) => {
      this.attachedEls.add(el);
      el.addEventListener('scroll', scroll, { passive: true });
    });

    return () => {
      els.forEach((el) => {
        el.removeEventListener('scroll', scroll);
        this.attachedEls.delete(el);
      });

      if (this.endTimeout != null) {
        clearTimeout(this.endTimeout);
        this.endTimeout = undefined;
      }
    };
  }

  cancel(): void {}

  private onScroll(e: Event) {
    const now = Date.now();
    const dt = Math.max((now - this.lastTime) / 1000, 1e-6);
    this.lastTime = now;

    const tgt = e.currentTarget as HTMLElement | Window;
    const x = tgt instanceof HTMLElement ? tgt.scrollLeft : window.scrollX;
    const y = tgt instanceof HTMLElement ? tgt.scrollTop : window.scrollY;

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
