import type { BaseGestureConfig, GestureDescriptor } from './types';

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
