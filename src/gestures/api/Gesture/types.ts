// Discriminated by `type` so the engine can pattern-match without instanceof.
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

// `E` is inferred per gesture kind (e.g. `PanEvent` for `'pan'`). `H` lets a
// gesture kind use a narrower handlers shape (e.g. Swipe's single terminal
// `onSwipe`) instead of the default start/change/end/finalize stream.
export interface GestureDescriptor<E = unknown, H = GestureHandlers<E>> {
  readonly type: GestureType;
  readonly config: BaseGestureConfig;
  readonly handlers: H;
}
