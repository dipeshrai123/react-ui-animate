import type { AnimationController } from './AnimationController';

interface LoopOpts {
  onStart?(): void;
  onPause?(): void;
  onResume?(): void;
  onComplete?(): void;
}

class LoopController implements AnimationController {
  private count = 0;
  private isCancelled = false;
  private isPaused = false;
  private onAllDone?: () => void;
  private driverOnComplete?: () => void | undefined;

  constructor(
    private driver: AnimationController,
    private iterations: number,
    private hooks: LoopOpts = {}
  ) {
    this.driverOnComplete = (driver as any)?.hooks?.onComplete;
  }

  private handleIterationComplete = () => {
    this.count++;
    this.driverOnComplete?.();
    if (this.count < this.iterations) {
      this.driver.reset?.();
      this.runOne();
    } else {
      this.onAllDone?.();
      this.hooks.onComplete?.();
    }
  };

  private runOne() {
    if (this.isCancelled || this.isPaused) return;

    this.driver.setOnComplete?.(this.handleIterationComplete);
    this.driver.start();
  }

  start() {
    this.isCancelled = false;
    this.isPaused = false;
    this.count = 0;
    this.driver.reset();
    this.hooks.onStart?.();
    this.runOne();
  }

  pause() {
    this.isPaused = true;
    this.driver.pause();
    this.hooks.onPause?.();
  }

  resume() {
    if (this.isCancelled || !this.isPaused) return;
    this.isPaused = false;
    this.driver.resume();
    this.hooks.onResume?.();
  }

  cancel() {
    this.isCancelled = true;
    this.driver.cancel();
  }

  reset() {
    this.isCancelled = false;
    this.isPaused = false;
    this.count = 0;
    this.driver.reset?.();
  }

  setOnComplete(fn: () => void) {
    this.onAllDone = fn;
  }
}

export function loop(
  controller: AnimationController,
  iterations: number,
  opts: LoopOpts = {}
): AnimationController {
  return new LoopController(controller, iterations, opts);
}
