import { MotionValue } from '../MotionValue';
import { AnimationController } from './AnimationController';
import { createInterpolatedDriver } from './createInterpolatedDriver';

interface SpringOpts {
  stiffness?: number;
  damping?: number;
  mass?: number;
  onStart?(): void;
  onPause?(): void;
  onResume?(): void;
  onComplete?(): void;
  onChange?(value: number): void;
}

class SpringController implements AnimationController {
  private velocity = 0;
  private frameId!: number;
  private startTime: number;
  private position: number;
  private startPosition: number;
  private restDisplacement: number = 0.001;
  private restSpeed: number = 0.001;

  private isPaused = false;
  private isCancelled = false;

  constructor(
    private mv: MotionValue<number>,
    private to: number,
    private stiffness: number,
    private damping: number,
    private mass: number,
    private hooks: SpringOpts
  ) {}

  start() {
    const prev = this.mv.getAnimationController();

    if (prev instanceof SpringController) {
      this.position = prev.position;
      this.velocity = prev.velocity;
      this.startTime = prev.startTime;
    } else {
      this.position = this.startPosition = this.mv.current;
      this.velocity = 0;
      this.startTime = Date.now();
    }

    this.hooks.onStart?.();
    this.mv.setAnimationController(this);

    this.isPaused = false;
    this.isCancelled = false;

    this.frameId = requestAnimationFrame(this.animate);
  }

  private animate = () => {
    if (this.isCancelled || this.isPaused) return;

    const now = Date.now();
    const deltaTime = Math.min(now - this.startTime, 64);
    this.startTime = now;

    const c = this.damping;
    const m = this.mass;
    const k = this.stiffness;

    const v0 = -this.velocity;
    const x0 = this.to - this.position;

    const zeta = c / (2 * Math.sqrt(k * m));
    const omega0 = Math.sqrt(k / m);
    const omega1 = omega0 * Math.sqrt(1 - zeta ** 2);

    const t = deltaTime / 1000;

    const sin1 = Math.sin(omega1 * t);
    const cos1 = Math.cos(omega1 * t);

    const underDampedEnvelope = Math.exp(-zeta * omega0 * t);
    const underDampedFrag1 =
      underDampedEnvelope *
      (sin1 * ((v0 + zeta * omega0 * x0) / omega1) + x0 * cos1);

    const underDampedPosition = this.to - underDampedFrag1;
    const underDampedVelocity =
      zeta * omega0 * underDampedFrag1 -
      underDampedEnvelope *
        (cos1 * (v0 + zeta * omega0 * x0) - omega1 * x0 * sin1);

    const criticallyDampedEnvelope = Math.exp(-omega0 * t);
    const criticallyDampedPosition =
      this.to - criticallyDampedEnvelope * (x0 + (v0 + omega0 * x0) * t);

    const criticallyDampedVelocity =
      criticallyDampedEnvelope *
      (v0 * (t * omega0 - 1) + t * x0 * omega0 * omega0);

    this.mv._internalSet(this.position);
    this.hooks.onChange?.(this.position);

    const isVelocity = Math.abs(this.velocity) < this.restSpeed;

    const isDisplacement =
      this.stiffness === 0 ||
      Math.abs(this.to - this.position) < this.restDisplacement;

    if (zeta < 1) {
      this.position = underDampedPosition;
      this.velocity = underDampedVelocity;
    } else {
      this.position = criticallyDampedPosition;
      this.velocity = criticallyDampedVelocity;
    }

    if (isVelocity && isDisplacement) {
      this.velocity = 0;
      this.position = this.to;

      this.mv._internalSet(this.position);
      this.hooks.onChange?.(this.position);
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
    this.velocity = 0;
    this.position = this.startPosition;
    this.startTime = Date.now();
    this.mv.reset();
  }

  setOnComplete(fn: () => void) {
    this.hooks.onComplete = fn;
  }
}

export function spring(
  mv: MotionValue<number | string>,
  to: number | string,
  opts: SpringOpts = {}
): AnimationController {
  return createInterpolatedDriver(mv, to, opts, (m, t, o) => {
    const { stiffness = 170, damping = 14, mass = 1, ...hooks } = o;
    return new SpringController(m, t, stiffness, damping, mass, hooks);
  });
}
