import { GesturePhase } from '../engine/phases';
import type { GestureRecognizer, RecognizerContext } from '../engine/GestureRecognizer';
import type { BaseGestureConfig, GestureHandlers, WheelEvent } from '../api/Gesture';

/**
 * Wheel events. `movement` is the per-event delta, `offset` accumulates
 * forever across the recognizer's lifetime (matching the pre-unification
 * `WheelGesture` controller — never reset between "sessions"). Fires
 * `onChange` (with `onStart` on the first event of a burst) per wheel event,
 * `onEnd`/`onFinalize` 150ms after the last one (debounced, since there's no
 * native "wheel end" event).
 */
export class WheelRecognizer implements GestureRecognizer {
  phase: GesturePhase = GesturePhase.UNDETERMINED;

  private offset = { x: 0, y: 0 };
  private endTimeout?: number;

  constructor(
    private config: BaseGestureConfig,
    private handlers: GestureHandlers<WheelEvent>
  ) {}

  updateConfig(config: BaseGestureConfig): void {
    this.config = config;
  }

  updateHandlers(handlers: GestureHandlers<WheelEvent>): void {
    this.handlers = handlers;
  }

  onWheel(e: globalThis.WheelEvent, ctx: RecognizerContext): void {
    if (this.config.enabled === false) return;

    this.offset = { x: this.offset.x + e.deltaX, y: this.offset.y + e.deltaY };

    const isFirst = this.phase !== GesturePhase.ACTIVE;
    if (isFirst) this.phase = GesturePhase.ACTIVE;

    const evt: WheelEvent = {
      movement: { x: e.deltaX, y: e.deltaY },
      offset: { ...this.offset },
      velocity: { ...ctx.kinematics.velocity },
      event: e,
      cancel: () => {
        if (this.endTimeout != null) clearTimeout(this.endTimeout);
      },
    };

    if (isFirst) this.handlers.onStart?.(evt);
    this.handlers.onChange?.(evt);

    if (this.endTimeout != null) clearTimeout(this.endTimeout);
    this.endTimeout = window.setTimeout(() => {
      this.phase = GesturePhase.END;
      this.handlers.onEnd?.(evt);
      this.handlers.onFinalize?.(evt);
      this.phase = GesturePhase.UNDETERMINED;
    }, 150);
  }

  reset(): void {
    this.phase = GesturePhase.UNDETERMINED;
    if (this.endTimeout != null) {
      clearTimeout(this.endTimeout);
      this.endTimeout = undefined;
    }
  }
}
