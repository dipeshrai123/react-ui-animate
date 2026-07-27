import { GesturePhase } from '../engine/phases';
import type { GestureRecognizer, RecognizerContext } from '../engine/GestureRecognizer';
import { computeMovement } from '../engine/PointerTracker';
import { suppressNextClick } from '../engine/suppressSyntheticClick';
import type { BaseGestureConfig, GestureHandlers, PanEvent } from '../api/Gesture';

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

      // Capture only once recognized as a drag, not on pointerdown, so plain clicks still allow text selection.
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
      // Arm at pointerup, not threshold-cross — arming earlier lets the macrotask fallback clear it before a real-length drag's click arrives.
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
