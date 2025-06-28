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

  private pointerCaptured = false;
  private activePointerId: number | null = null;
  private attachedEls = new Set<HTMLElement>();
  private activeEl: HTMLElement | null = null;
  private pointerDownPos = { x: 0, y: 0 };
  private thresholdPassed = false;

  constructor(config: DragConfig = {}) {
    super();
    this.config = config;
  }

  attach(elements: HTMLElement | HTMLElement[]): () => void {
    const els = Array.isArray(elements) ? elements : [elements];
    const down = this.onDown.bind(this);
    const move = this.onMove.bind(this);
    const up = this.onUp.bind(this);

    els.forEach((el) => {
      this.attachedEls.add(el);
      el.addEventListener('pointerdown', down, { passive: false });
    });

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);

    return () => {
      els.forEach((el) => {
        el.removeEventListener('pointerdown', down);
        this.attachedEls.delete(el);
      });

      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }

  private onDown(e: PointerEvent) {
    if (e.button !== 0) return;

    const target = e.currentTarget as HTMLElement;
    if (!this.attachedEls.has(target)) return;

    this.activeEl = target;
    this.activePointerId = e.pointerId;
    this.pointerCaptured = false;

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
    if (this.activePointerId !== e.pointerId || !this.activeEl) return;

    const threshold = this.config.threshold ?? 0;
    if (!this.thresholdPassed) {
      const dxTotal = e.clientX - this.pointerDownPos.x;
      const dyTotal = e.clientY - this.pointerDownPos.y;
      const dist = Math.hypot(dxTotal, dyTotal);
      if (dist < threshold) return;
      this.thresholdPassed = true;

      this.activeEl.setPointerCapture(e.pointerId);
      this.pointerCaptured = true;
    }

    if (this.pointerCaptured) {
      e.preventDefault();
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
    if (this.activePointerId !== e.pointerId || !this.activeEl) return;
    this.activeEl.releasePointerCapture(e.pointerId);

    this.emitEnd({
      down: false,
      movement: { ...this.movement },
      offset: { ...this.offset },
      velocity: { ...this.velocity },
      event: e,
      cancel: this.cancel.bind(this),
    });

    this.activePointerId = null;
    this.pointerCaptured = false;
  }

  cancel() {
    if (this.activeEl && this.activePointerId !== null) {
      this.activeEl.releasePointerCapture(this.activePointerId);
      this.activePointerId = null;
      this.activeEl = null;
    }
  }
}
