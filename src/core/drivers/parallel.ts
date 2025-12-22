import type { AnimationController } from './AnimationController';

interface ParallelOpts {
  onStart?(): void;
  onPause?(): void;
  onResume?(): void;
  onComplete?(): void;
}

class ParallelController implements AnimationController {
  private completedCount = 0;
  private isPaused = false;
  private isCancelled = false;
  private onAllDone?: () => void;
  private driverOnCompletes: Array<(() => void) | undefined>;

  constructor(
    private controllers: AnimationController[],
    private hooks: ParallelOpts = {}
  ) {
    this.driverOnCompletes = controllers.map(
      (ctrl) => (ctrl as any)?.hooks?.onComplete
    );
  }

  start() {
    this.completedCount = 0;
    this.isPaused = false;
    this.isCancelled = false;
    this.hooks.onStart?.();

    this.controllers.forEach((ctrl, i) => {
      const orig = this.driverOnCompletes[i];

      ctrl.setOnComplete?.(() => {
        orig?.();
        this.handleOneComplete();
      });

      ctrl.start();
    });
  }

  private handleOneComplete() {
    if (this.isCancelled) return;
    this.completedCount += 1;

    if (this.completedCount === this.controllers.length) {
      this.completedCount = 0;
      this.hooks.onComplete?.();
      this.onAllDone?.();
    }
  }

  pause() {
    if (this.isCancelled || this.isPaused) return;
    this.isPaused = true;
    this.hooks.onPause?.();
    this.controllers.forEach((ctrl) => ctrl.pause());
  }

  resume() {
    if (this.isCancelled || !this.isPaused) return;
    this.isPaused = false;
    this.hooks.onResume?.();
    this.controllers.forEach((ctrl) => ctrl.resume());
  }

  cancel() {
    if (this.isCancelled) return;
    this.isCancelled = true;
    this.controllers.forEach((ctrl) => ctrl.cancel());
  }

  reset() {
    this.isCancelled = false;
    this.isPaused = false;
    this.completedCount = 0;
    this.controllers.forEach((ctrl) => ctrl.reset?.());
  }

  setOnComplete(fn: () => void) {
    this.onAllDone = fn;
  }
}

export function parallel(
  controllers: AnimationController[],
  opts: ParallelOpts = {}
): AnimationController {
  return new ParallelController(controllers, opts);
}
