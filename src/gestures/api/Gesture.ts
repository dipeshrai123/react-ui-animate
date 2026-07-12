import type { GesturePhase } from '../engine/phases';

// Discriminated by `type` so the engine can pattern-match without instanceof.
// Extended with 'tap' | 'longPress' etc. in later phases.
export type GestureType = 'pan' | 'move' | 'wheel' | 'scroll';

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
export interface GestureDescriptor<E = unknown> {
  readonly type: GestureType;
  readonly config: BaseGestureConfig;
  readonly handlers: GestureHandlers<E>;
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

class ContinuousGestureBuilder<E> implements GestureDescriptor<E> {
  config: BaseGestureConfig = {};
  handlers: GestureHandlers<E> = {};

  constructor(readonly type: 'move' | 'wheel' | 'scroll') {}

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

export const Gesture = {
  Pan: () => new PanGestureBuilder(),
  Move: () => new ContinuousGestureBuilder<MoveEvent>('move'),
  Wheel: () => new ContinuousGestureBuilder<WheelEvent>('wheel'),
  Scroll: () => new ContinuousGestureBuilder<ScrollEvent>('scroll'),
};
