import type { BaseGestureConfig, GestureDescriptor, GestureHandlers } from './types';

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

export interface HoverEvent {
  hovering: boolean;
  offset: { x: number; y: number };
  event: PointerEvent;
  target: HTMLElement;
}

export class ContinuousGestureBuilder<E> implements GestureDescriptor<E> {
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

  onFinalize(fn: (e: E) => void): this {
    this.handlers = { ...this.handlers, onFinalize: fn };
    return this;
  }

  enabled(v: boolean): this {
    this.config = { ...this.config, enabled: v };
    return this;
  }
}
