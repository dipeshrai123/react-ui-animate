import { GesturePhase } from '../engine/phases';
import type { GestureRecognizer, RecognizerContext } from '../engine/GestureRecognizer';
import { computeMovement } from '../engine/PointerTracker';
import type { BaseGestureConfig, GestureHandlers, MoveEvent } from '../api/Gesture';

/**
 * Continuous pointer tracking, no press required. Fires `onChange` (with
 * `onStart` on the first move of a hover "session") while the pointer moves
 * over the target, `onEnd`/`onFinalize` on `pointerleave`.
 *
 * `movement` is measured from the position of the very first move this
 * recognizer instance ever saw, even across multiple enter/leave cycles.
 */
export class MoveRecognizer implements GestureRecognizer {
  phase: GesturePhase = GesturePhase.UNDETERMINED;

  private startPos: { x: number; y: number } | null = null;
  private movement = { x: 0, y: 0 };

  constructor(
    private config: BaseGestureConfig,
    private handlers: GestureHandlers<MoveEvent>
  ) {}

  updateConfig(config: BaseGestureConfig): void {
    this.config = config;
  }

  updateHandlers(handlers: GestureHandlers<MoveEvent>): void {
    this.handlers = handlers;
  }

  onHoverMove(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.config.enabled === false) return;

    if (this.startPos === null) {
      this.startPos = { x: e.clientX, y: e.clientY };
    }
    this.movement = computeMovement(this.startPos, { x: e.clientX, y: e.clientY });

    const isFirst = this.phase !== GesturePhase.ACTIVE;
    if (isFirst) this.phase = GesturePhase.ACTIVE;

    const evt = this.buildEvent(e, ctx);
    if (isFirst) this.handlers.onStart?.(evt);
    this.handlers.onChange?.(evt);
  }

  onHoverEnd(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.phase !== GesturePhase.ACTIVE) return;

    this.phase = GesturePhase.END;
    const evt = this.buildEvent(e, ctx);
    this.handlers.onEnd?.(evt);
    this.handlers.onFinalize?.(evt);
    this.phase = GesturePhase.UNDETERMINED;
  }

  reset(): void {
    // Only the recognition phase resets — `startPos` intentionally persists (see class doc).
    this.phase = GesturePhase.UNDETERMINED;
  }

  private buildEvent(e: PointerEvent, ctx: RecognizerContext): MoveEvent {
    const target = ctx.target;
    const rect =
      target instanceof HTMLElement ? target.getBoundingClientRect() : { left: 0, top: 0 };

    return {
      movement: { ...this.movement },
      offset: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      velocity: { ...ctx.kinematics.velocity },
      event: e,
      cancel: () => this.onHoverEnd(e, ctx),
    };
  }
}
