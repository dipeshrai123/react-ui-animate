import { PanRecognizer } from '../recognizers/PanRecognizer';
import { MoveRecognizer } from '../recognizers/MoveRecognizer';
import { WheelRecognizer } from '../recognizers/WheelRecognizer';
import { ScrollRecognizer } from '../recognizers/ScrollRecognizer';
import { SwipeRecognizer } from '../recognizers/SwipeRecognizer';
import { HoverRecognizer } from '../recognizers/HoverRecognizer';
import { PinchRecognizer } from '../recognizers/PinchRecognizer';
import { RotateRecognizer } from '../recognizers/RotateRecognizer';
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
  updateHandlers?(handlers: any): void;
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
  swipe: 'pointer',
  hover: 'hover',
  pinch: 'pointer',
  rotate: 'pointer',
};

// Multi-pointer gesture types (Pinch/Rotate) share the 'pointer' native
// listeners with Pan/Swipe but are dispatched differently — they see every
// tracked pointer once 2+ are down, instead of being gated to a single
// primary pointer.
const MULTI_POINTER_TYPES = new Set<GestureType>(['pinch', 'rotate']);

interface Registration {
  recognizer: UpdatableRecognizer;
  group: ListenerGroup;
  multiPointer: boolean;
  type: GestureType;
}

function createRecognizer(descriptor: GestureDescriptor<any, any>): UpdatableRecognizer {
  switch (descriptor.type) {
    case 'pan':
      return new PanRecognizer(descriptor.config, descriptor.handlers);
    case 'move':
      return new MoveRecognizer(descriptor.config, descriptor.handlers);
    case 'wheel':
      return new WheelRecognizer(descriptor.config, descriptor.handlers);
    case 'scroll':
      return new ScrollRecognizer(descriptor.config, descriptor.handlers);
    case 'swipe':
      return new SwipeRecognizer(descriptor.config, descriptor.handlers);
    case 'hover':
      return new HoverRecognizer(descriptor.config, descriptor.handlers);
    case 'pinch':
      return new PinchRecognizer(descriptor.config, descriptor.handlers);
    case 'rotate':
      return new RotateRecognizer(descriptor.config, descriptor.handlers);
    default:
      throw new Error(`[useGesture] Unknown gesture type: ${(descriptor as GestureDescriptor).type}`);
  }
}

