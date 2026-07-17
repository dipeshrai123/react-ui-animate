import { GesturePhase } from '../engine/phases';
import type { GestureRecognizer, RecognizerContext } from '../engine/GestureRecognizer';
import type { BaseGestureConfig, GestureHandlers, ScrollEvent } from '../api/Gesture';

/**
 * Scroll events. `offset` is the absolute scroll position; `movement` is the
 * delta from the last scroll event this recognizer instance ever saw. Fires
 * `onChange` (with `onStart` on the first event of a burst) per scroll
 * event, `onEnd`/`onFinalize` 150ms after the last one (debounced, since
 * there's no native "scroll end" event).
 */
export class ScrollRecognizer implements GestureRecognizer {
  phase: GesturePhase = GesturePhase.UNDETERMINED;

  private prevScroll = { x: 0, y: 0 };
  private endTimeout?: number;

  constructor(
    private config: BaseGestureConfig,
    private handlers: GestureHandlers<ScrollEvent>
  ) {}

  updateConfig(config: BaseGestureConfig): void {
    this.config = config;
  }

  updateHandlers(handlers: GestureHandlers<ScrollEvent>): void {
    this.handlers = handlers;
  }

  onScroll(e: Event, ctx: RecognizerContext): void {
    if (this.config.enabled === false) return;

    const target = ctx.target;
    const x = target instanceof HTMLElement ? target.scrollLeft : window.scrollX;
    const y = target instanceof HTMLElement ? target.scrollTop : window.scrollY;

    const movement = { x: x - this.prevScroll.x, y: y - this.prevScroll.y };
    this.prevScroll = { x, y };

    const isFirst = this.phase !== GesturePhase.ACTIVE;
    if (isFirst) this.phase = GesturePhase.ACTIVE;

    const evt: ScrollEvent = {
      movement,
      offset: { x, y },
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
