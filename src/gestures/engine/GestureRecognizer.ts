import type { GesturePhase } from './phases';
import type { KinematicState } from './PointerTracker';

export interface RecognizerContext {
  target: HTMLElement | Window;
  kinematics: KinematicState;
  pointers: ReadonlyMap<number, { x: number; y: number }>;
  // First caller per pointer stream wins; used to arbitrate e.g. Pan vs Swipe.
  requestActivation(): boolean;
  yieldTo(other: GestureRecognizer): void;
}

export interface GestureRecognizer {
  readonly phase: GesturePhase;

  onPointerDown?(e: PointerEvent, ctx: RecognizerContext): void;
  onPointerMove?(e: PointerEvent, ctx: RecognizerContext): void;
  onPointerUp?(e: PointerEvent, ctx: RecognizerContext): void;
  onPointerCancel?(e: PointerEvent, ctx: RecognizerContext): void;

  onHoverMove?(e: PointerEvent, ctx: RecognizerContext): void;
  onHoverEnd?(e: PointerEvent, ctx: RecognizerContext): void;

  onWheel?(e: globalThis.WheelEvent, ctx: RecognizerContext): void;

  onScroll?(e: Event, ctx: RecognizerContext): void;

  reset(): void;
}
