import { GesturePhase } from '../engine/phases';
import type { GestureRecognizer, RecognizerContext } from '../engine/GestureRecognizer';
import { angleBetween, centerOf, pointerPair, type Point } from '../utils/twoPointerGeometry';
import type { RotateEvent, RotateGestureConfig, GestureHandlers } from '../api/Gesture';

const DEFAULT_THRESHOLD = 2; // degrees

// Wraps into (-180, 180] so crossing the atan2 boundary reads as a small step, not a ~360deg jump.
function normalizeDelta(delta: number): number {
  let d = delta % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

export class RotateRecognizer implements GestureRecognizer {
  phase: GesturePhase = GesturePhase.UNDETERMINED;

  private prevAngle = 0;
  private rotation = 0;
  private prevRotation = 0;
  private prevTime = 0;
  private velocity = 0;
  private target: HTMLElement | null = null;

  constructor(
    private config: RotateGestureConfig,
    private handlers: GestureHandlers<RotateEvent>
  ) {}

  updateConfig(config: RotateGestureConfig): void {
    this.config = config;
  }

  updateHandlers(handlers: GestureHandlers<RotateEvent>): void {
    this.handlers = handlers;
  }

  onPointerDown(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.config.enabled === false) return;
    if (this.phase !== GesturePhase.UNDETERMINED) return;

    const pair = pointerPair(ctx.pointers);
    if (!pair) return;

    this.target = ctx.target instanceof HTMLElement ? ctx.target : null;
    this.prevAngle = angleBetween(pair[0], pair[1]);
    this.rotation = 0;
    this.prevRotation = 0;
    this.prevTime = e.timeStamp;
    this.velocity = 0;
    this.phase = GesturePhase.POSSIBLE;
  }

  onPointerMove(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.phase !== GesturePhase.POSSIBLE && this.phase !== GesturePhase.ACTIVE) return;

    const pair = pointerPair(ctx.pointers);
    if (!pair) return;

    const currentAngle = angleBetween(pair[0], pair[1]);
    this.rotation += normalizeDelta(currentAngle - this.prevAngle);
    this.prevAngle = currentAngle;

    const dt = Math.max(e.timeStamp - this.prevTime, 1e-6);
    this.velocity = (this.rotation - this.prevRotation) / dt;
    this.prevRotation = this.rotation;
    this.prevTime = e.timeStamp;

    if (this.phase === GesturePhase.POSSIBLE) {
      const threshold = this.config.threshold ?? DEFAULT_THRESHOLD;
      if (Math.abs(this.rotation) < threshold) return;

      this.phase = GesturePhase.BEGAN;
      this.handlers.onStart?.(this.buildEvent(e, pair));
      this.phase = GesturePhase.ACTIVE;
    }

    this.handlers.onChange?.(this.buildEvent(e, pair));
  }

  onPointerUp(e: PointerEvent, ctx: RecognizerContext): void {
    if (ctx.pointers.size > 2) return;
    this.finish(e, ctx, false);
  }

  onPointerCancel(e: PointerEvent, ctx: RecognizerContext): void {
    if (ctx.pointers.size > 2) return;
    this.finish(e, ctx, true);
  }

  private finish(e: PointerEvent, ctx: RecognizerContext, cancelled: boolean): void {
    const pair = pointerPair(ctx.pointers) ?? ([{ x: 0, y: 0 }, { x: 0, y: 0 }] as [Point, Point]);

    if (this.phase === GesturePhase.ACTIVE) {
      this.phase = cancelled ? GesturePhase.CANCELLED : GesturePhase.END;
      this.handlers.onEnd?.(this.buildEvent(e, pair));
      this.handlers.onFinalize?.(this.buildEvent(e, pair));
    } else if (this.phase === GesturePhase.POSSIBLE) {
      this.phase = cancelled ? GesturePhase.CANCELLED : GesturePhase.FAILED;
      this.handlers.onFinalize?.(this.buildEvent(e, pair));
    }

    this.reset();
  }

  reset(): void {
    this.phase = GesturePhase.UNDETERMINED;
  }

  private buildEvent(e: PointerEvent, pair: [Point, Point]): RotateEvent {
    return {
      phase: this.phase,
      rotation: this.rotation,
      velocity: this.velocity,
      center: centerOf(pair[0], pair[1]),
      event: e,
      target: this.target as HTMLElement,
      cancel: () => {
        this.phase = GesturePhase.CANCELLED;
        this.reset();
      },
    };
  }
}
