import { Easing } from '../easing';
import { AnimateValue } from '../AnimateValue';
import type { AnimateController, AnimateHooks } from './AnimateController';

interface TimingOptions extends AnimateHooks {
  duration?: number;
  easing?: (t: number) => number;
  onChange?: (value: number) => void;
}

type DriverFactory = (
  value: AnimateValue<number>,
  target: number,
  options: TimingOptions
) => AnimateController;

function withInterpolation(
  value: AnimateValue<number | string>,
  target: number | string,
  options: TimingOptions,
  factory: DriverFactory
): AnimateController {
  if (typeof value.current === 'number' && typeof target === 'number') {
    return factory(value as AnimateValue<number>, target, options);
  }

  if (typeof value.current === 'string' && typeof target === 'string') {
    try {
      const progress = new AnimateValue(0);
      const interpolated = progress.to([0, 1], [value.current, target]);

      const controller = factory(progress, 1, options);
      value.setAnimationController(controller);

      progress.subscribe(() => {
        if (value.getAnimationController() === controller) {
          value._internalSet(interpolated.current);
        }
      });

      return controller;
    } catch (err: any) {
      throw new Error(
        `[timing] Cannot animate from "${value.current}" to "${target}": ${err.message}`
      );
    }
  }

  throw new Error(
    `[timing] Unsupported type: ${typeof value.current} → ${typeof target}`
  );
}

class TimingController implements AnimateController {
  private startTime: number;
  private frameId: number;
  private from: number;
  private position: number;
  private isPaused = false;
  private isCancelled = false;
  private pausedAt: number | null = null;
  private elapsedBeforePause = 0;

  constructor(
    private value: AnimateValue<number>,
    private target: number,
    private duration: number = 300,
    private easing: (t: number) => number = Easing.linear,
    private hooks: Omit<TimingOptions, 'duration' | 'easing'>
  ) {}

  start() {
    const previous = this.value.getAnimationController();

    if (
      previous instanceof TimingController &&
      !previous.isCancelled &&
      previous.target === this.target &&
      previous.startTime
    ) {
      this.from = previous.from;
      this.startTime = previous.startTime;
    } else {
      this.from = this.position = this.value.current;
      this.startTime = performance.now();
    }

    this.hooks.onStart?.();
    this.value.setAnimationController(this);

    this.isPaused = false;
    this.isCancelled = false;
    this.pausedAt = null;
    this.elapsedBeforePause = 0;

    this.frameId = requestAnimationFrame(this.animate);
  }

  private animate = (timestamp: number) => {
    if (this.isCancelled || this.isPaused) return;

    const elapsed = this.elapsedBeforePause + (timestamp - this.startTime);
    let progress = elapsed / this.duration;
    if (!Number.isFinite(progress)) progress = progress === Infinity ? 1 : 0;
    const t = Math.min(1, Math.max(0, progress));

    if (t < 1) {
      this.position = this.from + (this.target - this.from) * this.easing(t);
      this.value._internalSet(this.position);
      this.hooks.onChange?.(this.position);
      this.frameId = requestAnimationFrame(this.animate);
    } else {
      this.position = this.target;
      this.value._internalSet(this.position);
      this.hooks.onChange?.(this.position);
      this.hooks.onComplete?.();
    }
  };

  pause() {
    if (this.isCancelled || this.isPaused) return;

    this.isPaused = true;
    this.pausedAt = performance.now();
    this.elapsedBeforePause += this.pausedAt - this.startTime;
    this.startTime = 0;

    cancelAnimationFrame(this.frameId);
    this.hooks.onPause?.();
  }

  resume() {
    if (this.isCancelled || !this.isPaused) return;

    this.isPaused = false;
    this.hooks.onResume?.();
    this.startTime = performance.now();
    this.pausedAt = null;
    this.frameId = requestAnimationFrame(this.animate);
  }

  cancel() {
    this.isCancelled = true;
    cancelAnimationFrame(this.frameId);
  }

  reset() {
    this.cancel();
    this.isPaused = false;
    this.pausedAt = null;
    this.elapsedBeforePause = 0;
    cancelAnimationFrame(this.frameId);
  }

  setOnComplete(fn: () => void) {
    this.hooks.onComplete = fn;
  }
}

export function timing(
  value: AnimateValue<number> | AnimateValue<string> | AnimateValue<number | string>,
  target: number | string,
  options: TimingOptions = {}
): AnimateController {
  return withInterpolation(
    value as AnimateValue<number | string>,
    target,
    options,
    (v, t, opts) => {
      const { duration = 300, easing = Easing.linear, ...hooks } = opts;
      return new TimingController(v, t, duration, easing, hooks);
    }
  );
}
