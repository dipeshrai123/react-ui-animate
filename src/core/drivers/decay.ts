import { MotionValue } from '../MotionValue';
import { AnimationController } from './AnimationController';

interface DecayOpts {
  decay?: number;
  clamp?: [number, number];
  onStart?(): void;
  onPause?(): void;
  onResume?(): void;
  onComplete?(): void;
  onChange?(value: number): void;
}

class DecayController implements AnimationController {
  private startTime: number;
  private from: number;
  private frameId: number;
  private position: number;
  private restSpeed: number = 0.01;

  private isPaused = false;
  private isCancelled = false;
  private pausedAt = 0;
  private clampBounds?: [number, number];

  constructor(
    private mv: MotionValue<number>,
    private velocity: number,
    private deceleration: number,
    private hooks: DecayOpts
  ) {
    this.clampBounds = hooks.clamp;
  }

  start() {
    const prev = this.mv.getAnimationController();

    if (prev instanceof DecayController) {
      this.velocity = prev.velocity;
      this.deceleration = prev.deceleration;
    }

    this.hooks.onStart?.();
    this.mv.setAnimationController(this);

    this.isPaused = false;
    this.isCancelled = false;

    this.from = this.position = this.mv.current;
    this.startTime = performance.now();

    this.frameId = requestAnimationFrame(this.animate);
  }

  private animate = (now: number) => {
    if (this.isCancelled || this.isPaused) return;

    const t = now - this.startTime;
    const k = 1 - this.deceleration;

    const vNow = this.velocity * Math.exp(-k * t);

    this.position = this.from + (this.velocity / k) * (1 - Math.exp(-k * t));

    if (this.clampBounds) {
      const [min, max] = this.clampBounds;

      if (this.position < min) {
        this.position = min;
      } else if (this.position > max) {
        this.position = max;
      }
    }

    this.mv._internalSet(this.position);
    this.hooks.onChange?.(this.position);

    if (Math.abs(vNow) > this.restSpeed) {
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
    this.mv.reset();
    this.startTime = 0;
  }

  setOnComplete(fn: () => void): void {
    this.hooks.onComplete = fn;
  }
}

export function decay(
  mv: MotionValue<number>,
  velocity: number,
  opts: DecayOpts = {}
): DecayController {
  const { decay = 0.998, ...hooks } = opts;
  const ctl = new DecayController(mv, velocity, decay, hooks);
  return ctl;
}
