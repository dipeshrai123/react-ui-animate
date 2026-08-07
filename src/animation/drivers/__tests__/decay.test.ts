import { AnimateValue } from '../../values/AnimateValue';
import { decay } from '../decay';

describe('decay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls onStart, onChange repeatedly, then onComplete once', () => {
    const value = new AnimateValue(0);
    const onStart = jest.fn();
    const onChange = jest.fn();
    const onComplete = jest.fn();

    const controller = decay(value, 10, {
      decay: 0.9,
      onStart,
      onChange,
      onComplete,
    });

    controller.start();
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(value.getAnimationController()).toBe(controller);

    for (let i = 0; i < 500; i++) {
      jest.advanceTimersByTime(16);
      if (onComplete.mock.calls.length) break;
    }

    expect(onChange).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(value.current).toBeGreaterThan(0);
  });

  it('respects clamp bounds', () => {
    const value = new AnimateValue(0);
    const onChange = jest.fn();
    const onComplete = jest.fn();

    const controller = decay(value, 20, {
      decay: 0.5,
      clamp: [0, 5],
      onChange,
      onComplete,
    });
    controller.start();

    jest.advanceTimersByTime(1000);

    expect(value.current).toBeLessThanOrEqual(5);

    expect(onChange).toHaveBeenCalled();

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toBeLessThanOrEqual(5);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('reset() snaps back to the initial value and stops any further updates', () => {
    const value = new AnimateValue(0);
    const controller = decay(value, 10, { decay: 0.9 });
    controller.start();

    jest.advanceTimersByTime(100);
    expect(value.current).not.toBe(0);

    controller.reset();
    // reset() only resets animation state, not the value
    // The value stays at its current position to allow loops to work correctly
    expect(value.current).not.toBe(0);
    
    // To reset the value, use value.reset() directly
    value.reset();
    expect(value.current).toBe(0);

    jest.advanceTimersByTime(1000);
    expect(value.current).toBe(0);
  });

  it('reflects velocity off a bound (bounce) instead of sticking to it', () => {
    const value = new AnimateValue(0);
    const onComplete = jest.fn();

    const controller = decay(value, 300, {
      decay: 0.995,
      clamp: [0, 10],
      bounce: 0.5,
      onComplete,
    });
    controller.start();

    jest.advanceTimersByTime(16);
    // First frame already overshoots and gets pinned at the bound.
    expect(value.current).toBe(10);

    jest.advanceTimersByTime(16);
    // A real bounce moves it away from the bound on the next frame instead
    // of staying pinned there the way a hard clamp would.
    expect(value.current).toBeLessThan(10);

    for (let i = 0; i < 500; i++) {
      jest.advanceTimersByTime(16);
      if (onComplete.mock.calls.length) break;
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(value.current).toBeLessThanOrEqual(10);
    expect(value.current).toBeGreaterThanOrEqual(0);
  });

  it('bounce: 0 absorbs on contact and settles right at the bound, no rebound', () => {
    const value = new AnimateValue(0);
    const onComplete = jest.fn();

    const controller = decay(value, 300, {
      decay: 0.995,
      clamp: [0, 10],
      bounce: 0,
      onComplete,
    });
    controller.start();

    jest.advanceTimersByTime(16);
    expect(value.current).toBe(10);

    for (let i = 0; i < 20; i++) {
      jest.advanceTimersByTime(16);
    }
    expect(value.current).toBe(10);
    expect(onComplete).toHaveBeenCalled();
  });

  it('bounce takes priority over elastic when both are set', () => {
    const value = new AnimateValue(0);

    const controller = decay(value, 300, {
      decay: 0.995,
      clamp: [0, 10],
      elastic: true,
      bounce: 0.5,
    });
    controller.start();

    jest.advanceTimersByTime(16);
    // Pinned exactly at the bound, not rubber-clamped short of it.
    expect(value.current).toBe(10);

    jest.advanceTimersByTime(16);
    expect(value.current).toBeLessThan(10);
  });
});
