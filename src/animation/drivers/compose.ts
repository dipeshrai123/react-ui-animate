import type { AnimateController, AnimateHooks } from './AnimateController';
import { isReducedMotionEnabled } from '../utils/reducedMotion';

class ParallelController implements AnimateController {
  private completedCount = 0;
  private isPaused = false;
  private isCancelled = false;
  private onComplete?: () => void;
  private originalCompletes: Array<(() => void) | undefined>;

  constructor(
    private controllers: AnimateController[],
    private hooks: AnimateHooks = {}
  ) {
    this.originalCompletes = controllers.map(
      (ctrl) => (ctrl as any)?.hooks?.onComplete
    );
  }

  start() {
    this.completedCount = 0;
    this.isPaused = false;
    this.isCancelled = false;
    this.hooks.onStart?.();

    this.controllers.forEach((controller, index) => {
      const original = this.originalCompletes[index];

      controller.setOnComplete?.(() => {
        original?.();
        this.handleComplete();
      });

      controller.start();
    });
  }

  private handleComplete() {
    if (this.isCancelled) return;
    this.completedCount += 1;

    if (this.completedCount === this.controllers.length) {
      this.completedCount = 0;
      this.hooks.onComplete?.();
      this.onComplete?.();
    }
  }

  pause() {
    if (this.isCancelled || this.isPaused) return;
    this.isPaused = true;
    this.hooks.onPause?.();
    this.controllers.forEach((controller) => controller.pause());
  }

  resume() {
    if (this.isCancelled || !this.isPaused) return;
    this.isPaused = false;
    this.hooks.onResume?.();
    this.controllers.forEach((controller) => controller.resume());
  }

  cancel() {
    if (this.isCancelled) return;
    this.isCancelled = true;
    this.controllers.forEach((controller) => controller.cancel());
  }

  reset() {
    this.isCancelled = false;
    this.isPaused = false;
    this.completedCount = 0;
    this.controllers.forEach((controller) => controller.reset?.());
  }

  setOnComplete(fn: () => void) {
    this.onComplete = fn;
  }
}

class SequenceController implements AnimateController {
  private index = 0;
  private isPaused = false;
  private isCancelled = false;
  private current: AnimateController | null = null;
  private onComplete?: () => void;
  private originalCompletes: Array<(() => void) | undefined>;

  constructor(
    private controllers: AnimateController[],
    private hooks: AnimateHooks = {}
  ) {
    this.originalCompletes = controllers.map(
      (ctrl) => (ctrl as any)?.hooks?.onComplete
    );
  }

  private runNext() {
    if (this.isCancelled || this.isPaused) return;

    const index = this.index++;
    const controller = this.controllers[index];

    if (!controller) {
      this.onComplete?.();
      this.hooks.onComplete?.();
      return;
    }

    this.current = controller;
    const original = this.originalCompletes[index];

    controller.setOnComplete?.(() => {
      original?.();
      this.runNext();
    });

    controller.start();
  }

  start() {
    this.index = 0;
    this.isPaused = false;
    this.isCancelled = false;
    this.hooks.onStart?.();
    this.runNext();
  }

  pause() {
    if (this.isCancelled) return;
    this.isPaused = true;
    this.current?.pause();
    this.hooks.onPause?.();
  }

  resume() {
    if (this.isCancelled || !this.isPaused) return;
    this.isPaused = false;
    this.current?.resume();
    this.hooks.onResume?.();
  }

  cancel() {
    this.isCancelled = true;
    this.current?.cancel();
  }

  reset() {
    this.isCancelled = false;
    this.isPaused = false;
    this.index = 0;
    this.controllers.forEach((controller) => controller.reset?.());
  }

  setOnComplete(fn: () => void) {
    this.onComplete = fn;
  }
}

class LoopController implements AnimateController {
  private count = 0;
  private isCancelled = false;
  private isPaused = false;
  private onComplete?: () => void;
  private current!: AnimateController;
  private currentOriginalComplete?: () => void;
  private effectiveIterations = 0;
  // Guards against unbounded recursive runIteration() calls when a controller completes
  // synchronously inside its own start() (e.g. reduced motion).
  private isRunningIteration = false;

  constructor(
    private controllerFactory: (iteration: number) => AnimateController,
    private iterations: number,
    private hooks: AnimateHooks = {}
  ) {}

  // Stable reference reused across iterations — a fresh closure each time would wrap the
  // previous iteration's wrapper and eventually overflow the stack.
  private handleCurrentComplete = () => {
    this.currentOriginalComplete?.();
    this.handleIterationComplete();
  };

  private handleIterationComplete = () => {
    this.count++;
    if (this.count < this.effectiveIterations) {
      if (this.isRunningIteration) {
        queueMicrotask(() => this.runIteration());
      } else {
        this.runIteration();
      }
    } else {
      this.onComplete?.();
      this.hooks.onComplete?.();
    }
  };

  private runIteration() {
    if (this.isCancelled || this.isPaused) return;
    this.isRunningIteration = true;

    const next = this.controllerFactory(this.count);
    if (next !== this.current) {
      this.currentOriginalComplete = (next as any)?.hooks?.onComplete;
    }
    this.current = next;

    this.current.setOnComplete?.(this.handleCurrentComplete);
    this.current.reset?.();
    this.current.start();
    this.isRunningIteration = false;
  }

  start() {
    this.isCancelled = false;
    this.isPaused = false;
    this.count = 0;
    // Caps Infinity iterations to 1 under reduced motion, or it would spin forever doing no visible work.
    this.effectiveIterations = isReducedMotionEnabled()
      ? Math.min(this.iterations, 1)
      : this.iterations;
    this.hooks.onStart?.();
    this.runIteration();
  }

  pause() {
    this.isPaused = true;
    this.current?.pause();
    this.hooks.onPause?.();
  }

  resume() {
    if (this.isCancelled || !this.isPaused) return;
    this.isPaused = false;
    this.current?.resume();
    this.hooks.onResume?.();
  }

  cancel() {
    this.isCancelled = true;
    this.current?.cancel();
  }

  reset() {
    this.isCancelled = false;
    this.isPaused = false;
    this.count = 0;
    this.current?.reset?.();
  }

  setOnComplete(fn: () => void) {
    this.onComplete = fn;
  }
}

class DelayController implements AnimateController {
  private timerId?: number;
  private onComplete?: () => void;

  constructor(private duration: number) {}

  start() {
    this.timerId = window.setTimeout(() => {
      this.onComplete?.();
    }, this.duration);
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
    this.onComplete = fn;
  }
}

export function parallel(
  controllers: AnimateController[],
  hooks: AnimateHooks = {}
): AnimateController {
  return new ParallelController(controllers, hooks);
}

export function sequence(
  controllers: AnimateController[],
  hooks: AnimateHooks = {}
): AnimateController {
  return new SequenceController(controllers, hooks);
}

export function loop(
  controller: AnimateController | ((iteration: number) => AnimateController),
  iterations: number,
  hooks: AnimateHooks = {}
): AnimateController {
  const factory = typeof controller === 'function' ? controller : () => controller;
  return new LoopController(factory, iterations, hooks);
}

export function delay(duration: number): AnimateController {
  return new DelayController(duration);
}

