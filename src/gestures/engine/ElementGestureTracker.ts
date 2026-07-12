import { PanRecognizer } from '../recognizers/PanRecognizer';
import { MoveRecognizer } from '../recognizers/MoveRecognizer';
import { WheelRecognizer } from '../recognizers/WheelRecognizer';
import { ScrollRecognizer } from '../recognizers/ScrollRecognizer';
import type { GestureRecognizer, RecognizerContext } from './GestureRecognizer';
import {
  createKinematicState,
  updateKinematics,
  type KinematicState,
} from './PointerTracker';
import type {
  BaseGestureConfig,
  GestureDescriptor,
  GestureHandlers,
  GestureType,
} from '../api/Gesture';

interface UpdatableRecognizer extends GestureRecognizer {
  updateConfig?(config: BaseGestureConfig): void;
  updateHandlers?(handlers: GestureHandlers<any>): void;
}

// Every gesture type is dispatched from exactly one native-event category.
// 'pointer' is press-gated (requires pointerdown); 'hover' is the same
// pointermove event but ungated (no press required) so it needs its own
// listener attached directly to the target instead of window; 'wheel'/
// 'scroll' are entirely different native event types.
type ListenerGroup = 'pointer' | 'hover' | 'wheel' | 'scroll';

const GROUP_BY_TYPE: Record<GestureType, ListenerGroup> = {
  pan: 'pointer',
  move: 'hover',
  wheel: 'wheel',
  scroll: 'scroll',
};

interface Registration {
  recognizer: UpdatableRecognizer;
  group: ListenerGroup;
}

function createRecognizer(descriptor: GestureDescriptor<any>): UpdatableRecognizer {
  switch (descriptor.type) {
    case 'pan':
      return new PanRecognizer(descriptor.config, descriptor.handlers);
    case 'move':
      return new MoveRecognizer(descriptor.config, descriptor.handlers);
    case 'wheel':
      return new WheelRecognizer(descriptor.config, descriptor.handlers);
    case 'scroll':
      return new ScrollRecognizer(descriptor.config, descriptor.handlers);
    default:
      throw new Error(`[useGesture] Unknown gesture type: ${(descriptor as GestureDescriptor).type}`);
  }
}

/**
 * One instance per DOM node/window (see `registry.ts`). Owns the native
 * listeners for every event category any registered recognizer needs —
 * attached lazily per category on first registration needing it, removed
 * once the last one leaves — and fans events out to the matching
 * recognizers. Every gesture type (Pan/Move/Wheel/Scroll) is a plain
 * `GestureRecognizer` registered here the same way, so N gestures of any
 * mix on one element share listeners per category instead of each attaching
 * its own (as the pre-unification per-type controller classes did).
 */
export class ElementGestureTracker {
  private registrations = new Map<symbol, Registration>();
  private groupCounts: Record<ListenerGroup, number> = {
    pointer: 0,
    hover: 0,
    wheel: 0,
    scroll: 0,
  };
  private attachedGroups = new Set<ListenerGroup>();

  // Press-gated pointer stream state (Pan, future Tap/LongPress).
  private activePointerId: number | null = null;
  private pointerKinematics: KinematicState = createKinematicState({ x: 0, y: 0, t: 0 });

  // Ungated hover stream state (Move).
  private hoverKinematics: KinematicState = createKinematicState({ x: 0, y: 0, t: 0 });

  // Wheel stream state — accumulator exists purely to derive velocity
  // (recognizer-visible `offset` is tracked independently, recognizer-side).
  private wheelAccum = { x: 0, y: 0 };
  private wheelKinematics: KinematicState = createKinematicState({ x: 0, y: 0, t: 0 });

  // Scroll stream state.
  private scrollKinematics: KinematicState = createKinematicState({ x: 0, y: 0, t: 0 });

  private readonly pointerDownHandler = this.onPointerDownNative.bind(this);
  private readonly pointerMoveHandler = this.onPointerMoveNative.bind(this);
  private readonly pointerUpHandler = this.onPointerUpNative.bind(this);
  private readonly pointerCancelHandler = this.onPointerCancelNative.bind(this);
  private readonly hoverMoveHandler = this.onHoverMoveNative.bind(this);
  private readonly hoverLeaveHandler = this.onHoverLeaveNative.bind(this);
  private readonly wheelHandler = this.onWheelNative.bind(this);
  private readonly scrollHandler = this.onScrollNative.bind(this);

  constructor(private target: HTMLElement | Window) {}

  register(descriptor: GestureDescriptor<any>): symbol {
    const id = Symbol('gesture');
    const group = GROUP_BY_TYPE[descriptor.type];
    this.registrations.set(id, { recognizer: createRecognizer(descriptor), group });
    this.groupCounts[group]++;
    this.ensureGroupListeners(group);
    return id;
  }

  unregister(id: symbol): void {
    const reg = this.registrations.get(id);
    if (!reg) return;
    this.registrations.delete(id);
    this.groupCounts[reg.group]--;
    this.teardownGroupListenersIfEmpty(reg.group);
  }

  updateConfig(id: symbol, config: BaseGestureConfig): void {
    this.registrations.get(id)?.recognizer.updateConfig?.(config);
  }

  updateHandlers(id: symbol, handlers: GestureHandlers<any>): void {
    this.registrations.get(id)?.recognizer.updateHandlers?.(handlers);
  }

