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
  private elementsWithDrag = new Set<HTMLElement>();
  private clickHandler: ((e: MouseEvent) => void) | null = null;

  constructor(config: DragConfig = {}) {
    super();
    this.config = config;
  }

  attach(elements: HTMLElement | HTMLElement[] | Window): () => void {
    if (elements === window) return () => {};

    const els = Array.isArray(elements) ? elements : [elements as HTMLElement];
    const down = this.onDown.bind(this);
    const move = this.onMove.bind(this);
    const up = this.onUp.bind(this);

    // Set up click prevention handler if not already set
    if (!this.clickHandler) {
      this.clickHandler = this.onClick.bind(this);
      // Use capture phase to intercept before React's synthetic events
      document.addEventListener('click', this.clickHandler as EventListener, {
        capture: true,
      });
    }

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
        this.elementsWithDrag.delete(el);
      });

      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);

      // Clean up click handler if no more attached elements
      if (this.attachedEls.size === 0 && this.clickHandler) {
        document.removeEventListener('click', this.clickHandler, {
          capture: true,
        });
        this.clickHandler = null;
      }
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
    this.movement = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };

    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.thresholdPassed = false;
    // Clear any previous drag flag for this element
    this.elementsWithDrag.delete(target);
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

    const hadDrag = this.thresholdPassed;
    this.activeEl.releasePointerCapture(e.pointerId);

    // If a drag occurred, prevent the click event
    if (hadDrag) {
      e.preventDefault();
      // Mark this element as having had a drag to prevent the click event
      this.elementsWithDrag.add(this.activeEl);
      // Clear the flag after the click event would have fired
      // Use requestAnimationFrame to ensure it happens after the current event loop
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.elementsWithDrag.delete(this.activeEl!);
        });
      });
    }

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

  private onClick(e: MouseEvent) {
    // Check if the click target or any of its ancestors had a drag
    let target = e.target as HTMLElement | null;
    while (target) {
      if (this.elementsWithDrag.has(target)) {
        e.preventDefault();
        e.stopPropagation();
        this.elementsWithDrag.delete(target);
        return;
      }
      target = target.parentElement;
    }
  }

  cancel() {
    if (this.activeEl && this.activePointerId !== null) {
      this.activeEl.releasePointerCapture(this.activePointerId);
      this.activePointerId = null;
      this.activeEl = null;
    }
  }
}
