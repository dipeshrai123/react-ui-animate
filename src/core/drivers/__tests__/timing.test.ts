import { MotionValue } from '../../MotionValue';
import { timing } from '../../drivers/timing';

describe('timing driver', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('animates from 0 → 100 and calls onComplete once', () => {
    const mv = new MotionValue(0);
    const onChange = jest.fn();
    const onComplete = jest.fn();

    timing(mv, 100, {
      duration: 100,
      easing: (t) => t,
      onChange,
      onComplete,
    }).start();

    for (let t = 0; t < 1000; t += 16) {
      jest.advanceTimersByTime(16);
      if (mv.current === 100) break;
    }

    expect(mv.current).toBeCloseTo(100, 1);
    expect(onChange).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('zero duration should complete immediately', () => {
    const mv = new MotionValue(0);
    const onChange = jest.fn();
    const onComplete = jest.fn();

    timing(mv, 200, {
      duration: 0,
      onChange,
      onComplete,
    }).start();

    jest.advanceTimersByTime(16);

    expect(mv.current).toBe(200);
    expect(onChange).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('reset() should snap back to original value', () => {
    const mv = new MotionValue(0);
    const ctrl = timing(mv, 50, { duration: 100 });
    ctrl.start();

    jest.advanceTimersByTime(40);
    expect(mv.current).not.toBe(0);

    ctrl.reset();
    expect(mv.current).toBe(0);
  });
});
