import type { GesturePhase } from './phases';
import type { KinematicState } from './PointerTracker';

// Given to a recognizer on every dispatched event so it can read shared
// kinematics and (once composition/Race/Simultaneous ships) negotiate
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

// The unit every concrete gesture implements (Pan, Move, Wheel, Scroll
// today; Tap/LongPress later). Dispatched to by `ElementGestureTracker`,
// which owns the actual native listeners so N recognizers on one element
// share one set of listeners per event category instead of each attaching
// its own.
//
// Every method is optional: a recognizer only implements the event category
// it cares about (Pan implements the press-gated onPointer* methods; Move
// implements the ungated onHover* pair; Wheel/Scroll implement their single
// native-event handler). The tracker only attaches the native listeners for
// categories that at least one registered recognizer actually needs.
export interface GestureRecognizer {
  readonly phase: GesturePhase;

  // Press-gated pointer stream (requires a pointerdown to start) — Pan,
  // future Tap/LongPress.
  onPointerDown?(e: PointerEvent, ctx: RecognizerContext): void;
  onPointerMove?(e: PointerEvent, ctx: RecognizerContext): void;
  onPointerUp?(e: PointerEvent, ctx: RecognizerContext): void;
  onPointerCancel?(e: PointerEvent, ctx: RecognizerContext): void;

  // Ungated hover stream (no press required) — Move.
  onHoverMove?(e: PointerEvent, ctx: RecognizerContext): void;
  onHoverEnd?(e: PointerEvent, ctx: RecognizerContext): void;

  // Wheel.
  onWheel?(e: globalThis.WheelEvent, ctx: RecognizerContext): void;

  // Scroll.
  onScroll?(e: Event, ctx: RecognizerContext): void;

  /** Returns to UNDETERMINED; called after END/FAILED/CANCELLED settle. */
  reset(): void;
}