/**
 * One instance per DOM node/window (see `registry.ts`). Owns the native
 * listeners for every event category any registered recognizer needs —
 * attached lazily per category on first registration needing it, removed
 * once the last one leaves — and fans events out to the matching
 * recognizers. Every gesture type (Pan/Move/Wheel/Scroll/Swipe/Hover) is a
 * plain `GestureRecognizer` registered here the same way, so N gestures of any
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

  // Press-gated pointer stream state (Pan/Swipe, and Pinch/Rotate once 2+
  // pointers join). `activePointers` tracks every currently-down pointer;
  // `primaryPointerId` is the one single-pointer recognizers (Pan/Swipe)
  // exclusively react to — set on the first pointerdown of a stream and
  // left as-is if it lifts before the others (no promotion to a remaining
  // pointer; the stream only fully resets once every pointer is up).
  private activePointers = new Map<number, { x: number; y: number }>();
  private primaryPointerId: number | null = null;
  private pointerKinematics: KinematicState = createKinematicState({ x: 0, y: 0, t: 0 });
  // Per-gesture-stream arbitration claim for the 'pointer' group's
  // single-pointer recognizers, scoped by gesture *kind* rather than by
  // individual registration — e.g. two independent `Gesture.Pan()`
  // registrations on the same element must both keep firing (not a
  // conflict, just two listeners), but a Pan and a Swipe genuinely
  // interpreting the same drag differently should not both fire. First kind
  // to call `requestActivation()` in a stream wins; further calls from that
  // same kind keep succeeding, calls from any other kind are denied until
  // the next fresh pointerdown sequence resets it. Multi-pointer recognizers
  // (Pinch/Rotate) don't use this — they activate independently.
  private activeOwnerType: GestureType | null = null;

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

  register(descriptor: GestureDescriptor<any, any>): symbol {
    const id = Symbol('gesture');
    const group = GROUP_BY_TYPE[descriptor.type];
    const multiPointer = MULTI_POINTER_TYPES.has(descriptor.type);
    this.registrations.set(id, {
      recognizer: createRecognizer(descriptor),
      group,
      multiPointer,
      type: descriptor.type,
    });
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
      pointers: this.activePointers,
      // No composition/arbitration for these groups — only the 'pointer'
      // group's single-pointer recognizers arbitrate (see makeContext).
      requestActivation: () => true,
      yieldTo: () => {},
    };

    this.registrations.forEach(({ recognizer, group: g }) => {
      if (g === group) fn(recognizer, ctx);
    });
  }

  private makeContext(type: GestureType): RecognizerContext {
    return {
      target: this.target,
      kinematics: this.pointerKinematics,
      pointers: this.activePointers,
      requestActivation: () => {
        if (this.activeOwnerType === null || this.activeOwnerType === type) {
          this.activeOwnerType = type;
          return true;
        }
        return false;
      },
      yieldTo: () => {},
    };
  }

  private dispatchSinglePointer(
    fn: (recognizer: GestureRecognizer, ctx: RecognizerContext) => void
  ): void {
    this.registrations.forEach((reg) => {
      if (reg.group !== 'pointer' || reg.multiPointer) return;
      fn(reg.recognizer, this.makeContext(reg.type));
    });
  }

  private dispatchMultiPointer(
    fn: (recognizer: GestureRecognizer, ctx: RecognizerContext) => void
  ): void {
    this.registrations.forEach((reg) => {
      if (reg.group !== 'pointer' || !reg.multiPointer) return;
      fn(reg.recognizer, this.makeContext(reg.type));
    });
  }

  // ---- press-gated pointer stream (Pan, Swipe, Pinch, Rotate) ----

  private onPointerDownNative(e: Event): void {
    const pe = e as PointerEvent;
    if (pe.button !== 0) return;

    const wasEmpty = this.activePointers.size === 0;
    this.activePointers.set(pe.pointerId, { x: pe.clientX, y: pe.clientY });

    if (wasEmpty) {
      this.primaryPointerId = pe.pointerId;
      this.activeOwnerType = null;
      this.pointerKinematics = createKinematicState({ x: pe.clientX, y: pe.clientY, t: pe.timeStamp });
      this.dispatchSinglePointer((r, ctx) => r.onPointerDown?.(pe, ctx));
      return;
    }

    if (this.activePointers.size === 2) {
      // A second concurrent pointer joins mid-stream: hand off from any
      // active/possible single-pointer recognizer (Pan/Swipe) to the
      // multi-pointer ones (Pinch/Rotate), reusing each single-pointer
      // recognizer's existing onPointerCancel handling for the hand-off —
      // no recognizer-side code needed for this.
      this.dispatchSinglePointer((r, ctx) => r.onPointerCancel?.(pe, ctx));
    }

    this.dispatchMultiPointer((r, ctx) => r.onPointerDown?.(pe, ctx));
  }

  private onPointerMoveNative(e: Event): void {
    const pe = e as PointerEvent;
    if (!this.activePointers.has(pe.pointerId)) return;

    this.activePointers.set(pe.pointerId, { x: pe.clientX, y: pe.clientY });

    if (pe.pointerId === this.primaryPointerId) {
      this.pointerKinematics = updateKinematics(this.pointerKinematics, {
        x: pe.clientX,
        y: pe.clientY,
        t: pe.timeStamp,
      });
      this.dispatchSinglePointer((r, ctx) => r.onPointerMove?.(pe, ctx));
    }

    if (this.activePointers.size >= 2) {
      this.dispatchMultiPointer((r, ctx) => r.onPointerMove?.(pe, ctx));
    }
  }

  private onPointerUpNative(e: Event): void {
    const pe = e as PointerEvent;
    if (!this.activePointers.has(pe.pointerId)) return;

    const wasMultiPointer = this.activePointers.size >= 2;

    if (pe.pointerId === this.primaryPointerId) {
      this.dispatchSinglePointer((r, ctx) => r.onPointerUp?.(pe, ctx));
    }
    if (wasMultiPointer) {
      this.dispatchMultiPointer((r, ctx) => r.onPointerUp?.(pe, ctx));
    }

    this.activePointers.delete(pe.pointerId);

    if (this.activePointers.size === 0) {
      this.primaryPointerId = null;
      this.activeOwnerType = null;
    }
  }

  private onPointerCancelNative(e: Event): void {
    const pe = e as PointerEvent;
    if (!this.activePointers.has(pe.pointerId)) return;

    const wasMultiPointer = this.activePointers.size >= 2;

    if (pe.pointerId === this.primaryPointerId) {
      this.dispatchSinglePointer((r, ctx) => r.onPointerCancel?.(pe, ctx));
    }
    if (wasMultiPointer) {
      this.dispatchMultiPointer((r, ctx) => r.onPointerCancel?.(pe, ctx));
    }

    this.activePointers.delete(pe.pointerId);

    if (this.activePointers.size === 0) {
      this.primaryPointerId = null;
      this.activeOwnerType = null;
    }
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
