import { GesturePhase } from '../engine/phases';
import type { GestureRecognizer, RecognizerContext } from '../engine/GestureRecognizer';
import type { BaseGestureConfig, GestureHandlers, HoverEvent } from '../api/Gesture';

/**
 * Boolean hover-state recognizer, no press required. Fires `onStart`
 * (hovering: true) on pointer entry, `onChange` (hovering: true) on every
 * subsequent move while over the target, `onEnd`/`onFinalize`
 * (hovering: false) on `pointerleave`. Unlike `MoveRecognizer`, tracks no
 * movement/velocity/startPos — purely enter/leave + current offset.
 */
export class HoverRecognizer implements GestureRecognizer {
  phase: GesturePhase = GesturePhase.UNDETERMINED;

  constructor(
    private config: BaseGestureConfig,
    private handlers: GestureHandlers<HoverEvent>
  ) {}

  updateConfig(config: BaseGestureConfig): void {
    this.config = config;
  }

  updateHandlers(handlers: GestureHandlers<HoverEvent>): void {
    this.handlers = handlers;
  }

  onHoverMove(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.config.enabled === false) return;

    const isFirst = this.phase !== GesturePhase.ACTIVE;
    if (isFirst) this.phase = GesturePhase.ACTIVE;

    const evt = this.buildEvent(e, ctx, true);
    if (isFirst) this.handlers.onStart?.(evt);
    this.handlers.onChange?.(evt);
  }

  onHoverEnd(e: PointerEvent, ctx: RecognizerContext): void {
    if (this.phase !== GesturePhase.ACTIVE) return;

    this.phase = GesturePhase.END;
    const evt = this.buildEvent(e, ctx, false);
    this.handlers.onEnd?.(evt);
    this.handlers.onFinalize?.(evt);
    this.phase = GesturePhase.UNDETERMINED;
  }

  reset(): void {
    this.phase = GesturePhase.UNDETERMINED;
  }

  private buildEvent(e: PointerEvent, ctx: RecognizerContext, hovering: boolean): HoverEvent {
    const target = ctx.target;
    const rect =
      target instanceof HTMLElement ? target.getBoundingClientRect() : { left: 0, top: 0 };

    return {
      hovering,
      offset: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      event: e,
      target: target as HTMLElement,
    };
  }
}
