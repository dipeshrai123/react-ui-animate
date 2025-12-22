import { MotionValue } from '../../MotionValue';
import { decay } from '../../drivers/decay';

describe('decay driver (using fake timers)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls onStart, onChange repeatedly, then onComplete once', () => {
    const mv = new MotionValue(0);
    const onStart = jest.fn();
    const onChange = jest.fn();
    const onComplete = jest.fn();

    const ctrl = decay(mv, 10, {
      decay: 0.9,
      onStart,
      onChange,
      onComplete,
    });

    ctrl.start();
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(mv.getAnimationController()).toBe(ctrl);

    for (let i = 0; i < 500; i++) {
      jest.advanceTimersByTime(16);
      if (onComplete.mock.calls.length) break;
    }

    expect(onChange).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(mv.current).toBeGreaterThan(0);
  });

  it('respects clamp bounds', () => {
    const mv = new MotionValue(0);
    const onChange = jest.fn();
    const onComplete = jest.fn();

    const ctrl = decay(mv, 20, {
      decay: 0.5,
      clamp: [0, 5],
      onChange,
      onComplete,
    });
    ctrl.start();

    jest.advanceTimersByTime(1000);

    expect(mv.current).toBeLessThanOrEqual(5);

    expect(onChange).toHaveBeenCalled();

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toBeLessThanOrEqual(5);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('reset() snaps back to the initial value and stops any further updates', () => {
    const mv = new MotionValue(0);
    const ctrl = decay(mv, 10, { decay: 0.9 });
    ctrl.start();

    jest.advanceTimersByTime(100);
    expect(mv.current).not.toBe(0);

    ctrl.reset();
    expect(mv.current).toBe(0);

    jest.advanceTimersByTime(1000);
    expect(mv.current).toBe(0);
  });
});
