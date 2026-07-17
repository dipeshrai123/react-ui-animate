import type { GesturePhase } from '../../engine/phases';
import type { GestureDescriptor, GestureHandlers } from './types';

// Both stream from the same pointer pair (`onStart` once 2 fingers are down
// and moving enough to cross `threshold`, `onChange` per tick, `onEnd`/
// `onFinalize` once either pointer lifts) and can be registered together on
// the same ref to read both scale and rotation from one gesture — they
// don't compete with each other for activation, since they're not
// alternate interpretations of the same input, just different measurements
// of it.
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

export class TwoPointerGestureBuilder<E, C extends { enabled?: boolean; threshold?: number }>
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
