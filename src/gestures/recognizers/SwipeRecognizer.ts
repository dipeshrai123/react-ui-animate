import { GesturePhase } from '../engine/phases';
import type { GestureRecognizer, RecognizerContext } from '../engine/GestureRecognizer';
import { computeMovement } from '../engine/PointerTracker';
import { suppressNextClick } from '../engine/suppressSyntheticClick';
import type { SwipeEvent, SwipeGestureConfig, SwipeHandlers } from '../api/Gesture';

const DEFAULT_VELOCITY_THRESHOLD = 0.5; // px/ms
const DEFAULT_DISTANCE_THRESHOLD = 30; // px

/**
 * Fling/flick recognizer. Unlike Pan, has no streaming ACTIVE phase — it
 * resolves once, at release, by checking the dominant-axis distance and
 * velocity against thresholds. Fires `onSwipe` only on a qualifying
 * release; a slow/short release fires nothing.
 *
 *   UNDETERMINED --(pointerdown)--> POSSIBLE         [capture pointer]
 *   POSSIBLE --(move)--> POSSIBLE                     [track movement, no emit]
 *   POSSIBLE --(pointerup, qualifies)--> END           [onSwipe]
 *   POSSIBLE --(pointerup, doesn't qualify)--> FAILED  [no callback]
 *   * --(pointercancel)--> CANCELLED                   [no callback]
 */
export class SwipeRecognizer implements GestureRecognizer {
  phase: GesturePhase = GesturePhase.UNDETERMINED;

  private pointerDownPos = { x: 0, y: 0 };
  private movement = { x: 0, y: 0 };
  private target: HTMLElement | null = null;
  private captured = false;

  constructor(
    private config: SwipeGestureConfig,
    private handlers: SwipeHandlers
  ) {}

  updateConfig(config: SwipeGestureConfig): void {
    this.config = config;
  }

  updateHandlers(handlers: SwipeHandlers): void {
    this.handlers = handlers;
  }

  onPointerDown(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.config.enabled === false) return;

    this.target = ctx.target instanceof HTMLElement ? ctx.target : null;
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.movement = { x: 0, y: 0 };
    this.phase = GesturePhase.POSSIBLE;

    // Captured immediately (unlike Pan's lazy capture) — a swipe has no
    // mid-stream "threshold crossed" moment to capture at, and letting the
    // browser scroll/select during the flick itself would distort the very
    // gesture being measured.
    if (this.target) {
      this.target.setPointerCapture(e.pointerId);
      this.captured = true;
    }
  }

  onPointerMove(e: PointerEvent): void {
    if (this.phase !== GesturePhase.POSSIBLE) return;
    if (this.captured) e.preventDefault();

    this.movement = computeMovement(
      this.pointerDownPos,
      { x: e.clientX, y: e.clientY },
      this.config.axis
    );
  }

  onPointerUp(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.captured && this.target) {
      this.target.releasePointerCapture(e.pointerId);
      this.captured = false;
    }

    if (this.phase !== GesturePhase.POSSIBLE) {
      this.reset();
      return;
    }

    const velocityThreshold = this.config.velocityThreshold ?? DEFAULT_VELOCITY_THRESHOLD;
    const distanceThreshold = this.config.distanceThreshold ?? DEFAULT_DISTANCE_THRESHOLD;

    const absX = Math.abs(this.movement.x);
    const absY = Math.abs(this.movement.y);
    const horizontal = absX >= absY;
    const dominantDistance = horizontal ? absX : absY;
    const dominantVelocity = horizontal
      ? Math.abs(ctx.kinematics.velocity.x)
      : Math.abs(ctx.kinematics.velocity.y);

    if (
      dominantDistance >= distanceThreshold &&
      dominantVelocity >= velocityThreshold &&
      ctx.requestActivation()
    ) {
      const direction: SwipeEvent['direction'] = horizontal
        ? this.movement.x < 0
          ? 'left'
          : 'right'
        : this.movement.y < 0
          ? 'up'
          : 'down';

      this.phase = GesturePhase.END;
      if (this.target) suppressNextClick(this.target);
      this.handlers.onSwipe?.(this.buildEvent(e, ctx, direction));
    } else {
      // Distance/velocity qualified but another recognizer (e.g. a Pan that
      // already crossed its own minDistance) claimed this stream first —
      // stay quiet instead of firing a second, contradictory callback for
      // what the user already interpreted as a drag.
      this.phase = GesturePhase.FAILED;
    }

    this.reset();
  }

  onPointerCancel(e: PointerEvent): void {
    if (this.captured && this.target) {
      this.target.releasePointerCapture(e.pointerId);
      this.captured = false;
    }
    if (this.phase === GesturePhase.POSSIBLE) this.phase = GesturePhase.CANCELLED;
    this.reset();
  }

  reset(): void {
    this.phase = GesturePhase.UNDETERMINED;
  }

  private buildEvent(
    e: PointerEvent,
    ctx: RecognizerContext,
    direction: SwipeEvent['direction']
  ): SwipeEvent {
    return {
      direction,
      movement: { ...this.movement },
      velocity: { ...ctx.kinematics.velocity },
      event: e,
      target: this.target as HTMLElement,
    };
  }
}
