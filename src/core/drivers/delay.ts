import type { AnimationController } from './AnimationController';

class DelayController implements AnimationController {
  private timerId?: number;
  private onDone?: () => void;

  constructor(private ms: number) {}

  start() {
    this.timerId = window.setTimeout(() => {
      this.onDone?.();
    }, this.ms);
  }
  pause() {}
  resume() {}
  cancel() {
    if (this.timerId) clearTimeout(this.timerId);
  }
  reset() {
    this.cancel();
  }
  setOnComplete(fn: () => void) {
    this.onDone = fn;
  }
}

export function delay(ms: number): AnimationController {
  return new DelayController(ms);
}
