import { Animation } from "./Animation";
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
  _delay: number;
  _easing: (value: number) => number;
  _onFrame: (value: number) => void;
  _animationFrame: any;
  _timeout: any;
  _position: number;

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
    this._easing = config.easing !== undefined ? config.easing : Easing.linear;
    this._duration = config.duration !== undefined ? config.duration : 500;
    this._delay = config.delay !== undefined ? config.delay : 0;
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

  start({
    toValue,
    onFrame,
    onEnd,
  }: {
    toValue: number;
    duration: number;
    onFrame: (value: number) => void;
    onEnd?: (result: { finished: boolean }) => void;
  }) {
    this._active = true;

    this._onFrame = onFrame;
    this._onEnd = onEnd;

    var start = () => {
      this._toValue = toValue;

      if (this._duration === 0) {
        this._onFrame(this._toValue);
        this._debounceOnEnd({ finished: true });
      } else {
        this._startTime = Date.now();
        this._animationFrame = RequestAnimationFrame.current(
          this.onUpdate.bind(this)
        );
      }
    };

    if (this._active) {
      if (this._toValue !== toValue) {
        this._fromValue = this._position;
        start();
      }
    } else {
      start();
    }
  }
}
