import type { GesturePhase } from '../engine/phases';

// Discriminated by `type` so the engine can pattern-match without instanceof.
// Extended with 'tap' | 'longPress' etc. in later phases.
export type GestureType =
  | 'pan'
  | 'move'
  | 'wheel'
  | 'scroll'
  | 'swipe'
  | 'hover'
  | 'pinch'
  | 'rotate';

export interface GestureHandlers<E> {
  onStart?: (e: E) => void;
  onChange?: (e: E) => void;
  /** Alias of `onChange`, fired on every ACTIVE tick. */
  onUpdate?: (e: E) => void;
  onEnd?: (e: E) => void;
  /** Always runs once, on END, FAILED, or CANCELLED. */
  onFinalize?: (e: E) => void;
}

export interface BaseGestureConfig {
  enabled?: boolean;
  /** Minimum pointer travel (px) before the gesture is recognized as ACTIVE. */
  minDistance?: number;
  axis?: 'x' | 'y';
}

// The descriptor produced by a builder and consumed by `useGesture`/the
// engine. `E` is inferred per gesture kind (e.g. `PanEvent` for `'pan'`).
// `H` lets a gesture kind use a narrower handlers shape than the default
// start/change/end/finalize stream (e.g. Swipe's single terminal `onSwipe`).
export interface GestureDescriptor<E = unknown, H = GestureHandlers<E>> {
  readonly type: GestureType;
  readonly config: BaseGestureConfig;
  readonly handlers: H;
}

export interface PanEvent {
  phase: GesturePhase;
  /** Derived: `phase === 'BEGAN' || phase === 'ACTIVE'`. */
  down: boolean;
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: PointerEvent;
  target: HTMLElement;
  cancel: () => void;
}

// Fluent builder producing a `GestureDescriptor<PanEvent>`. Mutates and
// returns `this` per chained call rather than cloning — cheap, and matches
// how these are realistically constructed fresh per render, e.g.
// `useGesture(ref, Gesture.Pan().onUpdate(fn))`. A descriptor built this way
// should not be cached/reused across renders once further mutated.
export class PanGestureBuilder implements GestureDescriptor<PanEvent> {
  readonly type = 'pan' as const;
  config: BaseGestureConfig = {};
  handlers: GestureHandlers<PanEvent> = {};

  onStart(fn: (e: PanEvent) => void): this {
    this.handlers = { ...this.handlers, onStart: fn };
    return this;
  }

  onUpdate(fn: (e: PanEvent) => void): this {
    this.handlers = { ...this.handlers, onUpdate: fn, onChange: fn };
    return this;
  }

  onChange(fn: (e: PanEvent) => void): this {
    this.handlers = { ...this.handlers, onChange: fn, onUpdate: fn };
    return this;
  }

  onEnd(fn: (e: PanEvent) => void): this {
    this.handlers = { ...this.handlers, onEnd: fn };
    return this;
  }

  onFinalize(fn: (e: PanEvent) => void): this {
    this.handlers = { ...this.handlers, onFinalize: fn };
    return this;
  }

  enabled(v: boolean): this {
    this.config = { ...this.config, enabled: v };
    return this;
  }

  minDistance(px: number): this {
    this.config = { ...this.config, minDistance: px };
    return this;
  }

  axis(a: 'x' | 'y'): this {
    this.config = { ...this.config, axis: a };
    return this;
  }
}

// A fling/flick: fast, short, directional pan resolved once at release —
// not a stream, so no phase/onChange/onFinalize. A release that doesn't
// clear the distance+velocity thresholds simply fires nothing.
export interface SwipeEvent {
  direction: 'up' | 'down' | 'left' | 'right';
  movement: { x: number; y: number };
  velocity: { x: number; y: number };
  event: PointerEvent;
  target: HTMLElement;
}

export interface SwipeGestureConfig extends BaseGestureConfig {
  /** Minimum dominant-axis speed (px/ms) at release to qualify as a swipe. Default 0.5. */
  velocityThreshold?: number;
  /** Minimum dominant-axis distance (px) travelled to qualify as a swipe. Default 30. */
  distanceThreshold?: number;
}

export interface SwipeHandlers {
  onSwipe?: (e: SwipeEvent) => void;
}

// Note: Swipe and Pan both listen on the 'pointer' group with no
// arbitration between them yet (see RecognizerContext.requestActivation) —
// registering both on the same ref means a fast enough drag can fire both
// Pan's onEnd and Swipe's onSwipe.
export class SwipeGestureBuilder implements GestureDescriptor<SwipeEvent, SwipeHandlers> {
  readonly type = 'swipe' as const;
  config: SwipeGestureConfig = {};
  handlers: SwipeHandlers = {};

  onSwipe(fn: (e: SwipeEvent) => void): this {
    this.handlers = { ...this.handlers, onSwipe: fn };
    return this;
  }

  enabled(v: boolean): this {
    this.config = { ...this.config, enabled: v };
    return this;
  }

  axis(a: 'x' | 'y'): this {
    this.config = { ...this.config, axis: a };
    return this;
  }

  velocityThreshold(pxPerMs: number): this {
    this.config = { ...this.config, velocityThreshold: pxPerMs };
    return this;
  }

  distanceThreshold(px: number): this {
    this.config = { ...this.config, distanceThreshold: px };
    return this;
  }
}

