import { RefObject, useEffect } from 'react';

import { clamp } from '../utils';
import { Gesture } from './Gesture';

interface DragEvent {
  down: boolean;
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: PointerEvent;
  cancel: () => void;
}

interface DragConfig {
  threshold?: number;
  axis?: 'x' | 'y';
  initial?: () => { x: number; y: number };
}

class DragGesture extends Gesture<DragEvent> {
  private config: DragConfig;
  private start: { x: number; y: number };
  private prev: { x: number; y: number };
  private lastTime: number;
  private activePointerId: number | null = null;
  private attachedEl: HTMLElement | null = null;
  private pointerDownPos: { x: number; y: number } = { x: 0, y: 0 };
  private thresholdPassed: boolean = false;

  constructor(config: DragConfig = {}) {
    super();

    this.config = config;
    this.start = { x: 0, y: 0 };
    this.prev = { x: 0, y: 0 };
    this.lastTime = 0;
  }

  attach(element: HTMLElement): () => void {
    this.attachedEl = element;
    const downHandler = this.handlePointerDown.bind(this);
    const moveHandler = this.handlePointerMove.bind(this);
    const upHandler = this.handlePointerUp.bind(this);

    element.addEventListener('pointerdown', downHandler, { passive: false });
    window.addEventListener('pointermove', moveHandler, { passive: false });
    window.addEventListener('pointerup', upHandler);
    window.addEventListener('pointercancel', upHandler);

    return () => {
      element.removeEventListener('pointerdown', downHandler);
      window.removeEventListener('pointermove', moveHandler);
      window.removeEventListener('pointerup', upHandler);
      window.removeEventListener('pointercancel', upHandler);
    };
  }

  private handlePointerDown(e: PointerEvent) {
    if (e.button !== 0 || !this.attachedEl) return;
    this.attachedEl.setPointerCapture(e.pointerId);
    this.activePointerId = e.pointerId;

    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.thresholdPassed = false;

    const init = this.config.initial?.() ?? { x: e.clientX, y: e.clientY };
    this.start = { x: init.x, y: init.y };

    this.prev = { x: e.clientX, y: e.clientY };
    this.lastTime = e.timeStamp;

    this.emit({
      down: true,
      movement: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      event: e,
      cancel: this.cancel.bind(this),
    });
  }

  private handlePointerMove(e: PointerEvent) {
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

    const dx = e.clientX - this.prev.x;
    const dy = e.clientY - this.prev.y;
    const dt = Math.max((e.timeStamp - this.lastTime) / 1000, 1e-6);
    this.lastTime = e.timeStamp;

    const rawX = dx / dt / 1000;
    const rawY = dy / dt / 1000;
    const velocity = {
      x: clamp(rawX, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
      y: clamp(rawY, -Gesture.VELOCITY_LIMIT, Gesture.VELOCITY_LIMIT),
    };

    const movementRaw = {
      x: e.clientX - this.start.x,
      y: e.clientY - this.start.y,
    };

    const movement = {
      x: this.config.axis === 'y' ? 0 : movementRaw.x,
      y: this.config.axis === 'x' ? 0 : movementRaw.y,
    };

    this.prev = { x: e.clientX, y: e.clientY };

    this.emit({
      down: true,
      movement,
      offset: movement,
      velocity,
      event: e,
      cancel: this.cancel.bind(this),
    });
  }

  private handlePointerUp(e: PointerEvent) {
    if (this.activePointerId !== e.pointerId || !this.attachedEl) return;
    this.attachedEl.releasePointerCapture(e.pointerId);
    this.emit({
      down: false,
      movement: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      event: e,
      cancel: this.cancel.bind(this),
    });
    this.activePointerId = null;
  }

  private emit(
    data: Omit<DragEvent, 'event' | 'cancel'> & {
      event: PointerEvent;
      cancel: DragEvent['cancel'];
    }
  ) {
    this.emitChange({
      ...data,
      event: data.event,
      cancel: data.cancel,
    });
    if (!data.down) {
      this.emitEnd({ ...data, event: data.event, cancel: data.cancel });
    }
  }

  private cancel() {
    if (this.attachedEl && this.activePointerId !== null) {
      this.attachedEl.releasePointerCapture(this.activePointerId);
      this.activePointerId = null;
    }
  }
}

export function useDrag<T extends HTMLElement>(
  ref: RefObject<T>,
  onDrag: (e: DragEvent) => void,
  config?: DragConfig
): void {
  useEffect(() => {
    if (!ref.current) return;
    const gesture = new DragGesture(config);
    gesture.onChange(onDrag).onEnd(onDrag);
    const cleanup = gesture.attach(ref.current);
    return cleanup;
  }, [ref, onDrag, config]);
}
