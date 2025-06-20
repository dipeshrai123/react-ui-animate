import { RefObject, useEffect } from 'react';
import { clamp } from '../../utils';

type Listener<E> = (event: E) => void;

export abstract class Gesture<E> {
  public static readonly VELOCITY_LIMIT = 20;

  private changeListeners = new Set<Listener<E>>();
  private endListeners = new Set<Listener<E>>();

  onChange(listener: Listener<E>): this {
    this.changeListeners.add(listener);
    return this;
  }

  onEnd(listener: Listener<E>): this {
    this.endListeners.add(listener);
    return this;
  }

  protected emitChange(event: E): void {
    this.changeListeners.forEach((fn) => fn(event));
  }

  protected emitEnd(event: E): void {
    this.endListeners.forEach((fn) => fn(event));
  }

  abstract attach(element: HTMLElement): () => void;
}

/** ───── Drag Gesture ───── */

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

/** ───── Move Gesture ───── */

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

/** ───── Scroll Gesture ───── */

export interface ScrollEvent {
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: Event;
  cancel?: () => void;
}

export class ScrollGesture extends Gesture<ScrollEvent> {
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

/** ───── Wheel Gesture ───── */

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
