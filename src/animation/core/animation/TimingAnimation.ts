import { Animation } from './Animation';
import {
  RequestAnimationFrame,
  CancelAnimationFrame,
} from './RequestAnimationFrame';
import { Easing } from '../easing/Easing';
import type { TransitionValueConfig, ResultType } from '../types';

/**
 * Class implementing timing based animation
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
  _lastPosition: number;
  _position: number;

  // Modifiers
  _delay: number;
  _tempDuration: number;
  _onRest?: (value: ResultType) => void;
  _onChange?: (value: number) => void;

  constructor({
    initialPosition,
    config,
  }: {
    initialPosition: number;
    config?: Omit<TransitionValueConfig, 'mass' | 'friction' | 'tension'>;
  }) {
    super();

    this._fromValue = initialPosition;
    this._position = this._fromValue;
    this._easing = config?.easing ?? Easing.linear;
    this._duration = config?.duration ?? 500;
    this._tempDuration = this._duration;

    // Modifiers
    // here immediate acts like duration: 0
    if (config?.immediate) {
      this._duration = 0;
    }

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
    const now = Date.now();

    const runTime = now - this._startTime;

    if (runTime >= this._duration) {
      this._startTime = 0;
      this._position = this._toValue;

      this.onChange(this._position);

      this._debounceOnEnd({ finished: true, value: this._position });
      return;
    }

    const progress = this._easing(runTime / this._duration);

    this._position =
      this._fromValue + (this._toValue - this._fromValue) * progress;

    this.onChange(this._position);

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
    previousAnimation?: TimingAnimation;
    onEnd?: (result: ResultType) => void;
  }) {
    const onStart: any = () => {
      this._onFrame = onFrame;
      this._active = true;
      this._onEnd = onEnd;
      this._toValue = toValue;

      if (
        previousAnimation &&
        previousAnimation instanceof TimingAnimation &&
        previousAnimation._toValue === toValue &&
        previousAnimation._startTime
      ) {
        this._startTime = previousAnimation._startTime;
        this._fromValue = previousAnimation._fromValue;
      } else {
        const now = Date.now();
        this._startTime = now;
        this._fromValue = this._position;
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