  private ensureGroupListeners(group: ListenerGroup): void {
    if (this.attachedGroups.has(group)) return;
    this.attachedGroups.add(group);

    const target = this.target as EventTarget;

    switch (group) {
      case 'pointer':
        target.addEventListener('pointerdown', this.pointerDownHandler, { passive: false });
        window.addEventListener('pointermove', this.pointerMoveHandler, { passive: false });
        window.addEventListener('pointerup', this.pointerUpHandler);
        window.addEventListener('pointercancel', this.pointerCancelHandler);
        break;
      case 'hover':
        target.addEventListener('pointermove', this.hoverMoveHandler, { passive: false });
        target.addEventListener('pointerleave', this.hoverLeaveHandler);
        break;
      case 'wheel':
        target.addEventListener('wheel', this.wheelHandler, { passive: false });
        break;
      case 'scroll':
        target.addEventListener('scroll', this.scrollHandler, { passive: true });
        break;
    }
  }

  private teardownGroupListenersIfEmpty(group: ListenerGroup): void {
    if (this.groupCounts[group] > 0 || !this.attachedGroups.has(group)) return;
    this.attachedGroups.delete(group);

    const target = this.target as EventTarget;

    switch (group) {
      case 'pointer':
        target.removeEventListener('pointerdown', this.pointerDownHandler);
        window.removeEventListener('pointermove', this.pointerMoveHandler);
        window.removeEventListener('pointerup', this.pointerUpHandler);
        window.removeEventListener('pointercancel', this.pointerCancelHandler);
        break;
      case 'hover':
        target.removeEventListener('pointermove', this.hoverMoveHandler);
        target.removeEventListener('pointerleave', this.hoverLeaveHandler);
        break;
      case 'wheel':
        target.removeEventListener('wheel', this.wheelHandler);
        break;
      case 'scroll':
        target.removeEventListener('scroll', this.scrollHandler);
        break;
    }
  }

  private dispatch(
    group: ListenerGroup,
    kinematics: KinematicState,
    fn: (recognizer: GestureRecognizer, ctx: RecognizerContext) => void
  ): void {
    const ctx: RecognizerContext = {
      target: this.target,
      kinematics,
      // No composition/arbitration yet (Phase 4) — every registered
      // recognizer runs simultaneously by default, so activation is always granted.
      requestActivation: () => true,
      yieldTo: () => {},
    };

    this.registrations.forEach(({ recognizer, group: g }) => {
      if (g === group) fn(recognizer, ctx);
    });
  }

  // ---- press-gated pointer stream (Pan) ----

  private onPointerDownNative(e: Event): void {
    const pe = e as PointerEvent;
    if (pe.button !== 0) return;
    // Single active pointer per element for now (see Phase 5 note re:
    // multi-touch — this tracker's public shape doesn't preclude it later).
    if (this.activePointerId !== null) return;

    this.activePointerId = pe.pointerId;
    this.pointerKinematics = createKinematicState({ x: pe.clientX, y: pe.clientY, t: pe.timeStamp });

    this.dispatch('pointer', this.pointerKinematics, (r, ctx) => r.onPointerDown?.(pe, ctx));
  }

  private onPointerMoveNative(e: Event): void {
    const pe = e as PointerEvent;
    if (this.activePointerId !== pe.pointerId) return;

    this.pointerKinematics = updateKinematics(this.pointerKinematics, {
      x: pe.clientX,
      y: pe.clientY,
      t: pe.timeStamp,
    });

    this.dispatch('pointer', this.pointerKinematics, (r, ctx) => r.onPointerMove?.(pe, ctx));
  }

  private onPointerUpNative(e: Event): void {
    const pe = e as PointerEvent;
    if (this.activePointerId !== pe.pointerId) return;

    this.dispatch('pointer', this.pointerKinematics, (r, ctx) => r.onPointerUp?.(pe, ctx));
    this.activePointerId = null;
  }

  private onPointerCancelNative(e: Event): void {
    const pe = e as PointerEvent;
    if (this.activePointerId !== pe.pointerId) return;

    this.dispatch('pointer', this.pointerKinematics, (r, ctx) => r.onPointerCancel?.(pe, ctx));
    this.activePointerId = null;
  }

  // ---- ungated hover stream (Move) ----

  private onHoverMoveNative(e: Event): void {
    const pe = e as PointerEvent;

    this.hoverKinematics = updateKinematics(this.hoverKinematics, {
      x: pe.clientX,
      y: pe.clientY,
      t: pe.timeStamp,
    });

    this.dispatch('hover', this.hoverKinematics, (r, ctx) => r.onHoverMove?.(pe, ctx));
  }

  private onHoverLeaveNative(e: Event): void {
    const pe = e as PointerEvent;
    this.dispatch('hover', this.hoverKinematics, (r, ctx) => r.onHoverEnd?.(pe, ctx));
  }

  // ---- wheel ----

  private onWheelNative(e: Event): void {
    const we = e as globalThis.WheelEvent;
    we.preventDefault();

    this.wheelAccum = { x: this.wheelAccum.x + we.deltaX, y: this.wheelAccum.y + we.deltaY };
    this.wheelKinematics = updateKinematics(this.wheelKinematics, {
      x: this.wheelAccum.x,
      y: this.wheelAccum.y,
      t: we.timeStamp,
    });

    this.dispatch('wheel', this.wheelKinematics, (r, ctx) => r.onWheel?.(we, ctx));
  }

  // ---- scroll ----

  private onScrollNative(e: Event): void {
    const target = this.target;
    const x = target instanceof HTMLElement ? target.scrollLeft : window.scrollX;
    const y = target instanceof HTMLElement ? target.scrollTop : window.scrollY;

    this.scrollKinematics = updateKinematics(this.scrollKinematics, { x, y, t: Date.now() });

    this.dispatch('scroll', this.scrollKinematics, (r, ctx) => r.onScroll?.(e, ctx));
  }
}
