import { Animation, ResultType } from "./Animation";
import {
  RequestAnimationFrame,
  CancelAnimationFrame,
} from "./RequestAnimationFrame";
import { UseTransitionConfig } from "./useTransition";
import { Easing } from "./Easing";

/**
 * TimingAnimation class implements duration based spring animation
 */
export class TimingAnimation extends Animation {
  _startTime: number;
  _fromValue: number;
  _toValue: any;
  _duration: number;
  _easing: (value: number) => number;
  _onFrame: (value: number) => void;
  _animationFrame: any;
  _timeout: any;
  _position: number;

  // Modifiers
  _immediate: boolean;
  _delay: number;
  _tempDuration: number;
  _onRest?: (value: any) => void;

  constructor({
    initialPosition,
    config,
  }: {
    initialPosition: number;
    config: Omit<UseTransitionConfig, "mass" | "friction" | "tension">;
  }) {
    super();

    this._fromValue = initialPosition;
    this._position = this._fromValue;
    this._easing = config?.easing ?? Easing.linear;
    this._duration = config?.duration ?? 500;
    this._tempDuration = config?.duration ?? 500;

    // Modifiers
    this._immediate = config?.immediate ?? false;
    this._delay = config?.delay ?? 0;
    this._onRest = config?.onRest;
  }

  onUpdate() {
    var now = Date.now();
    if (now >= this._startTime + this._duration) {
      if (this._duration === 0) {
        this._position = this._toValue;
        this._onFrame(this._position);
      } else {
        this._position =
          this._fromValue + this._easing(1) * (this._toValue - this._fromValue);
        this._onFrame(this._position);
      }
      this._debounceOnEnd({ finished: true, value: this._position });
      return;
    }

    this._position =
      this._fromValue +
      this._easing((now - this._startTime) / this._duration) *
        (this._toValue - this._fromValue);
    this._onFrame(this._position);

    if (this._active) {
      this._animationFrame = RequestAnimationFrame.current(
        this.onUpdate.bind(this)
      );
    }
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
    this._onFrame(toValue);
  }

  start({
    toValue,
    onFrame,
    onEnd,
    immediate,
    duration,
  }: {
    toValue: number;
    onFrame: (value: number) => void;
    onEnd?: (result: ResultType) => void;
    immediate?: boolean;
    duration?: number;
  }) {
    const onStart: any = () => {
      this._onFrame = onFrame;

      // set immediate here
      if (immediate !== undefined) {
        this._immediate = immediate;
      }

      if (duration !== undefined) {
        this._duration = duration;
      } else {
        this._duration = this._tempDuration;
      }

      if (this._immediate) {
        this.set(toValue);
      } else {
        this._active = true;

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

        // animate from lastly animated position to new toValue
        this._fromValue = this._position;
        this._toValue = toValue;

        if (this._duration === 0) {
          this._onFrame(this._toValue);
          this._debounceOnEnd({ finished: true, value: this._toValue });
        } else {
          this._startTime = Date.now();
          this._animationFrame = RequestAnimationFrame.current(
            this.onUpdate.bind(this)
          );
        }
      }
    };

    if (this._delay !== 0) {
      setTimeout(() => onStart(), this._delay);
    } else {
      onStart();
    }
  }
}
