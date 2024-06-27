import { Animation } from './Animation';
import {
  RequestAnimationFrame,
  CancelAnimationFrame,
} from './RequestAnimationFrame';
import type { FluidValueConfig, ResultType } from '../types/animation';

/**
 * Class implementing spring based animation
 */
export class SpringAnimation extends Animation {
  _overshootClamping: boolean;
  _restDisplacementThreshold: number;
  _restSpeedThreshold: number;
  _initialVelocity?: number;
  _lastVelocity: number;
  _startPosition: number;
  _lastPosition: number;
  _position: number;
  _fromValue: number;
  _toValue: any;
  _mass: number;
  _tension: number;
  _friction: number;
  _lastTime: number;
  _onFrame: (value: number) => void;
  _animationFrame: any;
  _timeout: any;

  // Modifiers
  _delay: number;
  _onRest?: (value: ResultType) => void;
  _onChange?: (value: number) => void;

  constructor({
    initialPosition,
    config,
  }: {
    initialPosition: number;
    config?: Omit<FluidValueConfig, 'duration' | 'easing'>;
  }) {
    super();

    this._overshootClamping = false;
    this._initialVelocity = 0;
    this._lastVelocity = 0;
    this._startPosition = initialPosition;
    this._position = this._startPosition;

    this._restDisplacementThreshold = config?.restDistance ?? 0.001;
    this._restSpeedThreshold = config?.restDistance ?? 0.001;
    this._mass = config?.mass ?? 1;
    this._tension = config?.tension ?? 170;
    this._friction = config?.friction ?? 26;
    this._delay = config?.delay ?? 0;

    this._onRest = config?.onRest;
    this._onChange = config?.onChange;
  }

  onChange(value: number) {
    this._onFrame(value);

    if (this._lastPosition !== value) {
      if (this._onChange) {
        this._onChange(value);
      }
    }

    this._lastPosition = value;
  }

  onUpdate() {
    var now = Date.now();

    const deltaTime = Math.min(now - this._lastTime, 64);
    this._lastTime = now;

    const c = this._friction;
    const m = this._mass;
    const k = this._tension;

    const v0 = -this._lastVelocity;
    const x0 = this._toValue - this._position;

    const zeta = c / (2 * Math.sqrt(k * m)); // damping ratio
    const omega0 = Math.sqrt(k / m); // undamped angular frequency of the oscillator (rad/ms)
    const omega1 = omega0 * Math.sqrt(1 - zeta ** 2); // exponential decay

    const t = deltaTime / 1000;

    const sin1 = Math.sin(omega1 * t);
    const cos1 = Math.cos(omega1 * t);

    // under damped
    const underDampedEnvelope = Math.exp(-zeta * omega0 * t);
    const underDampedFrag1 =
      underDampedEnvelope *
      (sin1 * ((v0 + zeta * omega0 * x0) / omega1) + x0 * cos1);

    const underDampedPosition = this._toValue - underDampedFrag1;
    // This looks crazy -- it's actually just the derivative of the oscillation function
    const underDampedVelocity =
      zeta * omega0 * underDampedFrag1 -
      underDampedEnvelope *
        (cos1 * (v0 + zeta * omega0 * x0) - omega1 * x0 * sin1);

    // critically damped
    const criticallyDampedEnvelope = Math.exp(-omega0 * t);
    const criticallyDampedPosition =
      this._toValue - criticallyDampedEnvelope * (x0 + (v0 + omega0 * x0) * t);

    const criticallyDampedVelocity =
      criticallyDampedEnvelope *
      (v0 * (t * omega0 - 1) + t * x0 * omega0 * omega0);

    this.onChange(this._position);

    const isOvershooting = () => {
      if (this._overshootClamping && this._tension !== 0) {
        return this._position < this._toValue
          ? this._position > this._toValue
          : this._position < this._toValue;
      } else {
        return false;
      }
    };

    const isVelocity = Math.abs(this._lastVelocity) < this._restSpeedThreshold;
    const isDisplacement =
      this._tension === 0 ||
      Math.abs(this._toValue - this._position) <
        this._restDisplacementThreshold;

    if (zeta < 1) {
      this._position = underDampedPosition;
      this._lastVelocity = underDampedVelocity;
    } else {
      this._position = criticallyDampedPosition;
      this._lastVelocity = criticallyDampedVelocity;
    }

    if (isOvershooting() || (isVelocity && isDisplacement)) {
      if (this._tension !== 0) {
        this._lastVelocity = 0;
        this._position = this._toValue;

        this.onChange(this._position);
      }
      // clear lastTimestamp to avoid using stale value by the next spring animation that starts after this one
      this._lastTime = 0;

      this._debounceOnEnd({ finished: true, value: this._toValue });

      return;
    }

    this._animationFrame = RequestAnimationFrame.current(
      this.onUpdate.bind(this)
    );
  }

  stop() {
    this._active = false;
    clearTimeout(this._timeout);
    CancelAnimationFrame.current(this._animationFrame);
    this._debounceOnEnd({ finished: false, value: this._position });
  }

  // Set value
  set(toValue: number) {
    this.stop();
    this._position = toValue;
    this._lastTime = 0;
    this._lastVelocity = 0;
    this.onChange(toValue);
  }

  start({
    toValue,
    onFrame,
    previousAnimation,
    onEnd,
  }: {
    toValue: number;
    onFrame: (value: number) => void;
    previousAnimation?: SpringAnimation;
    onEnd?: (result: ResultType) => void;
  }) {
    const onStart: any = () => {
      this._onFrame = onFrame;
      this._active = true;
      this._toValue = toValue;
      this._onEnd = onEnd;

      const now = Date.now();

      if (previousAnimation instanceof SpringAnimation) {
        this._lastVelocity =
          previousAnimation._lastVelocity || this._lastVelocity || 0;
        this._lastTime = previousAnimation._lastTime || now;
      } else {
        this._lastTime = now;
      }

      this._animationFrame = RequestAnimationFrame.current(
        this.onUpdate.bind(this)
      );
    };

    if (this._delay !== 0) {
      this._timeout = setTimeout(() => onStart(), this._delay);
    } else {
      onStart();
    }
  }
}
