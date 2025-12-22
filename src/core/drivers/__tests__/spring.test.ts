import { MotionValue } from '../../MotionValue';
import { spring } from '../../drivers/spring';

describe('spring driver', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('animates from 0 -> 100 and calls onComplete once', () => {
    const mv = new MotionValue(0);
    const onChange = jest.fn();
    const onComplete = jest.fn();

    spring(mv, 100, { onChange, onComplete }).start();

    for (let t = 0; t < 5000; t += 16) {
      jest.advanceTimersByTime(16);
      if (mv.current === 100) {
        break;
      }
    }

    expect(mv.current).toBeCloseTo(100, 2);
    expect(onChange).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('zero stiffness should complete immediately', () => {
    const mv = new MotionValue(0);
    const onChange = jest.fn();
    const onComplete = jest.fn();

    spring(mv, 100, { stiffness: 0, onChange, onComplete }).start();

    jest.advanceTimersByTime(16);

    expect(mv.current).toBe(100);
    expect(onChange).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('reset should snap back to original position', () => {
    const mv = new MotionValue(0);

    const ctrl = spring(mv, 100);
    ctrl.start();

    jest.advanceTimersByTime(100);

    ctrl.reset();

    expect(mv.current).toBe(0);
  });
});
