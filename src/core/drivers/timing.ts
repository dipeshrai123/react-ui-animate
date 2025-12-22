import { Easing } from '../easing/Easing';
import { MotionValue } from '../MotionValue';
import { AnimationController } from './AnimationController';
import { createInterpolatedDriver } from './createInterpolatedDriver';

interface TimingOpts {
  duration?: number;
  easing?: (t: number) => number;
  onStart?(): void;
  onPause?(): void;
  onResume?(): void;
  onComplete?(): void;
  onChange?: (value: number) => void;
}

class TimingController implements AnimationController {
  private startTime: number;
  private frameId: number;
  private from: number;
  private position: number;

  private isPaused = false;
  private isCancelled = false;
  private pausedAt: number | null = null;
  private elapsedBeforePause = 0;

  constructor(
    private mv: MotionValue<number>,
    private to: number,
    private duration: number = 300,
    private easing: (t: number) => number = Easing.linear,
    private hooks: Omit<TimingOpts, 'duration' | 'easing' | 'delay'>
  ) {}

  start() {
    const prev = this.mv.getAnimationController();

    if (
      prev instanceof TimingController &&
      !prev.isCancelled &&
      prev.to === this.to &&
      prev.startTime
    ) {
      this.from = prev.from;
      this.startTime = prev.startTime;
    } else {
      this.from = this.position = this.mv.current;
      this.startTime = performance.now();
    }

    this.hooks.onStart?.();
    this.mv.setAnimationController(this);

    this.isPaused = false;
    this.isCancelled = false;
    this.pausedAt = null;
    this.elapsedBeforePause = 0;

    this.frameId = requestAnimationFrame(this.animate);
  }

  private animate = (ts: number) => {
    if (this.isCancelled || this.isPaused) return;

    const elapsed = this.elapsedBeforePause + (ts - this.startTime);

    let rawT = elapsed / this.duration;
    if (!Number.isFinite(rawT)) rawT = rawT === Infinity ? 1 : 0;
    const t = Math.min(1, Math.max(0, rawT));

    if (t < 1) {
      this.position = this.from + (this.to - this.from) * this.easing(t);
      this.mv._internalSet(this.position);
      this.hooks.onChange?.(this.position);
      this.frameId = requestAnimationFrame(this.animate);
    } else {
      this.position = this.to;
      this.mv._internalSet(this.position);
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
    cancelAnimationFrame(this.frameId);
    this.mv.reset();
  }

  setOnComplete(fn: () => void) {
    this.hooks.onComplete = fn;
  }
}

export function timing(
  mv: MotionValue<number | string>,
  to: number | string,
  opts: TimingOpts = {}
): AnimationController {
  return createInterpolatedDriver(mv, to, opts, (m, t, o) => {
    const { duration = 300, easing = Easing.linear, ...hooks } = o;
    return new TimingController(m, t, duration, easing, hooks);
  });
}
