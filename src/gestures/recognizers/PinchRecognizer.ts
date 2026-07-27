import { GesturePhase } from '../engine/phases';
import type { GestureRecognizer, RecognizerContext } from '../engine/GestureRecognizer';
import { distanceBetween, centerOf, pointerPair, type Point } from '../utils/twoPointerGeometry';
import type { PinchEvent, PinchGestureConfig, GestureHandlers } from '../api/Gesture';

const DEFAULT_THRESHOLD = 0.02; // |scale - 1|

export class PinchRecognizer implements GestureRecognizer {
  phase: GesturePhase = GesturePhase.UNDETERMINED;

  private startDistance = 0;
  private scale = 1;
  private prevScale = 1;
  private prevTime = 0;
  private velocity = 0;
  private target: HTMLElement | null = null;

  constructor(
    private config: PinchGestureConfig,
    private handlers: GestureHandlers<PinchEvent>
  ) {}

  updateConfig(config: PinchGestureConfig): void {
    this.config = config;
  }

  updateHandlers(handlers: GestureHandlers<PinchEvent>): void {
    this.handlers = handlers;
  }

  onPointerDown(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.config.enabled === false) return;
    if (this.phase !== GesturePhase.UNDETERMINED) return;

    const pair = pointerPair(ctx.pointers);
    if (!pair) return;

    this.startDistance = distanceBetween(pair[0], pair[1]);
    if (this.startDistance === 0) return;

    this.target = ctx.target instanceof HTMLElement ? ctx.target : null;
    this.scale = 1;
    this.prevScale = 1;
    this.prevTime = e.timeStamp;
    this.velocity = 0;
    this.phase = GesturePhase.POSSIBLE;
  }

  onPointerMove(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.phase !== GesturePhase.POSSIBLE && this.phase !== GesturePhase.ACTIVE) return;

    const pair = pointerPair(ctx.pointers);
    if (!pair) return;

    const distance = distanceBetween(pair[0], pair[1]);
    this.scale = distance / this.startDistance;

    const dt = Math.max(e.timeStamp - this.prevTime, 1e-6);
    this.velocity = (this.scale - this.prevScale) / dt;
    this.prevScale = this.scale;
    this.prevTime = e.timeStamp;

    if (this.phase === GesturePhase.POSSIBLE) {
      const threshold = this.config.threshold ?? DEFAULT_THRESHOLD;
      if (Math.abs(this.scale - 1) < threshold) return;

      this.phase = GesturePhase.BEGAN;
      this.handlers.onStart?.(this.buildEvent(e, pair));
      this.phase = GesturePhase.ACTIVE;
    }

    this.handlers.onChange?.(this.buildEvent(e, pair));
  }

  onPointerUp(e: PointerEvent, ctx: RecognizerContext): void {
    if (ctx.pointers.size > 2) return; // a third pointer is still down
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

  private buildEvent(e: PointerEvent, pair: [Point, Point]): PinchEvent {
    return {
      phase: this.phase,
      scale: this.scale,
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
