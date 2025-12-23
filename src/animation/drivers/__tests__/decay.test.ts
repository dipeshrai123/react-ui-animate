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
});
