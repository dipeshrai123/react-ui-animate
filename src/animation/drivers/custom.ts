import { AnimateValue } from '../values/AnimateValue';
import type { AnimateController, AnimateHooks } from './AnimateController';
import { isReducedMotionEnabled } from '../utils/reducedMotion';

export interface CustomTickContext {
  /** Milliseconds elapsed since this run started (pauses excluded). */
  elapsed: number;
  /** Milliseconds since the previous frame (0 on the first frame). */
  dt: number;
  /** The value this run started from. */
  from: number;
}

export type CustomTickFn = (ctx: CustomTickContext) => number;

export interface CustomOptions extends AnimateHooks {
  /**
   * Optional run length in ms. When set, the driver stops ticking and fires
   * `onComplete` once `elapsed >= duration`. Omit for an indefinite driver
   * (e.g. a continuous orbit) that only stops via `cancel()`/`pause()`.
   */
  duration?: number;
  from?: number;
  onChange?(value: number): void;
}

class CustomController implements AnimateController {
  private startTime = 0;
  private lastTime = 0;
  private frameId = 0;
  private fromValue = 0;
  private isPaused = false;
  private isCancelled = false;

  constructor(
    private value: AnimateValue<number>,
    private tick: CustomTickFn,
    private duration: number | undefined,
    private hooks: CustomOptions
  ) {}

  start() {
    this.fromValue = this.hooks.from ?? this.value.current;
    this.startTime = performance.now();
    this.lastTime = this.startTime;

    this.hooks.onStart?.();
    this.value.setAnimationController(this);

    this.isPaused = false;
    this.isCancelled = false;

    if (isReducedMotionEnabled() && this.duration !== undefined) {
      const finalValue = this.tick({
        elapsed: this.duration,
        dt: 0,
        from: this.fromValue,
      });
      this.value._internalSet(finalValue);
      this.hooks.onChange?.(finalValue);
      this.hooks.onComplete?.();
      return;
    }

    this.frameId = requestAnimationFrame(this.animate);
  }

  private animate = (timestamp: number) => {
    if (this.isCancelled || this.isPaused) return;

    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;
    const elapsed = timestamp - this.startTime;

    const next = this.tick({ elapsed, dt, from: this.fromValue });
    this.value._internalSet(next);
    this.hooks.onChange?.(next);

    if (this.duration !== undefined && elapsed >= this.duration) {
      this.hooks.onComplete?.();
      return;
    }

    this.frameId = requestAnimationFrame(this.animate);
  };

  pause() {
    if (this.isCancelled || this.isPaused) return;

    this.isPaused = true;
    cancelAnimationFrame(this.frameId);
    this.hooks.onPause?.();
  }

  resume() {
    if (this.isCancelled || !this.isPaused) return;

    // Shift startTime forward by the pause gap so `elapsed` excludes it,
    // matching TimingController/DecayController's pause semantics.
    const now = performance.now();
    this.startTime += now - this.lastTime;
    this.lastTime = now;

    this.isPaused = false;
    this.hooks.onResume?.();
    this.frameId = requestAnimationFrame(this.animate);
  }

  cancel() {
    this.isCancelled = true;
    cancelAnimationFrame(this.frameId);
  }

  reset() {
    this.cancel();
    this.isPaused = false;
  }

  setOnComplete(fn: () => void) {
    this.hooks.onComplete = fn;
  }
}

export function custom(
  value: AnimateValue<number>,
  tick: CustomTickFn,
  options: CustomOptions = {}
): AnimateController {
  const { duration, from, ...hooks } = options;
  return new CustomController(value, tick, duration, { ...hooks, from });
}
