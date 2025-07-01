import { clamp } from '../../utils';
import { Gesture } from './Gesture';

export interface DragEvent {
  down: boolean;
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: PointerEvent;
  cancel: () => void;
}

export interface DragConfig {
  threshold?: number;
  axis?: 'x' | 'y';
  initial?: () => { x: number; y: number };
}

export class DragGesture extends Gesture<DragEvent> {
  private config: DragConfig;
  private prev = { x: 0, y: 0 };
  private lastTime = 0;

  private movement = { x: 0, y: 0 };
  private velocity = { x: 0, y: 0 };
  private start = { x: 0, y: 0 };
  private offset = { x: 0, y: 0 };

  private activePointerId: number | null = null;
  private attachedEl: HTMLElement | null = null;
  private pointerDownPos = { x: 0, y: 0 };
  private thresholdPassed = false;

  constructor(config: DragConfig = {}) {
    super();
    this.config = config;
  }

  attach(element: HTMLElement): () => void {
    this.attachedEl = element;
    const down = this.onDown.bind(this);
    const move = this.onMove.bind(this);
    const up = this.onUp.bind(this);

    element.addEventListener('pointerdown', down, { passive: false });
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);

    return () => {
      element.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }

  private onDown(e: PointerEvent) {
    if (e.button !== 0 || !this.attachedEl) return;
    this.attachedEl.setPointerCapture(e.pointerId);
    this.activePointerId = e.pointerId;

    this.start =
      this.thresholdPassed === false && this.start.x === 0 && this.start.y === 0
        ? this.config.initial?.() ?? { x: 0, y: 0 }
        : { ...this.offset };
    this.offset = { ...this.start };

    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.thresholdPassed = false;
    this.prev = { x: e.clientX, y: e.clientY };
    this.lastTime = e.timeStamp;

    this.emitChange({
      down: true,
      movement: { x: 0, y: 0 },
      offset: { ...this.offset },
      velocity: { x: 0, y: 0 },
      event: e,
      cancel: this.cancel.bind(this),
    });
  }

  private onMove(e: PointerEvent) {
    if (this.activePointerId !== e.pointerId) return;
    e.preventDefault();

    const threshold = this.config.threshold ?? 0;
    if (!this.thresholdPassed) {
      const dxTotal = e.clientX - this.pointerDownPos.x;
      const dyTotal = e.clientY - this.pointerDownPos.y;
      const dist = Math.hypot(dxTotal, dyTotal);
      if (dist < threshold) return;
      this.thresholdPassed = true;
    }

    const dt = Math.max((e.timeStamp - this.lastTime) / 1000, 1e-6);
    this.lastTime = e.timeStamp;
    const dx = e.clientX - this.prev.x;
    const dy = e.clientY - this.prev.y;
    const rawX = dx / dt / 1000;
    const rawY = dy / dt / 1000;
    this.velocity = {
      x: clamp(rawX, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
      y: clamp(rawY, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
    };

    const moveRaw = {
      x: e.clientX - this.pointerDownPos.x,
      y: e.clientY - this.pointerDownPos.y,
    };
    this.movement = {
      x: this.config.axis === 'y' ? 0 : moveRaw.x,
      y: this.config.axis === 'x' ? 0 : moveRaw.y,
    };

    this.offset = {
      x: this.start.x + this.movement.x,
      y: this.start.y + this.movement.y,
    };

    this.prev = { x: e.clientX, y: e.clientY };

    this.emitChange({
      down: true,
      movement: { ...this.movement },
      offset: { ...this.offset },
      velocity: { ...this.velocity },
      event: e,
      cancel: this.cancel.bind(this),
    });
  }

  private onUp(e: PointerEvent) {
    if (this.activePointerId !== e.pointerId || !this.attachedEl) return;
    this.attachedEl.releasePointerCapture(e.pointerId);

    this.emitEnd({
      down: false,
      movement: { ...this.movement },
      offset: { ...this.offset },
      velocity: { ...this.velocity },
      event: e,
      cancel: this.cancel.bind(this),
    });

    this.activePointerId = null;
  }

  private cancel() {
    if (this.attachedEl && this.activePointerId !== null) {
      this.attachedEl.releasePointerCapture(this.activePointerId);
      this.activePointerId = null;
    }
  }
}