// Shared shape for continuous, non-phase-gated gestures — pointer movement
// with no press required, wheel, and scroll. These have no recognition gate
// (no minDistance/POSSIBLE state): they simply stream `onChange` while
// active and fire `onEnd` when the stream settles (pointerleave, or a debounce
// window after the last wheel/scroll event).
export interface MoveEvent {
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: PointerEvent;
  cancel?: () => void;
}

export interface WheelEvent {
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: globalThis.WheelEvent;
  cancel?: () => void;
}

export interface ScrollEvent {
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: Event;
  cancel?: () => void;
}

// Boolean pointer-over-target state — deliberately leaner than MoveEvent
// (no movement/velocity tracking; use Gesture.Move() if you need that while
// hovering). onStart = enter, onEnd = leave, onChange fires on every move
// while over the target.
export interface HoverEvent {
  hovering: boolean;
  offset: { x: number; y: number };
  event: PointerEvent;
  target: HTMLElement;
}

class ContinuousGestureBuilder<E> implements GestureDescriptor<E> {
  config: BaseGestureConfig = {};
  handlers: GestureHandlers<E> = {};

  constructor(readonly type: 'move' | 'wheel' | 'scroll' | 'hover') {}

  onStart(fn: (e: E) => void): this {
    this.handlers = { ...this.handlers, onStart: fn };
    return this;
  }

  onChange(fn: (e: E) => void): this {
    this.handlers = { ...this.handlers, onChange: fn, onUpdate: fn };
    return this;
  }

  onUpdate(fn: (e: E) => void): this {
    return this.onChange(fn);
  }

  onEnd(fn: (e: E) => void): this {
    this.handlers = { ...this.handlers, onEnd: fn };
    return this;
  }

  enabled(v: boolean): this {
    this.config = { ...this.config, enabled: v };
    return this;
  }
}

// Two-pointer gestures. Both stream from the same pointer pair (`onStart`
// once 2 fingers are down and moving enough to cross `threshold`, `onChange`
// per tick, `onEnd`/`onFinalize` once either pointer lifts) and can be
// registered together on the same ref to read both scale and rotation from
// one gesture — they don't compete with each other for activation the way
// Pan/Swipe do, since they're not alternate interpretations of the same
// input, just different measurements of it.
export interface PinchEvent {
  phase: GesturePhase;
  /** Current pointer-pair distance / distance when the gesture began. */
  scale: number;
  /** Rate of scale change (per ms), for momentum-driven zoom on release. */
  velocity: number;
  /** Midpoint between the two pointers — useful for zoom-at-point. */
  center: { x: number; y: number };
  event: PointerEvent;
  target: HTMLElement;
  cancel: () => void;
}

export interface RotateEvent {
  phase: GesturePhase;
  /** Degrees rotated from the pointer pair's angle when the gesture began. */
  rotation: number;
  /** Rate of rotation change (degrees per ms). */
  velocity: number;
  center: { x: number; y: number };
  event: PointerEvent;
  target: HTMLElement;
  cancel: () => void;
}

export interface PinchGestureConfig {
  enabled?: boolean;
  /** Minimum |scale - 1| before the gesture is recognized as ACTIVE. Default 0.02. */
  threshold?: number;
}

export interface RotateGestureConfig {
  enabled?: boolean;
  /** Minimum rotation (degrees) before the gesture is recognized as ACTIVE. Default 2. */
  threshold?: number;
}

class TwoPointerGestureBuilder<E, C extends { enabled?: boolean; threshold?: number }>
  implements GestureDescriptor<E>
{
  config: C = {} as C;
  handlers: GestureHandlers<E> = {};

  constructor(readonly type: 'pinch' | 'rotate') {}

  onStart(fn: (e: E) => void): this {
    this.handlers = { ...this.handlers, onStart: fn };
    return this;
  }

  onChange(fn: (e: E) => void): this {
    this.handlers = { ...this.handlers, onChange: fn, onUpdate: fn };
    return this;
  }

  onUpdate(fn: (e: E) => void): this {
    return this.onChange(fn);
  }

  onEnd(fn: (e: E) => void): this {
    this.handlers = { ...this.handlers, onEnd: fn };
    return this;
  }

  onFinalize(fn: (e: E) => void): this {
    this.handlers = { ...this.handlers, onFinalize: fn };
    return this;
  }

  enabled(v: boolean): this {
    this.config = { ...this.config, enabled: v };
    return this;
  }

  threshold(v: number): this {
    this.config = { ...this.config, threshold: v };
    return this;
  }
}

export const Gesture = {
  Pan: () => new PanGestureBuilder(),
  Move: () => new ContinuousGestureBuilder<MoveEvent>('move'),
  Wheel: () => new ContinuousGestureBuilder<WheelEvent>('wheel'),
  Scroll: () => new ContinuousGestureBuilder<ScrollEvent>('scroll'),
  Swipe: () => new SwipeGestureBuilder(),
  Hover: () => new ContinuousGestureBuilder<HoverEvent>('hover'),
  Pinch: () => new TwoPointerGestureBuilder<PinchEvent, PinchGestureConfig>('pinch'),
  Rotate: () => new TwoPointerGestureBuilder<RotateEvent, RotateGestureConfig>('rotate'),
};
