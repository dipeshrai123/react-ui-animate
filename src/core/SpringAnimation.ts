import { Animation, ResultType } from "./Animation";
import {
  RequestAnimationFrame,
  CancelAnimationFrame,
} from "./RequestAnimationFrame";
import { UseTransitionConfig } from "./useTransition";

/**
 * SpringAnimation class implements physics based spring animation
 */
export class SpringAnimation extends Animation {
  _overshootClamping: boolean;
  _restDisplacementThreshold: number;
  _restSpeedThreshold: number;
  _initialVelocity?: number;
  _lastVelocity: number;
  _startPosition: number;
  _lastPosition: number;
  _fromValue: number;
  _toValue: any;
  _mass: number;
  _tension: number;
  _friction: number;
  _lastTime: number;
  _onFrame: (value: number) => void;
  _animationFrame: any;

  // Modifiers
  _immediate: boolean;
  _delay: number;
  _onRest?: (value: ResultType) => void;

  constructor({
    initialPosition,
    config,
  }: {
    initialPosition: number;
    config?: Omit<UseTransitionConfig, "duration" | "easing">;
  }) {
    super();

    this._overshootClamping = false;
    this._restDisplacementThreshold = 0.001;
    this._restSpeedThreshold = 0.001;
    this._initialVelocity = 0;
    this._lastVelocity = 0;

    this._startPosition = initialPosition;
    this._lastPosition = this._startPosition;
    this._mass = config?.mass ?? 1;
    this._tension = config?.tension ?? 170;
    this._friction = config?.friction ?? 26;

    // Modifiers
    this._immediate = config?.immediate ?? false;
    this._delay = config?.delay ?? 0;
    this._onRest = config?.onRest;
  }

  onUpdate() {
    var position = this._lastPosition;
    var velocity = this._lastVelocity;

    var tempPosition = this._lastPosition;
    var tempVelocity = this._lastVelocity;

    var MAX_STEPS = 64;
    var now = Date.now();
    if (now > this._lastTime + MAX_STEPS) {
      now = this._lastTime + MAX_STEPS;
    }

    var TIMESTEP_MSEC = 1;
    var numSteps = Math.floor((now - this._lastTime) / TIMESTEP_MSEC);

    for (var i = 0; i < numSteps; ++i) {
      var step = TIMESTEP_MSEC / 1000;

      var aVelocity = velocity;
      var aAcceleration =
        this._tension * (this._toValue - tempPosition) -
        this._friction * tempVelocity;

      var bVelocity = tempVelocity;
      var bAcceleration =
        this._tension * (this._toValue - tempPosition) -
        this._friction * tempVelocity;
      tempPosition = position + (bVelocity * step) / 2;
      tempVelocity = velocity + (bAcceleration * step) / 2;

      var cVelocity = tempVelocity;
      var cAcceleration =
        this._tension * (this._toValue - tempPosition) -
        this._friction * tempVelocity;
      tempPosition = position + (cVelocity * step) / 2;
      tempVelocity = velocity + (cAcceleration * step) / 2;

      var dVelocity = tempVelocity;
      var dAcceleration =
        this._tension * (this._toValue - tempPosition) -
        this._friction * tempVelocity;
      tempPosition = position + (cVelocity * step) / 2;
      tempVelocity = velocity + (cAcceleration * step) / 2;

      var dxdt = (aVelocity + 2 * (bVelocity + cVelocity) + dVelocity) / 6;
      var dvdt =
        (aAcceleration + 2 * (bAcceleration + cAcceleration) + dAcceleration) /
        6;

      position += dxdt * step;
      velocity += dvdt * step;
    }

    this._lastTime = now;
    this._lastPosition = position;
    this._lastVelocity = velocity;

    this._onFrame(position);

    if (!this._active) {
      return;
    }

    var isOvershooting = false;
    if (this._overshootClamping && this._tension !== 0) {
      if (this._startPosition < this._toValue) {
        isOvershooting = position > this._toValue;
      } else {
        isOvershooting = position < this._toValue;
      }
    }
    var isVelocity = Math.abs(velocity) <= this._restSpeedThreshold;
    var isDisplacement = true;
    if (this._tension !== 0) {
      isDisplacement =
        Math.abs(this._toValue - position) <= this._restDisplacementThreshold;
    }

    if (isOvershooting || (isVelocity && isDisplacement)) {
      if (this._tension !== 0) {
        this._lastVelocity = 0;
        this._lastPosition = this._toValue;

        this._onFrame(this._toValue);
      }

      this._lastTime = 0; // reset time

      this._debounceOnEnd({ finished: true, value: this._toValue });
      return;
    }

    this._animationFrame = RequestAnimationFrame.current(
      this.onUpdate.bind(this)
    );
  }

  stop() {
    this._active = false;
    CancelAnimationFrame.current(this._animationFrame);
    this._debounceOnEnd({ finished: false, value: this._lastPosition });
  }

  // Set value
  set(toValue: number) {
    this.stop();
    this._lastPosition = toValue;
    this._lastTime = 0;
    this._lastVelocity = 0;
    this._onFrame(toValue);
  }

  start({
    toValue,
    onFrame,
    previousAnimation,
    onEnd,
    immediate,
  }: {
    toValue: number;
    onFrame: (value: number) => void;
    previousAnimation?: SpringAnimation;
    onEnd?: (result: ResultType) => void;
    immediate?: boolean;
  }) {
    const onStart: any = () => {
      this._onFrame = onFrame;

      // set immediate here
      if (immediate !== undefined) {
        this._immediate = immediate;
      }

      if (this._immediate) {
        this.set(toValue);
      } else {
        this._active = true;
        this._toValue = toValue;

        // overriding this._onEnd if passed onEnd on start method
        if (onEnd !== undefined) {
          this._onEnd = onEnd;
        } else {
          // re-assign this._onEnd with onRest from config,
          // because the this._onEnd is nullified on debounce end.
          if (this._onRest !== undefined) {
            this._onEnd = this._onRest;
          }
        }

        const now = Date.now();

        if (previousAnimation instanceof SpringAnimation) {
          this._lastVelocity =
            previousAnimation._lastVelocity || this._lastVelocity || 0;
          this._lastTime = previousAnimation._lastTime || now;
        } else {
          this._lastTime = now;
        }

        this.onUpdate();
      }
    };

    if (this._delay !== 0) {
      setTimeout(() => onStart(), this._delay);
    } else {
      onStart();
    }
  }
}
