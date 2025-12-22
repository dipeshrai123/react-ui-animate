import { AnimateValue } from '../../AnimateValue';
import { timing } from '../timing';

describe('timing', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('animates from 0 → 100 and calls onComplete once', () => {
    const value = new AnimateValue<number | string>(0);
    const onChange = jest.fn();
    const onComplete = jest.fn();

    timing(value, 100, {
      duration: 100,
      easing: (t) => t,
      onChange,
      onComplete,
    }).start();

    for (let t = 0; t < 1000; t += 16) {
      jest.advanceTimersByTime(16);
      if (value.current === 100) break;
    }

    expect(value.current).toBeCloseTo(100, 1);
    expect(onChange).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('zero duration should complete immediately', () => {
    const value = new AnimateValue<number | string>(0);
    const onChange = jest.fn();
    const onComplete = jest.fn();

    timing(value, 200, {
      duration: 0,
      onChange,
      onComplete,
    }).start();

    jest.advanceTimersByTime(16);

    expect(value.current).toBe(200);
    expect(onChange).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('reset() should snap back to original value', () => {
    const value = new AnimateValue<number | string>(0);
    const controller = timing(value, 50, { duration: 100 });
    controller.start();

    jest.advanceTimersByTime(40);
    expect(value.current).not.toBe(0);

    controller.reset();
    expect(value.current).toBe(0);
  });
});
