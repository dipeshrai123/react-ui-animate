import { PanRecognizer } from '../recognizers/PanRecognizer';
import type { GestureRecognizer, RecognizerContext } from './GestureRecognizer';
import {
  createKinematicState,
  updateKinematics,
  type KinematicState,
} from './PointerTracker';
import type { BaseGestureConfig, GestureDescriptor, GestureHandlers } from '../api/Gesture';

interface UpdatableRecognizer extends GestureRecognizer {
  updateConfig?(config: BaseGestureConfig): void;
  updateHandlers?(handlers: GestureHandlers<any>): void;
}

interface Registration {
  recognizer: UpdatableRecognizer;
}

function createRecognizer(descriptor: GestureDescriptor<any>): UpdatableRecognizer {
  switch (descriptor.type) {
    case 'pan':
      return new PanRecognizer(descriptor.config, descriptor.handlers);
    default:
      throw new Error(`[useGesture] Unknown gesture type: ${descriptor.type}`);
  }
}

/**
 * One instance per DOM node/window (see `registry.ts`). Owns the actual
 * native pointerdown/move/up/cancel listeners — attached once, lazily, on
 * first registration, removed once the last registration leaves — and fans
 * every event out to each registered `GestureRecognizer`. This is what lets
 * multiple gestures on one element share a single set of native listeners
 * instead of each attaching its own (as the old per-gesture-type controllers
 * did).
 */
export class ElementGestureTracker {
  private registrations = new Map<symbol, Registration>();
  private activePointerId: number | null = null;
  private kinematics: KinematicState = createKinematicState({ x: 0, y: 0, t: 0 });
  private listenersAttached = false;

  private downHandler = this.onPointerDown.bind(this);
  private moveHandler = this.onPointerMove.bind(this);
  private upHandler = this.onPointerUp.bind(this);
  private cancelHandler = this.onPointerCancel.bind(this);

  constructor(private target: HTMLElement | Window) {}

  register(descriptor: GestureDescriptor<any>): symbol {
    const id = Symbol('gesture');
    this.registrations.set(id, { recognizer: createRecognizer(descriptor) });
    this.ensureListeners();
    return id;
  }

  unregister(id: symbol): void {
    this.registrations.delete(id);
    this.teardownListenersIfEmpty();
  }

  updateConfig(id: symbol, config: BaseGestureConfig): void {
    this.registrations.get(id)?.recognizer.updateConfig?.(config);
  }

  updateHandlers(id: symbol, handlers: GestureHandlers<any>): void {
    this.registrations.get(id)?.recognizer.updateHandlers?.(handlers);
  }

  private ensureListeners(): void {
    if (this.listenersAttached) return;
    this.listenersAttached = true;

    (this.target as EventTarget).addEventListener(
      'pointerdown',
      this.downHandler as EventListener,
      { passive: false }
    );
    window.addEventListener('pointermove', this.moveHandler as EventListener, {
      passive: false,
    });
    window.addEventListener('pointerup', this.upHandler as EventListener);
    window.addEventListener('pointercancel', this.cancelHandler as EventListener);
  }

  private teardownListenersIfEmpty(): void {
    if (this.registrations.size > 0 || !this.listenersAttached) return;
    this.listenersAttached = false;

    (this.target as EventTarget).removeEventListener(
      'pointerdown',
      this.downHandler as EventListener
    );
    window.removeEventListener('pointermove', this.moveHandler as EventListener);
    window.removeEventListener('pointerup', this.upHandler as EventListener);
    window.removeEventListener('pointercancel', this.cancelHandler as EventListener);
  }

  private buildContext(): RecognizerContext {
    return {
      target: this.target,
      kinematics: this.kinematics,
      // No composition/arbitration yet (Phase 4) — every registered
      // recognizer runs simultaneously by default, so activation is always granted.
      requestActivation: () => true,
      yieldTo: () => {},
    };
  }

  private dispatch(fn: (recognizer: GestureRecognizer, ctx: RecognizerContext) => void): void {
    const ctx = this.buildContext();
    this.registrations.forEach(({ recognizer }) => fn(recognizer, ctx));
  }

  private onPointerDown(e: Event): void {
    const pe = e as PointerEvent;
    if (pe.button !== 0) return;
    // Single active pointer per element for now (see Phase 5 note re:
    // multi-touch — this tracker's public shape doesn't preclude it later).
    if (this.activePointerId !== null) return;

    this.activePointerId = pe.pointerId;
    this.kinematics = createKinematicState({ x: pe.clientX, y: pe.clientY, t: pe.timeStamp });

    this.dispatch((recognizer, ctx) => recognizer.onPointerDown(pe, ctx));
  }

  private onPointerMove(e: Event): void {
    const pe = e as PointerEvent;
    if (this.activePointerId !== pe.pointerId) return;

    this.kinematics = updateKinematics(this.kinematics, {
      x: pe.clientX,
      y: pe.clientY,
      t: pe.timeStamp,
    });

    this.dispatch((recognizer, ctx) => recognizer.onPointerMove(pe, ctx));
  }

  private onPointerUp(e: Event): void {
    const pe = e as PointerEvent;
    if (this.activePointerId !== pe.pointerId) return;

    this.dispatch((recognizer, ctx) => recognizer.onPointerUp(pe, ctx));
    this.activePointerId = null;
  }

  private onPointerCancel(e: Event): void {
    const pe = e as PointerEvent;
    if (this.activePointerId !== pe.pointerId) return;

    this.dispatch((recognizer, ctx) => recognizer.onPointerCancel(pe, ctx));
    this.activePointerId = null;
  }
}
