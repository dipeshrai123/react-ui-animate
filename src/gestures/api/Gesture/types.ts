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

export interface GestureDescriptor<E = unknown, H = GestureHandlers<E>> {
  readonly type: GestureType;
  readonly config: BaseGestureConfig;
  readonly handlers: H;
}
