import type { GesturePhase } from './phases';
import type { KinematicState } from './PointerTracker';

// Given to a recognizer on every dispatched pointer event so it can read
// shared kinematics and (once composition/Race/Simultaneous ships) negotiate
// activation with other recognizers registered on the same element, without
// each recognizer owning its own pointer-capture/velocity bookkeeping.
export interface RecognizerContext {
  /** The element/window this recognizer was registered against. */
  target: HTMLElement | Window;
  kinematics: KinematicState;
  /**
   * Requests exclusive activation. Returns true if granted. With no
   * composition grouping in play (the only case today), this always grants.
   */
  requestActivation(): boolean;
  /** Cedes activation to another recognizer, e.g. after losing a Race. */
  yieldTo(other: GestureRecognizer): void;
}

// The unit every concrete gesture (Pan today; Tap/LongPress later) implements.
// Dispatched to by ElementGestureTracker, which owns the actual native
// pointerdown/move/up/cancel listeners so N recognizers on one element share
// one set of listeners instead of each attaching its own.
export interface GestureRecognizer {
  readonly phase: GesturePhase;
  onPointerDown(e: PointerEvent, ctx: RecognizerContext): void;
  onPointerMove(e: PointerEvent, ctx: RecognizerContext): void;
  onPointerUp(e: PointerEvent, ctx: RecognizerContext): void;
  onPointerCancel(e: PointerEvent, ctx: RecognizerContext): void;
  /** Returns to UNDETERMINED; called after END/FAILED/CANCELLED settle. */
  reset(): void;
}
