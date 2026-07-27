import { AnimateValue } from '../values/AnimateValue';
import { isReducedMotionEnabled } from '../utils/reducedMotion';
import type { AnimateController, AnimateHooks } from './AnimateController';

interface SpringOptions extends AnimateHooks {
  stiffness?: number;
  damping?: number;
  mass?: number;
  from?: number;
  onChange?(value: number): void;
}

type DriverFactory = (
  value: AnimateValue<number>,
  target: number,
  options: SpringOptions
) => AnimateController;

function withInterpolation(
  value: AnimateValue<number | string>,
  target: number | string,
  options: SpringOptions,
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
        `[spring] Cannot animate from "${value.current}" to "${target}": ${err.message}`,
        { cause: err }
      );
    }
  }

  throw new Error(
    `[spring] Unsupported type: ${typeof value.current} → ${typeof target}`
  );
}

class SpringController implements AnimateController {
  private velocity = 0;
  private frameId!: number;
  private startTime: number;
  private position: number;
  private startPosition: number;
  private readonly restDisplacement = 0.001;
  private readonly restSpeed = 0.001;
  private isPaused = false;
  private isCancelled = false;
  private explicitFrom?: number;

  constructor(
    private value: AnimateValue<number>,
    private target: number,
    private stiffness: number,
    private damping: number,
    private mass: number,
    private hooks: SpringOptions
  ) {
    this.explicitFrom = hooks.from;
  }

  start() {
    if (this.explicitFrom !== undefined) {
      this.position = this.startPosition = this.explicitFrom;
      this.value._internalSet(this.explicitFrom);
      this.velocity = 0;
      this.startTime = Date.now();
    } else {
      // Skip cancelled controllers when inheriting — their position can lag value.current
      // by a frame and flash the element back to a stale coordinate.
      const previous = this.value.getAnimationController();

      if (previous instanceof SpringController && !previous.isCancelled) {
        this.position = previous.position;
        this.velocity = previous.velocity;
        this.startTime = previous.startTime;
      } else {
        this.position = this.startPosition = this.value.current;
        this.velocity = 0;
        this.startTime = Date.now();
      }
    }

    this.hooks.onStart?.();
    this.value.setAnimationController(this);

    this.isPaused = false;
    this.isCancelled = false;

    if (isReducedMotionEnabled()) {
      this.velocity = 0;
      this.position = this.target;
      this.value._internalSet(this.position);
      this.hooks.onChange?.(this.position);
      this.hooks.onComplete?.();
      return;
    }

    this.frameId = requestAnimationFrame(this.animate);
  }

  // Never zero velocity here — that caused 1-frame settle hitches when Reorder
  // cancelled/restarted the spring on every swap.
  shiftBy(delta: number) {
    if (delta === 0) return;
    this.position += delta;
    this.startPosition += delta;
    this.value._internalSet(this.value.current + delta);
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
    const x0 = this.target - this.position;

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

    const underDampedPosition = this.target - underDampedFrag1;
    const underDampedVelocity =
      zeta * omega0 * underDampedFrag1 -
      underDampedEnvelope *
        (cos1 * (v0 + zeta * omega0 * x0) - omega1 * x0 * sin1);

    const criticallyDampedEnvelope = Math.exp(-omega0 * t);
    const criticallyDampedPosition =
      this.target - criticallyDampedEnvelope * (x0 + (v0 + omega0 * x0) * t);

    const criticallyDampedVelocity =
      criticallyDampedEnvelope *
      (v0 * (t * omega0 - 1) + t * x0 * omega0 * omega0);

    const nextPosition =
      zeta < 1 ? underDampedPosition : criticallyDampedPosition;
    const nextVelocity =
      zeta < 1 ? underDampedVelocity : criticallyDampedVelocity;

    // Settles against the upcoming sample, not the current one — publishing an overshoot
    // frame then snapping back was the vertical glitch Reorder showed near settle.
    const isVelocity = Math.abs(nextVelocity) < this.restSpeed;
    const isDisplacement =
      this.stiffness === 0 ||
      Math.abs(this.target - nextPosition) < this.restDisplacement;

    const isSettled = isVelocity && isDisplacement;

    this.position = isSettled ? this.target : nextPosition;
    this.velocity = isSettled ? 0 : nextVelocity;

    this.value._internalSet(this.position);
    this.hooks.onChange?.(this.position);

    if (isSettled) {
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
  }

  setOnComplete(fn: () => void) {
    this.hooks.onComplete = fn;
  }
}

export function spring(
  value: AnimateValue<number> | AnimateValue<string> | AnimateValue<number | string>,
  target: number | string,
  options: SpringOptions = {}
): AnimateController {
  return withInterpolation(
    value as AnimateValue<number | string>,
    target,
    options,
    (v, t, opts) => {
      const { stiffness = 170, damping = 14, mass = 1, from, ...hooks } = opts;
      return new SpringController(v, t, stiffness, damping, mass, { ...hooks, from });
    }
  );
}
