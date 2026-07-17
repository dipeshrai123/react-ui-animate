import type { GesturePhase } from '../../engine/phases';
import type { BaseGestureConfig, GestureDescriptor, GestureHandlers } from './types';

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

// Mutates and returns `this` per chained call rather than cloning — matches
// how these are built fresh per render, e.g.
// `useGesture(ref, Gesture.Pan().onUpdate(fn))`. Not safe to cache/reuse
// across renders once further mutated.
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
