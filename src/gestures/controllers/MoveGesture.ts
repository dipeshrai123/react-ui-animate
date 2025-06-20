import { clamp } from '../../utils';
import { Gesture } from './Gesture';

export interface MoveEvent {
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: PointerEvent;
  cancel?: () => void;
}

export class MoveGesture extends Gesture<MoveEvent> {
  private prev = { x: 0, y: 0 };
  private lastTime = 0;
  private attachedEl: HTMLElement | null = null;

  private movement = { x: 0, y: 0 };
  private offset = { x: 0, y: 0 };
  private velocity = { x: 0, y: 0 };
  private startPos: { x: number; y: number } | null = null;

  attach(element: HTMLElement): () => void {
    this.attachedEl = element;
    const move = this.onMove.bind(this);
    const leave = this.onLeave.bind(this);

    element.addEventListener('pointermove', move, { passive: false });
    element.addEventListener('pointerleave', leave);

    return () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
    };
  }

  private onMove(e: PointerEvent) {
    if (!this.attachedEl) return;
    const now = e.timeStamp;

    if (this.startPos === null) {
      this.startPos = { x: e.clientX, y: e.clientY };
      this.prev = { x: e.clientX, y: e.clientY };
      this.lastTime = now;
    }

    const dt = Math.max((now - this.lastTime) / 1000, 1e-6);
    this.lastTime = now;

    const dx = e.clientX - this.prev.x;
    const dy = e.clientY - this.prev.y;
    this.prev = { x: e.clientX, y: e.clientY };

    this.movement = {
      x: e.clientX - this.startPos.x,
      y: e.clientY - this.startPos.y,
    };

    const rect = this.attachedEl.getBoundingClientRect();
    this.offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const rawVx = dx / dt / 1000;
    const rawVy = dy / dt / 1000;
    this.velocity = {
      x: clamp(rawVx, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
      y: clamp(rawVy, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
    };

    this.emitChange({
      movement: { ...this.movement },
      offset: { ...this.offset },
      velocity: { ...this.velocity },
      event: e,
      cancel: () => this.onLeave(e),
    });
  }

  private onLeave(e: PointerEvent) {
    this.emitChange({
      movement: { ...this.movement },
      offset: { ...this.offset },
      velocity: { ...this.velocity },
      event: e,
      cancel: () => {},
    });
    this.emitEnd({
      movement: { ...this.movement },
      offset: { ...this.offset },
      velocity: { ...this.velocity },
      event: e,
      cancel: () => {},
    });
  }
}
