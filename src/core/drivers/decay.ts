import { AnimateValue } from '../AnimateValue';
import type { AnimateController, AnimateHooks } from './AnimateController';

interface DecayOptions extends AnimateHooks {
  decay?: number;
  clamp?: [number, number];
  onChange?(value: number): void;
}

class DecayController implements AnimateController {
  private startTime: number;
  private from: number;
  private frameId: number;
  private position: number;
  private readonly restSpeed = 0.01;
  private isPaused = false;
  private isCancelled = false;
  private pausedAt = 0;
  private clampBounds?: [number, number];

  constructor(
    private value: AnimateValue<number>,
    private velocity: number,
    private deceleration: number,
    private hooks: DecayOptions
  ) {
    this.clampBounds = hooks.clamp;
  }

  start() {
    const previous = this.value.getAnimationController();

    if (previous instanceof DecayController) {
      this.velocity = previous.velocity;
      this.deceleration = previous.deceleration;
    }

    this.hooks.onStart?.();
    this.value.setAnimationController(this);

    this.isPaused = false;
    this.isCancelled = false;

    this.from = this.position = this.value.current;
    this.startTime = performance.now();

    this.frameId = requestAnimationFrame(this.animate);
  }

  private animate = (now: number) => {
    if (this.isCancelled || this.isPaused) return;

    const elapsed = now - this.startTime;
    const k = 1 - this.deceleration;
    const currentVelocity = this.velocity * Math.exp(-k * elapsed);

    this.position = this.from + (this.velocity / k) * (1 - Math.exp(-k * elapsed));

    if (this.clampBounds) {
      const [min, max] = this.clampBounds;
      if (this.position < min) {
        this.position = min;
      } else if (this.position > max) {
        this.position = max;
      }
    }

    this.value._internalSet(this.position);
    this.hooks.onChange?.(this.position);

    if (Math.abs(currentVelocity) > this.restSpeed) {
      this.frameId = requestAnimationFrame(this.animate);
    } else {
      cancelAnimationFrame(this.frameId);
      this.hooks.onChange?.(this.position);
      this.hooks.onComplete?.();
    }
  };

  pause() {
    if (this.isCancelled || this.isPaused) return;

    this.isPaused = true;
    this.pausedAt = performance.now();
    cancelAnimationFrame(this.frameId);
    this.hooks.onPause?.();
  }

  resume() {
    if (this.isCancelled || !this.isPaused) return;
    const now = performance.now();

    this.startTime += now - this.pausedAt;

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
    this.pausedAt = 0;
    this.startTime = 0;
  }

  setOnComplete(fn: () => void): void {
    this.hooks.onComplete = fn;
  }
}

export function decay(
  value: AnimateValue<number>,
  velocity: number,
  options: DecayOptions = {}
): DecayController {
  const { decay = 0.998, ...hooks } = options;
  return new DecayController(value, velocity, decay, hooks);
}
