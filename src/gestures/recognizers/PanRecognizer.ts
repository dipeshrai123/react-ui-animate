import { GesturePhase } from '../engine/phases';
import type { GestureRecognizer, RecognizerContext } from '../engine/GestureRecognizer';
import { computeMovement } from '../engine/PointerTracker';
import { suppressNextClick } from '../engine/suppressSyntheticClick';
import type { BaseGestureConfig, GestureHandlers, PanEvent } from '../api/Gesture';

/**
 * Pan/drag recognizer. State diagram:
 *
 *   UNDETERMINED --(pointerdown)--> POSSIBLE
 *   POSSIBLE --(move, dist < minDistance)--> POSSIBLE          [no emit]
 *   POSSIBLE --(move, dist >= minDistance)--> BEGAN -> ACTIVE  [onStart, then onChange]
 *   ACTIVE --(move)--> ACTIVE                                  [onChange]
 *   ACTIVE --(pointerup)--> END                                [onEnd, onFinalize]
 *   POSSIBLE --(pointerup, dist < minDistance)--> FAILED        [onFinalize only]
 *   * --(pointercancel)--> CANCELLED                            [onFinalize]
 */
export class PanRecognizer implements GestureRecognizer {
  phase: GesturePhase = GesturePhase.UNDETERMINED;

  private pointerDownPos = { x: 0, y: 0 };
  private movement = { x: 0, y: 0 };
  private target: HTMLElement | null = null;
  private captured = false;

  constructor(
    private config: BaseGestureConfig,
    private handlers: GestureHandlers<PanEvent>
  ) {}

  updateConfig(config: BaseGestureConfig): void {
    this.config = config;
  }

  updateHandlers(handlers: GestureHandlers<PanEvent>): void {
    this.handlers = handlers;
  }

  onPointerDown(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.config.enabled === false) return;

    this.target = ctx.target instanceof HTMLElement ? ctx.target : null;
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.movement = { x: 0, y: 0 };
    this.captured = false;
    this.phase = GesturePhase.POSSIBLE;
  }

  onPointerMove(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.phase !== GesturePhase.POSSIBLE && this.phase !== GesturePhase.ACTIVE) {
      return;
    }

    this.movement = computeMovement(
      this.pointerDownPos,
      { x: e.clientX, y: e.clientY },
      this.config.axis
    );

    if (this.phase === GesturePhase.POSSIBLE) {
      const minDistance = this.config.minDistance ?? 0;
      const dist = Math.hypot(this.movement.x, this.movement.y);
      if (dist < minDistance) return;

      if (!ctx.requestActivation()) {
        this.phase = GesturePhase.CANCELLED;
        this.handlers.onFinalize?.(this.buildEvent(e, ctx));
        this.reset();
        return;
      }

      // Capture the pointer and block the browser's default handling (text
      // selection, native drag-image, touch scrolling) once this is
      // recognized as a real drag — not on every pointerdown, so a plain
      // click still lets text selection/native behavior work normally.
      if (this.target) {
        this.target.setPointerCapture(e.pointerId);
        this.captured = true;
      }

      this.phase = GesturePhase.BEGAN;
      this.handlers.onStart?.(this.buildEvent(e, ctx));
      this.phase = GesturePhase.ACTIVE;
    }

    if (this.captured) e.preventDefault();

    this.handlers.onChange?.(this.buildEvent(e, ctx));
  }

  onPointerUp(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.captured && this.target) {
      this.target.releasePointerCapture(e.pointerId);
      this.captured = false;
    }

    if (this.phase === GesturePhase.ACTIVE) {
      // Arm click suppression here, not at threshold-cross: the browser's
      // synthetic click fires right after pointerup, but a drag can run for
      // any length of time before that — arming earlier and relying on
      // suppressNextClick's macrotask fallback cleanup meant the fallback
      // could (and for any real-length drag, would) remove the suppressor
      // long before the click ever arrived.
      if (this.target) suppressNextClick(this.target);

      this.phase = GesturePhase.END;
      const evt = this.buildEvent(e, ctx);
      this.handlers.onEnd?.(evt);
      this.handlers.onFinalize?.(evt);
    } else if (this.phase === GesturePhase.POSSIBLE) {
      this.phase = GesturePhase.FAILED;
      this.handlers.onFinalize?.(this.buildEvent(e, ctx));
    }
    this.reset();
  }

  onPointerCancel(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.captured && this.target) {
      this.target.releasePointerCapture(e.pointerId);
      this.captured = false;
    }

    if (
      this.phase === GesturePhase.ACTIVE ||
      this.phase === GesturePhase.POSSIBLE ||
      this.phase === GesturePhase.BEGAN
    ) {
      this.phase = GesturePhase.CANCELLED;
      this.handlers.onFinalize?.(this.buildEvent(e, ctx));
    }
    this.reset();
  }

  reset(): void {
    this.phase = GesturePhase.UNDETERMINED;
  }

  private buildEvent(e: PointerEvent, ctx: RecognizerContext): PanEvent {
    return {
      phase: this.phase,
      down: this.phase === GesturePhase.BEGAN || this.phase === GesturePhase.ACTIVE,
      movement: { ...this.movement },
      offset: { ...this.movement },
      velocity: { ...ctx.kinematics.velocity },
      event: e,
      target: this.target as HTMLElement,
      cancel: () => {
        this.phase = GesturePhase.CANCELLED;
        this.reset();
      },
    };
  }
}
